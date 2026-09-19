import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./components/ui";
import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Posts from "./pages/Posts";
import PostEditor from "./pages/PostEditor";
import Pages from "./pages/Pages";
import PageEditor from "./pages/PageEditor";
import Media from "./pages/Media";
import Menus from "./pages/Menus";
import Sliders from "./pages/Sliders";
import Trash from "./pages/Trash";
import Users, { Profile } from "./pages/Users";
import { Forms, FormEditor, Submissions } from "./pages/Forms";
import { Theme, Authentication } from "./pages/Settings";
import {
  ContentTypes, People, PersonGroups, Partners, Documents, DocumentCategories,
  Events, EventCategories,
} from "./pages/resources";
import "./admin.css";

function RequireAuth({ children, roles }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) return <div style={{ padding: 40, color: "#6b7280" }}>Loading…</div>;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/admin/dashboard" replace />;
  return children;
}

export default function AdminApp() {
  return (
    <div className="adminRoot">
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="login" element={<Login />} />

            <Route element={<RequireAuth><AdminLayout /></RequireAuth>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              <Route path="posts" element={<Posts />} />
              <Route path="posts/:id" element={<PostEditor />} />

              <Route path="pages" element={<Pages />} />
              <Route path="pages/:id" element={<PageEditor />} />

              <Route path="content-types" element={<ContentTypes />} />
              <Route path="media" element={<Media />} />
              <Route path="menus" element={<Menus />} />
              <Route path="sliders" element={<Sliders />} />

              <Route path="forms" element={<Forms />} />
              <Route path="forms/:id" element={<FormEditor />} />
              <Route path="forms/:id/submissions" element={<Submissions />} />

              <Route path="trash" element={<Trash />} />

              <Route path="people" element={<People />} />
              <Route path="people/groups" element={<PersonGroups />} />
              <Route path="partners" element={<Partners />} />
              <Route path="documents" element={<Documents />} />
              <Route path="documents/collections" element={<DocumentCategories />} />

              <Route path="events" element={<Events />} />
              <Route path="event-categories" element={<EventCategories />} />

              <Route path="profile" element={<Profile />} />
              <Route path="users" element={<RequireAuth roles={["admin"]}><Users /></RequireAuth>} />
              <Route path="authentication" element={<RequireAuth roles={["admin"]}><Authentication /></RequireAuth>} />
              <Route path="theme" element={<RequireAuth roles={["admin", "editor"]}><Theme /></RequireAuth>} />

              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </div>
  );
}
