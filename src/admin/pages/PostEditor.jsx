import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAsync } from "../hooks/useResource";
import EditorShell, { Rail, RailSection, TitleField } from "../components/EditorShell";
import RichText from "../components/RichText";
import { MediaField } from "../components/MediaPicker";
import SectionsEditor from "../components/SectionsEditor";
import { Button, Card, CardHead, ErrorBox, Field, Input, Select, TableSkeleton, Textarea, useToast } from "../components/ui";
import TranslationPanel from "../components/TranslationPanel";

const EMPTY = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  status: "draft",
  publishedAt: "",
  contentType: "",
  tags: [],
  featuredImage: null,
  sections: [],
  keyInfo: { label: "", title: "", html: "", linkLabel: "", linkUrl: "" },
  translations: {},
};

/** <input type="datetime-local"> needs `YYYY-MM-DDTHH:mm` in local time. */
function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function PostEditor() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const { data: post, loading, error, reload } = useAsync(
    () => (isNew ? Promise.resolve(null) : api.posts.get(id)),
    [id],
  );
  const { data: types } = useAsync(() => api.contentTypes.list({ limit: 100 }), []);

  useEffect(() => {
    if (!post) return;
    setForm({
      ...EMPTY,
      ...post,
      contentType: post.contentType?._id || post.contentType || "",
      featuredImage: post.featuredImage || null,
      sections: post.sections || [],
      keyInfo: { ...EMPTY.keyInfo, ...(post.keyInfo || {}) },
      translations: post.translations || {},
      publishedAt: toLocalInput(post.publishedAt),
      tags: post.tags || [],
    });
    setTagInput((post.tags || []).map((t) => t.name || t).join(", "));
    setDirty(false);
  }, [post]);

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
  };

  const setKeyInfo = (patch) => {
    setForm((f) => ({ ...f, keyInfo: { ...f.keyInfo, ...patch } }));
    setDirty(true);
  };

  const typeOptions = useMemo(
    () => (types?.items || []).map((t) => ({ value: t._id, label: t.name })),
    [types],
  );

  async function save() {
    if (!form.title.trim()) return toast.error("A title is required.");
    if (!form.contentType) return toast.error("Choose a Content Type before saving.");
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug || undefined,
        excerpt: form.excerpt,
        body: form.body,
        status: form.status,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
        contentType: form.contentType || null,
        featuredImage: form.featuredImage?._id || form.featuredImage || null,
        // the editor holds populated media objects; the API stores ids
        sections: (form.sections || []).map((sec) => ({
          ...sec,
          image: sec.image?._id || sec.image || null,
        })),
        keyInfo: form.keyInfo,
        translations: form.translations,
        tagNames: tagInput.split(",").map((t) => t.trim()).filter(Boolean),
      };

      const saved = isNew ? await api.posts.create(payload) : await api.posts.update(id, payload);
      setDirty(false);
      toast.success(isNew ? "Post created" : "Post updated");
      if (isNew) navigate(`/admin/posts/${saved._id}`, { replace: true });
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
      backTo="/admin/posts"
      backLabel="Posts"
      title={isNew ? "New Post" : "Edit Post"}
      dirty={dirty}
      saving={saving}
      onSave={save}
      extraActions={
        !isNew && form.slug && form.status === "published" ? (
          <a href={`/news-and-media/${form.slug}`} target="_blank" rel="noreferrer">
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
            <Field
              label="Publish Date & Time"
              hint={
                form.status === "scheduled"
                  ? "The post goes live automatically at this time."
                  : "Backdating is allowed — the site orders posts by this date."
              }
            >
              <Input
                type="datetime-local"
                value={form.publishedAt}
                onChange={(e) => set({ publishedAt: e.target.value })}
              />
            </Field>
          </RailSection>

          <RailSection title="Content Type">
            <Field required hint="Blog posts appear under News & Media; focus areas drive the homepage carousel.">
              <Select
                placeholder="Choose a type…"
                value={form.contentType}
                onChange={(e) => set({ contentType: e.target.value })}
                options={typeOptions}
              />
            </Field>
          </RailSection>

          <RailSection title="Featured Image">
            <MediaField
              label=""
              value={form.featuredImage}
              onChange={(m) => set({ featuredImage: m })}
              hint="Shown on cards and at the top of the article."
            />
          </RailSection>

          <RailSection title="Excerpt">
            <Field hint="A short summary for listing cards. Leave blank to use the first lines of the body.">
              <Textarea
                rows={4}
                value={form.excerpt}
                onChange={(e) => set({ excerpt: e.target.value })}
                placeholder="One or two sentences…"
              />
            </Field>
          </RailSection>

          <RailSection title="Tags">
            <Field hint="Separate tags with commas. New tags are created automatically.">
              <Input
                value={tagInput}
                onChange={(e) => { setTagInput(e.target.value); setDirty(true); }}
                placeholder="teacher education, policy"
              />
            </Field>
          </RailSection>

          <RailSection title="Français" defaultOpen={false}>
            <TranslationPanel
              value={form.translations}
              onChange={(translations) => set({ translations })}
              fields={[
                { key: "title", label: "Titre", source: form.title },
                { key: "excerpt", label: "Résumé", type: "textarea", rows: 4, source: form.excerpt },
                { key: "body", label: "Contenu", type: "richtext", source: form.body },
              ]}
            />
          </RailSection>

          <RailSection title="Key information" defaultOpen={false}>
            <Field
              label="Small line above the heading"
              hint="The panel that stays beside the text as the reader scrolls a Focus Area. Leave the heading empty and no panel is shown."
            >
              <Input
                value={form.keyInfo.label || ""}
                onChange={(e) => setKeyInfo({ label: e.target.value })}
                placeholder="Institutional Links"
              />
            </Field>
            <Field label="Heading">
              <Input
                value={form.keyInfo.title || ""}
                onChange={(e) => setKeyInfo({ title: e.target.value })}
                placeholder="Delivery Partners"
              />
            </Field>
            <Field label="Text">
              <Textarea
                rows={5}
                value={form.keyInfo.html || ""}
                onChange={(e) => setKeyInfo({ html: e.target.value })}
                placeholder="Who delivers this work, and with whom…"
              />
            </Field>
            <Field label="Link text">
              <Input
                value={form.keyInfo.linkLabel || ""}
                onChange={(e) => setKeyInfo({ linkLabel: e.target.value })}
                placeholder="All partners"
              />
            </Field>
            <Field label="Link address">
              <Input
                value={form.keyInfo.linkUrl || ""}
                onChange={(e) => setKeyInfo({ linkUrl: e.target.value })}
                placeholder="/about-us/our-partners"
              />
            </Field>
          </RailSection>
        </Rail>
      }
    >
      <TitleField
        value={form.title}
        onChange={(title) => set({ title })}
        slug={form.slug}
        onSlugChange={(slug) => set({ slug })}
        prefix="/news-and-media/"
      />

      <Card>
        <CardHead title="Page blocks" />
        <SectionsEditor value={form.sections} onChange={(sections) => set({ sections })} />
      </Card>

      <Card>
        <CardHead title={form.sections?.length ? "Content — unused while blocks exist" : "Content"} />
        <RichText
          value={form.body}
          onChange={(body) => set({ body })}
          placeholder="Write the article…"
        />
      </Card>
    </EditorShell>
  );
}
