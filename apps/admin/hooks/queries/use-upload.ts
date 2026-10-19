import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { uploadFile } from "@/lib/api/upload";

import type { UploadFileOptions } from "@/lib/types/upload";

export const useUploadFile = () => {
  return useMutation({
    mutationFn: ({ file, folder = "profiles" }: UploadFileOptions) => {
      return uploadFile(file, folder);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload file");
    },
  });
};
