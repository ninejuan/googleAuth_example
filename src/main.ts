import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session'
import * as passport from 'passport'
import { linkToDatabase } from './utils/db.util';
import { setupSwagger } from './utils/swagger.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(session({
    secret: 'abc',
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 60000,
    }
  }))
  app.use(passport.initialize())
  app.use(passport.session())
  
  await linkToDatabase();
  if (process.env.MODE == "DEV") {
    try {
      setupSwagger(app);
      console.log("Swagger is enabled");
    } catch (e) {
      console.error(e);
    }
  }
  await app.listen(process.env.PORT || 3000).then(() => {
    console.log(`App is running on Port ${process.env.PORT || 3000}`)
  }).catch((e) => {
    console.error(e)
  });
}
bootstrap();
