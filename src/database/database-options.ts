import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import type { DataSourceOptions } from 'typeorm';
import { CreateTasks1763136000000 } from './migrations/1763136000000-create-tasks.js';
import { Task } from '../tasks/task.entity.js';

if (existsSync('.env')) {
  loadEnvFile();
}

export function createDatabaseOptions(): DataSourceOptions {
  const commonOptions = {
    entities: [Task],
    migrations: [CreateTasks1763136000000],
    synchronize: false,
    migrationsRun: process.env.NODE_ENV !== 'production',
  };

  if (process.env.NODE_ENV === 'production') {
    const requiredVariables = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'] as const;
    const missingVariables = requiredVariables.filter((name) => !process.env[name]);

    if (missingVariables.length > 0) {
      throw new Error(
        `Missing PostgreSQL environment variables: ${missingVariables.join(', ')}`,
      );
    }

    const port = Number(process.env.DB_PORT ?? 5432);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('DB_PORT must be an integer between 1 and 65535');
    }

    return {
      ...commonOptions,
      type: 'postgres',
      host: process.env.DB_HOST,
      port,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true',
    };
  }

  return {
    ...commonOptions,
    type: 'better-sqlite3',
    database:
      process.env.NODE_ENV === 'test'
        ? ':memory:'
        : (process.env.SQLITE_DATABASE ?? 'tasks.sqlite'),
  };
}
