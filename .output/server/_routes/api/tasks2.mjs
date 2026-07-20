import { a as defineHandler, c as readBody, i as createError } from "../../_libs/h3+rou3+srvx.mjs";
import { t as sql } from "../../_chunks/db.mjs";
//#region server/routes/api/tasks.post.ts
var tasks_post_default = defineHandler(async (event) => {
	const { title, description, due_date, priority, appointment_id } = await readBody(event);
	if (!title) throw createError({
		statusCode: 400,
		statusMessage: "Title is required"
	});
	const [task] = await sql`
    INSERT INTO tasks (title, description, due_date, priority, appointment_id)
    VALUES (${title}, ${description || null}, ${due_date || null}, ${priority || "medium"}, ${appointment_id || null})
    RETURNING *
  `;
	return task;
});
//#endregion
export { tasks_post_default as default };
