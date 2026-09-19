import { useRef, useState } from "react";
import { api } from "../lib/api";
import { mediaUrl } from "../../lib/cms";
import { useAsync, useList } from "../hooks/useResource";
import {
  Button, Card, ConfirmDialog, EmptyState, ErrorBox, Field, Input, Modal, PageHead, Pager,
  SearchInput, Select, Spacer, TableSkeleton, Textarea, Toolbar, useToast,
} from "../components/ui";
import s from "./Media.module.css";

const KB = 1024;
const fmtSize = (n = 0) =>
  n > KB * KB ? `${(n / KB / KB).toFixed(1)} MB` : `${Math.max(Math.round(n / KB), 1)} KB`;

export default function Media() {
  const toast = useToast();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [newFolder, setNewFolder] = useState(false);

  const list = useList(api.media, { limit: 48, folder: "" });
  const { data: folders, reload: reloadFolders } = useAsync(() => api.media.folders(), []);

  async function upload(files) {
    if (!files.length) return;
    setUploading(true);
    try {
      const extra = list.params.folder ? { folder: list.params.folder } : {};
      await api.media.upload(files, extra);
      toast.success(`${files.length} file${files.length === 1 ? "" : "s"} uploaded`);
      list.reload();
    } catch (err) {
      toast.error(err);
    } finally {
      setUploading(false);
    }
  }

  async function remove(item) {
    try {
      await api.media.remove(item._id);
      toast.success("File deleted");
      setDetail(null);
      list.reload();
    } catch (err) {
      toast.error(err);
    }
  }

  return (
    <>
      <PageHead title="Media" subtitle="Images, video and documents used across the site.">
        <Button icon="folder" onClick={() => setNewFolder(true)}>New folder</Button>
        <Button variant="primary" icon="upload" disabled={uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? "Uploading…" : "Upload File"}
        </Button>
      </PageHead>

      <input
        ref={fileRef}
        type="file"
        multiple
        hidden
        onChange={(e) => { upload(Array.from(e.target.files || [])); e.target.value = ""; }}
      />

      <Card>
        <Toolbar>
          <Select
            placeholder="All folders"
            value={list.params.folder}
            onChange={(e) => list.setParam({ folder: e.target.value })}
            options={(folders?.items || []).map((f) => ({ value: f._id, label: f.name }))}
          />
          <Spacer />
          <SearchInput value={list.search} onChange={list.setSearch} placeholder="Search media…" />
        </Toolbar>

        <div
          className={s.dropzone}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); upload(Array.from(e.dataTransfer.files || [])); }}
        >
          {list.loading && <TableSkeleton rows={4} />}
          {list.error && <ErrorBox error={list.error} onRetry={list.reload} />}

          {!list.loading && !list.error && list.items.length === 0 && (
            <EmptyState
              title="No files here"
              message="Drag files onto this area, or use Upload File."
              action={<Button variant="primary" icon="upload" onClick={() => fileRef.current?.click()}>Upload File</Button>}
            />
          )}

          <div className={s.grid}>
            {list.items.map((m) => (
              <button key={m._id} className={s.tile} onClick={() => setDetail(m)}>
                {m.mime?.startsWith("image/") ? (
                  <img src={mediaUrl(m)} alt={m.alt || m.originalName} loading="lazy" />
                ) : (
                  <span className={s.fileTile}>{(m.originalName || "").split(".").pop()?.toUpperCase()}</span>
                )}
                <span className={s.meta}>
                  <span className={s.name}>{m.originalName}</span>
                  <span className={s.size}>{fmtSize(m.size)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <Pager page={list.page} pages={list.pages} total={list.total} onPage={(page) => list.setParam({ page })} />
      </Card>

      {detail && (
        <MediaDetail
          item={detail}
          folders={folders?.items || []}
          onClose={() => setDetail(null)}
          onSaved={() => { setDetail(null); list.reload(); }}
          onDelete={() => setConfirm(detail)}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title="Delete file"
          message={`“${confirm.originalName}” will be removed. Anything still using it will show a broken image.`}
          confirmLabel="Delete"
          destructive
          onConfirm={() => remove(confirm)}
          onClose={() => setConfirm(null)}
        />
      )}

      {newFolder && (
        <NewFolder
          onClose={() => setNewFolder(false)}
          onCreated={() => { setNewFolder(false); reloadFolders(); }}
        />
      )}
    </>
  );
}

function MediaDetail({ item, folders, onClose, onSaved, onDelete }) {
  const toast = useToast();
  const [alt, setAlt] = useState(item.alt || "");
  const [caption, setCaption] = useState(item.caption || "");
  const [folder, setFolder] = useState(item.folder?._id || item.folder || "");
  const [saving, setSaving] = useState(false);
  const url = mediaUrl(item);

  async function save() {
    setSaving(true);
    try {
      await api.media.update(item._id, { alt, caption, folder: folder || null });
      toast.success("File updated");
      onSaved();
    } catch (err) {
      toast.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      wide
      title={item.originalName}
      onClose={onClose}
      footer={
        <>
          <Button variant="danger" icon="trash" onClick={onDelete}>Delete</Button>
          <Spacer />
          <Button onClick={onClose}>Close</Button>
          <Button variant="primary" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save"}</Button>
        </>
      }
    >
      <div className={s.detail}>
        <div className={s.detailPreview}>
          {item.mime?.startsWith("image/") ? (
            <img src={url} alt={alt} />
          ) : item.mime?.startsWith("video/") ? (
            <video src={url} controls />
          ) : (
            <span className={s.fileTile}>{(item.originalName || "").split(".").pop()?.toUpperCase()}</span>
          )}
        </div>

        <div>
          <Field label="Alternative text" hint="Describes the image for screen readers and search engines.">
            <Input value={alt} onChange={(e) => setAlt(e.target.value)} />
          </Field>
          <Field label="Caption">
            <Textarea rows={3} value={caption} onChange={(e) => setCaption(e.target.value)} />
          </Field>
          <Field label="Folder">
            <Select
              placeholder="No folder"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              options={folders.map((f) => ({ value: f._id, label: f.name }))}
            />
          </Field>
          <Field label="File URL" hint="Copy this to link to the file directly.">
            <Input readOnly value={url} onFocus={(e) => e.target.select()} />
          </Field>
          <dl className={s.facts}>
            <div><dt>Type</dt><dd>{item.mime}</dd></div>
            <div><dt>Size</dt><dd>{fmtSize(item.size)}</dd></div>
            {item.width > 0 && <div><dt>Dimensions</dt><dd>{item.width} × {item.height}</dd></div>}
            <div><dt>Uploaded</dt><dd>{new Date(item.createdAt).toLocaleDateString("en-GB")}</dd></div>
          </dl>
        </div>
      </div>
    </Modal>
  );
}

function NewFolder({ onClose, onCreated }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function create(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.media.createFolder(name.trim());
      toast.success("Folder created");
      onCreated();
    } catch (err) {
      toast.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="New folder"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" form="newFolder" variant="primary" disabled={saving}>Create</Button>
        </>
      }
    >
      <form id="newFolder" onSubmit={create}>
        <Field label="Folder name" required>
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Reports 2025" />
        </Field>
      </form>
    </Modal>
  );
}
