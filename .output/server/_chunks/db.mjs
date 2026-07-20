import { t as cs } from "../_libs/neondatabase__serverless.mjs";
//#region server/utils/db.ts
var sql = cs(process.env.DATABASE_URL);
//#endregion
export { sql as t };
