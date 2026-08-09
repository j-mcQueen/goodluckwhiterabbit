import { ArtMemoFields, MemoFields, PhotoDesignMemoFields, PortfolioCategory } from "./types";

// Memo content is stored as rendered markup after Submit, not separate
// structured fields (spec confirmed decision). This is the one place that
// markup is generated - both the admin queue and public site render the
// resulting string as-is via MemoDisplay, so WYSIWYG holds by construction
// rather than by keeping two render paths in sync.
//
// Every element carries a data-field attribute so parseMemoHtml.ts can
// round-trip the stored markup back into form fields when the edit dialog
// re-opens - this is markup the admin never sees or edits directly, so it
// doubles as a structured-enough format for that purpose without violating
// "stored as markup, not separate fields" (there's still exactly one `html`
// field in the database).
//
// Class names are written as literal strings so Tailwind's static content
// scanner (tailwind.config.js) picks them up at build time - this file is a
// scanned .ts source, so the classes exist in the compiled CSS even though
// they're injected into the DOM later via dangerouslySetInnerHTML.

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const INQUIRE_BUTTON_CLASSES =
  "font-tnrBI tracking-widest text-white opacity-80 drop-shadow-glo border border-solid border-white xl:hover:text-rd xl:hover:border-rd xl:hover:drop-shadow-red xl:focus:text-rd xl:focus:border-rd xl:focus:drop-shadow-red transition-colors px-4 py-2 mt-4";

const inquireButtonHtml = () =>
  `<button type="button" data-field="inquire" class="${INQUIRE_BUTTON_CLASSES}">INQUIRE</button>`;

const generatePhotoDesignMemoHtml = (fields: PhotoDesignMemoFields): string => {
  const parts: string[] = [];

  if (fields.title.trim()) {
    parts.push(
      `<h3 data-field="title" class="font-tnrBI drop-shadow-glo text-white opacity-80 text-2xl xl:text-3xl text-center">${escapeHtml(fields.title)}</h3>`,
    );
  }
  if (fields.subheading.trim()) {
    parts.push(
      `<h4 data-field="subheading" class="font-vt tracking-vt text-white opacity-80 text-lg text-center mt-2">${escapeHtml(fields.subheading)}</h4>`,
    );
  }
  if (fields.body.trim()) {
    parts.push(
      `<p data-field="body" class="font-tnrBI text-white text-justify max-w-2xl mt-4">${escapeHtml(fields.body)}</p>`,
    );
  }

  return `<div class="memo-content flex flex-col items-center py-8 px-4" data-memo-category="PHOTO_DESIGN">${parts.join("")}</div>`;
};

const generateArtMemoHtml = (fields: ArtMemoFields): string => {
  const parts: string[] = [];

  if (fields.title.trim() || fields.year.trim()) {
    const title = fields.title.trim()
      ? `<span data-field="title">${escapeHtml(fields.title)},</span> `
      : "";
    const year = fields.year.trim() ? `<span data-field="year">${escapeHtml(fields.year)}</span>` : "";
    parts.push(
      `<p class="font-tnrBI text-white text-lg xl:text-xl text-center">${title}${year}</p>`,
    );
  }
  if (fields.body.trim()) {
    parts.push(
      `<p data-field="body" class="font-vt tracking-vt text-white uppercase text-sm text-center mt-3">${escapeHtml(fields.body)}</p>`,
    );
  }
  if (fields.inquire) {
    parts.push(inquireButtonHtml());
  }
  if (fields.sold) {
    parts.push(`<p data-field="sold" class="font-tnrBI text-rd text-center mt-3">* COLLECTED *</p>`);
  }

  return `<div class="memo-content flex flex-col items-center pt-2 pb-10 px-4" data-memo-category="ART">${parts.join("")}</div>`;
};

export const generateMemoHtml = (category: PortfolioCategory, fields: MemoFields): string =>
  category === "ART"
    ? generateArtMemoHtml(fields as ArtMemoFields)
    : generatePhotoDesignMemoHtml(fields as PhotoDesignMemoFields);
