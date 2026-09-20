import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs/AboutUs";
import OurHistory from "./pages/AboutUs/OurHistory";
import OurPartners from "./pages/AboutUs/OurPartners";
import OurPolicies from "./pages/AboutUs/OurPolicies";
import OurPeopleIndex from "./pages/AboutUs/OurPeopleIndex";
import OurPeopleCategory from "./pages/AboutUs/OurPeopleCategory";
import FocusAreas from "./pages/FocusAreas/FocusAreas";
import FocusAreaDetail from "./pages/FocusAreas/FocusAreaDetail";
import Programmes from "./pages/Programmes/Programmes";
import ProgrammeDetail from "./pages/Programmes/ProgrammeDetail";
import NewsAndMedia from "./pages/NewsAndMedia";
import ArticleDetail from "./pages/ArticleDetail";
import KnowledgeHub from "./pages/KnowledgeHub";
import KnowledgeHubCollection from "./pages/KnowledgeHubCollection";
import ContactUs from "./pages/ContactUs";
import JoinUs from "./pages/JoinUs";
import CustomPage from "./pages/CustomPage";

// The dashboard is a separate bundle — visitors never download it.
const AdminApp = lazy(() => import("./admin/AdminApp"));

export default function App() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={null}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route element={<Layout />}>
        <Route index element={<Home />} />

        <Route path="about-us" element={<AboutUs />} />
        <Route path="about-us/our-history" element={<OurHistory />} />
        <Route path="about-us/our-partners" element={<OurPartners />} />
        <Route path="about-us/our-policies" element={<OurPolicies />} />
        <Route path="about-us/our-people" element={<OurPeopleIndex />} />
        <Route path="about-us/our-people/:category" element={<OurPeopleCategory />} />

        <Route path="focus-areas" element={<FocusAreas />} />
        <Route path="focus-areas/:slug" element={<FocusAreaDetail />} />

        <Route path="programmes" element={<Programmes />} />
        <Route path="programmes/:slug" element={<ProgrammeDetail />} />
        {/* legacy paths from the previous build */}
        <Route path="our-work" element={<Navigate to="/focus-areas" replace />} />
        <Route path="our-work/:slug" element={<Navigate to="/programmes" replace />} />

        <Route path="knowledge-hub" element={<KnowledgeHub />} />
        <Route path="knowledge-hub/:slug" element={<KnowledgeHubCollection />} />
        <Route path="news-and-media" element={<NewsAndMedia />} />
        <Route path="news-and-media/:slug" element={<ArticleDetail />} />
        <Route path="contact-us" element={<ContactUs />} />
        <Route path="join-us" element={<JoinUs />} />

        {/* Anything not claimed above is looked up as a custom page — the kind
            created in the admin — and falls through to the 404 when there is
            no published page at that address. React Router ranks the static
            routes above this one, so a page with a component of its own is
            never reached through here. */}
        <Route path="*" element={<CustomPage />} />
      </Route>
    </Routes>
  );
}
