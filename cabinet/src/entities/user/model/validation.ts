import { FieldErrors, validateEmail, validateMinLength, validateName } from "@/shared/lib";
import { Role, UserFormData } from "./types";

export const MIN_PASSWORD_LENGTH = 6;
const ROLES: Role[] = ["admin", "merchant"];

// Что такое "правильный пользователь". Используется и в форме, и в API.
// isEdit: при редактировании пустой пароль разрешён (значит "не менять пароль").
export function validateUser(
  data: Partial<Record<keyof UserFormData, unknown>>,
  { isEdit }: { isEdit: boolean }
) {
  const errors: FieldErrors<UserFormData> = {};

  const name = validateName(data.name);
  if (name) errors.name = name;

  const email = validateEmail(data.email);
  if (email) errors.email = email;

  const passwordIsEmpty = data.password === undefined || data.password === "";
  if (!(isEdit && passwordIsEmpty)) {
    const password = validateMinLength(data.password, MIN_PASSWORD_LENGTH);
    if (password) errors.password = password;
  }

  if (!ROLES.includes(data.role as Role)) errors.role = "Выберите роль";

  return errors;
}
