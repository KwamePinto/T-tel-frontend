import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAsync } from "../hooks/useResource";
import AdminIcon from "../components/AdminIcon";
import { Card, CardHead, Chip, ErrorBox, PageHead, Table, TableSkeleton, Button } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import s from "./Dashboard.module.css";

const CARDS = [
  { key: "posts", label: "Posts", icon: "posts", to: "/admin/posts" },
  { key: "pages", label: "Pages", icon: "pages", to: "/admin/pages" },
  { key: "people", label: "Our People", icon: "people", to: "/admin/people" },
  { key: "documents", label: "Documents", icon: "documents", to: "/admin/documents" },
  { key: "media", label: "Media Files", icon: "media", to: "/admin/media" },
  { key: "unreadSubmissions", label: "Unread Messages", icon: "mail", to: "/admin/forms", alert: true },
  { key: "users", label: "Users", icon: "users", to: "/admin/users" },
];

const QUICK = [
  { label: "Write a post", to: "/admin/posts/new", icon: "posts" },
  { label: "Add a page", to: "/admin/pages/new", icon: "pages" },
  { label: "Upload media", to: "/admin/media", icon: "upload" },
  { label: "Add a person", to: "/admin/people/new", icon: "people" },
];

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(() => api.dashboard(), []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHead
        title={`${greeting}, ${user?.name?.split(" ")[0] || "there"}`}
        subtitle="Here's what's happening across the T-TEL website."
      />

      {error && <ErrorBox error={error} onRetry={reload} />}

      <div className={s.stats}>
        {CARDS.map((c) => {
          const value = data?.counts?.[c.key];
          return (
            <Link key={c.key} to={c.to} className={s.stat}>
              <span className={`${s.statIcon} ${c.alert && value > 0 ? s.statIconAlert : ""}`}>
                <AdminIcon name={c.icon} size={19} />
              </span>
              <span className={s.statValue}>{loading ? "—" : (value ?? 0)}</span>
              <span className={s.statLabel}>{c.label}</span>
            </Link>
          );
        })}
      </div>

      <div className={s.cols}>
        <Card>
          <CardHead title="Recently updated">
            <Link to="/admin/posts"><Button size="sm">View all posts</Button></Link>
          </CardHead>
          {loading ? (
            <TableSkeleton rows={5} />
          ) : (
            <Table columns={["Title", "Type", "Author", "Status", "Updated"]}>
              {(data?.recent || []).map((p) => (
                <tr key={p._id}>
                  <td>
                    <Link to={`/admin/posts/${p._id}`} className={s.rowLink}>{p.title}</Link>
                  </td>
                  <td>{p.contentType?.name || "—"}</td>
                  <td>{p.author?.name || "—"}</td>
                  <td><Chip>{p.status}</Chip></td>
                  <td>{fmtDate(p.updatedAt)}</td>
                </tr>
              ))}
            </Table>
          )}
        </Card>

        <div className={s.side}>
          <Card>
            <CardHead title="Quick actions" />
            <div className={s.quick}>
              {QUICK.map((q) => (
                <Link key={q.to} to={q.to} className={s.quickItem}>
                  <AdminIcon name={q.icon} size={17} />
                  {q.label}
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <CardHead title="Content types" />
            <div className={s.types}>
              {(data?.contentTypes || []).map((t) => (
                <Link key={t.id} to={`/admin/posts?contentType=${t.id}`} className={s.typeRow}>
                  <span>{t.name}</span>
                  <strong>{t.count}</strong>
                </Link>
              ))}
              {!loading && !(data?.contentTypes || []).length && (
                <p className={s.muted}>No content types defined yet.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
