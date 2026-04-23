import { z } from "zod";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const institutionCreateSchema = z.object({
  name: z.string().trim().min(3).max(255),
  domain: z.string().trim().min(1).max(255).optional(),
});

export const institutionUpdateSchema = z
  .object({
    name: z.string().trim().min(3).max(255).optional(),
    domain: z.string().trim().min(1).max(255).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const institutionParamSchema = z.object({
  id: z.string().uuid(),
});

export const institutionQuerySchema = paginationSchema.extend({
  sort: z.enum(["createdAt", "updatedAt", "name"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  name: z.string().trim().min(1).optional(),
});

export type InstitutionCreateDto = z.infer<typeof institutionCreateSchema>;
export type InstitutionUpdateDto = z.infer<typeof institutionUpdateSchema>;
export type InstitutionParamDto = z.infer<typeof institutionParamSchema>;
export type InstitutionQueryDto = z.infer<typeof institutionQuerySchema>;
