import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useList } from "../hooks/useResource";
import {
  Button, Card, Chip, ConfirmDialog, EmptyState, ErrorBox, FilterPills, PageHead, Pager,
  RowActions, RowTitle, SearchInput, Spacer, Table, TableSkeleton, Toolbar, useToast,
} from "../components/ui";

const STATUSES = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

export default function Pages() {
  const toast = useToast();
  const [confirm, setConfirm] = useState(null);
  const list = useList(api.pages, { status: "all", limit: 30 });

  async function trash(page) {
    try {
      await api.pages.trash(page._id);
      toast.success(`“${page.title}” moved to Trash`);
      list.reload();
    } catch (err) {
      toast.error(err);
    }
  }

  return (
    <>
      <PageHead title="Pages" subtitle="Standing pages such as Who We Are, Our History and Contact Us.">
        <Link to="/admin/pages/new">
          <Button variant="primary" icon="plus">New Page</Button>
        </Link>
      </PageHead>

      <Card>
        <Toolbar>
          <FilterPills options={STATUSES} value={list.params.status} onChange={(status) => list.setParam({ status })} />
          <Spacer />
          <SearchInput value={list.search} onChange={list.setSearch} placeholder="Search pages…" />
        </Toolbar>

        {list.loading && <TableSkeleton rows={8} />}
        {list.error && <ErrorBox error={list.error} onRetry={list.reload} />}

        {!list.loading && !list.error && list.items.length === 0 && (
          <EmptyState title="No pages found" message="Adjust the filters, or create a new page." />
        )}

        {!list.loading && !list.error && list.items.length > 0 && (
          <Table columns={["Title", "Slug", "Template", "Status", "In Nav", ""]}>
            {list.items.map((p) => (
              <tr key={p._id}>
                <td>
                  <Link to={`/admin/pages/${p._id}`}><RowTitle>{p.title}</RowTitle></Link>
                </td>
                <td style={{ color: "var(--a-muted)" }}>/{p.slug}</td>
                <td>{p.template || "default"}</td>
                <td><Chip>{p.status}</Chip></td>
                <td>{p.showInNav ? <Chip tone="chipGreen">Yes</Chip> : <Chip tone="chipGrey">No</Chip>}</td>
                <td>
                  <RowActions>
                    <a href={`/${p.slug}`} target="_blank" rel="noreferrer">
                      <Button size="sm" icon="eye">View</Button>
                    </a>
                    <Link to={`/admin/pages/${p._id}`}><Button size="sm" icon="edit">Edit</Button></Link>
                    {p.isSystem ? (
                      <Button size="sm" variant="ghost" disabled title="Part of the site structure">Trash</Button>
                    ) : (
                      <Button size="sm" variant="ghost" icon="trash" onClick={() => setConfirm(p)}>Trash</Button>
                    )}
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
          message={`“${confirm.title}” will be moved to Trash. Any navigation link pointing at it will 404 until it is restored.`}
          confirmLabel="Move to Trash"
          destructive
          onConfirm={() => trash(confirm)}
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  );
}
