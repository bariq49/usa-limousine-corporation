import { http } from "../http/client";
import API_ROUTES from "./routes";
import type { UploadResponse } from "./types";

export const uploadFile = (file: File, folder = "profiles") => {
  const formData = new FormData();
  formData.append("file", file);
  return http.post<UploadResponse>(
    `${API_ROUTES.UPLOADS}?folder=${encodeURIComponent(folder)}`,
    formData,
  );
};
