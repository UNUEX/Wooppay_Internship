"use client";
import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import { useAuth } from "@/context/AuthContext";
import { Report } from "@/types";
import * as reportService from "@/services/reportService";

export default function ReportsPage() {
  return (
    <ProtectedPage>
      <ReportsContent />
    </ProtectedPage>
  );
}

function ReportsContent() {
  const { user } = useAuth();
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    if (user) reportService.getReport(user).then(setReport);
  }, [user]);

  if (!report) return <p>Загрузка...</p>;

  return (
    <div>
      <h1>Отчёт</h1>
      <table>
        <tbody>
          <tr><td>Всего платежей</td><td>{report.totalCount}</td></tr>
          <tr><td>Оплачено (шт.)</td><td>{report.paidCount}</td></tr>
          <tr><td>Оплачено (сумма)</td><td>{report.paidSum} ₸</td></tr>
          <tr><td>Возвращено (шт.)</td><td>{report.refundedCount}</td></tr>
          <tr><td>Возвращено (сумма)</td><td>{report.refundedSum} ₸</td></tr>
        </tbody>
      </table>
    </div>
  );
}
