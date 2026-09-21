import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { useAsync } from "../hooks/useResource";
import { MediaPickerModal } from "../components/MediaPicker";
import { mediaUrl } from "../../lib/cms";
import {
  Button, Card, ErrorBox, Field, Input, PageHead, Select, TableSkeleton, Textarea, Toggle, useToast,
} from "../components/ui";
import s from "./Settings.module.css";

/** Types that hold words rather than a colour, a reference or a toggle — the
 *  ones worth offering a French counterpart for. */
const TRANSLATABLE = new Set(["text", "textarea", "email", "tel", undefined]);

/** The compact French box shown under a translatable field. Kept out of the
 *  Field component's own label/hint chrome so a screen of eighty settings
 *  does not double in height — this is a footnote to the English field
 *  above it, not a field of equal weight. */
function FrenchField({ multiline, value, onChange }) {
  const Comp = multiline ? Textarea : Input;
  return (
    <div className={s.frRow}>
      <span className={s.frTag}>FR</span>
      <Comp
        rows={multiline ? 3 : undefined}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Not yet translated — the English is shown until it is."
        lang="fr"
      />
    </div>
  );
}

/** One settings field, rendered from the `type` stored alongside it. */
function SettingField({ field, value, onChange, frValue, onFrChange, menus, forms }) {
  const withFrench = (node, multiline) =>
    TRANSLATABLE.has(field.type) ? (
      <div className={s.fieldGroup}>
        {node}
        <FrenchField multiline={multiline} value={frValue} onChange={onFrChange} />
      </div>
    ) : node;

  const [picking, setPicking] = useState(false);

  switch (field.type) {
    case "boolean":
      return (
        <Toggle checked={!!value} onChange={onChange} title={field.label} description={field.hint} />
      );

    case "textarea":
      return withFrench(
        <Field label={field.label} hint={field.hint}>
          <Textarea rows={4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
        </Field>,
        true,
      );

    case "number":
      return (
        <Field label={field.label} hint={field.hint}>
          <Input type="number" value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} />
        </Field>
      );

    case "color":
      return (
        <Field label={field.label} hint={field.hint}>
          <div className={s.colorRow}>
            <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)} />
            <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
          </div>
        </Field>
      );

    case "select":
      return (
        <Field label={field.label} hint={field.hint}>
          <Select value={value ?? ""} onChange={(e) => onChange(e.target.value)} options={field.options || []} />
        </Field>
      );

    case "menu":
      return (
        <Field label={field.label} hint={field.hint || "Which menu fills this slot."}>
          <Select
            placeholder="No menu"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            options={(menus || []).map((m) => ({ value: m.slug, label: m.name }))}
          />
        </Field>
      );

    case "form":
      return (
        <Field label={field.label} hint={field.hint || "Which form appears in this slot."}>
          <Select
            placeholder="No form"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            options={(forms || []).map((f) => ({ value: f.slug, label: f.title }))}
          />
        </Field>
      );

    case "media":
      return (
        <Field label={field.label} hint={field.hint || "Pick a file, or type a path already in /public."}>
          <div className={s.mediaRow}>
            {value && /\.(png|jpe?g|webp|svg|gif)$/i.test(String(value)) && (
              <img className={s.mediaPreview} src={mediaUrl(value)} alt="" />
            )}
            <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
            <Button type="button" size="sm" icon="media" onClick={() => setPicking(true)}>Browse</Button>
          </div>
          {picking && (
            <MediaPickerModal
              accept="*/*"
              onSelect={(m) => onChange(mediaUrl(m))}
              onClose={() => setPicking(false)}
            />
          )}
        </Field>
      );

    default:
      return withFrench(
        <Field label={field.label} hint={field.hint}>
          <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
        </Field>,
        false,
      );
  }
}

function SettingsScreen({ group, title, subtitle }) {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => api.settings.schema(group), [group]);
  const { data: menus } = useAsync(() => api.menus.list({ limit: 50 }), []);
  const { data: forms } = useAsync(() => api.forms.list({ limit: 50 }), []);

  const [values, setValues] = useState({});
  const [frValues, setFrValues] = useState({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState(null);

  const fields = data?.fields || [];

  useEffect(() => {
    if (!fields.length) return;
    setValues(Object.fromEntries(fields.map((f) => [f.key, f.value])));
    // `schemaFor` returns full rows, translations included — read straight off
    // the row rather than a second request
    setFrValues(Object.fromEntries(fields.map((f) => [f.key, f.translations?.fr ?? ""])));
    setDirty(false);
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const sections = useMemo(() => {
    const map = new Map();
    for (const f of fields) {
      if (!map.has(f.section)) map.set(f.section, []);
      map.get(f.section).push(f);
    }
    return [...map.entries()];
  }, [fields]);

  const activeTab = tab ?? sections[0]?.[0];
  const activeFields = sections.find(([name]) => name === activeTab)?.[1] || [];

  async function save() {
    setSaving(true);
    try {
      await api.settings.save(group, { values, translations: { fr: frValues } });
      setDirty(false);
      toast.success("Settings saved");
      reload();
    } catch (err) {
      toast.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Card><TableSkeleton rows={8} /></Card>;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  return (
    <>
      <PageHead title={title} subtitle={subtitle}>
        {dirty && <span className={s.dirty}>Unsaved changes</span>}
        <Button variant="primary" disabled={saving || !dirty} onClick={save}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </PageHead>

      <div className={s.layout}>
        <nav className={s.tabs}>
          {sections.map(([name, items]) => (
            <button
              key={name}
              type="button"
              className={`${s.tab} ${name === activeTab ? s.tabOn : ""}`}
              onClick={() => setTab(name)}
            >
              {name}
              <span className={s.tabCount}>{items.length}</span>
            </button>
          ))}
        </nav>

        <Card>
          <div className={s.panel}>
            {activeFields.map((f) => (
              <SettingField
                key={f.key}
                field={f}
                value={values[f.key]}
                frValue={frValues[f.key]}
                menus={menus?.items}
                forms={forms?.items}
                onChange={(v) => {
                  setValues((prev) => ({ ...prev, [f.key]: v }));
                  setDirty(true);
                }}
                onFrChange={(v) => {
                  setFrValues((prev) => ({ ...prev, [f.key]: v }));
                  setDirty(true);
                }}
              />
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

export const Theme = () => (
  <SettingsScreen
    group="theme"
    title="Theme"
    subtitle="Branding, homepage content and site-wide options."
  />
);

export const Authentication = () => (
  <SettingsScreen
    group="auth"
    title="Authentication"
    subtitle="Who may create an account, and what they can do."
  />
);
