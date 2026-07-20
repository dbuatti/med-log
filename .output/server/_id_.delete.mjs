import { a as defineHandler, i as createError, s as getRouterParam } from "./_libs/h3+rou3+srvx.mjs";
import { t as sql } from "./_chunks/db.mjs";
//#region server/routes/api/tasks/[id].delete.ts
var _id__delete_default = defineHandler(async (event) => {
	const id = getRouterParam(event, "id");
	if (!id) throw createError({
		statusCode: 400,
		statusMessage: "Task ID is required"
	});
	await sql`DELETE FROM tasks WHERE id = ${id}`;
	return { success: true };
});
//#endregion
export { _id__delete_default as default };
