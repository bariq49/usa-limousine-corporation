"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "../button";
import { Form } from "../form";
import { Input } from "../input";
import { personalDetailsSchema, type PersonalDetailsSchema } from "../../schemas";
import { useUser } from "../../providers/user-context";

export interface PersonalDetailsFormProps {
  onSubmit?: ((values: PersonalDetailsSchema) => Promise<void> | void) | undefined;
  isSubmitting?: boolean | undefined;
}

export function PersonalDetailsForm({ onSubmit, isSubmitting }: PersonalDetailsFormProps = {}) {
  const { user } = useUser();

  const form = useForm<PersonalDetailsSchema>({
    resolver: zodResolver(personalDetailsSchema),
    mode: "all",
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
      email: user?.email || "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        email: user.email || "",
      });
    }
  }, [user, form]);

  const handleSubmit = (values: PersonalDetailsSchema) => {
    if (onSubmit) {
      return onSubmit(values);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-1 flex-col justify-between"
      >
        <div className="grid grid-cols-12 gap-y-5 md:gap-x-6">
          <div className="col-span-12 md:col-span-6">
            <Input name="firstName" label="First Name" />
          </div>
          <div className="col-span-12 md:col-span-6">
            <Input name="lastName" label="Last Name" />
          </div>
          <div className="col-span-12 md:col-span-6">
            <Input name="phone" label="Phone Number" type="phone" />
          </div>
          <div className="col-span-12 md:col-span-6">
            <Input name="email" label="Email Address" type="email" readOnly />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset({
                firstName: user?.firstName || "",
                lastName: user?.lastName || "",
                phone: user?.phone || "",
                email: user?.email || "",
              });
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !onSubmit}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
