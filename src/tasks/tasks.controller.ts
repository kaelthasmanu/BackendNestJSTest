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
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
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
@ApiTags('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una tarea' })
  @ApiCreatedResponse({ description: 'La tarea fue creada.' })
  @ApiBadRequestResponse({ description: 'Los datos enviados no son válidos.' })
  create(@Body({ schema: createTaskSchema }) input: CreateTaskDto) {
    return this.tasksService.create(input);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tareas con filtros y paginación' })
  @ApiOkResponse({ description: 'Lista paginada de tareas.' })
  @ApiBadRequestResponse({ description: 'Los filtros o parámetros de paginación no son válidos.' })
  findAll(@Query({ schema: listTasksQuerySchema }) query: ListTasksQueryDto) {
    return this.tasksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar una tarea por ID' })
  @ApiOkResponse({ description: 'La tarea solicitada.' })
  @ApiBadRequestResponse({ description: 'El ID debe ser un entero positivo.' })
  @ApiNotFoundResponse({ description: 'No existe una tarea con ese ID.' })
  findOne(@Param('id', { schema: taskIdSchema }) id: TaskIdDto) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar parcialmente una tarea' })
  @ApiOkResponse({ description: 'La tarea actualizada.' })
  @ApiBadRequestResponse({ description: 'El ID o los datos enviados no son válidos.' })
  @ApiNotFoundResponse({ description: 'No existe una tarea con ese ID.' })
  update(
    @Param('id', { schema: taskIdSchema }) id: TaskIdDto,
    @Body({ schema: updateTaskSchema }) input: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una tarea' })
  @ApiNoContentResponse({ description: 'La tarea fue eliminada.' })
  @ApiBadRequestResponse({ description: 'El ID debe ser un entero positivo.' })
  @ApiNotFoundResponse({ description: 'No existe una tarea con ese ID.' })
  async remove(@Param('id', { schema: taskIdSchema }) id: TaskIdDto): Promise<void> {
    await this.tasksService.remove(id);
  }
}
