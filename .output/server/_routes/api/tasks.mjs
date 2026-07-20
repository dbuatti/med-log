import { a as defineHandler } from "../../_libs/h3+rou3+srvx.mjs";
import { t as sql } from "../../_chunks/db.mjs";
//#region server/routes/api/tasks.get.ts
var tasks_get_default = defineHandler(async () => {
	return await sql`
    SELECT t.*, a.date as appointment_date, a.title as appointment_title
    FROM tasks t
    LEFT JOIN appointments a ON t.appointment_id = a.id
    ORDER BY
      CASE t.status WHEN 'pending' THEN 0 WHEN 'completed' THEN 1 ELSE 2 END,
      t.due_date ASC NULLS LAST,
      CASE t.priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END
  `;
});
//#endregion
export { tasks_get_default as default };
