import { z } from 'zod';
import { TaskStatus } from '../types/task-status.js';

const positiveIntegerQuerySchema = z
  .string()
  .regex(/^[1-9]\d*$/, 'Value must be a positive integer')
  .transform(Number)
  .pipe(z.number().int().safe().min(1));

export const listTasksQuerySchema = z
  .object({
    status: z.enum(TaskStatus).optional(),
    responsible: z.string().trim().min(1).max(120).optional(),
    page: z
      .preprocess((value) => value ?? '1', positiveIntegerQuerySchema)
      .pipe(z.number().max(1_000_000)),
    limit: z
      .preprocess((value) => value ?? '10', positiveIntegerQuerySchema)
      .pipe(z.number().max(100)),
  })
  .strict();

export type ListTasksQueryDto = z.infer<typeof listTasksQuerySchema>;
