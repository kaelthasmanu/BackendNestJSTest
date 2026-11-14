import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '../types/task-status.js';

export class CreateTaskRequestDto {
  @ApiProperty({
    description:
      'Título de la tarea. Se eliminan espacios al inicio y al final.',
    minLength: 1,
    maxLength: 150,
    example: 'Preparar el lanzamiento',
  })
  title!: string;

  @ApiProperty({
    description: 'Descripción detallada de la tarea.',
    minLength: 1,
    maxLength: 5000,
    example: 'Completar la lista de verificación antes del despliegue.',
  })
  description!: string;

  @ApiProperty({
    description: 'Nombre de la persona responsable.',
    minLength: 1,
    maxLength: 120,
    example: 'Alex',
  })
  responsible!: string;

  @ApiProperty({
    description: 'Fecha límite en formato ISO 8601 (fecha calendario).',
    type: String,
    format: 'date',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
    example: '2026-12-01',
  })
  dueDate!: string;

  @ApiPropertyOptional({
    description: 'Estado inicial. Si se omite, se asigna `pendiente`.',
    enum: TaskStatus,
    enumName: 'TaskStatus',
    default: TaskStatus.PENDING,
    example: TaskStatus.IN_PROGRESS,
  })
  status?: TaskStatus;
}

export class UpdateTaskRequestDto {
  @ApiPropertyOptional({
    description: 'Nuevo título de la tarea.',
    minLength: 1,
    maxLength: 150,
    example: 'Preparar el lanzamiento final',
  })
  title?: string;

  @ApiPropertyOptional({
    description: 'Nueva descripción de la tarea.',
    minLength: 1,
    maxLength: 5000,
    example: 'Validar el checklist de producción.',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Nueva persona responsable.',
    minLength: 1,
    maxLength: 120,
    example: 'Sam',
  })
  responsible?: string;

  @ApiPropertyOptional({
    description: 'Nueva fecha límite en formato `YYYY-MM-DD`.',
    type: String,
    format: 'date',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
    example: '2026-12-15',
  })
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Nuevo estado de la tarea.',
    enum: TaskStatus,
    enumName: 'TaskStatus',
    example: TaskStatus.DONE,
  })
  status?: TaskStatus;
}

export class TaskResponseDto {
  @ApiProperty({
    description: 'Identificador único de la tarea.',
    example: 42,
    minimum: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Título de la tarea.',
    example: 'Preparar el lanzamiento',
  })
  title!: string;

  @ApiProperty({
    description: 'Descripción detallada de la tarea.',
    example: 'Completar la lista de verificación antes del despliegue.',
  })
  description!: string;

  @ApiProperty({
    description: 'Estado actual de la tarea.',
    enum: TaskStatus,
    enumName: 'TaskStatus',
    example: TaskStatus.PENDING,
  })
  status!: TaskStatus;

  @ApiProperty({ description: 'Persona responsable.', example: 'Alex' })
  responsible!: string;

  @ApiProperty({
    description: 'Fecha límite en formato ISO 8601 (fecha calendario).',
    type: String,
    format: 'date',
    example: '2026-12-01',
  })
  dueDate!: string;

  @ApiProperty({
    description: 'Fecha y hora de creación en UTC.',
    type: String,
    format: 'date-time',
    example: '2026-11-14T20:12:27.930Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Fecha y hora de la última actualización en UTC.',
    type: String,
    format: 'date-time',
    example: '2026-11-14T20:12:27.930Z',
  })
  updatedAt!: string;
}

export class TaskPaginationMetaDto {
  @ApiProperty({
    description: 'Página solicitada, empezando en 1.',
    example: 1,
    minimum: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Cantidad máxima de resultados por página.',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  limit!: number;

  @ApiProperty({
    description: 'Cantidad total de tareas que coinciden con los filtros.',
    example: 23,
  })
  total!: number;

  @ApiProperty({
    description: 'Cantidad total de páginas. Es 0 cuando no hay resultados.',
    example: 3,
    minimum: 0,
  })
  totalPages!: number;
}

export class TaskListResponseDto {
  @ApiProperty({
    description: 'Tareas de la página solicitada.',
    type: [TaskResponseDto],
  })
  data!: TaskResponseDto[];

  @ApiProperty({
    description: 'Metadatos de paginación.',
    type: TaskPaginationMetaDto,
  })
  meta!: TaskPaginationMetaDto;
}

export class ApiErrorResponseDto {
  @ApiProperty({
    description: 'Mensajes de error de validación o mensaje del error HTTP.',
    oneOf: [
      { type: 'string', example: 'Task 42 not found' },
      { type: 'array', items: { type: 'string' }, example: ['Invalid status'] },
    ],
  })
  message!: string | string[];

  @ApiProperty({
    description: 'Descripción HTTP del error.',
    example: 'Bad Request',
  })
  error!: string;

  @ApiProperty({ description: 'Código de estado HTTP.', example: 400 })
  statusCode!: number;
}
