import { defineHandler } from 'nitro';
import { sql } from '../../utils/db';
import { readMultipartFormData } from 'nitro/h3';

export default defineHandler(async (event) => {
  try {
    const parts = await readMultipartFormData(event);
    
    if (!parts || parts.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No file provided' });
    }

    const filePart = parts.find(p => p.name === 'file');
    
    if (!filePart || !filePart.filename) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid file upload' });
    }

    const [file] = await sql`
      INSERT INTO files (filename, content_type, file_data)
      VALUES (${filePart.filename}, ${filePart.type || 'application/octet-stream'}, ${filePart.data})
      RETURNING id, filename, content_type, created_at
    `;

    return file;
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: 'Failed to upload file' });
  }
});