import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import LinkExt from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  ArrowLeft,
  Bold,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Save,
  Send,
  Undo2,
  Redo2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  adminCreatePost,
  adminGetPost,
  adminUpdatePost,
  adminUpload,
} from "@/lib/api";

function slugify(s) {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export default function AdminEditor() {
  const { user, loading } = useAuth();
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const coverInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "Transformation",
    excerpt: "",
    cover_url: "",
    status: "draft",
  });
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(isNew);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      LinkExt.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({ HTMLAttributes: { class: "rounded-[16px] my-4" } }),
      Placeholder.configure({ placeholder: "Write the post…" }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "article-body min-h-[420px] focus:outline-none px-4 py-6 prose-invert",
      },
    },
  });

  useEffect(() => {
    if (loading || !user || isNew) return;
    adminGetPost(id)
      .then((p) => {
        setForm({
          title: p.title || "",
          slug: p.slug || "",
          category: p.category || "Transformation",
          excerpt: p.excerpt || "",
          cover_url: p.cover_url || "",
          status: p.status || "draft",
        });
        editor?.commands.setContent(p.body || "");
      })
      .catch((err) => {
        toast.error("Couldn't load post", { description: err?.message || "" });
      })
      .finally(() => setLoaded(true));
  }, [loading, user, id, isNew, editor]);

  const setField = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setTitle = (e) => {
    const title = e.target.value;
    setForm((f) => ({
      ...f,
      title,
      slug: f.slug && !isNew ? f.slug : slugify(title),
    }));
  };

  const onUploadCover = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await adminUpload(file, "covers");
      setForm((f) => ({ ...f, cover_url: url }));
      toast.success("Cover uploaded.");
    } catch (err) {
      toast.error("Upload failed", {
        description: err?.message || "Check the blog-images bucket.",
      });
    } finally {
      e.target.value = "";
    }
  };

  const insertInlineImage = useCallback(async (file) => {
    try {
      const { url } = await adminUpload(file, "inline");
      editor?.chain().focus().setImage({ src: url, alt: file.name }).run();
    } catch (err) {
      toast.error("Image upload failed", { description: err?.message || "" });
    }
  }, [editor]);

  const onPickInlineImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const f = e.target.files?.[0];
      if (f) insertInlineImage(f);
    };
    input.click();
  };

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href || "";
    const url = window.prompt("Link URL", prev);
    if (url === null) return;
    if (url === "") return editor.chain().focus().unsetLink().run();
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const save = async (publish = false) => {
    if (!form.title.trim()) {
      toast.error("Title required");
      return;
    }
    setBusy(true);
    const body = editor?.getHTML() || "";
    const payload = {
      ...form,
      slug: form.slug || slugify(form.title),
      body,
      status: publish ? "published" : form.status,
    };
    try {
      let res;
      if (isNew) {
        res = await adminCreatePost(payload);
        toast.success(publish ? "Published." : "Draft saved.");
        navigate(`/admin/edit/${res.id}`, { replace: true });
      } else {
        res = await adminUpdatePost(id, payload);
        toast.success(publish ? "Published." : "Saved.");
        setForm((f) => ({ ...f, status: res.status || f.status }));
      }
    } catch (err) {
      toast.error("Couldn't save", { description: err?.message || "" });
    } finally {
      setBusy(false);
    }
  };

  if (!loading && !user) return <Navigate to="/admin/login" replace />;

  return (
    <div className="grain relative min-h-screen bg-bg text-ink" data-testid="admin-editor">
      <header className="border-b border-line bg-surface/60 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-lime"
            data-testid="editor-back"
          >
            <ArrowLeft className="h-4 w-4" /> Posts
          </Link>
          <p className="font-display text-sm tracking-tight">
            {isNew ? "New post" : "Edit post"}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => save(false)}
              disabled={busy}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-4 py-2 text-xs hover:border-lime hover:text-lime"
              data-testid="save-draft"
            >
              <Save className="h-3.5 w-3.5" /> Save draft
            </button>
            <button
              onClick={() => save(true)}
              disabled={busy}
              className="inline-flex items-center gap-1 rounded-full bg-lime px-4 py-2 text-xs font-semibold text-bg disabled:opacity-60"
              data-testid="publish-post"
            >
              <Send className="h-3.5 w-3.5" /> Publish
            </button>
          </div>
        </div>
      </header>

      <main className="container-page grid grid-cols-1 gap-8 py-10 lg:grid-cols-12">
        {/* Editor */}
        <section className="lg:col-span-8">
          <input
            value={form.title}
            onChange={setTitle}
            placeholder="Post title"
            className="w-full border-b border-line bg-transparent pb-3 font-display text-3xl tracking-tight outline-none placeholder:text-muted md:text-5xl"
            data-testid="editor-title"
          />

          <textarea
            value={form.excerpt}
            onChange={setField("excerpt")}
            placeholder="Short excerpt (shown on cards)"
            className="mt-5 w-full resize-y bg-transparent text-lg text-ink/85 outline-none placeholder:text-muted"
            rows={2}
            data-testid="editor-excerpt"
          />

          <div className="mt-6 rounded-[20px] border border-line bg-surface">
            <Toolbar
              editor={editor}
              onInsertImage={onPickInlineImage}
              onSetLink={setLink}
            />
            <EditorContent editor={editor} data-testid="editor-content" />
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-5 lg:col-span-4">
          <Card>
            <Label>Slug</Label>
            <input
              value={form.slug}
              onChange={(e) =>
                setForm({ ...form, slug: slugify(e.target.value) })
              }
              className="mt-2 w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime"
              data-testid="editor-slug"
            />
          </Card>

          <Card>
            <Label>Category</Label>
            <input
              value={form.category}
              onChange={setField("category")}
              className="mt-2 w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime"
              data-testid="editor-category"
            />
          </Card>

          <Card>
            <Label>Cover image</Label>
            {form.cover_url ? (
              <div className="mt-3 overflow-hidden rounded-[16px] border border-line">
                <img src={form.cover_url} alt="" className="aspect-[16/9] w-full object-cover" />
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted">No cover yet.</p>
            )}
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-line bg-bg px-4 py-2 text-xs hover:border-lime hover:text-lime"
              data-testid="upload-cover"
            >
              <ImageIcon className="h-3.5 w-3.5" /> Upload cover
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={onUploadCover}
              className="hidden"
            />
            {form.cover_url && (
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, cover_url: "" }))}
                className="ml-2 text-xs text-muted hover:text-destructive"
              >
                Remove
              </button>
            )}
          </Card>

          <Card>
            <Label>Status</Label>
            <p className="mt-2 text-sm">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                  form.status === "published"
                    ? "bg-lime text-bg"
                    : "border border-line text-muted"
                }`}
              >
                {form.status}
              </span>
            </p>
          </Card>
        </aside>
      </main>
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="rounded-[18px] border border-line bg-surface p-5">{children}</div>
  );
}
function Label({ children }) {
  return (
    <p className="text-xs uppercase tracking-[0.2em] text-muted">{children}</p>
  );
}

function ToolbarBtn({ on, active, label, children, testId }) {
  return (
    <button
      type="button"
      onClick={on}
      aria-label={label}
      className={`flex h-9 w-9 items-center justify-center rounded-md transition ${
        active ? "bg-lime text-bg" : "text-ink hover:bg-surface-2"
      }`}
      data-testid={testId}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, onInsertImage, onSetLink }) {
  if (!editor) return null;
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-line p-2">
      <ToolbarBtn
        on={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        label="Bold"
        testId="tb-bold"
      >
        <Bold className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn
        on={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        label="Italic"
        testId="tb-italic"
      >
        <Italic className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn
        on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        label="Heading 2"
        testId="tb-h2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn
        on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        label="Heading 3"
        testId="tb-h3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn
        on={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        label="Quote"
        testId="tb-quote"
      >
        <Quote className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn
        on={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        label="Bullet list"
        testId="tb-ul"
      >
        <List className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn
        on={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        label="Numbered list"
        testId="tb-ol"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn on={onSetLink} active={editor.isActive("link")} label="Link" testId="tb-link">
        <LinkIcon className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn on={onInsertImage} label="Insert image" testId="tb-img">
        <ImageIcon className="h-4 w-4" />
      </ToolbarBtn>
      <span className="mx-2 h-5 w-px bg-line" />
      <ToolbarBtn on={() => editor.chain().focus().undo().run()} label="Undo" testId="tb-undo">
        <Undo2 className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn on={() => editor.chain().focus().redo().run()} label="Redo" testId="tb-redo">
        <Redo2 className="h-4 w-4" />
      </ToolbarBtn>
    </div>
  );
}
