# Text Box Memo — Feature Spec (v2, codebase-informed)

## 0. Scope of work — implementation summary

Reviewable checklist before implementation starts. Full rationale for
every item here is in the numbered sections below; this is the "what
gets built, in what order" view.

### Backend

1. **Schema**: add `layout: [{type,position}|{type,memoId}]` to
   `GroupSchema` (`backend/models/portfolioSubcategory.js`); new small
   collection for memo content (`memoId, category, html, createdAt`).
2. **Migration script** (one-time, run before/with deploy): backfill
   `layout` for all 18 existing groups from a live S3 listing per group
   (same listing/regex/sort logic already in production) — not from the
   cached `count` field, which is known to have drifted. Exhaustively
   diffable by eye at this scale before committing. Corrects `count`
   drift as a side effect.
3. **Memo CRUD endpoints**: create (render fields → markup, assign
   `memoId`, insert into `layout`), edit (update `html` only, `layout`
   untouched), delete (remove the one `layout` entry).
4. **Sync `layout` in the three existing image controllers**
   (`adminUploadPortfolioImage`, `adminDeletePortfolioImage`,
   `adminSwapPortfolioImages`) — unconditional, alongside their existing
   S3 work, same call shape as their existing `count` update.
5. **Self-heal hook**: extend the existing client-driven `count`
   self-heal path (`handlePortfolioLoad.ts` → `adminUpdatePortfolioGroupCount`)
   to also diff/repair `layout` against a live S3 listing on every admin
   queue load for a group.
6. **Read-path branch**: `adminGetPortfolioGroupImages` (admin) and
   `generatePortfolioUrls` (public) branch on whether a group's `layout`
   contains a memo — no memo, keep today's live-S3-listing logic
   untouched; memo present, serve from `layout`.

### Frontend

7. **Packing simulation utility** (client-side, shared by admin queue and
   public site): for a memo-bounded run, compute explicit `grid-row`/
   `grid-column` per image (reproducing today's column-span-aware dense
   packing) and detect a short trailing row. This is the one real
   algorithmic piece; everything else below wires existing patterns.
8. **Memo rendering component** (shared, category-parameterized):
   Title (`font-tnrBI drop-shadow-glo opacity-80`), Sub-heading/Art
   details block (`font-vt tracking-vt`), Body (`font-tnrBI` justified),
   Inquire button, SOLD → `* COLLECTED *` (`text-rd`) for Art.
9. **Widow-pairing wrapper**: when the simulation flags a short trailing
   row, render that row's image(s) together with the following memo in
   one shared centered block instead of as normal grid cells.
10. **Public site wiring** (`Body.tsx`/`Unit.tsx`): branch per §2.1 — zero
    memo entries in `layout`, render exactly as today, untouched; one or
    more memos, use the segmented-grid + simulation + widow-pairing path.
11. **Admin queue wiring** (`PortfolioImageOrder.tsx`/`PortfolioOrderItem.tsx`):
    same segmented rendering as public, for real WYSIWYG.
12. **Admin creation/edit UI**: feather-pen button (`memo-icon.svg`) next
    to "Add Files"; MEMO dialog (Title/Subheading/Body/Inquire toggle/
    Submit, category-specific fields per §7/§8, mobile-stacked); delete
    (X, upper-left) and edit (feather pen, upper-right) on existing memo
    tiles.
13. **DnD extension** (`handleDragStart.ts`/`PortfolioOrderItem.tsx`):
    memo tiles tagged `source: "order"` like image tiles, as new branches
    alongside existing image-swap logic, not modifications to it. Memo
    moves are pure `layout` splices (no S3 call); image moves keep using
    `adminSwapPortfolioImages` unchanged.

### Explicitly deferred / non-goals
- Rasterization (Puppeteer/html2canvas) — never, at any point.
- Empty-memo placeholder graphic — out of scope (existing portfolio
  content, not something to design).
- Exact spacing values — ship with reasonable defaults, tune against the
  live site.

### Suggested build order
1. Schema + migration script (verify against all 18 groups before moving on)
2. Memo CRUD + layout-sync in the 3 image controllers + self-heal hook
3. Packing simulation utility, tested standalone against known image sets
4. Memo rendering component + widow-pairing wrapper
5. Public site wiring (lowest-traffic path to validate branch correctness)
6. Admin queue wiring + creation/edit dialog + DnD extension

## 1. Goal

An admin-created text component ("memo") that lives in the same ordered
queue as images within a portfolio category/subcategory/group. It renders
with its **full real styling** — actual fonts, actual glow, actual
justified body text — at full row width, identically in the admin
placement queue and on the public site. No truncation, no
simplified/placeholder styling, no rasterization, anywhere in the pipeline.

Non-goals, explicitly ruled out during scoping:
- No rasterization / screenshot pipeline (Puppeteer, html2canvas, or
  similar) at any point — this stays live HTML/CSS end to end.
- No new drag-and-drop library.
- No renumbering/shifting of image S3 positions as a side effect of memo
  operations.
- No simplified/plain fallback rendering for a memo in the admin queue —
  it must be pixel-real WYSIWYG against the public site.

## 2. Architecture (resolved against the existing codebase)

### 2.1 Rendering: segmented grid blocks, not a spanning grid cell

The public grid (`client/src/components/portfolio/Body.tsx`) is CSS Grid,
not a JS masonry library:

```
grid grid-cols-1 gap-2 px-2 xl:grid-flow-dense xl:auto-rows-[39vw] xl:[grid-template-columns:repeat(3,minmax(320px,1fr))]
```

`grid-flow-dense` plus a fixed `auto-rows-[39vw]` fakes masonry — every
cell is the same viewport-relative height, and `Unit.tsx` spans landscape
images (aspect ratio ≥ 1.3) across 2 columns via `xl:col-span-2`. Cropping
is done with `object-cover` on the `<img>`, not variable row height.

A memo's height is content-driven, which this fixed-row grid has no
mechanism for — spanning it with a guessed `grid-row: span N` fights dense
packing (later images can visually backfill space the memo actually needs).
So: **memos are not injected into the grid as a cell.** When a group's
`layout` contains at least one memo, the sequence is split into runs of
consecutive images, bounded by memos and by the group's start/end; each
run renders in its own grid block using the exact classes above; memos
render as plain full-width block elements between grid blocks. This gives
the "line break before/after" behavior for free.

**Zero-memo groups render on the untouched, existing code path — this is
a hard branch, not a best-effort equivalence.** If a group's `layout` has
no memo entries, none of the logic below (run-splitting, simulated
placement, widow pairing) executes at all: it's the same `Body.tsx` /
`Unit.tsx` component, the same single continuous grid, the same native
`grid-auto-flow: dense` auto-placement the browser already does today.
This is deliberate — it means "no memo present → no behavior change" is
guaranteed by not running the new code, not by having to prove a new
implementation is equivalent to the old one for the general case. This
also isn't one-way: if a memo is added to a group and later deleted, that
group's `layout` has zero memo entries again and it falls straight back
onto this same untouched path on the next render.

**Placement within a memo-bounded run is computed, not left to
`grid-auto-flow: dense` auto-placement — but only for groups that actually
have a memo.** Relying on the browser's automatic dense packing across a
boundary is unsafe: dense mode rescans the whole grid from the top on
every item's turn regardless of DOM position, so a later image (after a
memo) could legally auto-place itself into a gap left *before* that memo,
rendering content above the divider that's supposed to introduce it. To
guarantee a memo boundary is never crossed, each run's own packing (which
row/column and span each image gets) is simulated up front — reproducing
the same column-span-aware dense-packing result the browser produces
today, just computed explicitly — and every image in that run gets an
explicit `grid-row`/`grid-column` assignment instead of relying on
auto-placement. This simulation is also what powers widow detection
below; it isn't extra work layered on top, it's the same computation. It
only ever runs on runs adjacent to a real memo, so there's no risk of it
subtly diverging from native browser dense-packing anywhere it isn't
already required to deviate by definition (i.e. at a boundary).

**Memo position types and their widow implications:**
- **Group/subgroup intro** — a memo as the very first item in a group or
  subgroup, nothing preceding it. Zero widow risk: nothing precedes it to
  leave a gap, and everything after packs freely from a fresh start,
  identical to how the group behaves today.
- **Subsection divider** — a memo with images on both sides, splitting a
  large group into visually distinct parts. This is where widow risk
  exists (see below).
- **Art descriptor** — not applicable at all. Art is single-frame-per-
  scroll (§6), not masonry — there's no packing/widow concept there.

**Widow rows, precisely defined, and the pairing rule:** a widow row is
any trailing row of a bounded run that doesn't fill all 3 columns —
1 image or 2 images with a gap, not narrowly "exactly one image." A widow
row can, by definition, only ever occur immediately before a hard
boundary — nothing exists after it, within that run, to pull forward and
close the gap; that absence is *why* it's a widow. Since every interior
boundary in this feature is a memo, every interior widow row is
automatically followed by a memo — this is one uniform rule recurring at
each divider, not separate cases for "before" vs. "after" a memo. When
the simulation detects a run's trailing row is short, that row's image(s)
are pulled out of normal per-image grid placement and rendered together
with the following memo inside one shared centered wrapper (e.g.
`flex flex-col items-center`), so both share the same horizontal center
by construction rather than by coincidence of grid math. The one
exception is the group's absolute final widow row, if any — with no
following memo to pair with, it stays a plain short row exactly as it
behaves today.

Content immediately after any memo starts fresh and packs gaplessly
until it hits the next boundary, at which point the same widow rule
applies again if that run ends short.

The admin placement queue (`PortfolioImageOrder.tsx` /
`PortfolioOrderItem.tsx`) must render the same segmented, explicitly-
placed structure so the WYSIWYG guarantee is real, not approximate.

Mobile is already single-column (`grid-cols-1` with no `xl:` overrides) —
a memo block between runs is just another full-width block in a column of
full-width blocks, and a "row" is always exactly 1 item wide, so the
widow concept doesn't arise on mobile at all. No separate mobile masonry
logic is needed.

### 2.2 Drag-and-drop: extend the existing native HTML5 DnD

Current admin reordering (`PortfolioOrderItem.tsx`,
`utils/handlers/handleDragStart.ts`) uses native `dragstart` /
`dragover` / `drop` events with index/source data stashed on
`dataTransfer` (`text/index`, `text/source`) — no dnd-kit or
react-beautiful-dnd. Memo tiles participate the same way, tagged
`source: "order"` like image tiles.

**Reordering branches on whether the group has a memo — this determines
which backend endpoint a drag calls, not just what it visually does:**

- **Zero-memo group**: unchanged from today. Display order *is* S3
  position order, so reordering still means renaming S3 content between
  two positions (`adminSwapPortfolioImages`). `layout` isn't consulted for
  rendering here (§2.1), so it doesn't need to track this operation either
  — a content swap doesn't add or remove positions, only trades what's at
  two existing ones, so the set of position-entries `layout` cares about
  is unaffected by it.
- **Memo-managed group**: display order *is* `layout`'s array sequence,
  not position values (`[img@pos5, memo, img@pos2]` renders in that literal
  order). Once that's true, reordering — image-image, image-memo, or
  memo-memo alike — is a pure `layout` array-index swap
  (`adminSwapPortfolioLayout`, §2.4), never an S3 call. `adminSwapPortfolioImages`
  is not invoked by drag-reordering in a memo-managed group at all; it's
  solving a problem (content is the only order signal) that no longer
  exists once `layout` exists.

The drag gesture itself doesn't change (still a from-index/to-index swap,
matching the existing `dataTransfer` mechanics) — only which endpoint the
drop handler calls depends on whether the group currently has a memo.

### 2.3 Storage: portfolio images, corrected

Portfolio images (`AWS_SECONDARY_BUCKET`, `backend/controllers/portfolioAdmin.js`)
are **not** one-folder-per-index like the client photo-delivery bucket.
A whole group shares one folder, and position lives in the *filename
suffix*:

```
{category}/{sub}/{groupId}/{size}/{filenameBase}_{position}.webp
```

- `adminUploadPortfolioImage` writes `sm`/`lg` variants with that
  `_{position}` suffix.
- `adminDeletePortfolioImage` deletes whatever matches `_{position}` —
  it does **not** shift later positions down. A gap is left until
  something is uploaded into that position again.
- `adminSwapPortfolioImages` renames the `_{position}` suffix between two
  positions pairwise (with temp-key staging if the destination is
  occupied) — adapted from the client-bucket version but suffix-based
  instead of folder-based. There is no bulk "compact/reflow" operation
  anywhere in the codebase today, for either bucket.

This confirms the same conclusion as the client-bucket flow: **closing a
gap by renumbering every subsequent image is not something the storage
layer does anywhere right now**, and building it would mean cascading
`adminSwapPortfolioImages`-style renames across every image after the
gap. Memo delete must not depend on that existing.

### 2.4 Data model

Memos are **not** interleaved into the S3 position space. A group gets an
ordering sequence decoupled from image position:

```js
// addition to GroupSchema in backend/models/portfolioSubcategory.js
layout: [
  { type: "image", position: Number },   // matches the _{position} suffix
  { type: "memo", memoId: String },
]
```

Memo content (rendered markup, per the confirmed decision below) lives in
its own small collection keyed by `memoId`:

```js
{ memoId, category, html, createdAt }
```

**Migration (one-time, upfront):** both `adminGetPortfolioGroupImages` and
`generatePortfolioUrls` currently derive order *live* from an S3 listing
(list objects, regex the `_{position}` suffix, sort numerically) — there
is no ordering document in Mongo at all today, for any group. At current
scale (2 subcategories, 18 groups, 100+ images verified directly against
S3 — the cached `count` field undercounts and should not be trusted as a
source) a one-time backfill script is cheap to write and cheap to verify
exhaustively (print every derived `layout` against the live S3 order for
all 18 groups and diff by eye before committing, not a sample). The
script re-derives each group's order using the exact listing/regex/sort
logic already in production, writes it as that group's `layout`, and — as
a free side effect — corrects any drift in the cached `count` field
against the same listing.

After migration, **every group has a `layout`, unconditionally** — new
groups get `layout: []` at creation (schema default) and it's populated
as images are added, so there's never a state where a group exists
without one. `adminUploadPortfolioImage`, `adminDeletePortfolioImage`, and
`adminSwapPortfolioImages` unconditionally keep it in sync (push/remove/
swap the matching `type: "image"` entry) alongside their existing S3
work, regardless of whether that group currently has a memo — not a
conditional addition, just part of what those controllers do now. This
mirrors a risk shape already present and accepted in this codebase: these
same controllers already do a second Mongo write today
(`updatePortfolioGroupCount`), and the schema comment already
acknowledges `count` can drift and is "self-healed against S3." `layout`
gets the same treatment, via the same trigger: `count`'s self-heal today
is client-driven, not a background job — `handlePortfolioLoad.ts` compares
the admin queue's rendered count against stored `count` on every group
load, and if they differ, re-derives the true count from S3 and overwrites
Mongo (`adminUpdatePortfolioGroupCount`), automatically, no manual step.
`layout` verification hooks into that exact same opportunistic check: on
every admin queue load for a group, diff `layout` against a live S3
listing, and repair it the same way if they've drifted. That makes
`layout` drift self-correcting on the next time anyone opens that group
in the admin — not something that stays silently wrong until someone
happens to notice and manually re-runs the migration script.

Having `layout` populated everywhere is a write-side guarantee only,
though — it does **not** mean the render path reads `layout`
unconditionally. Per §2.1, rendering still branches on whether a group's
`layout` actually contains a memo: zero-memo groups keep using the
existing live-S3-listing render path untouched, even though `layout` is
sitting there in sync in the background, ready for the moment a memo is
added.

- **Create**: render form fields to markup, assign a `memoId`, insert a
  `{ type: "memo", memoId }` entry into `layout` at the drop point.
- **Edit**: update the `html` for an existing `memoId` in place. `layout`
  is untouched, so position is preserved automatically — this is what
  makes "re-save returns to its original position" true by construction,
  not something that needs special-casing.
- **Delete**: remove that one entry from `layout`. No image position is
  renumbered; the grid re-renders with the gap closed because `layout`
  itself has one fewer entry — the "reflow" requirement falls out of
  `layout` being the render source, not out of any S3 operation.
- **Reorder** (any two entries, image or memo, once a group has a memo):
  `adminSwapPortfolioLayout` swaps two `layout` array indices in place —
  free of S3 cost, since display order is the array sequence itself. This
  is the same endpoint for image-image, image-memo, and memo-memo swaps;
  it's agnostic to entry type. Zero-memo groups don't use this at all —
  see §2.2 for the full split and why `adminSwapPortfolioImages` (S3
  content rename) is what a zero-memo group's reorder still means.

Both the admin queue and the public site render from the same `layout`
sequence once a group has one — this is what makes "same ordered data,
different rendering" (compact tile vs. full-width divider) hold. Groups
without memos keep rendering exactly as they do today, indefinitely.

## 3. Admin creation flow
- Entry point: feather-pen icon button (`memo-icon.svg` is the reference
  icon) next to "Add Files" in the admin portal, inside the selected
  category's queue section.
- Click opens a form dialog (fields vary by category — §7/§8).
- Submit renders the form to markup, creates the `memoId` entry, and
  inserts it into `layout` at the queue position it was placed.

## 4. Editing flow (post-publish)
- Admin opens the category's placement queue view.
- Existing memo tile shows: delete ("X", upper-left) and edit (feather
  pen, upper-right).
- Edit re-opens the same dialog, loaded into the far-right "queue
  load-in" section, pre-filled from the stored markup/fields.
- **Re-save** → updates `html` for that `memoId` only; `layout` position
  is untouched (see §2.4).
- **Delete** → removes the `layout` entry for that `memoId`; photo
  positions are untouched; the grid re-flows around the closed gap
  because `layout` has one fewer item (see §2.4).

## 5. Divider/spacer formatting (all categories)
- Preset padding above and below.
- Not part of the masonry/column flow — its own segment, per §2.1.
- Content immediately before/after follows normal layout rules for that
  category.

## 6. Category-specific layout rules

| Category | Layout | Memo behavior |
|---|---|---|
| **Photography** | Masonry-style grid (§2.1) | Centered, padding above/below, breaks grid flow. A widow row (the run's trailing row not filling all 3 columns — 1 or 2 images) has its content centered and vertically paired with the following memo, per the uniform rule in §2.1. |
| **Design** | Full-page column, edge-to-edge | Centered, padding above/below. |
| **Art** | Single-frame column (1 artwork per scroll "page") | Centered below the artwork, minimal padding above, INQUIRE button below memo, extra padding below to preserve one-artwork-per-scroll. |

## 7. Form fields — Photography & Design
All fields are **independently optional** — body text alone gets normal
padding with no dead space or error; title-only is equally valid.

- **Title/Heading** — `font-tnrBI` (Times New Roman **Bold** Italic —
  always bold italic, no separate italic weight; confirmed) with the
  sitewide glow treatment: `drop-shadow-glo` (`filter: drop-shadow(0px
  0px 2px #FFF)`, from `tailwind.config.js`) plus `opacity-80`. This is
  the exact same pairing used on every other `tnrBI` heading in the app
  (`Login.tsx`, `Welcome.tsx`, `Error.tsx`, `global/styles/buttons.ts`,
  etc.) — reuse verbatim, don't invent new shadow values.
- **Sub-Heading** — "V2 font" = `font-vt tracking-vt` (VT323), the
  sitewide monospace/blocky display font already used for nav
  (PHOTO/ART/DESIGN), sidebar category labels, and buttons
  (SUBMIT/ADD/INQUIRE). Reuse, don't source a new font asset.
- **Body Text** — `font-tnrBI`, justified; last line sits left-flush
  rather than stretched (standard justify + last-line-left, no special
  handling needed beyond `text-align: justify`).
- **Submit** — commits and creates the memo component.

No Inquire button here — **Inquire is Art-only** (see §8). You inquire
about buying a specific artwork; Photo/Design already has the sitewide
contact mechanism (header mail icon) for general inquiries, so a
per-memo Inquire toggle doesn't apply to those two categories.

Admin dialog panel (desktop and mobile): "MEMO" header with X close
(top-right), Title input, Subheading input, large Body textarea, Submit
button (bottom-right). Mobile stacks the same fields full-width.

## 8. Form fields — Art
- **Title** — `font-tnrBI`, pre-formatted with a trailing comma
  ("TITLE,") since Title and Year render on one line:
  `A Dream is a Wish, 2024`.
- **Year** — same line as Title, after the comma, non-italic weight
  within that line.
- **Body Text** — `font-vt tracking-vt`, all caps, centered — a details
  block (medium / dimensions / "SIGNED" / "UNIQUE"), not prose.
- **INQUIRE button** — on/off toggle. Art-only (see §7) — not present in
  the Photo/Design dialog or front-end at all.
- **SOLD checkbox** — labeled "SOLD?" in the admin dialog. The front-end
  never displays the word "SOLD" — it renders as `* COLLECTED *` in red
  (`text-rd` / `#DC2626`), below the Inquire button.
- **Submit**.

SOLD/Collected and Inquire are independent — checking SOLD does not hide
or disable Inquire.

Front-end (Art), confirmed top-to-bottom order: artwork (centered, one
per scroll) → Title+Year line → details block → Inquire button →
Collected status (only rendered when SOLD is checked). Even spacing
between each, and above/below the artwork. Treat 12pt as a starting size
for Title/Year/Body and adjust against the live site if precision
matters.

## 9. Styling reference (consolidated)

| Element | Class(es) |
|---|---|
| Title/Heading (Photo/Design), Title+Year (Art) | `font-tnrBI drop-shadow-glo opacity-80` |
| Sub-Heading (Photo/Design), details block (Art) | `font-vt tracking-vt` |
| Body Text (Photo/Design) | `font-tnrBI` + `text-align: justify` |
| SOLD/Collected text | `text-rd` (`#DC2626`), reads `* COLLECTED *` |
| INQUIRE button (Art-only, §7/§8) | reuse existing button styles (`global/styles/buttons.ts`) |

## 10. Open items still requiring a build-time decision

- **Exact spacing values** ("even spacing," "extra padding," 12pt
  starting size for Art) — treat as defaults, verify against the live
  site during implementation, tune via the Tailwind spacing scale.
- **Empty-memo placeholder graphic** — out of scope. The "LOVE" torn-paper
  graphic referenced in earlier drafts is existing portfolio content, not
  a memo placeholder asset to design.

## 11. Confirmed decisions carried over (do not re-litigate)

- Memo content is stored as rendered markup after Submit (`html` on the
  memo document), not separate structured fields.
- The admin placement queue is fully WYSIWYG: a memo renders exactly as
  it will on the public site — full styling, full row width — with no
  truncation and no simplified/plain fallback.
- Rasterization is ruled out; this stays live HTML/CSS throughout.
- The DnD-internal representation of a memo item (image-like vs. its own
  component type) is an implementation detail — resolved above as its
  own `layout` entry type, decoupled from image position (§2.3–2.4).
- SOLD (Art) and INQUIRE are independent; SOLD displays as
  `* COLLECTED *` and does not hide Inquire.
- "V2 font" is `font-vt` (VT323), the site's existing monospace/blocky
  display font — not a new font to source.
- Widow-row detection and the shared-centered-alignment pairing with the
  following memo (§2.1) apply uniformly at every interior boundary — one
  rule, not special-cased per direction. Group/subgroup-intro memos have
  zero widow risk; Art is unaffected entirely (no masonry there).
- `layout` is backfilled for all existing groups via a one-time migration
  script (§2.4), not a lazy per-group conversion — every group has a
  `layout` unconditionally after migration, no fallback branch needed in
  the render path or the image controllers.
