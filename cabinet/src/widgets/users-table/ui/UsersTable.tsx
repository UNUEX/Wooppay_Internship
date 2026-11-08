import { SessionUser } from "@/entities/user";

type Props = {
  users: SessionUser[];
  onEdit: (user: SessionUser) => void;
};

export function UsersTable({ users, onEdit }: Props) {
  return (
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
            <td><button onClick={() => onEdit(u)}>Изменить</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
