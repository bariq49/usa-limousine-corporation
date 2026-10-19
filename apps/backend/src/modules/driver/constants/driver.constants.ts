import { DRIVER_ROOM_PREFIX, driverRoom } from "../../../infrastructure/websocket/constants/rooms";

export { DRIVER_ROOM_PREFIX, driverRoom };

export const VEHICLE_DOCUMENT_FIELDS = {
  registrationDocument: "CAR_REGISTRATION",
  frontView: "CAR_FRONT",
  backView: "CAR_BACK",
  leftSideView: "CAR_LEFT",
  rightSideView: "CAR_RIGHT",
  insideView: "CAR_INSIDE",
  licensePlateView: "LICENSE_PLATE",
} as const;

export const REQUIRED_DOCUMENT_FIELDS = {
  chauffeurFront: "CHAUFFEUR_FRONT",
  chauffeurBack: "CHAUFFEUR_BACK",
  licenseFront: "LICENSE_FRONT",
  licenseBack: "LICENSE_BACK",
  nationalIdFront: "NATIONAL_ID_FRONT",
  nationalIdBack: "NATIONAL_ID_BACK",
  kiwaPermit: "KIWA_PERMIT",
  vehicleInsurance: "INSURANCE",
  airportStaPass: "AIRPORT_STA_PASS",
} as const;

export const DRIVER_QUEUE_NAME = "driver";

export const DRIVER_JOB_NAMES = {
  SEND_APPLICATION_STATUS_EMAIL: "SendApplicationStatusEmail",
  SEND_APPLICATION_RECEIVED_EMAILS: "SendApplicationReceivedEmails",
  SEND_DRIVER_CREDENTIALS_EMAIL: "SendDriverCredentialsEmail",
} as const;

export const DRIVER_WS_EVENTS = {
  PRESENCE_UPDATED: "driver.presence.updated",
} as const;

export const DRIVER_NOTIFICATION_WS_EVENTS = {
  CREATED: "driver.notification.created",
} as const;

export const FLEET_WS_EVENTS = {
  UPDATED: "driver.fleet.updated",
} as const;
