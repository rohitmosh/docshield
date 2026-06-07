"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const migrations_1 = require("./database/migrations");
const seedData_1 = require("./database/seedData");
const cryptoUtils_1 = require("./utils/cryptoUtils");
function bootstrap() {
    try {
        // 1. Run migrations to ensure schema tables exist
        (0, migrations_1.runMigrations)();
        // 2. Populate tables with seed data if fresh
        (0, seedData_1.runSeeds)();
        // 3. Setup cryptographic wrapper HSM RSA keys
        (0, cryptoUtils_1.initCryptoKeys)();
        // 4. Start HTTP server
        app_1.default.listen(env_1.env.PORT, () => {
            console.log(`===================================================`);
            console.log(` DocShield DMS Server Started Successfully`);
            console.log(` Port: ${env_1.env.PORT}`);
            console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(` API Endpoint: http://localhost:${env_1.env.PORT}/api/v1`);
            console.log(`===================================================`);
        });
    }
    catch (error) {
        console.error('Fatal bootstrapping failure:', error);
        process.exit(1);
    }
}
bootstrap();
