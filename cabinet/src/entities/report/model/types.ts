// итоги по платежам для страницы отчётов
export type Report = {
  totalCount: number;
  paidCount: number;
  refundedCount: number;
  paidSum: number;
  refundedSum: number;
};
