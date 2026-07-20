import { defineHandler } from 'nitro';
import { sql } from '../../../utils/db';
import { getRouterParam, createError, setResponseHeader, sendStream } from 'nitro/h3';

export default defineHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'File ID is required' });
  }

  try {
    const [file] = await sql`
      SELECT filename, content_type, file_data
      FROM files
      WHERE id = ${id}
    `;

    if (!file) {
      throw createError({ statusCode: 404, statusMessage: 'File not found' });
    }

    setResponseHeader(event, 'Content-Type', file.content_type);
    setResponseHeader(event, 'Content-Disposition', `inline; filename="${file.filename}"`);

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(file.file_data));
        controller.close();
      },
    });

    return sendStream(event, stream);
  } catch (error: any) {
    console.error('File fetch error:', error.message);
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch file' });
  }
});
