import { z } from 'zod';

export const taskFields = {
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().min(1).max(5000),
  responsible: z.string().trim().min(1).max(120),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'dueDate must use YYYY-MM-DD format')
    .refine((value) => {
      const parsed = new Date(`${value}T00:00:00.000Z`);
      return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
    }, 'dueDate must be a valid calendar date'),
};
