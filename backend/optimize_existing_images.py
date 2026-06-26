"""One-time optimiser for images already stored in the `blog-images` bucket.

Downloads every object, re-encodes raster images to WebP (capped at 1600px),
and overwrites the file IN PLACE. The path never changes, so every existing
cover_url / gallery URL in the database keeps working — browsers honour the
served `image/webp` content type regardless of the file extension.

Usage:
    cd backend
    pip install -r requirements.txt
    export SUPABASE_URL="https://<project>.supabase.co"
    export SUPABASE_SERVICE_KEY="<service-role-key>"   # keep secret, never commit

    python optimize_existing_images.py --dry-run   # preview, changes nothing
    python optimize_existing_images.py             # apply

Notes:
- The service-role key is required to overwrite storage objects. Set it only as
  a local environment variable; do not paste it into any file.
- Animated GIFs/WebP and non-images (e.g. SVG) are skipped untouched.
- Re-running is safe: already-optimised files won't shrink further and are left.
"""

from __future__ import annotations

import io
import os
import sys

from PIL import Image, ImageOps
from supabase import create_client

BUCKET = "blog-images"
MAX_IMAGE_DIM = 1600
WEBP_QUALITY = 80
# Only overwrite if the new file is at least this much smaller (avoids churn on
# files that are already well-optimised).
MIN_SAVING_RATIO = 0.05


def optimize(contents: bytes):
    """Return optimised WebP bytes, or None if the file should be left as-is."""
    try:
        img = Image.open(io.BytesIO(contents))
        if getattr(img, "is_animated", False):
            return None
        img = ImageOps.exif_transpose(img)
        img.thumbnail((MAX_IMAGE_DIM, MAX_IMAGE_DIM), Image.Resampling.LANCZOS)
        img = img.convert("RGBA" if img.mode in ("RGBA", "LA", "P") else "RGB")
        out = io.BytesIO()
        img.save(out, format="WEBP", quality=WEBP_QUALITY, method=6)
        return out.getvalue()
    except Exception:
        return None  # not a raster image Pillow can handle


def list_all(sb, prefix: str = ""):
    """Recursively list every file path in the bucket."""
    paths = []
    offset = 0
    while True:
        items = sb.storage.from_(BUCKET).list(
            prefix, {"limit": 100, "offset": offset, "sortBy": {"column": "name", "order": "asc"}}
        )
        if not items:
            break
        for it in items:
            name = it.get("name")
            if not name:
                continue
            full = f"{prefix}/{name}" if prefix else name
            # Folders come back with id == None and no metadata.
            if it.get("id") is None and it.get("metadata") is None:
                paths.extend(list_all(sb, full))
            else:
                paths.append(full)
        if len(items) < 100:
            break
        offset += 100
    return paths


def human(n: int) -> str:
    for unit in ("B", "KB", "MB"):
        if n < 1024:
            return f"{n:.0f}{unit}"
        n /= 1024
    return f"{n:.1f}GB"


def main():
    dry_run = "--dry-run" in sys.argv

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        sys.exit("Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables first.")

    sb = create_client(url, key)

    print(f"Scanning bucket '{BUCKET}'{' (DRY RUN)' if dry_run else ''}...\n")
    paths = list_all(sb)
    print(f"Found {len(paths)} files.\n")

    total_before = total_after = 0
    changed = skipped = failed = 0

    for path in paths:
        try:
            original = sb.storage.from_(BUCKET).download(path)
        except Exception as exc:
            print(f"  ! download failed: {path} ({exc})")
            failed += 1
            continue

        new_bytes = optimize(original)
        if new_bytes is None:
            skipped += 1
            continue

        before, after = len(original), len(new_bytes)
        if after >= before * (1 - MIN_SAVING_RATIO):
            skipped += 1  # already small / no meaningful gain
            continue

        total_before += before
        total_after += after
        changed += 1
        pct = (1 - after / before) * 100
        print(f"  {path}\n    {human(before)} -> {human(after)}  (-{pct:.0f}%)")

        if not dry_run:
            try:
                sb.storage.from_(BUCKET).upload(
                    path=path,
                    file=new_bytes,
                    file_options={"content-type": "image/webp", "upsert": "true"},
                )
            except Exception as exc:
                print(f"    ! upload failed ({exc})")
                failed += 1

    print("\n" + "=" * 48)
    print(f"Optimised: {changed}   Skipped: {skipped}   Failed: {failed}")
    if changed:
        saved = total_before - total_after
        print(f"Total: {human(total_before)} -> {human(total_after)}  (saved {human(saved)})")
    if dry_run:
        print("\nDry run only — nothing was changed. Re-run without --dry-run to apply.")


if __name__ == "__main__":
    main()
