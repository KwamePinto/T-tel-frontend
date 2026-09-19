import { useCallback, useEffect, useRef, useState } from "react";
import s from "./RichText.module.css";

/* execCommand is deprecated but is still the only cross-browser way to get a
   rich-text surface without pulling in a 200 KB editor bundle. Everything the
   live CMS's toolbar offers is covered here. */
const exec = (cmd, value = null) => document.execCommand(cmd, false, value);

const INLINE = [
  { cmd: "bold", label: "B", title: "Bold", style: { fontWeight: 800 } },
  { cmd: "italic", label: "I", title: "Italic", style: { fontStyle: "italic" } },
  { cmd: "underline", label: "U", title: "Underline", style: { textDecoration: "underline" } },
  { cmd: "strikeThrough", label: "S", title: "Strikethrough", style: { textDecoration: "line-through" } },
];

const ALIGN = [
  { cmd: "justifyLeft", label: "⇤", title: "Align left" },
  { cmd: "justifyCenter", label: "↔", title: "Align centre" },
  { cmd: "justifyRight", label: "⇥", title: "Align right" },
];

const COLOURS = ["#111827", "#e2574c", "#027f6c", "#023e38", "#4f46e5", "#b45309"];

export default function RichText({ value = "", onChange, placeholder = "Write something…", onPickImage }) {
  const ref = useRef(null);
  const [focused, setFocused] = useState(false);
  const [source, setSource] = useState(false);
  const [active, setActive] = useState({});
  const [block, setBlock] = useState("p");

  // Only push external values in when they differ, or the caret jumps on every keystroke.
  useEffect(() => {
    const el = ref.current;
    if (el && !source && el.innerHTML !== (value || "")) el.innerHTML = value || "";
  }, [value, source]);

  const emit = useCallback(() => {
    if (ref.current) onChange(ref.current.innerHTML);
  }, [onChange]);

  const refreshState = useCallback(() => {
    if (source) return;
    const next = {};
    for (const { cmd } of [...INLINE, ...ALIGN]) {
      try {
        next[cmd] = document.queryCommandState(cmd);
      } catch {
        next[cmd] = false;
      }
    }
    next.insertUnorderedList = document.queryCommandState("insertUnorderedList");
    next.insertOrderedList = document.queryCommandState("insertOrderedList");
    setActive(next);
    try {
      const b = document.queryCommandValue("formatBlock");
      setBlock((b || "p").toLowerCase().replace(/[<>]/g, "") || "p");
    } catch {
      /* not supported — leave the select alone */
    }
  }, [source]);

  function run(cmd, value) {
    ref.current?.focus();
    exec(cmd, value);
    emit();
    refreshState();
  }

  function addLink() {
    const url = window.prompt("Link URL");
    if (!url) return;
    run("createLink", url);
  }

  function addImage() {
    if (onPickImage) return onPickImage((url) => run("insertImage", url));
    const url = window.prompt("Image URL");
    if (url) run("insertImage", url);
  }

  function addTable() {
    const cols = Number(window.prompt("Columns", "3"));
    const rows = Number(window.prompt("Rows", "3"));
    if (!cols || !rows) return;
    const head = `<tr>${"<th>Heading</th>".repeat(cols)}</tr>`;
    const body = `<tr>${"<td>&nbsp;</td>".repeat(cols)}</tr>`.repeat(Math.max(rows - 1, 1));
    run("insertHTML", `<table><thead>${head}</thead><tbody>${body}</tbody></table><p><br></p>`);
  }

  function addVideo() {
    const url = window.prompt("YouTube or Vimeo URL");
    if (!url) return;
    const yt = url.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    const src = yt ? `https://www.youtube.com/embed/${yt[1]}` : vimeo ? `https://player.vimeo.com/video/${vimeo[1]}` : null;
    if (!src) return window.alert("That doesn't look like a YouTube or Vimeo link.");
    run(
      "insertHTML",
      `<div class="video-embed" style="position:relative;padding-top:56.25%"><iframe src="${src}" style="position:absolute;inset:0;width:100%;height:100%;border:0" allowfullscreen></iframe></div><p><br></p>`,
    );
  }

  const Tool = ({ cmd, label, title, style, on, onClick }) => (
    <button
      type="button"
      title={title}
      style={style}
      className={`${s.tool} ${on ?? active[cmd] ? s.toolOn : ""}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick || (() => run(cmd))}
    >
      {label}
    </button>
  );

  const words = String(value || "").replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className={`${s.wrap} ${focused ? s.wrapFocus : ""}`}>
      <div className={s.bar}>
        <select
          className={s.blockSelect}
          value={["h1", "h2", "h3", "blockquote", "pre"].includes(block) ? block : "p"}
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => run("formatBlock", `<${e.target.value}>`)}
          title="Paragraph format"
          disabled={source}
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="blockquote">Quote</option>
          <option value="pre">Code block</option>
        </select>

        <span className={s.sep} />
        {INLINE.map((t) => <Tool key={t.cmd} {...t} />)}
        <Tool cmd="code" label="<>" title="Inline code" on={false} onClick={() => run("insertHTML", `<code>${window.getSelection()?.toString() || "code"}</code>`)} />

        <span className={s.sep} />
        <Tool cmd="insertUnorderedList" label="•—" title="Bullet list" />
        <Tool cmd="insertOrderedList" label="1." title="Numbered list" />

        <span className={s.sep} />
        {ALIGN.map((t) => <Tool key={t.cmd} {...t} />)}

        <span className={s.sep} />
        {COLOURS.map((c) => (
          <button
            key={c}
            type="button"
            title={`Text colour ${c}`}
            className={s.swatch}
            style={{ background: c }}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => run("foreColor", c)}
          />
        ))}
        <Tool cmd="hiliteColor" label="▤" title="Highlight" on={false} onClick={() => run("hiliteColor", "#fff3b0")} />

        <span className={s.sep} />
        <Tool label="🔗" title="Insert link" on={false} onClick={addLink} />
        <Tool label="⛓" title="Remove link" on={false} onClick={() => run("unlink")} />
        <Tool label="🖼" title="Insert image" on={false} onClick={addImage} />
        <Tool label="▦" title="Insert table" on={false} onClick={addTable} />
        <Tool label="▶" title="Embed video" on={false} onClick={addVideo} />
        <Tool label="—" title="Horizontal rule" on={false} onClick={() => run("insertHorizontalRule")} />
        <Tool label="⌫" title="Clear formatting" on={false} onClick={() => run("removeFormat")} />

        <span className={s.sep} />
        <Tool label="HTML" title="Edit the underlying HTML" on={source} onClick={() => setSource((v) => !v)} />
      </div>

      {source ? (
        <textarea
          className={s.htmlArea}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
        />
      ) : (
        <div
          ref={ref}
          className={s.editor}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={emit}
          onBlur={() => { setFocused(false); emit(); }}
          onFocus={() => setFocused(true)}
          onKeyUp={refreshState}
          onMouseUp={refreshState}
          onPaste={(e) => {
            // paste as plain text so Word/Google Docs markup never lands in the DB
            e.preventDefault();
            const text = e.clipboardData.getData("text/plain");
            exec("insertText", text);
            emit();
          }}
        />
      )}

      <div className={s.foot}>
        <span>{source ? "Editing raw HTML" : "Rich text"}</span>
        <span>{words} word{words === 1 ? "" : "s"}</span>
      </div>
    </div>
  );
}
