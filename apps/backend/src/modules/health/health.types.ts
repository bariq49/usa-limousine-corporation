export type DependencyStatus = "up" | "down" | "not_configured";

export interface HealthStatus {
  status: "ok" | "degraded";
  database: "up" | "down";
  redis: DependencyStatus;
  queue: DependencyStatus;
  storage: DependencyStatus;
  email: DependencyStatus;
  websocket: DependencyStatus;
  firebase: DependencyStatus;
  twilio: DependencyStatus;
}
