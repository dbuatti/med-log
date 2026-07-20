import { a as defineHandler, c as readBody, i as createError, s as getRouterParam } from "./_libs/h3+rou3+srvx.mjs";
import { t as sql } from "./_chunks/db.mjs";
//#region server/routes/api/appointments/[id].put.ts
var _id__put_default = defineHandler(async (event) => {
	const id = getRouterParam(event, "id");
	const { title, notes, provider, location, cost, category, date } = await readBody(event);
	if (!id) throw createError({
		statusCode: 400,
		statusMessage: "Appointment ID is required"
	});
	const [appointment] = await sql`
    UPDATE appointments
    SET
      title = COALESCE(${title}, title),
      notes = COALESCE(${notes}, notes),
      provider = COALESCE(${provider}, provider),
      location = COALESCE(${location}, location),
      cost = COALESCE(${cost}, cost),
      category = COALESCE(${category}, category),
      date = COALESCE(${date}, date),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
	if (!appointment) throw createError({
		statusCode: 404,
		statusMessage: "Appointment not found"
	});
	return appointment;
});
//#endregion
export { _id__put_default as default };
