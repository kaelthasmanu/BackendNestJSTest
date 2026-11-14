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
  ApiBody,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { createTaskSchema, type CreateTaskDto } from './dto/create-task.dto.js';
import {
  listTasksQuerySchema,
  type ListTasksQueryDto,
} from './dto/list-tasks-query.dto.js';
import { taskIdSchema, type TaskIdDto } from './dto/task-id.dto.js';
import { updateTaskSchema, type UpdateTaskDto } from './dto/update-task.dto.js';
import {
  ApiErrorResponseDto,
  CreateTaskRequestDto,
  TaskListResponseDto,
  TaskResponseDto,
  UpdateTaskRequestDto,
} from './dto/task-api-contracts.dto.js';
import { TaskStatus } from './types/task-status.js';
import { TasksService } from './tasks.service.js';

@Controller('tasks')
@ApiTags('Tareas')
@ApiExtraModels(
  ApiErrorResponseDto,
  CreateTaskRequestDto,
  TaskListResponseDto,
  TaskResponseDto,
  UpdateTaskRequestDto,
)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear una tarea',
    description:
      'Crea una tarea nueva. El estado es opcional y, si se omite, se guarda como `pendiente`. Los campos de texto se recortan antes de guardarse.',
  })
  @ApiBody({
    type: CreateTaskRequestDto,
    description:
      'Se rechazan propiedades adicionales que no formen parte del contrato.',
  })
  @ApiCreatedResponse({
    description: 'Tarea creada correctamente.',
    type: TaskResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'El cuerpo contiene campos inválidos, faltantes o no permitidos.',
    type: ApiErrorResponseDto,
  })
  create(@Body({ schema: createTaskSchema }) input: CreateTaskDto) {
    return this.tasksService.create(input);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar tareas',
    description:
      'Devuelve resultados ordenados por fecha de creación descendente (ID descendente para desempatar). Los filtros se combinan con AND. Una página fuera del rango devuelve `data: []` y conserva los metadatos solicitados.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TaskStatus,
    enumName: 'TaskStatus',
    description: 'Filtra por estado exacto.',
    example: TaskStatus.IN_PROGRESS,
  })
  @ApiQuery({
    name: 'responsible',
    required: false,
    type: String,
    maxLength: 120,
    description:
      'Filtra por nombre exacto de responsable; se recortan espacios externos.',
    example: 'Alex',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    schema: { type: 'integer', minimum: 1, maximum: 1_000_000, default: 1 },
    description: 'Número de página (entero positivo).',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
    description: 'Cantidad de resultados por página.',
    example: 10,
  })
  @ApiOkResponse({
    description: 'Página de resultados y metadatos de paginación.',
    type: TaskListResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Uno o más filtros, parámetros o campos de consulta no son válidos.',
    type: ApiErrorResponseDto,
  })
  findAll(@Query({ schema: listTasksQuerySchema }) query: ListTasksQueryDto) {
    return this.tasksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Consultar una tarea',
    description: 'Obtiene una tarea mediante su identificador.',
  })
  @ApiParam({
    name: 'id',
    schema: { type: 'integer', minimum: 1 },
    description: 'Identificador entero positivo.',
    example: 42,
  })
  @ApiOkResponse({ description: 'Tarea encontrada.', type: TaskResponseDto })
  @ApiBadRequestResponse({
    description: 'El identificador debe ser un entero positivo.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'No existe una tarea con ese identificador.',
    type: ApiErrorResponseDto,
  })
  findOne(@Param('id', { schema: taskIdSchema }) id: TaskIdDto) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar parcialmente una tarea',
    description:
      'Actualiza únicamente los campos incluidos. Se requiere al menos un campo y los campos omitidos conservan su valor actual.',
  })
  @ApiParam({
    name: 'id',
    schema: { type: 'integer', minimum: 1 },
    description: 'Identificador entero positivo.',
    example: 42,
  })
  @ApiBody({
    type: UpdateTaskRequestDto,
    description:
      'Debe incluir al menos un campo; las propiedades adicionales se rechazan.',
  })
  @ApiOkResponse({
    description: 'Tarea actualizada correctamente.',
    type: TaskResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'El identificador o el cuerpo contiene valores inválidos; no se permite un cuerpo vacío.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'No existe una tarea con ese identificador.',
    type: ApiErrorResponseDto,
  })
  update(
    @Param('id', { schema: taskIdSchema }) id: TaskIdDto,
    @Body({ schema: updateTaskSchema }) input: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar una tarea',
    description: 'Elimina permanentemente la tarea indicada.',
  })
  @ApiParam({
    name: 'id',
    schema: { type: 'integer', minimum: 1 },
    description: 'Identificador entero positivo.',
    example: 42,
  })
  @ApiNoContentResponse({
    description:
      'Tarea eliminada correctamente. La respuesta no contiene cuerpo.',
  })
  @ApiBadRequestResponse({
    description: 'El identificador debe ser un entero positivo.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'No existe una tarea con ese identificador.',
    type: ApiErrorResponseDto,
  })
  async remove(
    @Param('id', { schema: taskIdSchema }) id: TaskIdDto,
  ): Promise<void> {
    await this.tasksService.remove(id);
  }
}
