import { z } from "zod";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const resourceCreateSchema = z.object({
  name: z.string().trim().min(1).max(255),
  type: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(1000).optional(),
  capacity: z.coerce.number().int().min(1),
  isActive: z.boolean().optional(),
});

export const resourceUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    type: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().min(1).max(1000).nullable().optional(),
    capacity: z.coerce.number().int().min(1).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const resourceParamSchema = z.object({
  id: z.string().uuid(),
});

export const resourceQuerySchema = paginationSchema.extend({
  sort: z
    .enum(["createdAt", "updatedAt", "name", "type", "capacity"])
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  type: z.string().trim().min(1).optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

export type ResourceCreateDto = z.infer<typeof resourceCreateSchema>;
export type ResourceUpdateDto = z.infer<typeof resourceUpdateSchema>;
export type ResourceParamDto = z.infer<typeof resourceParamSchema>;
export type ResourceQueryDto = z.infer<typeof resourceQuerySchema>;
