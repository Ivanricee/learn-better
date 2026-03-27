"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import type { Category } from "@/lib/types";
import { useCategoryStore } from "@/lib/stores/zustand-store";
import {
  newCategorySchema,
  type NewCategoryFormValues,
} from "@/components/modals/schemas/new-category.schema";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface CategoryCardProps {
  category?: Category;
  isNewCard?: boolean;
  onClick?: () => void;
}

export function CategoryCard({
  category,
  isNewCard,
  onClick,
}: CategoryCardProps) {
  const createCategory = useCategoryStore((state) => state.createCategory);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<NewCategoryFormValues>({
    resolver: zodResolver(newCategorySchema),
    defaultValues: { nombre: "" },
    mode: "onChange",
  });

  const handleOpenCreateModal = () => {
    setIsCreateOpen(true);
  };

  const handleCreateCategory = ({ nombre }: NewCategoryFormValues) => {
    const created = createCategory({ nombre });

    if (!created) {
      return;
    }

    setIsCreateOpen(false);
    reset();
  };

  if (isNewCard) {
    return (
      <>
        <button
          onClick={handleOpenCreateModal}
          className="group flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-dashed border-border bg-card hover:border-primary hover:bg-primary-muted transition-all duration-150 min-h-[140px]"
        >
          <Plus className="w-6 h-6 text-foreground-secondary  group-hover:text-primary transition-colors duration-150" />
          <span className="text-sm text-foreground-secondary group-hover:text-primary transition-colors duration-150">
            Nueva categoría
          </span>
        </button>

        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) reset();
          }}
        >
          <DialogContent
            showCloseButton={false}
            className="max-w-md p-6 rounded-2xl bg-card border border-border ring-0 text-foreground gap-0"
          >
            <DialogTitle className="font-display text-base text-foreground mb-2">
              Crear categoría
            </DialogTitle>
            <p className="text-sm text-foreground-secondary mb-4">
              Crea una categoría vacía. El temario se podrá generar después.
            </p>

            <form onSubmit={handleSubmit(handleCreateCategory)} noValidate>
              <input
                type="text"
                placeholder="Nombre de la categoría"
                className="w-full px-4 py-2 rounded-xl bg-input border border-border text-foreground placeholder:text-foreground-tertiary focus:border-primary outline-none transition-colors duration-150"
                autoFocus
                {...register("nombre")}
              />

              {errors.nombre && (
                <p className="mt-2 text-xs text-secondary">
                  {errors.nombre.message}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 mt-6">
                <DialogClose asChild>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl text-sm font-medium border border-border text-foreground-secondary hover:border-border-hover hover:text-foreground transition-all duration-150"
                  >
                    Cancelar
                  </button>
                </DialogClose>
                <button
                  type="submit"
                  disabled={!isValid}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-background hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  Crear
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (!category) return null;

  return (
    <button
      onClick={onClick}
      className="group flex flex-col gap-3 p-5 rounded-xl border border-border-subtle bg-card
      hover:border-border-hover hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]
      transition-all duration-150 text-left min-h-[140px]"
    >
      <h3 className="font-display font-semibold text-base text-foreground">
        {category.nombre}
      </h3>

      <div className="flex-1" />

      {/* Progress bar */}
      <div className="w-full space-y-2">
        <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${category.progreso}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-foreground-tertiary tracking-wider">
          <span>{category.progreso}% completado</span>
          <span className="bg-black px-2.5 py-1 rounded-full text-primary/85">
            {category.temas} temas
          </span>
        </div>
      </div>
    </button>
  );
}
