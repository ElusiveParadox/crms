import { BookingStatus } from "@prisma/client";
import { z } from "zod";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

const dateField = z.coerce.date();

export const bookingCreateSchema = z.object({
  resourceId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  startTime: dateField,
  endTime: dateField,
  status: z.nativeEnum(BookingStatus).optional(),
});

export const bookingUpdateSchema = z
  .object({
    resourceId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    startTime: dateField.optional(),
    endTime: dateField.optional(),
    status: z.nativeEnum(BookingStatus).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const bookingParamSchema = z.object({
  id: z.string().uuid(),
});

export const bookingQuerySchema = paginationSchema.extend({
  sort: z
    .enum(["createdAt", "updatedAt", "startTime", "endTime", "status"])
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  status: z.nativeEnum(BookingStatus).optional(),
  resourceId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  startDate: dateField.optional(),
  endDate: dateField.optional(),
});

export type BookingCreateDto = z.infer<typeof bookingCreateSchema>;
export type BookingUpdateDto = z.infer<typeof bookingUpdateSchema>;
export type BookingParamDto = z.infer<typeof bookingParamSchema>;
export type BookingQueryDto = z.infer<typeof bookingQuerySchema>;
