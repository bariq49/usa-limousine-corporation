import { dashboardSmokeTests } from "../dashboard-smoke";

dashboardSmokeTests("admin", "http://127.0.0.1:3001", {
  headingRegex: /Welcome Back, Admin/i,
  hasForgotPassword: false,
  dashboardPath: "/analytics",
  profilePath: "/profile-setting",
});
