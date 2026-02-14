"use strict";
Object.defineProperty(exports, "__esModule", {
  value: true,
});
const _core = require("@nestjs/core");
const _config = require("@nestjs/config");
const _cookieparser = /*#__PURE__*/ _interop_require_default(
  require("cookie-parser"),
);
const _appmodule = require("../dist/app.module");
function _interop_require_default(obj) {
  return obj && obj.__esModule
    ? obj
    : {
      default: obj,
    };
}
const WHILTELIST_ORIGIN = ["http://localhost:3001", "http://localhost:3005", "https://warung.raihanmd.xyz"];
async function bootstrap() {
  const app = await _core.NestFactory.create(_appmodule.AppModule);
  app.enableCors({
    origin: WHILTELIST_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept", "x-school-id"],
  });
  app.setGlobalPrefix("v1");
  app.use((0, _cookieparser.default)());
  app.enableShutdownHooks();
  await app.listen(app.get(_config.ConfigService).get("SERVER_PORT") ?? 3000);
}
bootstrap();
