import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

export interface Database {
  // Add tables here as needed
  users: {
    id: string;
    username: string;
    password_hash: string;
  };
}

const dialect = new PostgresDialect({
  pool: new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
    max: 10,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
