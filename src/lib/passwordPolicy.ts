export const PASSWORD_MIN_LENGTH = 8;

// Shared client-side policy for password reset and admin user creation.
export function isPasswordLongEnough(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH;
}

export function getPasswordMinLengthMessage(): string {
  return `Das Passwort muss mindestens ${PASSWORD_MIN_LENGTH} Zeichen lang sein.`;
}

export function getPasswordMinLengthPlaceholder(): string {
  return `Mindestens ${PASSWORD_MIN_LENGTH} Zeichen`;
}
