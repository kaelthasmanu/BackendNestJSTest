import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DATA_SOURCE } from '../database/database.constants.js';
import { Task } from './task.entity.js';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';
import { TASKS_REPOSITORY } from './constants/tasks.constants.js';

@Module({
  providers: [
    {
      provide: TASKS_REPOSITORY,
      inject: [DATA_SOURCE],
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Task),
    },
    TasksService,
  ],
  controllers: [TasksController],
})
export class TasksModule {}
