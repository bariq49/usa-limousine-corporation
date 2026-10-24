import { contactUs } from "@/lib/api/contact";
import { useMutation } from "@tanstack/react-query";

export const useContactUs = () => {
    return useMutation({
        mutationFn: contactUs,
    });
};