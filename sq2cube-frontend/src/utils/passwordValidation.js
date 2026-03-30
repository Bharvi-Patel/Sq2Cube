/** Matches backend `app.validation.validate_password`. */
export const PASSWORD_REQUIREMENTS_MSG =
  "Password must be 8-128 characters and include: a number, a lowercase letter, an uppercase letter, and a special character.";

export function isPasswordValid(password) {
  const v = password.trim();
  if (v.length < 8 || v.length > 128) return false;
  if (!/[A-Z]/.test(v) || !/[a-z]/.test(v) || !/[0-9]/.test(v)) return false;
  if (!/[^A-Za-z0-9]/.test(v)) return false;
  return true;
}
