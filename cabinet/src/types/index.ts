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

export type PaymentStatus = "paid" | "refunded";

export type Payment = {
  id: number;
  customer: string;
  description: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  userId: number;
};
// данные из формы нового платежа
export type PaymentFormData = {
  customer: string;
  description: string;
  amount: number;
};
