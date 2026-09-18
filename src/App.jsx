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
import KnowledgeHub from "./pages/KnowledgeHub";
import ContactUs from "./pages/ContactUs";
import JoinUs from "./pages/JoinUs";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
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
        <Route path="news-and-media" element={<NewsAndMedia />} />
        <Route path="contact-us" element={<ContactUs />} />
        <Route path="join-us" element={<JoinUs />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
