import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAsync, useList } from "../hooks/useResource";
import AdminIcon from "../components/AdminIcon";
import EditorShell, { Rail, RailSection } from "../components/EditorShell";
import {
  Button, Card, CardHead, Chip, ConfirmDialog, EmptyState, ErrorBox, Field, Input, Modal,
  PageHead, Pager, RowActions, RowTitle, Select, Spacer, Table, TableSkeleton, Textarea,
  Toggle, Toolbar, useToast,
} from "../components/ui";
import s from "./Forms.module.css";

const FIELD_TYPES = ["text", "email", "textarea", "number", "tel", "url", "select", "radio", "checkbox", "date", "file"];
const uid = () => `f${Math.random().toString(36).slice(2, 8)}`;

/* ------------------------------------------------------------------ list */
export function Forms() {
  const toast = useToast();
  const list = useList(api.forms, { limit: 20 });
  const [confirm, setConfirm] = useState(null);

  async function remove(form) {
    try {
      await api.forms.trash(form._id);
      toast.success("Form deleted");
      list.reload();
    } catch (err) {
      toast.error(err);
    }
  }

  return (
    <>
      <PageHead title="Forms" subtitle="Forms on the site and the messages they collect.">
        <Link to="/admin/forms/new"><Button variant="primary" icon="plus">New Form</Button></Link>
      </PageHead>

      <Card>
        <Toolbar><Spacer /></Toolbar>
        {list.loading && <TableSkeleton rows={4} />}
        {list.error && <ErrorBox error={list.error} onRetry={list.reload} />}
        {!list.loading && !list.error && list.items.length === 0 && (
          <EmptyState title="No forms yet" message="Create a form to start collecting enquiries." />
        )}
        {!list.loading && !list.error && list.items.length > 0 && (
          <Table columns={["Name", "Fields", "Status", "Submissions", ""]}>
            {list.items.map((f) => (
              <tr key={f._id}>
                <td><Link to={`/admin/forms/${f._id}`}><RowTitle sub={f.description}>{f.title}</RowTitle></Link></td>
                <td>{f.fields?.length ?? 0}</td>
                <td><Chip>{f.status}</Chip></td>
                <td>
                  <Link to={`/admin/forms/${f._id}/submissions`} className={s.subLink}>
                    View messages <AdminIcon name="chevronRight" size={14} />
                  </Link>
                </td>
                <td>
                  <RowActions>
                    <Link to={`/admin/forms/${f._id}`}><Button size="sm" icon="edit">Edit</Button></Link>
                    <Button size="sm" variant="ghost" icon="trash" onClick={() => setConfirm(f)}>Delete</Button>
                  </RowActions>
                </td>
              </tr>
            ))}
          </Table>
        )}
        <Pager page={list.page} pages={list.pages} total={list.total} onPage={(page) => list.setParam({ page })} />
      </Card>

      {confirm && (
        <ConfirmDialog
          title="Delete form"
          message={`“${confirm.title}” will be deleted. Messages already received are kept.`}
          confirmLabel="Delete"
          destructive
          onConfirm={() => remove(confirm)}
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  );
}

/* ---------------------------------------------------------------- editor */
const BLANK_FORM = {
  title: "", slug: "", description: "", status: "active",
  fields: [],
  settings: {
    submitLabel: "Send message", buttonPosition: "left",
    successMessage: "Thanks — we'll get back to you shortly.",
    redirectUrl: "", notifyEmails: "", storeSubmissions: true, honeypot: true, requireAuth: false,
  },
};

export function FormEditor() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const toast = useToast();

  const [form, setForm] = useState(BLANK_FORM);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingField, setEditingField] = useState(null);

  const { data, loading, error, reload } = useAsync(
    () => (isNew ? Promise.resolve(null) : api.forms.get(id)),
    [id],
  );

  useEffect(() => {
    if (!data) return;
    setForm({ ...BLANK_FORM, ...data, settings: { ...BLANK_FORM.settings, ...(data.settings || {}) } });
    setDirty(false);
  }, [data]);

  const set = (patch) => { setForm((f) => ({ ...f, ...patch })); setDirty(true); };
  const setSetting = (patch) => { setForm((f) => ({ ...f, settings: { ...f.settings, ...patch } })); setDirty(true); };

  function upsertField(field, index) {
    setForm((f) => {
      const fields = [...f.fields];
      if (index == null) fields.push(field);
      else fields[index] = field;
      return { ...f, fields };
    });
    setDirty(true);
  }

  function removeField(index) {
    setForm((f) => ({ ...f, fields: f.fields.filter((_, i) => i !== index) }));
    setDirty(true);
  }

  function moveField(index, delta) {
    setForm((f) => {
      const fields = [...f.fields];
      const target = index + delta;
      if (target < 0 || target >= fields.length) return f;
      [fields[index], fields[target]] = [fields[target], fields[index]];
      return { ...f, fields };
    });
    setDirty(true);
  }

  async function save() {
    if (!form.title.trim()) return toast.error("A name is required.");
    if (!form.fields.length) return toast.error("Add at least one field.");
    setSaving(true);
    try {
      const payload = {
        title: form.title, slug: form.slug || undefined, description: form.description,
        status: form.status, fields: form.fields, settings: form.settings,
      };
      if (isNew) {
        const saved = await api.forms.create(payload);
        toast.success("Form created");
        window.location.replace(`/admin/forms/${saved._id}`);
      } else {
        await api.forms.update(id, payload);
        setDirty(false);
        toast.success("Form updated");
        reload();
      }
    } catch (err) {
      toast.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Card><TableSkeleton rows={6} /></Card>;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  return (
    <EditorShell
      backTo="/admin/forms"
      backLabel="Forms"
      title={isNew ? "New Form" : "Edit Form"}
      dirty={dirty}
      saving={saving}
      onSave={save}
      rail={
        <Rail>
          <RailSection title="Form settings">
            <Field label="Status">
              <Select
                value={form.status}
                onChange={(e) => set({ status: e.target.value })}
                options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]}
              />
            </Field>
            <Field label="Submit button label">
              <Input value={form.settings.submitLabel} onChange={(e) => setSetting({ submitLabel: e.target.value })} />
            </Field>
            <Field label="Button position">
              <Select
                value={form.settings.buttonPosition}
                onChange={(e) => setSetting({ buttonPosition: e.target.value })}
                options={[{ value: "left", label: "Left" }, { value: "center", label: "Centre" }, { value: "right", label: "Right" }]}
              />
            </Field>
            <Field label="Success message" hint="Shown in place of the form once it is sent.">
              <Textarea rows={3} value={form.settings.successMessage} onChange={(e) => setSetting({ successMessage: e.target.value })} />
            </Field>
            <Field label="Redirect URL" hint="Optional. Overrides the success message.">
              <Input value={form.settings.redirectUrl} onChange={(e) => setSetting({ redirectUrl: e.target.value })} />
            </Field>
          </RailSection>

          <RailSection title="Notifications">
            <Field label="Notify these addresses" hint="Comma-separated. Each submission is emailed to them.">
              <Input value={form.settings.notifyEmails} onChange={(e) => setSetting({ notifyEmails: e.target.value })} placeholder="info@t-tel.org" />
            </Field>
            <Toggle
              checked={form.settings.storeSubmissions}
              onChange={(v) => setSetting({ storeSubmissions: v })}
              title="Store submissions"
              description="Keep a copy in the dashboard as well as emailing it."
            />
            <Toggle
              checked={form.settings.honeypot}
              onChange={(v) => setSetting({ honeypot: v })}
              title="Spam protection"
              description="Adds a hidden field that blocks most automated submissions."
            />
          </RailSection>
        </Rail>
      }
    >
      <Card>
        <div className={s.formHead}>
          <Field label="Form name" required>
            <Input value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="Contact Us" />
          </Field>
          <Field label="Description" hint="Only shown in the dashboard.">
            <Input value={form.description} onChange={(e) => set({ description: e.target.value })} />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHead title="Fields">
          <Button type="button" size="sm" icon="plus" onClick={() => setEditingField({ index: null, field: { type: "text", label: "", name: "", required: false, placeholder: "", width: "full", options: [] } })}>
            Add field
          </Button>
        </CardHead>

        {form.fields.length === 0 ? (
          <EmptyState title="No fields yet" message="Add the questions this form should ask." />
        ) : (
          <div className={s.fieldList}>
            {form.fields.map((f, i) => (
              <div key={f.name + i} className={s.fieldRow}>
                <span className={s.fieldType}>{f.type}</span>
                <span className={s.fieldLabel}>
                  <strong>{f.label}</strong>
                  <em>{f.name}{f.required ? " · required" : ""} · {f.width}</em>
                </span>
                <div className={s.fieldActions}>
                  <Button type="button" size="sm" variant="ghost" onClick={() => moveField(i, -1)} disabled={i === 0} aria-label="Move up">↑</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => moveField(i, 1)} disabled={i === form.fields.length - 1} aria-label="Move down">↓</Button>
                  <Button type="button" size="sm" icon="edit" onClick={() => setEditingField({ index: i, field: f })}>Edit</Button>
                  <Button type="button" size="sm" variant="ghost" icon="trash" onClick={() => removeField(i)} aria-label="Remove" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {editingField && (
        <FieldDialog
          state={editingField}
          onClose={() => setEditingField(null)}
          onSave={(field) => { upsertField(field, editingField.index); setEditingField(null); }}
        />
      )}
    </EditorShell>
  );
}

function FieldDialog({ state, onClose, onSave }) {
  const toast = useToast();
  const [field, setField] = useState(state.field);
  const set = (patch) => setField((f) => ({ ...f, ...patch }));
  const needsOptions = ["select", "radio", "checkbox"].includes(field.type);

  function submit(e) {
    e.preventDefault();
    if (!field.label.trim()) return toast.error("A label is required.");
    const name = (field.name || field.label).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || uid();
    onSave({ ...field, name, options: needsOptions ? field.options.filter(Boolean) : [] });
  }

  return (
    <Modal
      title={state.index == null ? "Add field" : "Edit field"}
      onClose={onClose}
      footer={
        <>
          <Button type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="fieldForm" variant="primary">Save field</Button>
        </>
      }
    >
      <form id="fieldForm" onSubmit={submit}>
        <Field label="Field type">
          <Select value={field.type} onChange={(e) => set({ type: e.target.value })} options={FIELD_TYPES} />
        </Field>
        <Field label="Label" required>
          <Input autoFocus value={field.label} onChange={(e) => set({ label: e.target.value })} placeholder="Your name" />
        </Field>
        <Field label="Name" hint="The key stored with each submission. Generated from the label if left blank.">
          <Input value={field.name} onChange={(e) => set({ name: e.target.value })} placeholder="name" />
        </Field>
        <Field label="Placeholder">
          <Input value={field.placeholder} onChange={(e) => set({ placeholder: e.target.value })} />
        </Field>
        {needsOptions && (
          <Field label="Options" hint="One per line.">
            <Textarea
              rows={4}
              value={(field.options || []).join("\n")}
              onChange={(e) => set({ options: e.target.value.split("\n") })}
            />
          </Field>
        )}
        <Field label="Width">
          <Select
            value={field.width}
            onChange={(e) => set({ width: e.target.value })}
            options={[{ value: "full", label: "Full width" }, { value: "half", label: "Half width" }]}
          />
        </Field>
        <Toggle checked={field.required} onChange={(v) => set({ required: v })} title="Required" description="The form cannot be sent without it." />
      </form>
    </Modal>
  );
}

/* ----------------------------------------------------------- submissions */
export function Submissions() {
  const { id } = useParams();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const { data: form } = useAsync(() => api.forms.get(id), [id]);
  const { data, loading, error, reload } = useAsync(() => api.submissions.list(id, { page }), [id, page]);

  async function markRead(sub) {
    if (sub.isRead) return;
    try {
      await api.submissions.markRead(sub._id, true);
      reload();
    } catch { /* not worth interrupting the reader for */ }
  }

  async function remove(sub) {
    try {
      await api.submissions.remove(sub._id);
      toast.success("Message deleted");
      setOpen(null);
      reload();
    } catch (err) {
      toast.error(err);
    }
  }

  return (
    <>
      <PageHead title={form ? `${form.title} · Messages` : "Messages"} subtitle="Enquiries received through this form.">
        <Link to={`/admin/forms/${id}`}><Button icon="edit">Edit form</Button></Link>
      </PageHead>

      <Card>
        {loading && <TableSkeleton rows={6} />}
        {error && <ErrorBox error={error} onRetry={reload} />}
        {!loading && !error && (data?.items || []).length === 0 && (
          <EmptyState title="No messages yet" message="Submissions from the site will appear here." />
        )}
        {!loading && !error && (data?.items || []).length > 0 && (
          <Table columns={["From", "Summary", "Received", ""]}>
            {data.items.map((sub) => {
              const values = Object.values(sub.payload || {});
              return (
                <tr key={sub._id} className={sub.isRead ? undefined : s.unread}>
                  <td>
                    <RowTitle sub={sub.payload?.email}>{sub.payload?.name || "Anonymous"}</RowTitle>
                  </td>
                  <td className={s.summary}>{String(values[values.length - 1] ?? "").slice(0, 90)}</td>
                  <td>{new Date(sub.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</td>
                  <td>
                    <RowActions>
                      {!sub.isRead && <Chip tone="chipBrand">New</Chip>}
                      <Button size="sm" icon="eye" onClick={() => { setOpen(sub); markRead(sub); }}>Read</Button>
                      <Button size="sm" variant="ghost" icon="trash" onClick={() => setConfirm(sub)} aria-label="Delete" />
                    </RowActions>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
        <Pager page={data?.page || page} pages={data?.pages || 1} total={data?.total} onPage={setPage} />
      </Card>

      {open && (
        <Modal
          title={`Message from ${open.payload?.name || "Anonymous"}`}
          onClose={() => setOpen(null)}
          footer={
            <>
              {open.payload?.email && (
                <a href={`mailto:${open.payload.email}`}><Button icon="mail">Reply by email</Button></a>
              )}
              <Spacer />
              <Button onClick={() => setOpen(null)}>Close</Button>
            </>
          }
        >
          <dl className={s.payload}>
            {Object.entries(open.payload || {}).map(([key, value]) => (
              <div key={key}>
                <dt>{key.replace(/_/g, " ")}</dt>
                <dd>{String(value)}</dd>
              </div>
            ))}
            <div><dt>Received</dt><dd>{new Date(open.createdAt).toLocaleString("en-GB")}</dd></div>
          </dl>
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          title="Delete message"
          message="This message will be permanently removed."
          confirmLabel="Delete"
          destructive
          onConfirm={() => remove(confirm)}
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  );
}
