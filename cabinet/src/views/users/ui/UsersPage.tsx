"use client";
import { useEffect, useState } from "react";
import { SessionUser, UserFormData, getUsers } from "@/entities/user";
import { ProtectedPage } from "@/features/auth";
import { UserForm, createUser, updateUser } from "@/features/manage-user";
import { UsersTable } from "@/widgets/users-table";

export function UsersPage() {
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
    getUsers().then(setUsers);
  }, []);

  async function handleCreate(data: UserFormData) {
    const created = await createUser(data);
    setUsers([...users, created]);
  }

  async function handleUpdate(data: UserFormData) {
    if (!editing) return;
    const updated = await updateUser(editing.id, data);
    setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
    setEditing(null);
  }

  return (
    <div>
      <h1>Пользователи</h1>
      <UsersTable users={users} onEdit={setEditing} />
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
