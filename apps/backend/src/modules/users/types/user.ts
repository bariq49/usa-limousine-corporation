export interface FindByEmail {
  email: string;
}

export interface FindById {
  id: string;
}

export interface Create {
  email: string;
  passwordHash: string;
  firstName?: string | null | undefined;
  lastName?: string | null | undefined;
  phone?: string | null | undefined;
}

export interface MarkEmailVerified {
  userId: string;
}

export interface UpdatePassword {
  userId: string;
  passwordHash: string;
}

export interface UpdateLoginFailure {
  userId: string;
  failedLoginCount: number;
  lockoutUntil: Date | null;
}

export interface UpdateProfile {
  userId: string;
  firstName?: string | null | undefined;
  lastName?: string | null | undefined;
  phone?: string | null | undefined;
  avatar?: string | null | undefined;
}
