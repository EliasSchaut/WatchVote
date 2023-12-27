import { createApp } from '@/nest';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await createApp();
  app.enableCors();
  await app.listen(Number(process.env.PORT) + 1);
  Logger.verbose(`Application is running on: ${await app.getUrl()}`);
}

bootstrap().then();
