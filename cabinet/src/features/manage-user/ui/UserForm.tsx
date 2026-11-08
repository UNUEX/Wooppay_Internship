"use client";
import { useState } from "react";
import { Role, SessionUser, UserFormData, validateUser } from "@/entities/user";
import { FieldErrors, hasErrors } from "@/shared/lib";

type Props = {
  initial?: SessionUser; // если передан, форма работает как редактирование
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel?: () => void;
};

export function UserForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(initial?.role ?? "merchant");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<UserFormData>>({});
  const [error, setError] = useState(""); // ошибка от сервера

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const data: UserFormData = { name: name.trim(), email: email.trim(), password, role };

    // 1) проверка на фронтенде
    const errors = validateUser(data, { isEdit: Boolean(initial) });
    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    // 2) отправка на сервер (он проверит ещё раз)
    try {
      await onSubmit(data);
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
    <form onSubmit={handleSubmit} noValidate>
      <h3>{initial ? "Редактирование" : "Новый пользователь"}</h3>

      <input placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} />
      {fieldErrors.name && <p className="error">{fieldErrors.name}</p>}

      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      {fieldErrors.email && <p className="error">{fieldErrors.email}</p>}

      <input
        type="password"
        placeholder={initial ? "Новый пароль (необязательно)" : "Пароль"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {fieldErrors.password && <p className="error">{fieldErrors.password}</p>}

      <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
        <option value="merchant">Предприниматель</option>
        <option value="admin">Админ</option>
      </select>
      {fieldErrors.role && <p className="error">{fieldErrors.role}</p>}

      {error && <p className="error">{error}</p>}
      <button type="submit">Сохранить</button>
      {onCancel && <button type="button" onClick={onCancel}>Отмена</button>}
    </form>
  );
}
