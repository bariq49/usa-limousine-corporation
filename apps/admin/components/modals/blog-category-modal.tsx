"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@usa-limousine-corporation/ui/components/dialog";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { useSaveTaxonomy } from "@/hooks/queries/use-blogs";
import { useUploadFile } from "@/hooks/queries/use-upload";
import { taxonomySchema, type TaxonomySchema } from "@/lib/schemas/blogs";
import type { BlogCategoryModalProps } from "@/lib/types/blogs";

const EMPTY: TaxonomySchema = {
  name: "",
  slug: "",
  description: "",
  image: "",
  sortOrder: 0,
  isActive: true,
};

export function BlogCategoryModal(props: BlogCategoryModalProps) {
  const { open, onOpenChange, initialData } = props;
  const saveMutation = useSaveTaxonomy("category");
  const uploadMutation = useUploadFile();

  const form = useForm<TaxonomySchema>({
    resolver: zodResolver(taxonomySchema),
    mode: "all",
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      initialData
        ? {
            name: initialData.name,
            slug: initialData.slug,
            description: initialData.description ?? "",
            image: initialData.image ?? "",
            sortOrder: initialData.sortOrder,
            isActive: initialData.isActive,
          }
        : EMPTY,
    );
  }, [form, initialData, open]);

  const onSubmit = async (values: TaxonomySchema) => {
    try {
      await saveMutation.mutateAsync({
        id: initialData?.id,
        payload: {
          name: values.name,
          slug: values.slug || undefined,
          description: values.description || null,
          image: values.image || null,
          sortOrder: values.sortOrder,
          isActive: values.isActive,
        },
      });
      onOpenChange(false);
    } catch {
      return;
    }
  };

  const isPending = saveMutation.isPending || uploadMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <Input
              name="image"
              label="Image (Optional)"
              type="upload"
              accept="image/*"
              onUpload={async (file: File) => {
                const result = await uploadMutation.mutateAsync({ file, folder: "blog" });
                return result.secureUrl || result.url;
              }}
            />
            <Input name="name" label="Category Name" />
            <Input
              name="slug"
              label="Slug (Optional)"
              hint="Created from the name when left empty"
            />
            <Input name="description" label="Description (Optional)" type="textarea" />
            <Input name="sortOrder" label="Sort Order" type="number" min="0" />

            <div className="flex items-center justify-between border-t border-border pt-2">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-default-700">Active</p>
                <p className="text-xs text-default-500">
                  Show on the website and in the article form
                </p>
              </div>
              <Input name="isActive" type="switch" switchSize="md" />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} isLoading={isPending}>
                {initialData ? "Update Category" : "Add Category"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
