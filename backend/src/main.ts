import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";

import { AppModule } from "./app.module";

const WHILTELIST_ORIGIN = ["http://localhost:3001", "http://localhost:3005", "https://warung.raihanmd.xyz"];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: WHILTELIST_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept", "Authorization"],
  });

  app.setGlobalPrefix("v1");

  app.enableShutdownHooks();

  const config = app.get(ConfigService);
  const port = config.get<number>("SERVER_PORT") ?? 3000;

  await app.listen(port);
}

bootstrap();
