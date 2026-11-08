"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../model/AuthContext";
import { Role } from "@/entities/user";

type Props = {
  children: React.ReactNode;
  role?: Role; // если указана, пускаем только эту роль
};

export function ProtectedPage({ children, role }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) return <p>Загрузка...</p>;
  if (role && user.role !== role) return <p>Нет доступа</p>;

  return <>{children}</>;
}