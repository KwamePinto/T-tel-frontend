import RichText from "./RichText";
import { Field, Input, Textarea } from "./ui";
import s from "./TranslationPanel.module.css";

/**
 * Where a record's French is written.
 *
 * Every field here is optional, and the site falls back to English field by
 * field — so a title translated today and a body translated next month both
 * work, and the page in between reads with a French heading over English
 * prose rather than reverting wholesale. Clearing a field puts the English
 * back rather than blanking it, which is why nothing here needs a "remove
 * translation" control.
 *
 * The English above is shown beside each box rather than left to memory: a
 * translator working in the admin should not have to switch tabs to see what
 * they are translating.
 */
export default function TranslationPanel({ fields, value, onChange, lang = "fr" }) {
  const translated = value?.[lang] || {};

  const set = (key, next) =>
    onChange({ ...(value || {}), [lang]: { ...translated, [key]: next } });

  return (
    <div className={s.wrap}>
      {fields.map((field) => {
        const source = field.source;
        const current = translated[field.key] ?? "";

        return (
          <div key={field.key} className={s.field}>
            {source ? (
              <p className={s.source} lang="en">
                <span className={s.sourceLabel}>English</span>
                {/* the source may be markup; it is shown as plain text here so
                    a translator reads the words rather than the tags */}
                {String(source).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 400) || "—"}
              </p>
            ) : null}

            {field.type === "richtext" ? (
              <div className={s.sub}>
                <span className={s.subLabel}>{field.label}</span>
                <RichText value={current} onChange={(html) => set(field.key, html)} />
              </div>
            ) : field.type === "textarea" ? (
              <Field label={field.label}>
                <Textarea
                  rows={field.rows || 3}
                  value={current}
                  onChange={(e) => set(field.key, e.target.value)}
                  lang={lang}
                />
              </Field>
            ) : (
              <Field label={field.label}>
                <Input value={current} onChange={(e) => set(field.key, e.target.value)} lang={lang} />
              </Field>
            )}
          </div>
        );
      })}
    </div>
  );
}
