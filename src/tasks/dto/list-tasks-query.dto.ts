import { z } from 'zod';
import { TaskStatus } from '../types/task-status.js';

export const listTasksQuerySchema = z
  .object({
    status: z.enum(TaskStatus).optional(),
    responsible: z.string().trim().min(1).max(120).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  })
  .strict();

export type ListTasksQueryDto = z.infer<typeof listTasksQuerySchema>;
