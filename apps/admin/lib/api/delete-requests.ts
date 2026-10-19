import { http } from "../http/client";
import API_ROUTES from "./routes";
import type {
  DeleteRequest,
  DeleteRequestResponse,
  ListResponse,
  Query,
  RejectPayload,
} from "../types/delete-requests";

export const listDeleteRequests = (params?: Query) => {
  return http.get<ListResponse>(API_ROUTES.DELETE_REQUESTS, { params });
};

export const getDeleteRequestByDriverId = (driverId: string) => {
  return http.get<DeleteRequestResponse>(`${API_ROUTES.DRIVERS}/${driverId}/delete-request`);
};

export const approveDeleteRequest = (id: string) => {
  return http.post<DeleteRequest>(`${API_ROUTES.DELETE_REQUESTS}/${id}/approve`);
};

export const rejectDeleteRequest = (id: string, payload?: RejectPayload) => {
  return http.post<DeleteRequest>(`${API_ROUTES.DELETE_REQUESTS}/${id}/reject`, payload ?? {});
};
