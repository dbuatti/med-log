import { a as defineHandler, c as readBody, i as createError, s as getRouterParam } from "./_libs/h3+rou3+srvx.mjs";
import { t as sql } from "./_chunks/db.mjs";
//#region server/routes/api/tasks/[id].put.ts
var _id__put_default = defineHandler(async (event) => {
	const id = getRouterParam(event, "id");
	const { title, description, due_date, status, priority } = await readBody(event);
	if (!id) throw createError({
		statusCode: 400,
		statusMessage: "Task ID is required"
	});
	const [task] = await sql`
    UPDATE tasks
    SET
      title = COALESCE(${title}, title),
      description = COALESCE(${description}, description),
      due_date = ${due_date !== void 0 ? due_date : null},
      status = COALESCE(${status}, status),
      priority = COALESCE(${priority}, priority),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
	if (!task) throw createError({
		statusCode: 404,
		statusMessage: "Task not found"
	});
	return task;
});
//#endregion
export { _id__put_default as default };
