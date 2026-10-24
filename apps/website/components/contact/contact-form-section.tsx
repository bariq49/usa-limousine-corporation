"use client";

import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { CircleCheck, MoveRight, Spinner } from "@usa-limousine-corporation/ui/svg";
import { useContactUs } from "@/hooks/queries/use-contact-us";
import toast from "react-hot-toast";

interface ContactFormValues {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

export default function ContactFormSection() {
    const { mutate: submitContact, isPending } = useContactUs();
    
    const methods = useForm<ContactFormValues>({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            subject: "",
            message: "",
        },
    });

    const onSubmit = (data: ContactFormValues) => {
        submitContact(data, {
            onSuccess: (result) => {
                toast.success(result.message);
                methods.reset();
            },
            onError: (error: any) => {
                toast.error(error?.message || "Something went wrong. Please try again.");
            }
        });
    };

    return (
        <section className="py-4 bg-white pb-16">
            <div className="container mx-auto px-0 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
                    <div className="lg:col-span-5 flex flex-col space-y-2 px-6 lg:px-0 mb-8 lg:sticky lg:top-28 lg:mb-0">
                        <span className="text-secondary font-semibold text-base">
                            Message Us
                        </span>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                            Let's Start a Conversation
                        </h2>
                        <p className="text-sm md:text-base text-gray-500 leading-relaxed max-w-lg mt-2">
                            We value your time and interest. Fill out the form, and our team will get back to you shortly to discuss your requirements.
                        </p>

                        <div className="flex flex-col gap-5 mt-6">
                            <div className="flex items-start gap-3 group cursor-pointer">
                                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-secondary/5 flex items-center justify-center transition-colors group-hover:bg-secondary/10">
                                    <CircleCheck className="w-5 h-5 text-secondary" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-900 font-bold text-base tracking-tight uppercase">
                                        Personalized Service
                                    </span>
                                    <span className="text-gray-400 text-xs font-medium">
                                        Tailored solutions for your specific needs.
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 group cursor-pointer">
                                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-secondary/5 flex items-center justify-center transition-colors group-hover:bg-secondary/10">
                                    <CircleCheck className="w-5 h-5 text-secondary" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-900 font-bold text-base tracking-tight uppercase">
                                        Privacy Guaranteed
                                    </span>
                                    <span className="text-gray-400 text-xs font-medium">
                                        Your information is handled with discretion.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-7 p-6 lg:p-10 lg:bg-gray-50 lg:border lg:border-border lg:rounded-2xl shadow-none">
                        <FormProvider {...methods}>
                            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6 lg:space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                                    <Input
                                        name="firstName"
                                        label="First Name"
                                        required
                                    />
                                    <Input
                                        name="lastName"
                                        label="Last Name"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        name="email"
                                        type="email"
                                        label="Email Address"
                                        required
                                    />
                                    <Input
                                        name="phone"
                                        type="phone"
                                        label="Phone Number"
                                        required
                                    />
                                </div>

                                <Input
                                    name="subject"
                                    label="Subject"
                                    required
                                />

                                <Input
                                    name="message"
                                    type="textarea"
                                    label="Message"
                                    rows={5}
                                    required
                                />

                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full bg-black text-white hover:bg-black/80"
                                >
                                    {isPending ? (
                                        <div className="flex items-center gap-2">
                                            <Spinner className="w-5 h-5 animate-spin text-white" />
                                            <span>Sending...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span>Send Message</span>
                                            <MoveRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </FormProvider>
                    </div>
                </div>
            </div>
        </section>
    );
}
