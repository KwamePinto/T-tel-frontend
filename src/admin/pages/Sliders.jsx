import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { mediaUrl } from "../../lib/cms";
import { useAsync } from "../hooks/useResource";
import { MediaPickerModal } from "../components/MediaPicker";
import {
  Button, Card, CardHead, ConfirmDialog, EmptyState, ErrorBox, Field, Input, Modal,
  PageHead, Spacer, TableSkeleton, Textarea, Toggle, useToast,
} from "../components/ui";
import s from "./Sliders.module.css";

const blankSlide = () => ({
  key: Math.random().toString(36).slice(2),
  image: null, title: "", caption: "", buttonLabel: "", buttonUrl: "",
});

export default function Sliders() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => api.sliders.list({ limit: 50 }), []);
  const [activeId, setActiveId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const sliders = data?.items || [];
  const active = sliders.find((x) => x._id === activeId) || sliders[0];

  if (loading) return <Card><TableSkeleton rows={5} /></Card>;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  return (
    <>
      <PageHead title="Sliders" subtitle="Image carousels that can be dropped into pages.">
        <Button variant="primary" icon="plus" onClick={() => setCreating(true)}>New Slider</Button>
      </PageHead>

      <div className={s.layout}>
        <Card>
          <CardHead title="Sliders" />
          <div className={s.list}>
            {sliders.map((x) => (
              <button
                key={x._id}
                type="button"
                className={`${s.listItem} ${x._id === active?._id ? s.listItemOn : ""}`}
                onClick={() => setActiveId(x._id)}
              >
                <strong>{x.name}</strong>
                <em>{x.slides?.length || 0} slide{(x.slides?.length || 0) === 1 ? "" : "s"}</em>
              </button>
            ))}
            {!sliders.length && <EmptyState title="No sliders yet" message="Create one to get started." />}
          </div>
        </Card>

        {active && (
          <SlideEditor
            key={active._id}
            slider={active}
            onSaved={reload}
            onDelete={() => setConfirm(active)}
          />
        )}
      </div>

      {creating && (
        <NameDialog
          onClose={() => setCreating(false)}
          onSave={async (name) => {
            const saved = await api.sliders.create({ name, slides: [] });
            setActiveId(saved._id);
            setCreating(false);
            reload();
            toast.success("Slider created");
          }}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title="Delete slider"
          message={`“${confirm.name}” and its slides will be removed.`}
          confirmLabel="Delete"
          destructive
          onConfirm={async () => {
            await api.sliders.trash(confirm._id);
            setActiveId(null);
            reload();
            toast.success("Slider deleted");
          }}
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  );
}

function SlideEditor({ slider, onSaved, onDelete }) {
  const toast = useToast();
  const [name, setName] = useState(slider.name);
  const [autoplay, setAutoplay] = useState(slider.autoplay ?? true);
  const [intervalMs, setIntervalMs] = useState(slider.intervalMs ?? 5000);
  const [slides, setSlides] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [picking, setPicking] = useState(null);

  useEffect(() => {
    setSlides((slider.slides || []).map((sl) => ({ ...sl, key: Math.random().toString(36).slice(2) })));
    setName(slider.name);
    setDirty(false);
  }, [slider]);

  const setSlide = (key, patch) => {
    setSlides((list) => list.map((sl) => (sl.key === key ? { ...sl, ...patch } : sl)));
    setDirty(true);
  };

  const move = (index, delta) => {
    setSlides((list) => {
      const target = index + delta;
      if (target < 0 || target >= list.length) return list;
      const next = [...list];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setDirty(true);
  };

  async function save() {
    setSaving(true);
    try {
      await api.sliders.update(slider._id, {
        name,
        autoplay,
        intervalMs: Number(intervalMs) || 5000,
        slides: slides.map(({ key: _key, image, ...rest }, i) => ({
          ...rest,
          image: image?._id || image || null,
          sortOrder: i,
        })),
      });
      setDirty(false);
      toast.success("Slider saved");
      onSaved();
    } catch (err) {
      toast.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHead title={slider.name}>
        <Button size="sm" variant="ghost" icon="trash" onClick={onDelete}>Delete</Button>
      </CardHead>

      <div className={s.editor}>
        <div className={s.settings}>
          <Field label="Name">
            <Input value={name} onChange={(e) => { setName(e.target.value); setDirty(true); }} />
          </Field>
          <Field label="Interval (ms)" hint="How long each slide is shown.">
            <Input type="number" value={intervalMs} onChange={(e) => { setIntervalMs(e.target.value); setDirty(true); }} />
          </Field>
          <Toggle checked={autoplay} onChange={(v) => { setAutoplay(v); setDirty(true); }} title="Autoplay" description="Advance slides automatically." />
        </div>

        {slides.map((sl, i) => (
          <div key={sl.key} className={s.slide}>
            <button type="button" className={s.slideImage} onClick={() => setPicking(sl.key)}>
              {sl.image ? <img src={mediaUrl(sl.image)} alt="" /> : <span>Select image</span>}
            </button>

            <div className={s.slideFields}>
              <Field label="Title"><Input value={sl.title} onChange={(e) => setSlide(sl.key, { title: e.target.value })} /></Field>
              <Field label="Caption"><Textarea rows={2} value={sl.caption} onChange={(e) => setSlide(sl.key, { caption: e.target.value })} /></Field>
              <div className={s.pair}>
                <Field label="Button label"><Input value={sl.buttonLabel} onChange={(e) => setSlide(sl.key, { buttonLabel: e.target.value })} /></Field>
                <Field label="Button URL"><Input value={sl.buttonUrl} onChange={(e) => setSlide(sl.key, { buttonUrl: e.target.value })} /></Field>
              </div>
            </div>

            <div className={s.slideActions}>
              <Button size="sm" variant="ghost" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">↑</Button>
              <Button size="sm" variant="ghost" disabled={i === slides.length - 1} onClick={() => move(i, 1)} aria-label="Move down">↓</Button>
              <Button
                size="sm"
                variant="ghost"
                icon="trash"
                onClick={() => { setSlides((list) => list.filter((x) => x.key !== sl.key)); setDirty(true); }}
                aria-label="Remove slide"
              />
            </div>
          </div>
        ))}

        <div className={s.foot}>
          <Button icon="plus" onClick={() => { setSlides((l) => [...l, blankSlide()]); setDirty(true); }}>
            Add slide
          </Button>
          <Spacer />
          {dirty && <span className={s.dirty}>Unsaved changes</span>}
          <Button variant="primary" disabled={!dirty || saving} onClick={save}>
            {saving ? "Saving…" : "Save slider"}
          </Button>
        </div>
      </div>

      {picking && (
        <MediaPickerModal
          onSelect={(m) => setSlide(picking, { image: m })}
          onClose={() => setPicking(null)}
        />
      )}
    </Card>
  );
}

function NameDialog({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <Modal
      title="New slider"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" form="sliderForm" variant="primary" disabled={saving}>Create</Button>
        </>
      }
    >
      <form
        id="sliderForm"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim()) return;
          setSaving(true);
          try { await onSave(name.trim()); } finally { setSaving(false); }
        }}
      >
        <Field label="Name" required>
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Homepage hero" />
        </Field>
      </form>
    </Modal>
  );
}
