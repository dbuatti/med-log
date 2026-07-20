import { a as defineHandler } from "../../_libs/h3+rou3+srvx.mjs";
import { t as sql } from "../../_chunks/db.mjs";
//#region server/routes/api/plan/index.get.ts
var index_get_default = defineHandler(async () => {
	return await sql`SELECT * FROM health_plan ORDER BY month_number ASC`;
});
//#endregion
export { index_get_default as default };
