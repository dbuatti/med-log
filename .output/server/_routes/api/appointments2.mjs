import { a as defineHandler, c as readBody, i as createError } from "../../_libs/h3+rou3+srvx.mjs";
import { t as sql } from "../../_chunks/db.mjs";
//#region server/routes/api/appointments.post.ts
var appointments_post_default = defineHandler(async (event) => {
	const { date, category, title, notes, provider, location, cost } = await readBody(event);
	if (!date || !category) throw createError({
		statusCode: 400,
		statusMessage: "Date and category are required"
	});
	const [appointment] = await sql`
    INSERT INTO appointments (date, category, title, notes, provider, location, cost)
    VALUES (${date}, ${category}, ${title}, ${notes}, ${provider}, ${location}, ${cost})
    RETURNING *
  `;
	return appointment;
});
//#endregion
export { appointments_post_default as default };
