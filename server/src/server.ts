import app from './app';
import { env } from './config/env';
import { runMigrations } from './database/migrations';
import { runSeeds } from './database/seedData';
import { initCryptoKeys } from './utils/cryptoUtils';

function bootstrap() {
  try {
    // 1. Setup cryptographic wrapper HSM RSA keys
    initCryptoKeys();

    // 2. Run migrations to ensure schema tables exist
    runMigrations();

    // 3. Populate tables with seed data if fresh
    runSeeds();

    // 4. Start HTTP server
    app.listen(env.PORT, () => {
      console.log(`===================================================`);
      console.log(` DocShield DMS Server Started Successfully`);
      console.log(` Port: ${env.PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` API Endpoint: http://localhost:${env.PORT}/api/v1`);
      console.log(`===================================================`);
    });
  } catch (error) {
    console.error('Fatal bootstrapping failure:', error);
    process.exit(1);
  }
}

bootstrap();
