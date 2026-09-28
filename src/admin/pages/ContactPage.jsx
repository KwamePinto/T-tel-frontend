import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAsync } from "../hooks/useResource";
import { MediaField } from "../components/MediaPicker";
import { SettingField } from "./Settings";
import {
  Button, Card, CardHead, ErrorBox, Field, Input, PageHead, Textarea, TableSkeleton, useToast,
} from "../components/ui";
import s from "./Settings.module.css";

const EMPTY_META = { heroLabel: "", heroTitle: "", heroDescription: "", title: "", description: "", canonical: "", noindex: false };

/**
 * Everything a visitor sees on /contact-us, in one screen — previously three
 * unrelated sidebar sections (Pages, Theme, Forms) with no link between them.
 * Still the same three records underneath (a Page, a set of Theme settings,
 * a Form) — this only removes the need to go find each one separately.
 * The Page's `body` field is deliberately not shown here: ContactUs.jsx never
 * renders it, so exposing it would just be a second dead end.
 */
export default function ContactPage() {
  const toast = useToast();

  const { data: pages, loading: pagesLoading, error: pagesError, reload: reloadPages } =
    useAsync(() => api.pages.list({ search: "contact-us", limit: 5 }), []);
  const page = (pages?.items || []).find((p) => p.slug === "contact-us") || null;

  // Forms are only searchable by title, not slug, and this one's title is
  // "Contact Us" (a space, not a hyphen) — fetch and match the slug client
  // side instead of relying on a server-side text search that won't hit.
  const { data: formsList } = useAsync(() => api.forms.list({ limit: 50 }), []);
  const contactForm = (formsList?.items || []).find((f) => f.slug === "contact-us") || null;

  const { data: schema, loading: schemaLoading, error: schemaError, reload: reloadSchema } =
    useAsync(() => api.settings.schema("theme"), []);
  // contact_form is excluded here — it's the wiring that says which Form
  // record fills this slot, a structural choice edited via the full Theme
  // screen if it's ever needed, not a day-to-day content field. The card
  // below links straight to that form's own fields instead.
  const contactFields = (schema?.fields || []).filter((f) => f.section === "Contact Details" && f.key !== "contact_form");
  const socialFields = (schema?.fields || []).filter((f) => f.section === "Social Links");

  const [meta, setMeta] = useState(EMPTY_META);
  const [heroImage, setHeroImage] = useState(null);
  const [values, setValues] = useState({});
  const [frValues, setFrValues] = useState({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!page) return;
    setMeta({ ...EMPTY_META, ...(page.meta || {}) });
    setHeroImage(page.heroImage || null);
  }, [page]);

  useEffect(() => {
    const fields = [...contactFields, ...socialFields];
    if (!fields.length) return;
    setValues((prev) => ({ ...Object.fromEntries(fields.map((f) => [f.key, f.value])), ...prev }));
    setFrValues((prev) => ({ ...Object.fromEntries(fields.map((f) => [f.key, f.translations?.fr ?? ""])), ...prev }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema]);

  const setMetaField = (patch) => { setMeta((m) => ({ ...m, ...patch })); setDirty(true); };
  const setValue = (key, v) => { setValues((prev) => ({ ...prev, [key]: v })); setDirty(true); };
  const setFrValue = (key, v) => { setFrValues((prev) => ({ ...prev, [key]: v })); setDirty(true); };

  async function save() {
    setSaving(true);
    try {
      const jobs = [];
      if (page) jobs.push(api.pages.update(page._id, { meta, heroImage: heroImage?._id || heroImage || null }));
      if (contactFields.length + socialFields.length > 0) {
        jobs.push(api.settings.save("theme", { values, translations: { fr: frValues } }));
      }
      await Promise.all(jobs);
      setDirty(false);
      toast.success("Contact Us saved");
      reloadPages();
      reloadSchema();
    } catch (err) {
      toast.error(err);
    } finally {
      setSaving(false);
    }
  }

  const loading = pagesLoading || schemaLoading;
  const error = pagesError || schemaError;

  if (loading) return <Card><TableSkeleton rows={8} /></Card>;
  if (error) return <ErrorBox error={error} onRetry={() => { reloadPages(); reloadSchema(); }} />;

  return (
    <>
      <PageHead title="Contact Us" subtitle="Everything shown on the public /contact-us page.">
        {dirty && <span className={s.dirty}>Unsaved changes</span>}
        {page?.slug && (
          <a href={`/${page.slug}`} target="_blank" rel="noreferrer">
            <Button type="button" icon="eye">View</Button>
          </a>
        )}
        <Button variant="primary" disabled={saving || !dirty} onClick={save}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </PageHead>

      <Card>
        <CardHead title="Hero" />
        <div className={s.panel}>
          <MediaField
            label="Hero image"
            value={heroImage}
            onChange={setHeroImage}
          />
          <Field label="Hero label" hint="Small line above the hero title, e.g. “Get in touch”.">
            <Input value={meta.heroLabel || ""} onChange={(e) => setMetaField({ heroLabel: e.target.value })} />
          </Field>
          <Field label="Hero title" hint="Leave blank to use the page's default heading.">
            <Input value={meta.heroTitle || ""} onChange={(e) => setMetaField({ heroTitle: e.target.value })} />
          </Field>
          <Field label="Hero description">
            <Textarea rows={3} value={meta.heroDescription || ""} onChange={(e) => setMetaField({ heroDescription: e.target.value })} />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHead title="Contact details" />
        <div className={s.panel}>
          {contactFields.map((f) => (
            <SettingField
              key={f.key}
              field={f}
              value={values[f.key]}
              frValue={frValues[f.key]}
              onChange={(v) => setValue(f.key, v)}
              onFrChange={(v) => setFrValue(f.key, v)}
            />
          ))}
        </div>
      </Card>

      <Card>
        <CardHead title="Social links" />
        <div className={s.panel}>
          {socialFields.map((f) => (
            <SettingField
              key={f.key}
              field={f}
              value={values[f.key]}
              frValue={frValues[f.key]}
              onChange={(v) => setValue(f.key, v)}
              onFrChange={(v) => setFrValue(f.key, v)}
            />
          ))}
        </div>
      </Card>

      <Card>
        <CardHead title="Contact form" />
        <div className={s.panel}>
          <p>
            The fields visitors fill in (name, email, message, and so on) are a separate Form
            record, edited in its own screen.
          </p>
          {contactForm ? (
            <Link to={`/admin/forms/${contactForm._id}`}>
              <Button type="button" icon="edit">Edit form fields — {contactForm.title}</Button>
            </Link>
          ) : (
            <p>No form is linked yet — set Contact form under Contact details above once one exists.</p>
          )}
        </div>
      </Card>
    </>
  );
}
