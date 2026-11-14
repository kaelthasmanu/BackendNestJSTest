import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { TasksModule } from './tasks/tasks.module.js';

@Module({
  imports: [DatabaseModule, TasksModule],
})
export class AppModule {}
