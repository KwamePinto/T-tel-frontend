import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { mediaUrl } from "../../lib/cms";
import { useAsync, useList } from "../hooks/useResource";
import { MediaField } from "./MediaPicker";
import RichText from "./RichText";
import {
  Button, Card, Chip, ConfirmDialog, EmptyState, ErrorBox, Field, FilterPills, Input, Modal,
  PageHead, Pager, RowActions, RowTitle, SearchInput, Select, Spacer, Table, TableSkeleton,
  Textarea, Toggle, Toolbar, Thumb, useToast,
} from "./ui";

/**
 * Drives a whole CRUD screen — list, filters, create/edit modal, delete —
 * from a declarative config. Screens that need something genuinely different
 * (Posts, Pages, Media, Menus, Theme) have their own components instead.
 *
 * config = {
 *   title, subtitle, singular, resource,
 *   columns: [{ key, label, render?, width? }],
 *   fields:  [{ name, label, type, options?, hint?, required?, help?, when? }],
 *   filters: [{ key, label, options|source }],
 *   defaults, pageSize, orderable
 * }
 */
export default function ResourceManager({ config }) {
  const toast = useToast();
  const {
    title, subtitle, singular, resource, columns, fields,
    filters = [], defaults = {}, pageSize = 20, statusPills,
  } = config;

  const list = useList(resource, { limit: pageSize, ...(statusPills ? { status: "all" } : {}) });
  const [editing, setEditing] = useState(null); // object | "new" | null
  const [confirm, setConfirm] = useState(null);

  // option sources (e.g. a group select) are fetched once for the whole screen
  const sourceKeys = useMemo(
    () => [...filters, ...fields].filter((f) => f.source).map((f) => f.source),
    [filters, fields],
  );
  const { data: sources } = useAsync(async () => {
    const entries = await Promise.all(
      [...new Set(sourceKeys)].map(async (key) => {
        const res = await api[key].list({ limit: 200 });
        return [key, (res.items || []).map((i) => ({ value: i._id, label: i.name || i.title }))];
      }),
    );
    return Object.fromEntries(entries);
  }, [sourceKeys.join("|")]);

  const optionsFor = (f) => f.options || sources?.[f.source] || [];

  async function remove(item) {
    try {
      await resource.trash(item._id);
      toast.success(`${singular} deleted`);
      list.reload();
    } catch (err) {
      toast.error(err);
    }
  }

  return (
    <>
      <PageHead title={title} subtitle={subtitle}>
        <Button variant="primary" icon="plus" onClick={() => setEditing("new")}>
          New {singular}
        </Button>
      </PageHead>

      <Card>
        <Toolbar>
          {statusPills && (
            <FilterPills
              options={statusPills}
              value={list.params.status}
              onChange={(status) => list.setParam({ status })}
            />
          )}
          {filters.map((f) => (
            <Select
              key={f.key}
              placeholder={f.label}
              value={list.params[f.key] || ""}
              onChange={(e) => list.setParam({ [f.key]: e.target.value })}
              options={optionsFor(f)}
            />
          ))}
          <Spacer />
          <SearchInput value={list.search} onChange={list.setSearch} placeholder={`Search ${title.toLowerCase()}…`} />
        </Toolbar>

        {list.loading && <TableSkeleton rows={7} />}
        {list.error && <ErrorBox error={list.error} onRetry={list.reload} />}

        {!list.loading && !list.error && list.items.length === 0 && (
          <EmptyState
            title={`No ${title.toLowerCase()} yet`}
            message={`Create your first ${singular.toLowerCase()} to see it here.`}
            action={<Button variant="primary" icon="plus" onClick={() => setEditing("new")}>New {singular}</Button>}
          />
        )}

        {!list.loading && !list.error && list.items.length > 0 && (
          <Table columns={[...columns.map((c) => c.label), ""]}>
            {list.items.map((item) => (
              <tr key={item._id}>
                {columns.map((c) => (
                  <td key={c.key}>{c.render ? c.render(item) : (item[c.key] ?? "—")}</td>
                ))}
                <td>
                  <RowActions>
                    <Button size="sm" icon="edit" onClick={() => setEditing(item)}>Edit</Button>
                    <Button size="sm" variant="ghost" icon="trash" onClick={() => setConfirm(item)}>Delete</Button>
                  </RowActions>
                </td>
              </tr>
            ))}
          </Table>
        )}

        <Pager page={list.page} pages={list.pages} total={list.total} onPage={(page) => list.setParam({ page })} />
      </Card>

      {editing && (
        <ResourceForm
          config={config}
          item={editing === "new" ? null : editing}
          sources={sources}
          defaults={defaults}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); list.reload(); }}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title={`Delete ${singular.toLowerCase()}`}
          message={`“${confirm.name || confirm.title}” will be removed. Items that support Trash can be restored from there.`}
          confirmLabel="Delete"
          destructive
          onConfirm={() => remove(confirm)}
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  );
}

/* --------------------------------------------------------------- the form */
function ResourceForm({ config, item, sources, defaults, onClose, onSaved }) {
  const toast = useToast();
  const { fields, singular, resource } = config;

  const blank = useMemo(() => {
    const base = {};
    for (const f of fields) base[f.name] = f.type === "toggle" ? false : f.type === "number" ? 0 : "";
    return { ...base, ...defaults };
  }, [fields, defaults]);

  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!item) return setForm(blank);
    const next = { ...blank };
    for (const f of fields) {
      const value = item[f.name];
      next[f.name] = f.type === "ref" || f.type === "media"
        ? (value?._id || value || "")
        : value ?? next[f.name];
    }
    setForm(next);
  }, [item, blank, fields]);

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  async function submit(e) {
    e.preventDefault();
    for (const f of fields) {
      if (f.required && !String(form[f.name] ?? "").trim()) {
        return toast.error(`${f.label} is required.`);
      }
    }
    setSaving(true);
    try {
      const payload = {};
      for (const f of fields) {
        let value = form[f.name];
        if (f.type === "number") value = Number(value) || 0;
        if ((f.type === "ref" || f.type === "media") && !value) value = null;
        payload[f.name] = value;
      }
      if (item) await resource.update(item._id, payload);
      else await resource.create(payload);
      toast.success(item ? `${singular} updated` : `${singular} created`);
      onSaved();
    } catch (err) {
      toast.error(err);
    } finally {
      setSaving(false);
    }
  }

  const wide = fields.some((f) => f.type === "richtext");

  return (
    <Modal
      wide={wide}
      title={item ? `Edit ${singular.toLowerCase()}` : `New ${singular.toLowerCase()}`}
      onClose={onClose}
      footer={
        <>
          <Button type="button" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" form="resourceForm" variant="primary" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <form id="resourceForm" onSubmit={submit}>
        {fields.map((f) => {
          if (f.when && !f.when(form)) return null;
          const value = form[f.name];

          if (f.type === "toggle") {
            return (
              <Toggle
                key={f.name}
                checked={!!value}
                onChange={(v) => set(f.name, v)}
                title={f.label}
                description={f.hint}
              />
            );
          }

          if (f.type === "media") {
            return (
              <MediaField
                key={f.name}
                label={f.label}
                hint={f.hint}
                value={item && item[f.name]?._id === value ? item[f.name] : value || null}
                onChange={(m) => set(f.name, m?._id || null)}
              />
            );
          }

          if (f.type === "richtext") {
            return (
              <Field key={f.name} label={f.label} hint={f.hint} required={f.required}>
                <RichText value={value || ""} onChange={(v) => set(f.name, v)} placeholder={f.placeholder} />
              </Field>
            );
          }

          return (
            <Field key={f.name} label={f.label} hint={f.hint} required={f.required}>
              {f.type === "textarea" ? (
                <Textarea rows={f.rows || 4} value={value || ""} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} />
              ) : f.type === "select" || f.type === "ref" ? (
                <Select
                  placeholder={f.placeholder || `Choose ${f.label.toLowerCase()}…`}
                  value={value || ""}
                  onChange={(e) => set(f.name, e.target.value)}
                  options={f.options || sources?.[f.source] || []}
                />
              ) : (
                <Input
                  type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "datetime" ? "datetime-local" : f.type || "text"}
                  value={value ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              )}
            </Field>
          );
        })}
      </form>
    </Modal>
  );
}

/* --------------------------------------------- shared column renderers */
export const col = {
  title: (key = "name", subKey) => (item) => <RowTitle sub={subKey ? item[subKey] : undefined}>{item[key]}</RowTitle>,
  status: (key = "status") => (item) => <Chip>{item[key]}</Chip>,
  bool: (key, yes = "Yes", no = "No") => (item) =>
    item[key] ? <Chip tone="chipGreen">{yes}</Chip> : <Chip tone="chipGrey">{no}</Chip>,
  ref: (key, field = "name") => (item) => item[key]?.[field] || "—",
  image: (key) => (item) => (item[key] ? <Thumb src={mediaUrl(item[key])} /> : "—"),
  date: (key) => (item) =>
    item[key] ? new Date(item[key]).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—",
  text: (key) => (item) => <span style={{ color: "var(--a-muted)" }}>{item[key] || "—"}</span>,
};
