"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@usa-limousine-corporation/ui/components/dialog";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { useCreateTicket } from "@/hooks/queries/use-tickets";
import { useUploadFile } from "@/hooks/queries/use-upload";
import { CATEGORY_OPTIONS } from "@/lib/utils/ticket-labels";

const schema = z.object({
  subject: z.string().trim().min(3, "Subject must be at least 3 characters.").max(200),
  category: z.enum(["BOOKING", "PAYMENTS", "ACCOUNT", "APP", "OTHER"]),
  description: z
    .string()
    .trim()
    .min(10, "Please describe the issue in at least 10 characters.")
    .max(5000),
  attachment: z.string().optional(),
});

type Values = z.infer<typeof schema>;

const EMPTY: Values = { subject: "", category: "BOOKING", description: "", attachment: "" };

export function NewTicketDialog({ onCreated }: { onCreated?: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const createTicket = useCreateTicket();
  const uploadFile = useUploadFile();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: EMPTY,
  });

  const handleUpload = async (file: File) => {
    const result = await uploadFile.mutateAsync({ file, folder: "tickets" });
    return result.secureUrl || result.url;
  };

  const submit = (values: Values) => {
    createTicket.mutate(
      {
        subject: values.subject,
        category: values.category,
        description: values.description,
        attachment: values.attachment || undefined,
      },
      {
        onSuccess: (ticket) => {
          form.reset(EMPTY);
          setOpen(false);
          onCreated?.(ticket.id);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">New ticket</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a support ticket</DialogTitle>
          <DialogDescription>
            Tell us what you need help with. Our team will reply here and notify you.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="mt-2 space-y-4">
            <Input name="subject" label="Subject" />
            <Input name="category" label="Category" type="select" options={CATEGORY_OPTIONS} />
            <Input name="description" label="Describe the issue" type="textarea" rows={5} />
            <Input
              name="attachment"
              label="Attachment (optional)"
              type="upload"
              accept="image/*,application/pdf"
              maxSizeMB={10}
              onUpload={handleUpload}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTicket.isPending || uploadFile.isPending}
                isLoading={createTicket.isPending}
              >
                Submit ticket
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
