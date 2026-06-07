"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
// @ts-ignore
const node_sqlite_1 = require("node:sqlite");
const path_1 = __importDefault(require("path"));
const env_1 = require("./env");
// Make sure target database dir exists or is resolved
const resolvedDbPath = path_1.default.isAbsolute(env_1.env.DB_PATH)
    ? env_1.env.DB_PATH
    : path_1.default.resolve(__dirname, '../../', env_1.env.DB_PATH);
console.log(`Connecting SQLite Database at: ${resolvedDbPath}`);
exports.db = new node_sqlite_1.DatabaseSync(resolvedDbPath);
