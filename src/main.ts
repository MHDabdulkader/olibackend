import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true
  }))
  app.enableCors();
  app.setGlobalPrefix("api/v1");

  // swagger config
  const config  = new DocumentBuilder()
                .setTitle("Olistami Api")
                .setDescription("Api documentation")
                .setVersion("1.0.0")
                
                .addBearerAuth({
                  type: "http",
                  scheme: "bearer",
                  bearerFormat: "JWT",
                  name: "Authorization",
                  in: "header"
                },
                "access-token"
            ).build();

  const documentation = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/v1/docs", app, documentation);



  const port = process.env.PORT ?? 8000;
  const host = process.env.HOST ?? "0.0.0.0";
  await app.listen(port, host);
  console.log(`Server running port on http://${host}:${port}/api/v1`)
  console.log(`Swagger running port on http://${host}:${port}/api/v1/docs`)
}
bootstrap();
