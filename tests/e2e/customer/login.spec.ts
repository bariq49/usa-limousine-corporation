import { dashboardSmokeTests } from "../dashboard-smoke";

dashboardSmokeTests("customer", "http://127.0.0.1:3002", {
  profilePath: "/profile-setting",
});
