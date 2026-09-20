import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAsync } from "../hooks/useResource";
import { getBlueprint } from "../pageBlueprints";
import EditorShell, { Rail, RailSection, TitleField } from "../components/EditorShell";
import RichText from "../components/RichText";
import BlueprintFields from "../components/BlueprintFields";
import { MediaField } from "../components/MediaPicker";
import {
  Button, Card, CardBody, CardHead, ErrorBox, Field, Input, Select, TableSkeleton,
  Textarea, Toggle, useToast,
} from "../components/ui";
import s from "./PageEditor.module.css";

const EMPTY = {
  title: "", slug: "", kind: "custom", body: "", template: "default", status: "draft",
  publishedAt: "", showInNav: false, sortOrder: 0, heroImage: null, sections: [],
  meta: { heroLabel: "", heroTitle: "", heroDescription: "", title: "", description: "", canonical: "", noindex: false },
};

const TEMPLATES = [
  { value: "default", label: "Default" },
  { value: "full-width", label: "Full width" },
  { value: "landing", label: "Landing" },
  { value: "inner", label: "Inner" },
  { value: "contact", label: "Contact" },
];

function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function PageEditor() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: page, loading, error, reload } = useAsync(
    () => (isNew ? Promise.resolve(null) : api.pages.get(id)),
    [id],
  );

  useEffect(() => {
    if (!page) return;
    setForm({
      ...EMPTY,
      ...page,
      meta: { ...EMPTY.meta, ...(page.meta || {}) },
      publishedAt: toLocalInput(page.publishedAt),
      heroImage: page.heroImage || null,
      sections: page.sections || [],
    });
    setDirty(false);
  }, [page]);

  const set = (patch) => { setForm((f) => ({ ...f, ...patch })); setDirty(true); };
  const setMeta = (patch) => { setForm((f) => ({ ...f, meta: { ...f.meta, ...patch } })); setDirty(true); };

  // A special page is one with a component of its own; its blueprint says which
  // of that component's fields are editable here. Anything created in the admin
  // is custom, so a new page is always the plain kind.
  const isSpecial = !isNew && form.kind === "special";
  const blueprint = isSpecial ? getBlueprint(form.slug) : null;
  const showBody = !isSpecial || blueprint?.body;
  const showHero = !isSpecial || blueprint?.hero;

  /** Patches one section's data in place, creating the section if this is the
   *  first time it has been edited. Sections the blueprint doesn't declare are
   *  carried through untouched — see the note in BlueprintFields.jsx. */
  const patchSection = (type, patch) => {
    setForm((f) => {
      const sections = f.sections || [];
      const next = sections.some((sec) => sec.type === type)
        ? sections.map((sec) =>
            sec.type === type ? { ...sec, data: { ...(sec.data || {}), ...patch } } : sec)
        : [...sections, { type, enabled: true, data: patch }];
      return { ...f, sections: next };
    });
    setDirty(true);
  };

  const sectionData = (type) =>
    (form.sections || []).find((sec) => sec.type === type)?.data || {};

  async function save() {
    if (!form.title.trim()) return toast.error("A title is required.");
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        body: form.body,
        template: form.template,
        status: form.status,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
        showInNav: form.showInNav,
        sortOrder: Number(form.sortOrder) || 0,
        heroImage: form.heroImage?._id || form.heroImage || null,
        meta: form.meta,
      };
      // a special page's slug is bound to its route, so it is never sent; the
      // API drops it too, this just keeps the request honest
      if (!isSpecial) payload.slug = form.slug || undefined;
      if (blueprint?.sections?.length) payload.sections = form.sections;

      const saved = isNew ? await api.pages.create(payload) : await api.pages.update(id, payload);
      setDirty(false);
      toast.success(isNew ? "Page created" : "Page updated");
      if (isNew) navigate(`/admin/pages/${saved._id}`, { replace: true });
      else reload();
    } catch (err) {
      toast.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Card><TableSkeleton rows={8} /></Card>;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  return (
    <EditorShell
      backTo="/admin/pages"
      backLabel="Pages"
      title={isNew ? "New Page" : blueprint ? `Edit ${blueprint.label}` : "Edit Page"}
      dirty={dirty}
      saving={saving}
      onSave={save}
      extraActions={
        !isNew && form.slug ? (
          <a href={`/${form.slug}`} target="_blank" rel="noreferrer">
            <Button type="button" icon="eye">View</Button>
          </a>
        ) : null
      }
      rail={
        <Rail>
          <RailSection title="Publish">
            <Field label="Status">
              <Select
                value={form.status}
                onChange={(e) => set({ status: e.target.value })}
                options={[
                  { value: "draft", label: "Draft" },
                  { value: "published", label: "Published" },
                  { value: "scheduled", label: "Scheduled" },
                ]}
              />
            </Field>
            <Field label="Publish Date & Time">
              <Input type="datetime-local" value={form.publishedAt} onChange={(e) => set({ publishedAt: e.target.value })} />
            </Field>
            {!isSpecial && (
              <Field label="Template" hint="Controls how the page is laid out on the site.">
                <Select value={form.template} onChange={(e) => set({ template: e.target.value })} options={TEMPLATES} />
              </Field>
            )}
            <Toggle
              checked={form.showInNav}
              onChange={(showInNav) => set({ showInNav })}
              title="Show in navigation"
              description="Adds the page to menus built from page links."
            />
            <Field label="Sort order" hint="Lower numbers appear first.">
              <Input type="number" value={form.sortOrder} onChange={(e) => set({ sortOrder: e.target.value })} />
            </Field>
          </RailSection>

          {showHero && (
            <RailSection title="Hero">
              <MediaField
                label="Hero image"
                value={form.heroImage}
                onChange={(m) => set({ heroImage: m })}
                hint={blueprint?.heroNote}
              />
              <Field label="Hero label" hint="Small line above the hero title, e.g. “About Us”.">
                <Input value={form.meta.heroLabel || ""} onChange={(e) => setMeta({ heroLabel: e.target.value })} />
              </Field>
              <Field label="Hero title" hint="Leave blank to use the page title.">
                <Input value={form.meta.heroTitle || ""} onChange={(e) => setMeta({ heroTitle: e.target.value })} />
              </Field>
              <Field label="Hero description">
                <Textarea rows={3} value={form.meta.heroDescription || ""} onChange={(e) => setMeta({ heroDescription: e.target.value })} />
              </Field>
            </RailSection>
          )}

          <RailSection title="Search Engines" defaultOpen={false}>
            <Field label="Meta title" hint="Shown in search results. Leave blank to use the page title.">
              <Input value={form.meta.title || ""} onChange={(e) => setMeta({ title: e.target.value })} />
            </Field>
            <Field label="Meta description">
              <Textarea rows={3} value={form.meta.description || ""} onChange={(e) => setMeta({ description: e.target.value })} />
            </Field>
            <Field label="Canonical URL" hint="Only needed when this page duplicates another.">
              <Input value={form.meta.canonical || ""} onChange={(e) => setMeta({ canonical: e.target.value })} />
            </Field>
            <Toggle
              checked={form.meta.noindex}
              onChange={(noindex) => setMeta({ noindex })}
              title="Hide from search engines"
              description="Adds a noindex tag. The page stays reachable by direct link."
            />
          </RailSection>
        </Rail>
      }
    >
      <TitleField
        value={form.title}
        onChange={(title) => set({ title })}
        slug={form.slug}
        // a special page's address is fixed in the code that renders it
        onSlugChange={isSpecial ? undefined : (slug) => set({ slug })}
        prefix="/"
      />

      {isSpecial && (
        <div className={s.notice}>
          <p className={s.noticeLead}>
            <strong>{blueprint?.label || form.title}</strong> has a layout of its own at{" "}
            <code>/{form.slug}</code>, so it is edited field by field rather than as one block
            of text.
          </p>
          {blueprint?.summary && <p className={s.noticeBody}>{blueprint.summary}</p>}
          {blueprint?.managedIn?.length > 0 && (
            <p className={s.noticeBody}>
              Also on this page:{" "}
              {blueprint.managedIn.map((ref, i) => (
                <span key={ref.to}>
                  {i > 0 && ", "}
                  <Link to={ref.to}>{ref.label}</Link>
                </span>
              ))}
              .
            </p>
          )}
        </div>
      )}

      {isSpecial && !blueprint && (
        <div className={s.notice}>
          <p className={s.noticeLead}>
            This page is rendered by its own component, and no editor has been defined for it
            yet.
          </p>
          <p className={s.noticeBody}>
            Its heading, hero and search engine details can be changed from the panel on the
            right. Everything else needs a developer to add a blueprint for{" "}
            <code>{form.slug}</code>.
          </p>
        </div>
      )}

      {blueprint?.sections?.map((section) => (
        <Card key={section.type}>
          <CardHead title={section.label} />
          <CardBody className={s.sectionBody}>
            {section.hint && <p className={s.sectionHint}>{section.hint}</p>}
            <BlueprintFields
              fields={section.fields}
              value={sectionData(section.type)}
              onChange={(patch) => patchSection(section.type, patch)}
            />
          </CardBody>
        </Card>
      ))}

      {showBody && (
        <Card>
          <RichText value={form.body} onChange={(body) => set({ body })} placeholder="Write the page…" />
        </Card>
      )}
    </EditorShell>
  );
}
