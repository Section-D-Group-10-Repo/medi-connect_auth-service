import { ENV } from "../config";

export const SERVICE_NAME = {
  AUTH_SERVICE: "auth-service",
  APPOINTMENT_SERVICE: "appointment-service",
  NOTITICATION_SERVICE: "notification-service",
};

export const SERVICE_ANNOUNCEMENT_TIME = 1000 * 60 * 2; // 5 minutes

export const SERVICE_ADDRESS = `http://localhost:${ENV.PORT}`;
