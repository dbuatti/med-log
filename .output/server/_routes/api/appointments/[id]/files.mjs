import { a as defineHandler, i as createError, s as getRouterParam } from "../../../../_libs/h3+rou3+srvx.mjs";
import { t as sql } from "../../../../_chunks/db.mjs";
//#region server/routes/api/appointments/[id]/files.get.ts
var files_get_default = defineHandler(async (event) => {
	const id = getRouterParam(event, "id");
	if (!id) throw createError({
		statusCode: 400,
		statusMessage: "Appointment ID is required"
	});
	try {
		return await sql`
      SELECT id, filename, content_type, created_at
      FROM files
      WHERE appointment_id = ${id}
      ORDER BY created_at DESC
    ` || [];
	} catch (error) {
		console.error("Error fetching files:", error.message);
		return [];
	}
});
//#endregion
export { files_get_default as default };
