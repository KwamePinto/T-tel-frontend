import { useState } from "react";
import { api } from "../lib/api";
import { useAsync } from "../hooks/useResource";
import { useAuth } from "../context/AuthContext";
import {
  Button, Card, Chip, ConfirmDialog, EmptyState, ErrorBox, Field, Input, Modal, PageHead,
  RowActions, RowTitle, Select, Table, TableSkeleton, useToast,
} from "../components/ui";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "author", label: "Author" },
  { value: "user", label: "User" },
];

const ROLE_HINT = {
  admin: "Full access, including users, theme and permanent deletion.",
  editor: "Can create and publish all content, menus, forms and settings.",
  author: "Can write and edit their own posts and pages.",
  user: "Can sign in but cannot change site content.",
};

export default function Users() {
  const toast = useToast();
  const { user: me } = useAuth();
  const { data, loading, error, reload } = useAsync(() => api.users.list(), []);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const users = data?.items || data || [];

  async function remove(target) {
    try {
      await api.users.remove(target._id);
      toast.success("User removed");
      reload();
    } catch (err) {
      toast.error(err);
    }
  }

  return (
    <>
      <PageHead title="Users" subtitle="Who can sign in to the dashboard, and what they can do.">
        <Button variant="primary" icon="plus" onClick={() => setEditing("new")}>New User</Button>
      </PageHead>

      <Card>
        {loading && <TableSkeleton rows={4} />}
        {error && <ErrorBox error={error} onRetry={reload} />}
        {!loading && !error && users.length === 0 && <EmptyState title="No users" />}

        {!loading && !error && users.length > 0 && (
          <Table columns={["Name", "Email", "Role", "Added", ""]}>
            {users.map((u) => (
              <tr key={u._id}>
                <td>
                  <RowTitle sub={String(u._id) === String(me?.id) ? "That's you" : undefined}>{u.name}</RowTitle>
                </td>
                <td>{u.email}</td>
                <td><Chip>{u.role}</Chip></td>
                <td>{new Date(u.createdAt).toLocaleDateString("en-GB")}</td>
                <td>
                  <RowActions>
                    <Button size="sm" icon="edit" onClick={() => setEditing(u)}>Edit</Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon="trash"
                      disabled={String(u._id) === String(me?.id)}
                      title={String(u._id) === String(me?.id) ? "You cannot remove your own account" : undefined}
                      onClick={() => setConfirm(u)}
                    >
                      Remove
                    </Button>
                  </RowActions>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {editing && (
        <UserDialog
          user={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload(); }}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title="Remove user"
          message={`${confirm.name} will lose access immediately. Content they authored stays on the site.`}
          confirmLabel="Remove user"
          destructive
          onConfirm={() => remove(confirm)}
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  );
}

function UserDialog({ user, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "author",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return toast.error("Name and email are required.");
    if (!user && form.password.length < 8) return toast.error("Set a password of at least 8 characters.");
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email, role: form.role };
      if (form.password) payload.password = form.password;
      if (user) await api.users.update(user._id, payload);
      else await api.users.create(payload);
      toast.success(user ? "User updated" : "User created");
      onSaved();
    } catch (err) {
      toast.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={user ? "Edit user" : "New user"}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" form="userForm" variant="primary" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <form id="userForm" onSubmit={submit}>
        <Field label="Name" required>
          <Input autoFocus value={form.name} onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <Field label="Email" required>
          <Input type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} />
        </Field>
        <Field label="Role" hint={ROLE_HINT[form.role]}>
          <Select value={form.role} onChange={(e) => set({ role: e.target.value })} options={ROLES} />
        </Field>
        <Field
          label={user ? "New password" : "Password"}
          required={!user}
          hint={user ? "Leave blank to keep the current password." : "At least 8 characters."}
        >
          <Input
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => set({ password: e.target.value })}
          />
        </Field>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------- profile */
export function Profile() {
  const toast = useToast();
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", password: "", currentPassword: "" });
  const [saving, setSaving] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) {
        payload.password = form.password;
        payload.currentPassword = form.currentPassword;
      }
      const { user: updated } = await api.auth.updateProfile(payload);
      if (updated) setUser(updated);
      setForm((f) => ({ ...f, password: "", currentPassword: "" }));
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHead title="Edit profile" subtitle="Your name, sign-in email and password." />
      <Card>
        <form onSubmit={submit} style={{ padding: 24, maxWidth: 520 }}>
          <Field label="Name"><Input value={form.name} onChange={(e) => set({ name: e.target.value })} /></Field>
          <Field label="Email"><Input type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} /></Field>
          <Field label="Current password" hint="Only needed when changing your password.">
            <Input type="password" autoComplete="current-password" value={form.currentPassword} onChange={(e) => set({ currentPassword: e.target.value })} />
          </Field>
          <Field label="New password" hint="At least 8 characters. Leave blank to keep the current one.">
            <Input type="password" autoComplete="new-password" value={form.password} onChange={(e) => set({ password: e.target.value })} />
          </Field>
          <Button type="submit" variant="primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        </form>
      </Card>
    </>
  );
}
