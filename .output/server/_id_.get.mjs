import { a as defineHandler, d as setResponseHeader, i as createError, s as getRouterParam, u as sendStream } from "./_libs/h3+rou3+srvx.mjs";
import { t as sql } from "./_chunks/db.mjs";
//#region server/routes/api/files/[id].get.ts
var _id__get_default = defineHandler(async (event) => {
	const id = getRouterParam(event, "id");
	if (!id) throw createError({
		statusCode: 400,
		statusMessage: "File ID is required"
	});
	try {
		const [file] = await sql`
      SELECT filename, content_type, file_data
      FROM files
      WHERE id = ${id}
    `;
		if (!file) throw createError({
			statusCode: 404,
			statusMessage: "File not found"
		});
		setResponseHeader(event, "Content-Type", file.content_type);
		setResponseHeader(event, "Content-Disposition", `inline; filename="${file.filename}"`);
		return sendStream(event, new ReadableStream({ start(controller) {
			controller.enqueue(new Uint8Array(file.file_data));
			controller.close();
		} }));
	} catch (error) {
		console.error("File fetch error:", error.message);
		if (error.statusCode) throw error;
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to fetch file"
		});
	}
});
//#endregion
export { _id__get_default as default };
