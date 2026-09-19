"""
Shrinks the Knowledge Hub PDFs by downsampling the scanned page images.

    python scripts/compress_pdfs.py <dir> [--dry] [--max-px 1700] [--quality 75]
                                         [--min-mb 5] [--workers 4]

These files are almost entirely scans held at print resolution — a 249MB
maths manual is a few hundred 300dpi page images. Re-encoding those at
screen resolution is where the savings are; the PDF structure itself is
noise by comparison.

Rules it follows:
  - only files at or above --min-mb are touched
  - an image is only replaced when the new version is genuinely smaller
  - a file is only replaced when the whole PDF came out smaller
  - the original is left in place if anything goes wrong

Ghostscript would be the usual tool, but its Windows installer demands
elevation; pikepdf ships qpdf as a wheel and needs no system install.
"""
from __future__ import annotations

import argparse
import io
import shutil
import sys
import traceback
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

import pikepdf
from PIL import Image

Image.MAX_IMAGE_PIXELS = None  # these are big scans, not decompression bombs


def shrink_image(pdf: pikepdf.Pdf, obj, max_px: int, quality: int) -> int:
    """Re-encodes one image XObject. Returns bytes saved (0 if left alone)."""
    try:
        pim = pikepdf.PdfImage(obj)
        before = len(obj.read_raw_bytes())
    except Exception:
        return 0

    # tiny images (logos, rules) aren't worth touching
    if before < 24_000:
        return 0

    try:
        img = pim.as_pil_image()
    except Exception:
        return 0

    if img.mode in ("1", "P"):
        img = img.convert("L" if img.mode == "1" else "RGB")
    if img.mode not in ("L", "RGB", "CMYK"):
        img = img.convert("RGB")

    w, h = img.size
    scale = min(1.0, max_px / max(w, h))
    if scale < 1.0:
        img = img.resize((max(int(w * scale), 1), max(int(h * scale), 1)), Image.LANCZOS)

    buf = io.BytesIO()
    if img.mode == "CMYK":
        img.save(buf, format="JPEG", quality=quality, optimize=True)
        cs = pikepdf.Name.DeviceCMYK
    elif img.mode == "L":
        img.save(buf, format="JPEG", quality=quality, optimize=True)
        cs = pikepdf.Name.DeviceGray
    else:
        img.save(buf, format="JPEG", quality=quality, optimize=True, progressive=False)
        cs = pikepdf.Name.DeviceRGB

    data = buf.getvalue()
    if len(data) >= before:          # re-encoding made it worse
        return 0

    obj.write(data, filter=pikepdf.Name.DCTDecode)
    obj.ColorSpace = cs
    obj.BitsPerComponent = 8
    obj.Width, obj.Height = img.size
    for key in ("/SMask", "/Decode", "/DecodeParms", "/Interpolate"):
        if key in obj:
            del obj[key]
    return before - len(data)


def compress(path: Path, max_px: int, quality: int, dry: bool) -> dict:
    before = path.stat().st_size
    result = {"path": str(path), "before": before, "after": before, "changed": False, "error": None}

    try:
        with pikepdf.open(path) as pdf:
            seen = set()
            for page in pdf.pages:
                for obj in (page.get("/Resources", {}).get("/XObject", {}) or {}).values():
                    if obj.get("/Subtype") != "/Image":
                        continue
                    key = obj.objgen
                    if key in seen:      # the same scan reused across pages
                        continue
                    seen.add(key)
                    shrink_image(pdf, obj, max_px, quality)

            if dry:
                return result

            tmp = path.with_suffix(".compressed.tmp")
            pdf.save(
                tmp,
                compress_streams=True,
                object_stream_mode=pikepdf.ObjectStreamMode.generate,
                linearize=False,
            )

        after = tmp.stat().st_size
        # only keep the rewrite when it actually helped
        if after < before * 0.95:
            shutil.move(str(tmp), str(path))
            result["after"] = after
            result["changed"] = True
        else:
            tmp.unlink(missing_ok=True)
    except Exception as exc:
        result["error"] = f"{type(exc).__name__}: {exc}"
        for leftover in path.parent.glob(path.stem + ".compressed.tmp"):
            leftover.unlink(missing_ok=True)

    return result


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("directory")
    ap.add_argument("--dry", action="store_true")
    ap.add_argument("--max-px", type=int, default=1700, help="longest edge in pixels (~150dpi A4)")
    ap.add_argument("--quality", type=int, default=75)
    ap.add_argument("--min-mb", type=float, default=5.0)
    ap.add_argument("--workers", type=int, default=4)
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()

    root = Path(args.directory)
    files = sorted(
        (p for p in root.rglob("*.pdf") if p.stat().st_size >= args.min_mb * 1024 * 1024),
        key=lambda p: p.stat().st_size,
        reverse=True,
    )
    if args.limit:
        files = files[: args.limit]

    total_before = sum(p.stat().st_size for p in files)
    print(f"{len(files)} file(s) at or above {args.min_mb}MB, {total_before/1024/1024/1024:.2f}GB")
    print(f"max edge {args.max_px}px, JPEG quality {args.quality}{' [dry run]' if args.dry else ''}\n")

    saved = 0
    changed = 0
    errors = []

    with ProcessPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(compress, p, args.max_px, args.quality, args.dry): p for p in files}
        for i, fut in enumerate(as_completed(futures), 1):
            r = fut.result()
            name = Path(r["path"]).name[:52]
            if r["error"]:
                errors.append((name, r["error"]))
                print(f"  !! {name}: {r['error'][:70]}")
                continue
            if r["changed"]:
                changed += 1
                saved += r["before"] - r["after"]
                print(f"  {i:>3}/{len(files)} {r['before']/1024/1024:>7.1f}MB -> "
                      f"{r['after']/1024/1024:>6.1f}MB  {name}")
            else:
                print(f"  {i:>3}/{len(files)} {r['before']/1024/1024:>7.1f}MB    (kept)  {name}")

    print(f"\nrewrote {changed} of {len(files)} file(s)")
    print(f"saved {saved/1024/1024/1024:.2f}GB "
          f"({saved/total_before*100:.0f}% of the material considered)")
    if errors:
        print(f"{len(errors)} error(s)")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        traceback.print_exc()
        sys.exit(1)
