import { z } from "zod";

const allowedPriorities = ["low", "medium", "high", "urgent"] as const;
const allowedStatus = ["todo", "in_progress", "done", "pending"] as const;

export const itemSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional().default(""),
  due_date: z.string().nullable().optional().default(null),
  priority: z.enum(allowedPriorities).default("medium"),
  status: z.enum(allowedStatus).default("todo"),
  reminder_date: z.string().nullable().optional().default(null),
  tags: z.string().nullable().optional().default(null),
  project_id: z.string().uuid().nullable().optional().default(null),
  list_id: z.string().uuid().nullable().optional().default(null),
  completed: z.boolean().optional().default(false),
  // number().min(0).max(1).optional().default(0),
});

export type Item = z.infer<typeof itemSchema>;
