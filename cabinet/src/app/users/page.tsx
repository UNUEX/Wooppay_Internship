"use client";
import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import UserForm from "@/components/UserForm";
import { SessionUser, UserFormData } from "@/types";
import * as userService from "@/services/userService";

export default function UsersPage() {
  return (
    <ProtectedPage role="admin">
      <UsersContent />
    </ProtectedPage>
  );
}

function UsersContent() {
  const [users, setUsers] = useState<SessionUser[]>([]);
  const [editing, setEditing] = useState<SessionUser | null>(null);

  useEffect(() => {
    userService.getUsers().then(setUsers);
  }, []);

  async function handleCreate(data: UserFormData) {
    const created = await userService.createUser(data);
    setUsers([...users, created]);
  }

  async function handleUpdate(data: UserFormData) {
    if (!editing) return;
    const updated = await userService.updateUser(editing.id, data);
    setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
    setEditing(null);
  }

  return (
    <div>
      <h1>Пользователи</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя</th>
            <th>Email</th>
            <th>Роль</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role === "admin" ? "Админ" : "Предприниматель"}</td>
              <td><button onClick={() => setEditing(u)}>Изменить</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing ? (
        <UserForm
          key={editing.id}
          initial={editing}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <UserForm onSubmit={handleCreate} />
      )}
    </div>
  );
}
