import { z } from "zod";

export const newCategorySchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(60, "El nombre no puede tener más de 60 caracteres"),
});

export type NewCategoryFormValues = z.infer<typeof newCategorySchema>;
