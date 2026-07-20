import { a as defineHandler } from "../../_libs/h3+rou3+srvx.mjs";
import { t as sql } from "../../_chunks/db.mjs";
//#region server/routes/api/appointments.get.ts
var appointments_get_default = defineHandler(async () => {
	return await sql`
    SELECT * FROM appointments 
    ORDER BY date DESC, created_at DESC
  `;
});
//#endregion
export { appointments_get_default as default };
