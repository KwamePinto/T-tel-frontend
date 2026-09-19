import { useState } from "react";
import RichText from "./RichText";
import { MediaField } from "./MediaPicker";
import AdminIcon from "./AdminIcon";
import { Button, Field, Select } from "./ui";
import s from "./SectionsEditor.module.css";

/**
 * Edits the laid-out content on Focus Area and Programme pages as a list of
 * blocks, matching the `sections` field on the Post model.
 *
 * A page with no blocks falls back to the single Content field below, which is
 * what every Blog post uses — so adding the first block here is what opts a
 * page into the laid-out rendering.
 */

const TYPES = [
  { value: "prose", label: "Text" },
  { value: "split", label: "Image + text" },
  { value: "image", label: "Full-width image" },
  { value: "facts", label: "Details panel + text" },
];

const LABEL = Object.fromEntries(TYPES.map((t) => [t.value, t.label]));

const blank = (type) => ({ type, html: "", aside: "", image: null, flip: false });

/** A one-line description of what is in a block, for the collapsed row. */
function summarise(section) {
  if (section.type === "image") return section.image ? "1 image" : "no image chosen";
  const text = (section.html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? `${text.split(" ").length} words` : "empty";
  return section.type === "split" ? `${section.image ? "image" : "no image"} · ${words}` : words;
}

export default function SectionsEditor({ value = [], onChange }) {
  const [openIndex, setOpenIndex] = useState(null);
  const sections = value || [];

  const update = (i, patch) =>
    onChange(sections.map((sec, n) => (n === i ? { ...sec, ...patch } : sec)));

  const add = (type) => {
    onChange([...sections, blank(type)]);
    setOpenIndex(sections.length);
  };

  const remove = (i) => {
    onChange(sections.filter((_, n) => n !== i));
    setOpenIndex(null);
  };

  const move = (i, by) => {
    const to = i + by;
    if (to < 0 || to >= sections.length) return;
    const next = [...sections];
    [next[i], next[to]] = [next[to], next[i]];
    onChange(next);
    setOpenIndex(to);
  };

  return (
    <div className={s.wrap}>
      {sections.length === 0 && (
        <p className={s.empty}>
          No blocks yet — this page renders the Content field below. Add a block to lay the page
          out with images beside the text instead.
        </p>
      )}

      <ol className={s.list}>
        {sections.map((section, i) => {
          const open = openIndex === i;
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
                  <span className={s.kind}>{LABEL[section.type] || section.type}</span>
                  <span className={s.summary}>{summarise(section)}</span>
                </button>

                <div className={s.controls}>
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="Move up">
                    {/* the icon set has no arrows; a chevron turned over reads
                        the same and keeps the admin on one vocabulary */}
                    <AdminIcon name="chevronDown" size={15} style={{ transform: "rotate(180deg)" }} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === sections.length - 1}
                    title="Move down"
                  >
                    <AdminIcon name="chevronDown" size={15} />
                  </button>
                  <button type="button" onClick={() => remove(i)} title="Remove block" className={s.remove}>
                    <AdminIcon name="close" size={15} />
                  </button>
                </div>
              </div>

              {open && (
                <div className={s.body}>
                  <div className={s.row}>
                    <Field label="Block type">
                      <Select
                        value={section.type}
                        onChange={(e) => update(i, { type: e.target.value })}
                      >
                        {TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </Select>
                    </Field>

                    {section.type === "split" && (
                      <label className={s.check}>
                        <input
                          type="checkbox"
                          checked={!!section.flip}
                          onChange={(e) => update(i, { flip: e.target.checked })}
                        />
                        Image on the right
                      </label>
                    )}
                  </div>

                  {(section.type === "split" || section.type === "image") && (
                    <MediaField
                      label="Image"
                      value={section.image}
                      onChange={(image) => update(i, { image })}
                      hint="Shown at full width on phones."
                    />
                  )}

                  {section.type === "facts" && (
                    <div className={s.sub}>
                      <span className={s.subLabel}>Details panel</span>
                      <p className={s.subHint}>
                        The narrow panel beside the text. Bold a line to turn it into a heading,
                        as with “Project Amount”.
                      </p>
                      <RichText value={section.aside || ""} onChange={(aside) => update(i, { aside })} />
                    </div>
                  )}

                  {section.type !== "image" && (
                    <div className={s.sub}>
                      <span className={s.subLabel}>Text</span>
                      <RichText value={section.html || ""} onChange={(html) => update(i, { html })} />
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className={s.add}>
        {TYPES.map((t) => (
          <Button key={t.value} size="sm" onClick={() => add(t.value)}>
            + {t.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
