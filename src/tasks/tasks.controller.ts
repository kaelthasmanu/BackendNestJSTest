import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  createTaskSchema,
  type CreateTaskDto,
} from './dto/create-task.dto.js';
import {
  listTasksQuerySchema,
  type ListTasksQueryDto,
} from './dto/list-tasks-query.dto.js';
import { taskIdSchema, type TaskIdDto } from './dto/task-id.dto.js';
import { updateTaskSchema, type UpdateTaskDto } from './dto/update-task.dto.js';
import { TasksService } from './tasks.service.js';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body({ schema: createTaskSchema }) input: CreateTaskDto) {
    return this.tasksService.create(input);
  }

  @Get()
  findAll(@Query({ schema: listTasksQuerySchema }) query: ListTasksQueryDto) {
    return this.tasksService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', { schema: taskIdSchema }) id: TaskIdDto) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', { schema: taskIdSchema }) id: TaskIdDto,
    @Body({ schema: updateTaskSchema }) input: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', { schema: taskIdSchema }) id: TaskIdDto): Promise<void> {
    await this.tasksService.remove(id);
  }
}
