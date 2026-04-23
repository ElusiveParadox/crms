import { Role } from "@prisma/client";
import { z } from "zod";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const userCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.nativeEnum(Role),
});

export const userUpdateSchema = z
  .object({
    email: z.string().email().optional(),
    password: z.string().min(8).max(128).optional(),
    role: z.nativeEnum(Role).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const userParamSchema = z.object({
  id: z.string().uuid(),
});

export const userQuerySchema = paginationSchema.extend({
  sort: z.enum(["createdAt", "updatedAt", "email", "role"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  role: z.nativeEnum(Role).optional(),
  email: z.string().trim().min(1).optional(),
});

export type UserCreateDto = z.infer<typeof userCreateSchema>;
export type UserUpdateDto = z.infer<typeof userUpdateSchema>;
export type UserParamDto = z.infer<typeof userParamSchema>;
export type UserQueryDto = z.infer<typeof userQuerySchema>;
