import { useState } from "react";
import RichText from "./RichText";
import { MediaField } from "./MediaPicker";
import AdminIcon from "./AdminIcon";
import { Button, Field, Input, Textarea } from "./ui";
import s from "./BlueprintFields.module.css";

/**
 * Renders the editing form for one special page's section, from the field list
 * its blueprint declares (see the pageBlueprints folder).
 *
 * The rule that keeps this safe: a blueprint is a *view* over the stored data,
 * never a replacement for it. Every write merges into what is already there, so
 * a key the blueprint doesn't mention — a cached image width, a layout flag
 * the component reads but nobody edits — survives being edited around. That is
 * what lets a blueprint describe only the fields worth showing an admin
 * without it quietly dropping the rest of the record on first save.
 */

/** Section images are stored as plain URL strings rather than Media ids, which
 *  is what the site's components expect to render. MediaField hands back the
 *  whole Media document, so unwrap it on the way in. */
function ImageInput({ label, hint, value, onChange }) {
  return (
    <MediaField
      label={label}
      hint={hint}
      value={value || null}
      onChange={(media) => onChange(media ? media.url : null)}
    />
  );
}

/** A list of plain strings — the paragraphs of a phase, the steps under a
 *  mission. Kept as separate boxes rather than one textarea split on blank
 *  lines, so what the admin sees is one box per paragraph on the page. */
function TextList({ field, value, onChange }) {
  const items = Array.isArray(value) ? value : [];
  const set = (i, text) => onChange(items.map((it, n) => (n === i ? text : it)));

  return (
    <div className={s.sub}>
      <span className={s.subLabel}>{field.label}</span>
      {field.hint && <p className={s.subHint}>{field.hint}</p>}

      {items.map((item, i) => (
        <div key={i} className={s.textListRow}>
          <Textarea
            rows={field.rows || 3}
            value={item || ""}
            onChange={(e) => set(i, e.target.value)}
            placeholder={field.placeholder}
          />
          <button
            type="button"
            className={s.rowRemove}
            title={`Remove ${field.itemNoun || "paragraph"}`}
            onClick={() => onChange(items.filter((_, n) => n !== i))}
          >
            <AdminIcon name="close" size={15} />
          </button>
        </div>
      ))}

      <Button size="sm" onClick={() => onChange([...items, ""])}>
        + Add {field.itemNoun || "paragraph"}
      </Button>
    </div>
  );
}

/** A list of objects, each edited by its own set of sub-fields — the phases on
 *  Our History, the operating principles on Who We Are. Collapsed to one row
 *  each so a long list stays readable, matching how blocks read on a post. */
function ObjectList({ field, value, onChange }) {
  const [openIndex, setOpenIndex] = useState(null);
  const items = Array.isArray(value) ? value : [];

  // merge, never replace: see the note at the top of this file
  const update = (i, patch) =>
    onChange(items.map((it, n) => (n === i ? { ...it, ...patch } : it)));

  const move = (i, by) => {
    const to = i + by;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[i], next[to]] = [next[to], next[i]];
    onChange(next);
    setOpenIndex(to);
  };

  const noun = field.itemNoun || "item";

  return (
    <div className={s.sub}>
      <span className={s.subLabel}>{field.label}</span>
      {field.hint && <p className={s.subHint}>{field.hint}</p>}

      <ol className={s.list}>
        {items.map((item, i) => {
          const open = openIndex === i;
          const heading =
            (field.itemTitle && field.itemTitle(item, i)) || `${noun} ${i + 1}`;

          return (
            <li key={i} className={`${s.item} ${open ? s.itemOpen : ""}`}>
              <div className={s.head}>
                <button
                  type="button"
                  className={s.toggle}
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                >
                  <AdminIcon name={open ? "chevronDown" : "chevronRight"} size={16} />
                  <span className={s.kind}>{heading}</span>
                </button>

                <div className={s.controls}>
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="Move up">
                    <AdminIcon name="chevronDown" size={15} style={{ transform: "rotate(180deg)" }} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === items.length - 1}
                    title="Move down"
                  >
                    <AdminIcon name="chevronDown" size={15} />
                  </button>
                  <button
                    type="button"
                    className={s.remove}
                    title={`Remove ${noun}`}
                    onClick={() => {
                      onChange(items.filter((_, n) => n !== i));
                      setOpenIndex(null);
                    }}
                  >
                    <AdminIcon name="close" size={15} />
                  </button>
                </div>
              </div>

              {open && (
                <div className={s.body}>
                  <BlueprintFields
                    fields={field.fields}
                    value={item}
                    onChange={(patch) => update(i, patch)}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <Button
        size="sm"
        onClick={() => {
          onChange([...items, field.blank ? field.blank() : {}]);
          setOpenIndex(items.length);
        }}
      >
        + Add {noun}
      </Button>
    </div>
  );
}

/**
 * Renders a blueprint's field list against a data object.
 *
 * `onChange` is handed a patch of only what changed rather than the whole
 * object, so callers keep control of the merge and nothing undeclared is lost.
 */
export default function BlueprintFields({ fields = [], value = {}, onChange }) {
  const data = value || {};

  return (
    <>
      {fields.map((field) => {
        const current = data[field.key];

        switch (field.type) {
          case "textarea":
            return (
              <Field key={field.key} label={field.label} hint={field.hint}>
                <Textarea
                  rows={field.rows || 3}
                  value={current || ""}
                  onChange={(e) => onChange({ [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                />
              </Field>
            );

          case "richtext":
            return (
              <div key={field.key} className={s.sub}>
                <span className={s.subLabel}>{field.label}</span>
                {field.hint && <p className={s.subHint}>{field.hint}</p>}
                <RichText
                  value={current || ""}
                  onChange={(html) => onChange({ [field.key]: html })}
                />
              </div>
            );

          case "image":
            return (
              <ImageInput
                key={field.key}
                label={field.label}
                hint={field.hint}
                value={current}
                onChange={(url) => onChange({ [field.key]: url })}
              />
            );

          case "textlist":
            return (
              <TextList
                key={field.key}
                field={field}
                value={current}
                onChange={(next) => onChange({ [field.key]: next })}
              />
            );

          case "list":
            return (
              <ObjectList
                key={field.key}
                field={field}
                value={current}
                onChange={(next) => onChange({ [field.key]: next })}
              />
            );

          default:
            return (
              <Field key={field.key} label={field.label} hint={field.hint}>
                <Input
                  value={current || ""}
                  onChange={(e) => onChange({ [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                />
              </Field>
            );
        }
      })}
    </>
  );
}
