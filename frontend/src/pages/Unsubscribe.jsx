import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { Seo } from "@/components/site/Seo";
import { unsubscribeByToken } from "@/lib/api";

/**
 * Unsubscribe landing page.
 *
 * Every broadcast carries a link here plus a List-Unsubscribe header. Gmail and
 * Yahoo now require one-click unsubscribe on bulk mail, and honouring it
 * promptly is the single biggest thing protecting the sending domain's
 * reputation — so this runs on load rather than behind a confirm button.
 */
export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState(token ? "working" : "missing");

  useEffect(() => {
    if (!token) return;
    let active = true;
    unsubscribeByToken(token)
      .then(() => active && setState("done"))
      .catch(() => active && setState("error"));
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="grain relative flex min-h-screen items-center justify-center bg-bg px-6 text-ink">
      <Seo title="Unsubscribe" description="Manage your email preferences." />
      <div className="w-full max-w-md text-center" data-testid="unsubscribe-page">
        {state === "working" && (
          <>
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-lime" />
            <p className="mt-5 text-muted">Updating your preferences…</p>
          </>
        )}

        {state === "done" && (
          <>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-line bg-surface">
              <Check className="h-6 w-6 text-lime" />
            </span>
            <h1 className="mt-7 text-3xl">You've been unsubscribed.</h1>
            <p className="mt-4 text-muted">
              You won't receive any more emails from debowoseni.com. No hard feelings —
              the door stays open if you ever want to come back.
            </p>
          </>
        )}

        {state === "error" && (
          <>
            <h1 className="text-3xl">Something went wrong.</h1>
            <p className="mt-4 text-muted">
              We couldn't update your preferences just now. Email{" "}
              <a href="mailto:hello@debowoseni.com" className="text-lime underline">
                hello@debowoseni.com
              </a>{" "}
              and it will be handled by hand.
            </p>
          </>
        )}

        {state === "missing" && (
          <>
            <h1 className="text-3xl">Nothing to unsubscribe.</h1>
            <p className="mt-4 text-muted">
              This link is missing its token. Use the unsubscribe link at the bottom of
              any email you've received.
            </p>
          </>
        )}

        <Link to="/" className="btn-ghost mt-9">
          Back to the site
        </Link>
      </div>
    </div>
  );
}
