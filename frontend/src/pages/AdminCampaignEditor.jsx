import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Eye, ImagePlus, Loader2, Save, Send, TestTube2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { GroupHeading } from "@/components/admin/GroupHeading";
import {
  adminCampaigns,
  adminGetCampaign,
  adminPreviewCampaign,
  adminSendCampaign,
  adminTestCampaign,
  adminUpload,
} from "@/lib/api";

const SEGMENTS = [
  { value: "all", label: "Everyone on the list" },
  { value: "source:newsletter", label: "Newsletter sign-ups" },
  { value: "tag:quiz", label: "Everyone who took a quiz" },
  { value: "tag:quiz:lte", label: "Quiz — LTE result" },
  { value: "tag:quiz:tier-1", label: "Quiz — 1-to-1 coaching" },
  { value: "tag:quiz:tier-2", label: "Quiz — in-person bootcamp" },
  { value: "tag:quiz:tier-3", label: "Quiz — online bootcamp" },
];

const BLANK = { subject: "", preheader: "", body: "", segment: "all" };

export default function AdminCampaignEditor() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [draft, setDraft] = useState(BLANK);
  const [campaign, setCampaign] = useState(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(null);
  const [testEmail, setTestEmail] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const bodyRef = useRef(null);

  // Upload an image and drop its markdown at the cursor, so it renders in the
  // email body (the mailer turns `![alt](url)` into a centered, responsive image).
  const insertImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingImage(true);
    try {
      const { url } = await adminUpload(file, "email/images");
      const snippet = `\n\n![${file.name.replace(/\.[^.]+$/, "")}](${url})\n\n`;
      const el = bodyRef.current;
      const at = el ? el.selectionStart : draft.body.length;
      const next = draft.body.slice(0, at) + snippet + draft.body.slice(at);
      setDraft((d) => ({ ...d, body: next }));
      toast.success("Image added.", { description: "It shows in the body — hit Preview to see it." });
    } catch (err) {
      toast.error("Image upload failed", { description: err?.message || "" });
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    if (loading || !user || isNew) return;
    adminGetCampaign(id)
      .then((c) => {
        setCampaign(c);
        setDraft({
          subject: c.subject || "",
          preheader: c.preheader || "",
          body: c.body || "",
          segment: c.segment || "all",
        });
      })
      .catch((err) => toast.error("Couldn't load", { description: err?.message || "" }));
  }, [id, isNew, loading, user]);

  useEffect(() => {
    if (!user) return;
    setTestEmail((cur) => cur || user.email || "");
  }, [user]);

  if (!loading && !user) return <Navigate to="/admin/login" replace />;

  const sent = campaign?.status === "sent";

  const save = async () => {
    if (!draft.subject.trim()) {
      toast.error("Give the email a subject line.");
      return null;
    }
    setBusy(true);
    try {
      if (isNew) {
        const created = await adminCampaigns.create(draft);
        toast.success("Saved.");
        navigate(`/admin/emails/${created.id}`, { replace: true });
        return created;
      }
      const updated = await adminCampaigns.update(id, draft);
      setCampaign((c) => ({ ...c, ...updated }));
      toast.success("Saved.");
      return updated;
    } catch (err) {
      toast.error("Couldn't save", {
        description: err?.response?.data?.detail || err?.message || "",
      });
      return null;
    } finally {
      setBusy(false);
    }
  };

  const showPreview = async () => {
    const saved = await save();
    if (!saved) return;
    try {
      const p = await adminPreviewCampaign(saved.id || id);
      setPreview(p);
    } catch (err) {
      toast.error("Couldn't build preview", { description: err?.message || "" });
    }
  };

  const sendTest = async () => {
    const saved = await save();
    if (!saved) return;
    if (!testEmail) {
      toast.error("Enter an address to send the test to.");
      return;
    }
    setBusy(true);
    try {
      const res = await adminTestCampaign(saved.id || id, testEmail);
      toast.success(
        res.dry_run ? "Mail is not configured — nothing was sent." : `Test sent to ${testEmail}.`
      );
    } catch (err) {
      toast.error("Test send failed", {
        description: err?.response?.data?.detail || err?.message || "",
      });
    } finally {
      setBusy(false);
    }
  };

  const send = async () => {
    const saved = await save();
    if (!saved) return;
    const targetId = saved.id || id;

    let count = "the selected segment";
    try {
      const p = await adminPreviewCampaign(targetId);
      count = `${p.recipient_count} subscriber${p.recipient_count === 1 ? "" : "s"}`;
    } catch {
      /* fall through to the generic wording */
    }

    if (!window.confirm(`Send "${draft.subject}" to ${count}? This cannot be undone.`)) return;

    setBusy(true);
    try {
      const res = await adminSendCampaign(targetId);
      toast.success(`Sending to ${res.recipient_count} subscribers.`, {
        description: "Delivery runs in the background — refresh in a moment for the count.",
      });
      navigate("/admin/emails");
    } catch (err) {
      toast.error("Couldn't send", {
        description: err?.response?.data?.detail || err?.message || "",
      });
    } finally {
      setBusy(false);
    }
  };

  const field = (key) => (e) => setDraft({ ...draft, [key]: e.target.value });
  const inputClass =
    "mt-2 w-full rounded-[12px] border border-line bg-bg px-4 py-3 text-ink outline-none focus:border-lime disabled:opacity-60";

  return (
    <div className="grain relative min-h-screen bg-bg text-ink" data-testid="admin-campaign-editor">
      <header className="border-b border-line bg-surface/60 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link
            to="/admin/emails"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-lime"
          >
            <ArrowLeft className="h-4 w-4" /> Emails
          </Link>
          <p className="font-display text-sm tracking-tight">
            {isNew ? "New email" : sent ? "Sent email" : "Edit email"}
          </p>
          <span />
        </div>
      </header>

      <main className="container-page py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            {sent && (
              <div className="mb-8 rounded-[16px] border border-lime/40 bg-surface p-6 text-sm">
                <p className="text-lime">This email has been sent and can no longer be edited.</p>
                <p className="mt-2 text-muted">
                  {campaign.sent_count} sent
                  {campaign.failed_count > 0 && `, ${campaign.failed_count} failed`} of{" "}
                  {campaign.recipient_count} recipients.
                </p>

                {campaign.engagement && (
                  <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-5 md:grid-cols-5">
                    {[
                      ["Delivered", campaign.engagement.delivered],
                      ["Opened", campaign.engagement.opened],
                      ["Clicked", campaign.engagement.clicked],
                      ["Bounced", campaign.engagement.bounced],
                      ["Complaints", campaign.engagement.complained],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted">{label}</p>
                        <p className="mt-1 font-display text-2xl text-ink">{value ?? 0}</p>
                        {label === "Opened" && campaign.sent_count > 0 && (
                          <p className="text-xs text-muted">
                            {Math.round(((value || 0) / campaign.sent_count) * 100)}%
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {campaign.engagement &&
                  campaign.engagement.delivered === 0 &&
                  campaign.sent_count > 0 && (
                    <p className="mt-4 text-xs text-muted">
                      No delivery data yet. Opens and clicks only appear once the Resend
                      webhook is pointed at <code>/api/webhooks/resend</code>.
                    </p>
                  )}
              </div>
            )}

            <div className="rounded-[20px] border border-line bg-surface p-6">
              <GroupHeading first>Compose</GroupHeading>
              <div className="mt-5">
              <label htmlFor="c-subject" className="text-xs uppercase tracking-[0.2em] text-muted">
                Subject line
              </label>
              <input
                id="c-subject"
                value={draft.subject}
                onChange={field("subject")}
                disabled={sent}
                className={inputClass}
                placeholder="The one thing that changes everything"
                data-testid="campaign-subject"
              />
            </div>

            <div className="mt-6">
              <label htmlFor="c-preheader" className="text-xs uppercase tracking-[0.2em] text-muted">
                Preview text
              </label>
              <input
                id="c-preheader"
                value={draft.preheader}
                onChange={field("preheader")}
                disabled={sent}
                className={inputClass}
                placeholder="The grey line inboxes show after the subject."
                data-testid="campaign-preheader"
              />
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="c-body" className="text-xs uppercase tracking-[0.2em] text-muted">
                  Your email
                </label>
                <label
                  className={`press inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-bg px-3 py-1.5 text-xs transition-colors hover:border-lime hover:text-lime ${
                    sent || uploadingImage ? "pointer-events-none opacity-50" : ""
                  }`}
                  data-testid="campaign-add-image"
                >
                  {uploadingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                  {uploadingImage ? "Uploading…" : "Add image"}
                  <input type="file" accept="image/*,.heic,.heif" className="hidden" onChange={insertImage} disabled={sent || uploadingImage} />
                </label>
              </div>
              <textarea
                ref={bodyRef}
                id="c-body"
                rows={20}
                value={draft.body}
                onChange={field("body")}
                disabled={sent}
                className={`mt-2 ${inputClass} resize-y font-mono text-sm leading-relaxed`}
                placeholder={
                  "# A heading\n\nWrite normally. Blank lines separate paragraphs.\n\n" +
                  "**Bold**, *italic*, [a link](https://debowoseni.com)\n\n" +
                  "- a bullet\n- another bullet"
                }
                data-testid="campaign-body"
              />
              <p className="mt-2 text-xs text-muted">
                Formatting: <code># heading</code>, <code>**bold**</code>, <code>*italic*</code>,{" "}
                <code>[link](url)</code>, <code>- bullet</code>, <code>---</code> for a divider, and{" "}
                <code>![caption](url)</code> for an image (use <strong>Add image</strong> above to insert one).
              </p>
            </div>
            </div>
          </div>

          <aside className="space-y-6">
            <GroupHeading first>Delivery</GroupHeading>
            <div className="rounded-[20px] border border-line bg-surface p-6">
              <label htmlFor="c-segment" className="text-xs uppercase tracking-[0.2em] text-muted">
                Send to
              </label>
              <select
                id="c-segment"
                value={draft.segment}
                onChange={field("segment")}
                disabled={sent}
                className={inputClass}
                data-testid="campaign-segment"
              >
                {SEGMENTS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-surface">
                    {s.label}
                  </option>
                ))}
              </select>
              <p className="mt-3 text-xs text-muted">
                Unsubscribed people are always excluded.
              </p>
            </div>

            {!sent && (
              <div className="space-y-3">
                <button
                  onClick={save}
                  disabled={busy}
                  className="btn-ghost w-full justify-center"
                  data-testid="campaign-save"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{" "}
                  Save draft
                </button>
                <button
                  onClick={showPreview}
                  disabled={busy}
                  className="btn-ghost w-full justify-center"
                  data-testid="campaign-preview"
                >
                  <Eye className="h-4 w-4" /> Preview
                </button>

                <div className="rounded-[20px] border border-line bg-surface p-6">
                  <label htmlFor="c-test" className="text-xs uppercase tracking-[0.2em] text-muted">
                    Send a test to
                  </label>
                  <input
                    id="c-test"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className={inputClass}
                    data-testid="campaign-test-email"
                  />
                  <button
                    onClick={sendTest}
                    disabled={busy}
                    className="btn-ghost mt-3 w-full justify-center"
                    data-testid="campaign-test-send"
                  >
                    <TestTube2 className="h-4 w-4" /> Send test
                  </button>
                </div>

                <button
                  onClick={send}
                  disabled={busy}
                  className="btn-lime w-full justify-center"
                  data-testid="campaign-send"
                >
                  <Send className="h-4 w-4" /> Send to the list
                </button>
                <p className="text-center text-xs text-muted">
                  Always send yourself a test first.
                </p>
              </div>
            )}
          </aside>
        </div>

        {preview && (
          <div className="mt-12">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl">Preview</h2>
              <p className="text-sm text-muted">
                {preview.recipient_count} recipient{preview.recipient_count === 1 ? "" : "s"}
              </p>
            </div>
            <iframe
              title="Email preview"
              srcDoc={preview.html}
              sandbox=""
              className="mt-4 h-[720px] w-full rounded-[20px] border border-line bg-white"
              data-testid="campaign-preview-frame"
            />
          </div>
        )}
      </main>
    </div>
  );
}
