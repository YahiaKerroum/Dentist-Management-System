import { useEffect, useState } from "react";
import { Role } from "../../backend/src/types/prisma.types";

type User = { id: string; firstName: string; lastName: string; email: string; role: Role };

export default function PermissionsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [newPermission, setNewPermission] = useState("");

  useEffect(() => {
    fetch("/api/users", { credentials: "include" })
      .then((r) => r.json())
      .then((res) => setUsers(res.data || []));
  }, []);

  const loadPermissions = async (userId: string) => {
    const r = await fetch(`/api/users/${userId}/permissions`, { credentials: "include" });
    const res = await r.json();
    setPermissions(res.data || []);
  };

  const onSelectUser = async (id: string) => {
    const user = users.find((u) => u.id === id) || null;
    setSelectedUser(user);
    if (user) await loadPermissions(user.id);
  };

  const grant = async () => {
    if (!selectedUser || !newPermission) return;
    await fetch(`/api/users/${selectedUser.id}/permissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ permissionName: newPermission }),
    });
    setNewPermission("");
    await loadPermissions(selectedUser.id);
  };

  const revoke = async (perm: string) => {
    if (!selectedUser) return;
    await fetch(`/api/users/${selectedUser.id}/permissions/${encodeURIComponent(perm)}`, {
      method: "DELETE",
      credentials: "include",
    });
    await loadPermissions(selectedUser.id);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Permissions Management</h1>
      <div className="mb-4">
        <label className="mr-2">Select User:</label>
        <select onChange={(e) => onSelectUser(e.target.value)} value={selectedUser?.id || ""}>
          <option value="" disabled>Select a user</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.firstName} {u.lastName} ({u.role})
            </option>
          ))}
        </select>
      </div>

      {selectedUser && (
        <div>
          <h2 className="text-lg font-medium mb-2">User Permissions</h2>
          <ul className="mb-4">
            {permissions.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <span>{p}</span>
                <button className="text-red-600" onClick={() => revoke(p)}>Revoke</button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <input
              className="border px-2 py-1"
              placeholder="Permission name"
              value={newPermission}
              onChange={(e) => setNewPermission(e.target.value)}
            />
            <button className="bg-blue-600 text-white px-3 py-1" onClick={grant}>Grant</button>
          </div>
        </div>
      )}
    </div>
  );
}
