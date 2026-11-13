type EmailAccess = {
  role?: string;
  emailVerified: boolean;
  emailVerificationDeadline: Date;
};

export function hasEmailAccess(user: EmailAccess, now = new Date()): boolean {
  return (
    user.role === 'SUPER_ADMIN' ||
    user.emailVerified ||
    user.emailVerificationDeadline > now
  );
}
