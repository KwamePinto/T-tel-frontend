import { useRef, useState } from "react";
import { api } from "../lib/api";
import { mediaUrl } from "../../lib/cms";
import { useAsync, useDebounced } from "../hooks/useResource";
import { Button, Modal, SearchInput, TableSkeleton, EmptyState, ErrorBox, useToast } from "./ui";
import s from "./MediaPicker.module.css";

/** Modal browser over the Media Library, used by every "Select from Media
 *  Library" button — the same phrasing the client already knows. */
export function MediaPickerModal({ onSelect, onClose, accept = "image/*" }) {
  const toast = useToast();
  const fileRef = useRef(null);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const debounced = useDebounced(search);

  const { data, loading, error, reload } = useAsync(
    () => api.media.list({ search: debounced, limit: 60 }),
    [debounced],
  );

  async function upload(files) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const result = await api.media.upload(files);
      toast.success(`${files.length} file${files.length === 1 ? "" : "s"} uploaded`);
      reload();
      const first = Array.isArray(result) ? result[0] : result?.items?.[0] || result;
      if (first) onSelect(first);
    } catch (err) {
      toast.error(err);
    } finally {
      setUploading(false);
    }
  }

  const items = data?.items || [];

  return (
    <Modal
      wide
      title="Media Library"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon="upload" disabled={uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? "Uploading…" : "Upload File"}
          </Button>
        </>
      }
    >
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        multiple
        hidden
        onChange={(e) => {
          upload(Array.from(e.target.files || []));
          e.target.value = "";
        }}
      />

      <div className={s.pickerBar}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search media…" />
      </div>

      {loading && <TableSkeleton rows={4} />}
      {error && <ErrorBox error={error} onRetry={reload} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState title="No media yet" message="Upload an image to get started." />
      )}

      <div className={s.grid}>
        {items.map((m) => (
          <button key={m._id} type="button" className={s.tile} onClick={() => { onSelect(m); onClose(); }}>
            {String(m.mime || "").startsWith("image/") ? (
              <img src={mediaUrl(m)} alt={m.alt || m.originalName} loading="lazy" />
            ) : (
              <span className={s.fileTile}>{(m.originalName || "").split(".").pop()?.toUpperCase()}</span>
            )}
            <span className={s.tileName}>{m.alt || m.originalName}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}

/** Field wrapper: shows the current selection with Select / Remove actions. */
export function MediaField({ label = "Featured Image", value, onChange, hint, variant }) {
  // "contain" is for a mark that must be shown whole — a partner's logo, a
  // funder's wordmark — never cropped to fill the box the way a photograph
  // legitimately is. Default stays "cover" so every existing caller (hero and
  // featured images) is unaffected.
  const marklike = variant === "contain";
  const [open, setOpen] = useState(false);
  const url = value ? mediaUrl(value) : null;

  return (
    <div className={s.field}>
      <span className={s.fieldLabel}>{label}</span>

      {url ? (
        <div className={`${s.preview} ${marklike ? s.previewContain : ""}`}>
          <img src={url} alt="" />
          <div className={s.previewActions}>
            <Button size="sm" onClick={() => setOpen(true)}>Replace</Button>
            <Button size="sm" variant="ghost" onClick={() => onChange(null)}>Remove</Button>
          </div>
        </div>
      ) : (
        <Button size="sm" icon="media" onClick={() => setOpen(true)}>
          Select from Media Library
        </Button>
      )}

      {hint && <span className={s.fieldHint}>{hint}</span>}
      {open && <MediaPickerModal onSelect={onChange} onClose={() => setOpen(false)} />}
    </div>
  );
}
