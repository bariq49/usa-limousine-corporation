export type AuthTokens = {
  accessToken: string;
  sessionId: string;
};

export type CsrfResponse = {
  csrfToken: string;
};

export type CurrentUserMembership = {
  id: string;
  membershipStatus: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
};

export type CurrentUser = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  roles: string[];
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  sessionId: string;
  memberships: CurrentUserMembership[];
};

export type MessageResponse = {
  message: string;
};
