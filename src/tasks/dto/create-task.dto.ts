import { z } from 'zod';
import { TaskStatus } from '../types/task-status.js';
import { taskFields } from './task-fields.dto.js';

export const createTaskSchema = z
  .object({
    ...taskFields,
    status: z.enum(TaskStatus).default(TaskStatus.PENDING),
  })
  .strict();

export type CreateTaskDto = z.output<typeof createTaskSchema>;
export type CreateTaskInput = z.input<typeof createTaskSchema>;
