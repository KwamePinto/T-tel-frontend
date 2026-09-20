import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useList } from "../hooks/useResource";
import { getBlueprint } from "../pageBlueprints";
import {
  Button, Card, CardBody, CardHead, Chip, ConfirmDialog, EmptyState, ErrorBox, FilterPills,
  PageHead, Pager, RowActions, RowTitle, SearchInput, Spacer, Table, TableSkeleton, Toolbar,
  useToast,
} from "../components/ui";
import s from "./Pages.module.css";

/** Reads a page's menu back as a label for the list. */
const SECTION_LABEL = {
  "about-us": "About Us",
  "focus-areas": "Focus Areas",
  programmes: "Programmes",
};

const STATUSES = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

/** Shared by both tables so the two groups stay in step under one search box. */
function useSharedSearch(...lists) {
  const [value, setValue] = useState("");
  return [
    value,
    (next) => {
      setValue(next);
      for (const list of lists) list.setSearch(next);
    },
  ];
}

export default function Pages() {
  const toast = useToast();
  const [confirm, setConfirm] = useState(null);

  // Two requests rather than one partitioned client-side, so the custom group
  // can page properly once the client has more pages than fit on a screen.
  // Special pages are a fixed, short list — one page of them is always enough.
  const special = useList(api.pages, { status: "all", kind: "special", limit: 100 });
  const custom = useList(api.pages, { status: "all", kind: "custom", limit: 30 });

  const [search, setSearch] = useSharedSearch(special, custom);

  async function trash(page) {
    try {
      await api.pages.trash(page._id);
      toast.success(`“${page.title}” moved to Trash`);
      custom.reload();
    } catch (err) {
      toast.error(err);
    }
  }

  const loading = special.loading || custom.loading;
  const error = special.error || custom.error;

  return (
    <>
      <PageHead title="Pages" subtitle="Standing pages such as Who We Are, Our History and Contact Us.">
        <Link to="/admin/pages/new">
          <Button variant="primary" icon="plus">New Page</Button>
        </Link>
      </PageHead>

      <Card>
        <Toolbar>
          <FilterPills
            options={STATUSES}
            value={custom.params.status}
            onChange={(status) => { special.setParam({ status }); custom.setParam({ status }); }}
          />
          <Spacer />
          <SearchInput value={search} onChange={setSearch} placeholder="Search pages…" />
        </Toolbar>
      </Card>

      {error && <ErrorBox error={error} onRetry={() => { special.reload(); custom.reload(); }} />}

      {/* ---------------- special ---------------- */}
      <Card className={s.group}>
        <CardHead title="Special pages">
          <span className={s.groupNote}>
            Each has a layout of its own and is edited field by field. A developer adds these.
          </span>
        </CardHead>

        {loading && <TableSkeleton rows={6} />}

        {!loading && !error && special.items.length === 0 && (
          <CardBody>
            <EmptyState title="No special pages match" message="Clear the search to see them all." />
          </CardBody>
        )}

        {!loading && !error && special.items.length > 0 && (
          <Table columns={["Page", "Menu", "Address", "Status", ""]}>
            {special.items.map((p) => {
              const blueprint = getBlueprint(p.slug);
              return (
                <tr key={p._id}>
                  <td>
                    <Link to={`/admin/pages/${p._id}`}>
                      <RowTitle>{blueprint?.label || p.title}</RowTitle>
                    </Link>
                    {!blueprint && <span className={s.flag}>no editor defined</span>}
                  </td>
                  <td>{SECTION_LABEL[p.section] || <span className={s.dash}>—</span>}</td>
                  <td style={{ color: "var(--a-muted)" }}>/{p.slug}</td>
                  <td><Chip>{p.status}</Chip></td>
                  <td>
                    <RowActions>
                      <a href={`/${p.slug}`} target="_blank" rel="noreferrer">
                        <Button size="sm" icon="eye">View</Button>
                      </a>
                      <Link to={`/admin/pages/${p._id}`}><Button size="sm" icon="edit">Edit</Button></Link>
                    </RowActions>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>

      {/* ---------------- custom ---------------- */}
      <Card className={s.group}>
        <CardHead title="Custom pages">
          <span className={s.groupNote}>
            A hero and a block of text, laid out to match the menu it is filed under. Every page you create is one of these.
          </span>
        </CardHead>

        {loading && <TableSkeleton rows={4} />}

        {!loading && !error && custom.items.length === 0 && (
          <CardBody>
            <EmptyState
              title="No custom pages yet"
              message="Use New Page to add one. It appears on the site at its own address as soon as it is published."
            />
          </CardBody>
        )}

        {!loading && !error && custom.items.length > 0 && (
          <>
            <Table columns={["Title", "Menu", "Address", "Status", "In Nav", ""]}>
              {custom.items.map((p) => (
                <tr key={p._id}>
                  <td>
                    <Link to={`/admin/pages/${p._id}`}><RowTitle>{p.title}</RowTitle></Link>
                  </td>
                  <td>{SECTION_LABEL[p.section] || <span className={s.dash}>Standalone</span>}</td>
                  <td style={{ color: "var(--a-muted)" }}>/{p.slug}</td>
                  <td><Chip>{p.status}</Chip></td>
                  <td>{p.showInNav ? <Chip tone="chipGreen">Yes</Chip> : <Chip tone="chipGrey">No</Chip>}</td>
                  <td>
                    <RowActions>
                      <a href={`/${p.slug}`} target="_blank" rel="noreferrer">
                        <Button size="sm" icon="eye">View</Button>
                      </a>
                      <Link to={`/admin/pages/${p._id}`}><Button size="sm" icon="edit">Edit</Button></Link>
                      <Button size="sm" variant="ghost" icon="trash" onClick={() => setConfirm(p)}>Trash</Button>
                    </RowActions>
                  </td>
                </tr>
              ))}
            </Table>
            <Pager
              page={custom.page}
              pages={custom.pages}
              total={custom.total}
              onPage={(page) => custom.setParam({ page })}
            />
          </>
        )}
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
