import { z } from 'zod';

export const voteSchema = z.object({
  ballotId: z.string().uuid(),
  optionId: z.string().uuid(),
});

export const ballotSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  options: z.array(z.string().min(1)).min(2).max(10),
});