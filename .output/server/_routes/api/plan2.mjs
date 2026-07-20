import { a as defineHandler } from "../../_libs/h3+rou3+srvx.mjs";
import { t as sql } from "../../_chunks/db.mjs";
//#region server/routes/api/plan/index.put.ts
var index_put_default = defineHandler(async (event) => {
	const { id, status, review_answers } = await readBody(event);
	if (!id) throw createError({
		statusCode: 400,
		message: "id is required"
	});
	if (status === "current") {
		await sql`UPDATE health_plan SET status = 'upcoming' WHERE status = 'current'`;
		await sql`UPDATE health_plan SET status = 'current', started_at = NOW() WHERE id = ${id}`;
	} else if (status === "completed") {
		if (!review_answers || Object.keys(review_answers).length === 0) throw createError({
			statusCode: 400,
			message: "review_answers required to complete"
		});
		await sql`UPDATE health_plan SET status = 'completed', completed_at = NOW(), review_answers = ${JSON.stringify(review_answers)}::jsonb WHERE id = ${id}`;
		const rows = await sql`SELECT month_number FROM health_plan WHERE id = ${id}`;
		if (rows.length > 0) await sql`UPDATE health_plan SET status = 'current', started_at = NOW() WHERE month_number = ${rows[0].month_number + 1}`;
	}
	return await sql`SELECT * FROM health_plan ORDER BY month_number ASC`;
});
//#endregion
export { index_put_default as default };
