import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { createDatabaseOptions } from './database-options.js';

export default new DataSource(createDatabaseOptions());
