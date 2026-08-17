import "@/App.css";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Books from "@/pages/Books";
import Publications from "@/pages/Publications";
import Events from "@/pages/Events";
import Journal from "@/pages/Journal";
import JournalPost from "@/pages/JournalPost";
import Contact from "@/pages/Contact";
import ExpressionLTE from "@/pages/ExpressionLTE";
import ExpressionAcademic from "@/pages/ExpressionAcademic";
import ExpressionMarriage from "@/pages/ExpressionMarriage";
import TheEnquiry from "@/pages/TheEnquiry";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminPosts from "@/pages/AdminPosts";
import AdminEditor from "@/pages/AdminEditor";
import AdminTestimonials from "@/pages/AdminTestimonials";
import AdminBooks from "@/pages/AdminBooks";
import AdminPublications from "@/pages/AdminPublications";
import AdminEvents from "@/pages/AdminEvents";
import AdminSubscribers from "@/pages/AdminSubscribers";
import AdminRegistrations from "@/pages/AdminRegistrations";
import AdminCampaigns from "@/pages/AdminCampaigns";
import AdminCampaignEditor from "@/pages/AdminCampaignEditor";
import Programmes from "@/pages/Programmes";
import Unsubscribe from "@/pages/Unsubscribe";
import { AuthProvider } from "@/lib/auth";

// Old /journal URLs (pre-rename) redirect to /articles.
function LegacyArticleRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/articles/${slug}`} replace />;
}

function App() {
  return (
    <HelmetProvider>
    <AuthProvider>
      <BrowserRouter>
        <Toaster theme="dark" position="bottom-right" richColors
          toastOptions={{ style: { background: "var(--surface)", color: "var(--ink)", border: "1px solid var(--line)" } }} />
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/books" element={<Books />} />
            <Route path="/publications" element={<Publications />} />
            <Route path="/events" element={<Events />} />
            <Route path="/articles" element={<Journal />} />
            <Route path="/articles/:slug" element={<JournalPost />} />
            <Route path="/journal" element={<Navigate to="/articles" replace />} />
            <Route path="/journal/:slug" element={<LegacyArticleRedirect />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/expressions/life-transformation-enquiry" element={<ExpressionLTE />} />
            <Route path="/expressions/academic-research-insight" element={<ExpressionAcademic />} />
            <Route path="/expressions/marriage-101" element={<ExpressionMarriage />} />
            <Route path="/expressions/the-enquiry" element={<TheEnquiry />} />
            {/* Replaces the Systeme funnel that lived on lte.debowoseni.com */}
            <Route path="/programmes" element={<Programmes />} />
          </Route>
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/posts" element={<AdminPosts />} />
          <Route path="/admin/new" element={<AdminEditor />} />
          <Route path="/admin/edit/:id" element={<AdminEditor />} />
          <Route path="/admin/testimonials" element={<AdminTestimonials />} />
          <Route path="/admin/books" element={<AdminBooks />} />
          <Route path="/admin/publications" element={<AdminPublications />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/subscribers" element={<AdminSubscribers />} />
          <Route path="/admin/registrations" element={<AdminRegistrations />} />
          <Route path="/admin/emails" element={<AdminCampaigns />} />
          <Route path="/admin/emails/new" element={<AdminCampaignEditor />} />
          <Route path="/admin/emails/:id" element={<AdminCampaignEditor />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
