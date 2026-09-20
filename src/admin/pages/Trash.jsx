import { useState } from "react";
import { api } from "../lib/api";
import { useAsync } from "../hooks/useResource";
import {
  Button, Card, Chip, ConfirmDialog, EmptyState, ErrorBox, PageHead, RowActions,
  RowTitle, Table, TableSkeleton, useToast,
} from "../components/ui";

const TYPE_LABELS = {
  posts: "Post",
  pages: "Page",
  people: "Person",
  partners: "Partner",
  "partner-groups": "Partner group",
  documents: "Document",
  events: "Event",
  sliders: "Slider",
  forms: "Form",
  media: "Media",
  menus: "Menu",
};

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function Trash() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => api.trash.list(), []);
  const [confirm, setConfirm] = useState(null);

  const items = data?.items || [];

  async function act(fn, message) {
    try {
      await fn();
      toast.success(message);
      reload();
    } catch (err) {
      toast.error(err);
    }
  }

  return (
    <>
      <PageHead title="Trash" subtitle="Deleted items are kept here so they can be restored.">
        {items.length > 0 && (
          <>
            <Button icon="restore" onClick={() => act(() => api.trash.restoreAll(), "Everything restored")}>
              Restore all
            </Button>
            <Button variant="danger" icon="trash" onClick={() => setConfirm({ all: true })}>
              Empty Trash
            </Button>
          </>
        )}
      </PageHead>

      <Card>
        {loading && <TableSkeleton rows={6} />}
        {error && <ErrorBox error={error} onRetry={reload} />}

        {!loading && !error && items.length === 0 && (
          <EmptyState title="Trash is empty" message="Nothing has been deleted recently." />
        )}

        {!loading && !error && items.length > 0 && (
          <Table columns={["Item", "Type", "Deleted", ""]}>
            {items.map((item) => (
              <tr key={`${item.type}-${item.id}`}>
                <td><RowTitle>{item.title || item.name || item.originalName || "Untitled"}</RowTitle></td>
                <td><Chip tone="chipGrey">{item.typeLabel || TYPE_LABELS[item.type] || item.type}</Chip></td>
                <td>{fmt(item.deletedAt)}</td>
                <td>
                  <RowActions>
                    <Button
                      size="sm"
                      icon="restore"
                      onClick={() => act(() => api.trash.restore(item.type, item.id), "Item restored")}
                    >
                      Restore
                    </Button>
                    <Button size="sm" variant="ghost" icon="trash" onClick={() => setConfirm(item)}>
                      Delete permanently
                    </Button>
                  </RowActions>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {confirm && (
        <ConfirmDialog
          title={confirm.all ? "Empty Trash" : "Delete permanently"}
          message={
            confirm.all
              ? `All ${items.length} item${items.length === 1 ? "" : "s"} in Trash will be destroyed. This cannot be undone.`
              : "This item will be destroyed. This cannot be undone."
          }
          confirmLabel={confirm.all ? "Empty Trash" : "Delete permanently"}
          destructive
          onConfirm={() =>
            confirm.all
              ? act(() => api.trash.empty(), "Trash emptied")
              : act(() => api.trash.destroy(confirm.type, confirm.id), "Item deleted")
          }
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  );
}
