export type Role = "admin" | "merchant";

export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
};

// пользователь без пароля, его отдаём на фронт
export type SessionUser = Omit<User, "password">;

// данные из формы пользователя (создание и редактирование)
export type UserFormData = {
  name: string;
  email: string;
  password: string;
  role: Role;
};
