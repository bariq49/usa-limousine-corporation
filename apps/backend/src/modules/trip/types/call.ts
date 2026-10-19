export type CallMode = "audio";

export type CallTokenResult = {
  tripId: string;
  appId: string;
  channel: string;
  uid: number;
  token: string;
  role: "publisher";
  expiresAt: string;
  mode: CallMode;
};

export type IssueCallToken = {
  tripId: string;
  userId: string;
  peerUserId: string | null;
  driverId: string;
};

export type CallInviteParams = {
  tripId: string;
  fromUserId: string;
  peerUserId: string | null;
  driverId: string;
  channel: string;
};

export type CallInviteBody = {
  tripId: string;
  channel: string;
  fromUserId: string;
  mode: CallMode;
};

export type CallInvitePayload = {
  type: "CALL_INVITE";
  payload: CallInviteBody;
};
