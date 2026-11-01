"use client";
import { useState } from "react";
import { Role, SessionUser, UserFormData } from "@/types";

type Props = {
  initial?: SessionUser; // если передан, форма работает как редактирование
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel?: () => void;
};

export default function UserForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(initial?.role ?? "merchant");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await onSubmit({ name, email, password, role });
      // очищаем форму после успешного создания
      if (!initial) {
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>{initial ? "Редактирование" : "Новый пользователь"}</h3>
      <input placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} required />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input
        type="password"
        placeholder={initial ? "Новый пароль (необязательно)" : "Пароль"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required={!initial}
      />
      <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
        <option value="merchant">Предприниматель</option>
        <option value="admin">Админ</option>
      </select>
      {error && <p className="error">{error}</p>}
      <button type="submit">Сохранить</button>
      {onCancel && <button type="button" onClick={onCancel}>Отмена</button>}
    </form>
  );
}
