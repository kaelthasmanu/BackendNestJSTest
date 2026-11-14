import { z } from 'zod';
import { TaskStatus } from '../types/task-status.js';
import { taskFields } from './task-fields.dto.js';

export const updateTaskSchema = z
  .object({
    ...taskFields,
    status: z.enum(TaskStatus),
  })
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required');

export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
