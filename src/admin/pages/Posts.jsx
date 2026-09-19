import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAsync, useList } from "../hooks/useResource";
import {
  Button, Card, Chip, ChipRow, ConfirmDialog, EmptyState, ErrorBox, FilterPills,
  PageHead, Pager, RowActions, RowTitle, SearchInput, Select, Spacer, Table,
  TableSkeleton, Toolbar, useToast,
} from "../components/ui";

const STATUSES = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
];

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function Posts() {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [confirm, setConfirm] = useState(null);

  const list = useList(api.posts, {
    status: "all",
    contentType: searchParams.get("contentType") || "",
    tag: "",
  });

  const { data: types } = useAsync(() => api.contentTypes.list({ limit: 100 }), []);
  const { data: tags } = useAsync(() => api.tags.list({ limit: 200 }), []);

  async function trash(post) {
    try {
      await api.posts.trash(post._id);
      toast.success(`“${post.title}” moved to Trash`);
      list.reload();
    } catch (err) {
      toast.error(err);
    }
  }

  return (
    <>
      <PageHead title="Posts" subtitle="Blog articles and focus areas.">
        <Link to="/admin/posts/new">
          <Button variant="primary" icon="plus">New Post</Button>
        </Link>
      </PageHead>

      <Card>
        <Toolbar>
          <FilterPills
            options={STATUSES}
            value={list.params.status}
            onChange={(status) => list.setParam({ status })}
          />
          <Select
            placeholder="All types"
            value={list.params.contentType}
            onChange={(e) => list.setParam({ contentType: e.target.value })}
            options={(types?.items || []).map((t) => ({ value: t._id, label: t.name }))}
          />
          <Select
            placeholder="All tags"
            value={list.params.tag}
            onChange={(e) => list.setParam({ tag: e.target.value })}
            options={(tags?.items || []).map((t) => ({ value: t._id, label: t.name }))}
          />
          <Spacer />
          <SearchInput value={list.search} onChange={list.setSearch} placeholder="Search posts…" />
        </Toolbar>

        {list.loading && <TableSkeleton rows={8} />}
        {list.error && <ErrorBox error={list.error} onRetry={list.reload} />}

        {!list.loading && !list.error && list.items.length === 0 && (
          <EmptyState
            title="No posts match those filters"
            message="Try clearing the search or switching the status filter."
            action={
              <Button onClick={() => { list.setSearch(""); list.setParam({ status: "all", contentType: "", tag: "" }); }}>
                Clear filters
              </Button>
            }
          />
        )}

        {!list.loading && !list.error && list.items.length > 0 && (
          <Table columns={["Title", "Tags", "Author", "Type", "Status", "Date", ""]}>
            {list.items.map((p) => (
              <tr key={p._id}>
                <td>
                  <Link to={`/admin/posts/${p._id}`}>
                    <RowTitle sub={`/news-and-media/${p.slug}`}>{p.title}</RowTitle>
                  </Link>
                </td>
                <td>
                  <ChipRow>
                    {(p.tags || []).slice(0, 3).map((t) => (
                      <Chip key={t._id || t} tone="chipGrey">{t.name || t}</Chip>
                    ))}
                    {(p.tags || []).length > 3 && <Chip tone="chipGrey">+{p.tags.length - 3}</Chip>}
                  </ChipRow>
                </td>
                <td>{p.author?.name || "—"}</td>
                <td>{p.contentType?.name || "—"}</td>
                <td><Chip>{p.status}</Chip></td>
                <td>{fmtDate(p.publishedAt || p.createdAt)}</td>
                <td>
                  <RowActions>
                    <Link to={`/admin/posts/${p._id}`}>
                      <Button size="sm" icon="edit">Edit</Button>
                    </Link>
                    <Button size="sm" variant="ghost" icon="trash" onClick={() => setConfirm(p)}>
                      Trash
                    </Button>
                  </RowActions>
                </td>
              </tr>
            ))}
          </Table>
        )}

        <Pager page={list.page} pages={list.pages} total={list.total} onPage={(page) => list.setParam({ page })} />
      </Card>

      {confirm && (
        <ConfirmDialog
          title="Move to Trash"
          message={`“${confirm.title}” will be moved to Trash. You can restore it from there.`}
          confirmLabel="Move to Trash"
          destructive
          onConfirm={() => trash(confirm)}
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  );
}
