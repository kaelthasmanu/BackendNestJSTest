import { z } from 'zod';

export const taskIdSchema = z
  .string()
  .regex(/^[1-9]\d*$/, 'id must be a positive integer')
  .transform(Number)
  .pipe(z.number().int().safe());

export type TaskIdDto = z.infer<typeof taskIdSchema>;
