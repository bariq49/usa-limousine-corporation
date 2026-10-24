import { getSettings } from "@/lib/api/settings";
import { useQuery } from "@tanstack/react-query";

export const useSettings = () => {
    return useQuery({
        queryKey: ["platform-settings"],
        queryFn: getSettings,
    });
};
