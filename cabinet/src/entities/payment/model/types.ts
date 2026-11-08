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
