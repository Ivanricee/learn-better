"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
  const updateCategory = useCategoryStore((state) => state.updateCategory);
  const deleteCategory = useCategoryStore((state) => state.deleteCategory);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrors, isValid: isEditValid },
  } = useForm<NewCategoryFormValues>({
    resolver: zodResolver(newCategorySchema),
    defaultValues: { nombre: category?.nombre ?? "" },
    mode: "onChange",
  });

  useEffect(() => {
    if (!category) {
      return;
    }

    resetEdit({ nombre: category.nombre });
  }, [category, resetEdit]);

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

  const handleOpenEdit = () => {
    if (!category) {
      return;
    }

    resetEdit({ nombre: category.nombre });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (category) {
      resetEdit({ nombre: category.nombre });
    }

    setIsEditing(false);
  };

  const handleSaveEdit = ({ nombre }: NewCategoryFormValues) => {
    if (!category) {
      return;
    }

    const normalizedName = nombre.trim();

    if (normalizedName === category.nombre) {
      setIsEditing(false);
      return;
    }

    updateCategory(category.id, { nombre: normalizedName });
    setIsEditing(false);
  };

  const handleRequestDelete = () => {
    if (!category) {
      return;
    }

    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!category) {
      return;
    }

    deleteCategory(category.id);
    setIsDeleteOpen(false);
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

  const handleCardClick = () => {
    if (isEditing) {
      return;
    }

    onClick?.();
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="group flex flex-col gap-3 p-5 rounded-xl border border-border-subtle bg-card
      hover:border-border-hover hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]
      transition-all duration-150 text-left min-h-[140px] cursor-pointer"
      >
        <div className="flex items-start justify-between gap-2">
          {isEditing ? (
            <form
              className="flex-1"
              onSubmit={handleSubmitEdit(handleSaveEdit)}
              noValidate
            >
              <input
                type="text"
                className="w-full rounded-lg bg-input border border-border px-3 py-1.5 text-sm text-foreground placeholder:text-foreground-tertiary focus:border-primary outline-none transition-colors duration-150"
                autoFocus
                onClick={(event) => event.stopPropagation()}
                {...registerEdit("nombre")}
              />

              {editErrors.nombre && (
                <p className="mt-2 text-xs text-secondary">
                  {editErrors.nombre.message}
                </p>
              )}

              <div className="mt-2 flex items-center gap-1">
                <button
                  type="submit"
                  disabled={!isEditValid}
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex items-center justify-center rounded-md border border-border px-2 py-1 text-foreground hover:border-border-hover disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Guardar categoría"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleCancelEdit();
                  }}
                  className="inline-flex items-center justify-center rounded-md border border-border px-2 py-1 text-foreground-secondary hover:border-border-hover hover:text-foreground"
                  aria-label="Cancelar edición"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </form>
          ) : (
            <>
              <h3 className="font-display font-semibold text-base text-foreground">
                {category.nombre}
              </h3>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleOpenEdit();
                  }}
                  className="inline-flex items-center justify-center rounded-md border border-transparent p-1.5 text-foreground-secondary hover:border-border hover:text-foreground transition-colors duration-150"
                  aria-label="Editar categoría"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRequestDelete();
                  }}
                  className="inline-flex items-center justify-center rounded-md border border-transparent p-1.5 text-secondary hover:border-border hover:text-secondary transition-colors duration-150"
                  aria-label="Borrar categoría"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>

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
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-lg p-0" showCloseButton={false}>
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Eliminar categoría</DialogTitle>
            <DialogDescription>
              <p>
                {`¿Seguro que deseas borrar `}
                <b>{category.nombre}</b>?
              </p>
              <p>{`Esta acción no se puede deshacer.`}</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-sm font-medium border border-border text-foreground-secondary hover:border-border-hover hover:text-foreground transition-all duration-150"
              >
                Cancelar
              </button>
            </DialogClose>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-secondary text-secondary-foreground hover:opacity-90 transition-all duration-150"
            >
              Eliminar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
