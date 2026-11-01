"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header>
      <b>Кабинет</b>
      <Link href="/payments">Платежи</Link>
      <Link href="/payments/new">Новый платёж</Link>
      <Link href="/reports">Отчёты</Link>
      {user.role === "admin" && <Link href="/users">Пользователи</Link>}
      <span style={{ marginLeft: "auto" }}>{user.name}</span>
      <button onClick={handleLogout}>Выйти</button>
    </header>
  );
}