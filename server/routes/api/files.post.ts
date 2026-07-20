import { defineHandler } from 'nitro';
import { sql } from '../../utils/db';
import { readMultipartFormData, createError } from 'nitro/h3';
import sharp from 'sharp';

export default defineHandler(async (event) => {
  try {
    const parts = await readMultipartFormData(event);

    if (!parts || parts.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No file provided' });
    }

    const filePart = parts.find(p => p.name === 'file');
    const appointmentPart = parts.find(p => p.name === 'appointmentId');

    if (!filePart || !filePart.filename) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid file upload' });
    }

    const appointmentId = appointmentPart?.data ? Buffer.from(appointmentPart.data).toString('utf-8') : null;
    let fileBuffer = Buffer.from(filePart.data);
    let filename = filePart.filename;
    let contentType = filePart.type || 'application/octet-stream';

    // Convert HEIC to JPEG using sharp
    const isHeic = filename.toLowerCase().endsWith('.heic') || filename.toLowerCase().endsWith('.heif') || contentType === 'image/heic';
    if (isHeic) {
      try {
        fileBuffer = await sharp(fileBuffer).jpeg({ quality: 85 }).toBuffer();
        filename = filename.replace(/\.hei[cf]$/i, '.jpg');
        contentType = 'image/jpeg';
      } catch (err: any) {
        console.error('HEIC conversion error:', err.message);
        throw createError({ statusCode: 400, statusMessage: 'Failed to convert HEIC image' });
      }
    }

    const [file] = await sql`
      INSERT INTO files (filename, content_type, file_data, appointment_id)
      VALUES (${filename}, ${contentType}, ${fileBuffer}::bytea, ${appointmentId})
      RETURNING id, filename, content_type, appointment_id, created_at
    `;

    return file;
  } catch (error: any) {
    console.error('File upload error:', error.message);
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: `Failed to upload file: ${error.message}` });
  }
});
