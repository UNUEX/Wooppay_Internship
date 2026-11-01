"use client";
import { useState } from "react";
import { Role, UserFormData } from "@/types";

type Props = {
  onSubmit: (data: UserFormData) => Promise<void>;
};

export default function UserForm({ onSubmit }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("merchant");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await onSubmit({ name, email, password, role });
      // очищаем форму после успешного создания
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Новый пользователь</h3>
      <input placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} required />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
        <option value="merchant">Предприниматель</option>
        <option value="admin">Админ</option>
      </select>
      {error && <p className="error">{error}</p>}
      <button type="submit">Сохранить</button>
    </form>
  );
}
