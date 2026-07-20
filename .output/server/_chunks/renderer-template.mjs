import { r as HTTPResponse } from "../_libs/h3+rou3+srvx.mjs";
//#region #nitro/virtual/renderer-template
var rendererTemplate = () => new HTTPResponse("<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>dyad-generated-app</title>\n    <script type=\"module\" crossorigin src=\"/assets/index-BKWvQIVV.js\"><\/script>\n    <link rel=\"stylesheet\" crossorigin href=\"/assets/index-D0_hGNnr.css\">\n  </head>\n\n  <body>\n    <div id=\"root\"></div>\n  </body>\n</html>\n", { headers: { "content-type": "text/html; charset=utf-8" } });
//#endregion
//#region node_modules/.pnpm/nitro@3.0.260610-beta_jiti@2.7.0_vite@8.0.10_@types+node@22.14.1_esbuild@0.27.7_jiti@2.7.0_yaml@2.7.1_/node_modules/nitro/dist/runtime/internal/routes/renderer-template.mjs
function renderIndexHTML(event) {
	return rendererTemplate(event.req);
}
//#endregion
export { renderIndexHTML as default };
