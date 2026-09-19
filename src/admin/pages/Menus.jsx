import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAsync } from "../hooks/useResource";
import AdminIcon from "../components/AdminIcon";
import {
  Button, Card, CardHead, ConfirmDialog, EmptyState, ErrorBox, Field, Input, Modal,
  PageHead, Select, Spacer, TableSkeleton, useToast,
} from "../components/ui";
import s from "./Menus.module.css";

const LOCATIONS = [
  { value: "header", label: "Header" },
  { value: "footer", label: "Footer" },
  { value: "sidebar", label: "Sidebar" },
];

const uid = () => `tmp-${Math.random().toString(36).slice(2)}`;

export default function Menus() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => api.menus.list({ limit: 50 }), []);
  const [activeId, setActiveId] = useState(null);
  const [editingMenu, setEditingMenu] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const menus = data?.items || [];
  const active = menus.find((m) => m._id === activeId) || menus[0];

  useEffect(() => {
    if (!activeId && menus.length) setActiveId(menus[0]._id);
  }, [menus, activeId]);

  async function removeMenu(menu) {
    try {
      await api.menus.trash(menu._id);
      toast.success("Menu deleted");
      setActiveId(null);
      reload();
    } catch (err) {
      toast.error(err);
    }
  }

  if (loading) return <Card><TableSkeleton rows={6} /></Card>;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  return (
    <>
      <PageHead title="Menus" subtitle="Navigation shown in the header and footer.">
        <Button variant="primary" icon="plus" onClick={() => setEditingMenu("new")}>New Menu</Button>
      </PageHead>

      <div className={s.layout}>
        <Card>
          <CardHead title="Menus" />
          <div className={s.menuList}>
            {menus.map((m) => (
              <button
                key={m._id}
                type="button"
                className={`${s.menuItem} ${m._id === active?._id ? s.menuItemOn : ""}`}
                onClick={() => setActiveId(m._id)}
              >
                <span>
                  <strong>{m.name}</strong>
                  <em>{m.location}</em>
                </span>
                <AdminIcon name="chevronRight" size={15} />
              </button>
            ))}
            {!menus.length && <EmptyState title="No menus yet" message="Create one to start building navigation." />}
          </div>
        </Card>

        {active && (
          <MenuBuilder
            key={active._id}
            menu={active}
            onEditMenu={() => setEditingMenu(active)}
            onDeleteMenu={() => setConfirm(active)}
          />
        )}
      </div>

      {editingMenu && (
        <MenuDialog
          menu={editingMenu === "new" ? null : editingMenu}
          onClose={() => setEditingMenu(null)}
          onSaved={(saved) => { setEditingMenu(null); setActiveId(saved._id); reload(); }}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title="Delete menu"
          message={`“${confirm.name}” and all of its items will be removed. Anywhere the site references this menu will fall back to nothing.`}
          confirmLabel="Delete menu"
          destructive
          onConfirm={() => removeMenu(confirm)}
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  );
}

/* --------------------------------------------------------------- builder */
function MenuBuilder({ menu, onEditMenu, onDeleteMenu }) {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => api.menuItems.list(menu._id), [menu._id]);
  const { data: pages } = useAsync(() => api.pages.list({ limit: 200, status: "published" }), []);

  const [items, setItems] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState(null);

  useEffect(() => {
    // the API returns a flat, sorted list; parents come through as ids
    setItems(
      (data?.items || []).map((n) => ({
        id: String(n._id),
        label: n.label,
        url: n.url || "",
        target: n.target || "_self",
        parent: n.parent ? String(n.parent) : null,
      })),
    );
    setDirty(false);
  }, [data]);

  const set = (id, patch) => {
    setItems((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    setDirty(true);
  };

  const add = () => {
    setItems((list) => [...list, { id: uid(), label: "", url: "", target: "_self", parent: null }]);
    setDirty(true);
  };

  const remove = (id) => {
    // removing a parent promotes its children rather than silently dropping them
    setItems((list) => list.filter((i) => i.id !== id).map((i) => (i.parent === id ? { ...i, parent: null } : i)));
    setDirty(true);
  };

  function move(fromId, toId) {
    if (fromId === toId) return;
    setItems((list) => {
      const from = list.findIndex((i) => i.id === fromId);
      const to = list.findIndex((i) => i.id === toId);
      if (from < 0 || to < 0) return list;
      const next = [...list];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDirty(true);
  }

  async function save() {
    if (items.some((i) => !i.label.trim())) return toast.error("Every item needs a label.");
    setSaving(true);
    try {
      await api.menuItems.save(
        menu._id,
        // the API rebuilds the tree from client-side keys, so rows created in
        // this session and rows loaded from the DB are handled identically
        items.map((i, index) => ({
          key: i.id,
          parentKey: i.parent || null,
          label: i.label,
          url: i.url,
          target: i.target,
          sortOrder: index,
        })),
      );
      toast.success("Menu saved");
      setDirty(false);
      reload();
    } catch (err) {
      toast.error(err);
    } finally {
      setSaving(false);
    }
  }

  const parentOptions = items
    .filter((i) => !i.parent)
    .map((i) => ({ value: i.id, label: i.label || "Untitled" }));

  return (
    <Card>
      <CardHead title={`${menu.name} · ${menu.location}`}>
        <Button size="sm" icon="edit" onClick={onEditMenu}>Rename</Button>
        <Button size="sm" variant="ghost" icon="trash" onClick={onDeleteMenu}>Delete</Button>
      </CardHead>

      {loading && <TableSkeleton rows={5} />}
      {error && <ErrorBox error={error} onRetry={reload} />}

      {!loading && !error && (
        <div className={s.builder}>
          {items.length === 0 && (
            <p className={s.hint}>This menu is empty. Add your first link below.</p>
          )}

          {items.map((item) => (
            <div
              key={item.id}
              className={`${s.row} ${item.parent ? s.rowChild : ""} ${dragId === item.id ? s.rowDragging : ""}`}
              draggable
              onDragStart={() => setDragId(item.id)}
              onDragEnd={() => setDragId(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { move(dragId, item.id); setDragId(null); }}
            >
              <span className={s.handle} title="Drag to reorder">
                <AdminIcon name="drag" size={16} />
              </span>

              <Input
                value={item.label}
                placeholder="Label"
                onChange={(e) => set(item.id, { label: e.target.value })}
              />

              <div className={s.urlCell}>
                <Input
                  value={item.url}
                  placeholder="/about-us or https://…"
                  onChange={(e) => set(item.id, { url: e.target.value })}
                  list={`pages-${menu._id}`}
                />
              </div>

              <Select
                value={item.parent || ""}
                placeholder="Top level"
                onChange={(e) => set(item.id, { parent: e.target.value || null })}
                options={parentOptions.filter((o) => o.value !== item.id)}
              />

              <Select
                value={item.target}
                onChange={(e) => set(item.id, { target: e.target.value })}
                options={[
                  { value: "_self", label: "Same tab" },
                  { value: "_blank", label: "New tab" },
                ]}
              />

              <Button size="sm" variant="ghost" icon="trash" onClick={() => remove(item.id)} aria-label="Remove item" />
            </div>
          ))}

          <datalist id={`pages-${menu._id}`}>
            {(pages?.items || []).map((p) => <option key={p._id} value={`/${p.slug}`}>{p.title}</option>)}
          </datalist>

          <div className={s.builderFoot}>
            <Button icon="plus" onClick={add}>Add item</Button>
            <Spacer />
            {dirty && <span className={s.dirty}>Unsaved changes</span>}
            <Button variant="primary" disabled={!dirty || saving} onClick={save}>
              {saving ? "Saving…" : "Save menu"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------ menu dialog */
function MenuDialog({ menu, onClose, onSaved }) {
  const toast = useToast();
  const [name, setName] = useState(menu?.name || "");
  const [slug, setSlug] = useState(menu?.slug || "");
  const [location, setLocation] = useState(menu?.location || "header");
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return toast.error("A name is required.");
    setSaving(true);
    try {
      const payload = { name, slug: slug || undefined, location };
      const saved = menu ? await api.menus.update(menu._id, payload) : await api.menus.create(payload);
      toast.success(menu ? "Menu updated" : "Menu created");
      onSaved(saved);
    } catch (err) {
      toast.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={menu ? "Edit menu" : "New menu"}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" form="menuForm" variant="primary" disabled={saving}>Save</Button>
        </>
      }
    >
      <form id="menuForm" onSubmit={submit}>
        <Field label="Name" required>
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Main Navigation" />
        </Field>
        <Field label="Slug" hint="How settings refer to this menu. Leave blank to generate it.">
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="main" />
        </Field>
        <Field label="Location" hint="Where on the site this menu is rendered.">
          <Select value={location} onChange={(e) => setLocation(e.target.value)} options={LOCATIONS} />
        </Field>
      </form>
    </Modal>
  );
}
