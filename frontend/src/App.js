import "@/App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminPosts from "@/pages/AdminPosts";
import AdminEditor from "@/pages/AdminEditor";
import AdminTestimonials from "@/pages/AdminTestimonials";
import AdminBooks from "@/pages/AdminBooks";
import AdminPublications from "@/pages/AdminPublications";
import AdminEvents from "@/pages/AdminEvents";
import { AuthProvider } from "@/lib/auth";

function App() {
  return (
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
            <Route path="/journal" element={<Journal />} />
            <Route path="/journal/:slug" element={<JournalPost />} />
            <Route path="/contact" element={<Contact />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/posts" element={<AdminPosts />} />
          <Route path="/admin/new" element={<AdminEditor />} />
          <Route path="/admin/edit/:id" element={<AdminEditor />} />
          <Route path="/admin/testimonials" element={<AdminTestimonials />} />
          <Route path="/admin/books" element={<AdminBooks />} />
          <Route path="/admin/publications" element={<AdminPublications />} />
          <Route path="/admin/events" element={<AdminEvents />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
