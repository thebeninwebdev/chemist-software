# Success Chemist Build Algorithm

## AI-Powered Pharmacy Inventory and Price Retrieval Platform

This document is the step-by-step implementation plan for rebuilding Success Chemist.

The application’s primary purpose is:

> Help an attendant quickly find a drug, view its current price, check its availability, and locate it inside the chemist.

The AI layer should improve search, product entry, and data quality. It must not diagnose customers, prescribe medication, or replace a pharmacist.

---

# 1. Final Product Definition

Success Chemist should be presented as:

> An AI-powered, offline-capable pharmacy inventory and price-retrieval platform for small community chemists.

The finished application should allow staff to:

- Search for a drug by its exact name.
- Search using partial or misspelled names.
- Search using natural language.
- View all selling prices and units.
- View stock status.
- View shelf location.
- View approved basic product information.
- Scan a barcode.
- Continue searching previously synchronized records while offline.

Administrators should be able to:

- Add and edit drugs.
- Manage multiple selling prices.
- Update stock.
- Import old drug records.
- Generate and store drug embeddings.
- Review AI-generated product information.
- View price history.
- View audit logs.
- Manage staff accounts.

The first release should not include:

- Diagnosis.
- Medication recommendations from symptoms.
- Customer medical records.
- Full accounting.
- Full point-of-sale functionality.
- Supplier management.
- Paid voice transcription.
- Autonomous AI changes to the database.

---

# 2. Recommended Technology Stack

## Core

- Next.js App Router
- React
- TypeScript
- Node.js
- Tailwind CSS
- shadcn/ui

## Database

- MongoDB Atlas
- Mongoose
- MongoDB Search
- MongoDB Vector Search

## Authentication and Validation

- Better Auth
- Zod

## AI

- Vercel AI SDK
- Voyage AI embeddings
- `voyage-4-lite`
- A low-cost vision model for label extraction
- Structured AI outputs
- Human approval before saving generated data

## Offline

- IndexedDB
- Dexie.js
- Progressive Web App
- Service worker
- Serwist or another maintained service-worker package

## Testing

- Vitest
- Playwright

## Delivery

- GitHub
- GitHub Actions
- Vercel
- Sentry

---

# 3. Development Rules

Follow these rules throughout the project.

## Rule 1: Build the reliable system before AI

The application must support exact drug search, prices, stock, locations, and administration before semantic search is added.

## Rule 2: The database is the source of truth

AI must never invent:

- Product availability.
- Current prices.
- Stock quantities.
- Shelf locations.
- Selling units.
- Drug records.

## Rule 3: AI creates suggestions, not final records

AI-generated information must be:

1. Generated.
2. Validated with Zod.
3. Displayed as a draft.
4. Reviewed by a human.
5. Explicitly approved before saving.

## Rule 4: Use deterministic code where possible

Do not use AI for:

- Price calculations.
- Authentication.
- Authorization.
- Barcode equality.
- Stock arithmetic.
- Filtering by exact amount.
- Audit logs.
- CSV validation.
- Date calculations.

## Rule 5: Complete one phase before starting the next

Do not begin image extraction before search works.

Do not begin offline mode before the online catalogue is reliable.

Do not begin advanced analytics before audit logging and data integrity are working.

---

# 4. High-Level Build Algorithm

```text
1. Define the product scope.
2. Create the repository and development environment.
3. Design the domain and database models.
4. Configure MongoDB and application validation.
5. Implement authentication and authorization.
6. Build the drug administration system.
7. Migrate the old Success Chemist records.
8. Build exact, autocomplete, and fuzzy search.
9. Build the staff-facing price lookup experience.
10. Add price history, stock history, and audit logs.
11. Generate and store drug embeddings.
12. Implement semantic vector search.
13. Combine text, vector, and exact filtering into hybrid search.
14. Add AI-assisted label extraction.
15. Add AI data-quality tools.
16. Add barcode scanning.
17. Add offline catalogue access.
18. Add automated testing.
19. Add CI/CD and production monitoring.
20. Deploy, validate, document, and publish the case study.
```

---

# 5. Phase 0 — Product Scope and Requirements

## Objective

Define exactly what version one will solve.

## Tasks

- [ ] Write the primary problem statement.
- [ ] Identify the people who will use the application.
- [ ] List the current problems in the chemist.
- [ ] List the information required to answer a price enquiry.
- [ ] Decide which features belong in the MVP.
- [ ] Decide which features belong in later versions.
- [ ] Write the AI safety boundaries.
- [ ] Write the user roles and permissions.
- [ ] Collect examples of real drug records.
- [ ] Collect examples of real searches used in the shop.

## Primary Problem Statement

Use this statement:

> Staff members may not remember the price, exact name, purpose, or shelf location of every product in the chemist. Success Chemist should make verified product information retrievable within seconds.

## MVP Feature List

- [ ] Login.
- [ ] Staff and admin roles.
- [ ] Drug CRUD.
- [ ] Multiple prices and selling units.
- [ ] Shelf location.
- [ ] Availability.
- [ ] Stock status.
- [ ] Exact drug search.
- [ ] Autocomplete.
- [ ] Fuzzy search.
- [ ] Price history.
- [ ] Audit logs.
- [ ] Old data migration.
- [ ] Responsive interface.
- [ ] Basic automated tests.
- [ ] Production deployment.

## AI MVP Feature List

- [ ] Generate embeddings when drugs are created or updated.
- [ ] Generate a query embedding for semantic searches.
- [ ] Retrieve semantically related drugs.
- [ ] Ground every result in MongoDB.
- [ ] AI-assisted product label extraction.
- [ ] Human review before saving extracted information.

## Later Features

- [ ] Offline catalogue.
- [ ] Barcode scanning.
- [ ] Duplicate detection.
- [ ] Voice search.
- [ ] Supplier management.
- [ ] Sales and receipts.
- [ ] Multiple branches.
- [ ] Pharmacist-only decision-support tools.

## Deliverable

Create:

```text
/docs/product-requirements.md
```

## Phase Completion Condition

Do not proceed until the MVP can be described in one paragraph without including diagnosis or prescription features.

---

# 6. Phase 1 — Repository and Project Setup

## Objective

Create a clean, professional development foundation.

## Tasks

### Repository

- [ ] Create a GitHub repository.
- [ ] Add a clear repository description.
- [ ] Add a `.gitignore`.
- [ ] Add an MIT or appropriate private licence.
- [ ] Add a basic `README.md`.
- [ ] Protect the `main` branch when possible.
- [ ] Use feature branches for significant work.

### Create the Application

```bash
npx create-next-app@latest success-chemist
```

Recommended choices:

```text
TypeScript: Yes
ESLint: Yes
Tailwind CSS: Yes
src directory: Yes
App Router: Yes
Turbopack: Yes
Import alias: @/*
```

### Install Core Dependencies

```bash
npm install mongoose zod
```

Install authentication and UI dependencies after choosing their current supported versions.

### Configure TypeScript

- [ ] Enable strict mode.
- [ ] Avoid unnecessary `any`.
- [ ] Add typed environment variables.
- [ ] Add shared types for API results.
- [ ] Add typed error objects.

### Configure Environment Variables

Create:

```text
.env.local
.env.example
```

Initial variables:

```env
MONGODB_URI=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
VOYAGE_API_KEY=
AI_VISION_API_KEY=
NEXT_PUBLIC_APP_URL=
SENTRY_DSN=
```

Never commit `.env.local`.

### Create Initial Folder Structure

```text
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── admin/
│   ├── api/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── search/
│   ├── drugs/
│   ├── admin/
│   └── shared/
├── features/
│   ├── auth/
│   ├── drugs/
│   ├── search/
│   ├── stock/
│   ├── pricing/
│   ├── imports/
│   └── ai/
├── lib/
│   ├── auth/
│   ├── db/
│   ├── ai/
│   ├── validation/
│   ├── errors/
│   └── utils/
├── models/
├── schemas/
├── services/
├── types/
└── tests/
```

## Deliverable

A clean Next.js application that:

- Runs locally.
- Passes linting.
- Passes type-checking.
- Connects to no production services yet.
- Contains documented environment variables.

## Phase Completion Condition

```bash
npm run lint
npm run build
```

Both commands must pass.

---

# 7. Phase 2 — User Experience and Design System

## Objective

Create a fast, simple interface designed around drug search.

## Design Direction

Use the established Success Chemist visual direction:

- Black background.
- Brown and warm neutral accents.
- Sophisticated but simple.
- High contrast.
- Clear information hierarchy.
- Minimal animations.
- Mobile and desktop support.

## Tasks

- [ ] Define background colours.
- [ ] Define text colours.
- [ ] Define brown accent colours.
- [ ] Define spacing scale.
- [ ] Define border styles.
- [ ] Define input styles.
- [ ] Define table styles.
- [ ] Define status badges.
- [ ] Define typography.
- [ ] Add loading skeletons.
- [ ] Add empty states.
- [ ] Add error states.
- [ ] Add confirmation dialogs.
- [ ] Add accessible focus states.

## Required Screens

Create static versions first:

- [ ] Login.
- [ ] Staff dashboard.
- [ ] Search results.
- [ ] Drug details.
- [ ] Admin overview.
- [ ] Drug list.
- [ ] Create drug.
- [ ] Edit drug.
- [ ] Import preview.
- [ ] AI review queue.
- [ ] Audit log.

## Dashboard Priority

The staff dashboard should begin with:

```text
What drug are you looking for?

[ Search by name, brand, ingredient, use or description ]
```

Secondary content:

- Recent searches.
- Frequently searched drugs.
- Low-stock alerts.
- Recently changed prices.

## Deliverable

Clickable static screens using sample data.

## Phase Completion Condition

A user should be able to understand how to search for a drug within five seconds of opening the dashboard.

---

# 8. Phase 3 — Domain and Database Design

## Objective

Create a reliable data model before implementing features.

## 8.1 Drug Schema

Create the Mongoose schema for:

```ts
interface Drug {
  name: string;
  slug: string;
  commonName?: string;
  aliases: string[];
  commonMisspellings: string[];

  activeIngredients: {
    name: string;
    strength?: string;
  }[];

  category: string;
  dosageForm: string;
  strength?: string;
  manufacturer?: string;
  description?: string;

  location: string;
  prescriptionStatus: "otc" | "prescription" | "unknown";

  prices: DrugPrice[];
  stock: StockInformation;

  barcode?: string;
  imageUrl?: string;

  approvedInformation?: ApprovedDrugInformation;

  embedding?: number[];
  embeddingModel?: string;
  embeddingDimensions?: number;
  embeddingTextHash?: string;
  embeddingUpdatedAt?: Date;

  isArchived: boolean;

  createdBy: string;
  updatedBy: string;

  createdAt: Date;
  updatedAt: Date;
}
```

## 8.2 Price Schema

```ts
type PriceUnit =
  | "tablet"
  | "capsule"
  | "sachet"
  | "strip"
  | "bottle"
  | "pack"
  | "box"
  | "tube"
  | "custom";
```

Each price should include:

- Unit.
- Custom unit where needed.
- Quantity per unit.
- Selling price.
- Currency.
- Whether it is the primary display price.
- Last update time.

## 8.3 Stock Schema

Store:

- Status.
- Quantity.
- Base unit.
- Reorder level.
- Nearest expiry date.
- Last updated time.

## 8.4 Supporting Collections

Create models for:

- [ ] User.
- [ ] PriceHistory.
- [ ] StockAdjustment.
- [ ] AuditLog.
- [ ] ImportJob.
- [ ] AIReviewItem.
- [ ] SearchEvent.
- [ ] UnmatchedBarcode.

## 8.5 Indexes

Create indexes for:

- Unique slug.
- Barcode.
- Name.
- Common name.
- Category.
- Dosage form.
- Manufacturer.
- Archived status.
- Updated date.

Create MongoDB Search indexes later for autocomplete and vector search.

## 8.6 Validation Schemas

Create Zod schemas for:

- Drug creation.
- Drug editing.
- Price creation.
- Stock update.
- Search parameters.
- CSV row.
- AI search output.
- AI label-extraction output.
- Environment variables.

## Deliverable

- Mongoose models.
- Zod schemas.
- TypeScript types.
- Database design documentation.

## Phase Completion Condition

Sample valid and invalid records must be tested through Zod before they reach MongoDB.

---

# 9. Phase 4 — Database Connection and Repository Layer

## Objective

Keep database access organised and testable.

## Tasks

- [ ] Create a cached MongoDB connection utility.
- [ ] Prevent multiple development connections.
- [ ] Create repository functions for drug operations.
- [ ] Keep queries outside presentation components.
- [ ] Add typed return values.
- [ ] Normalize database errors.
- [ ] Add pagination helpers.
- [ ] Add transaction support where appropriate.

## Recommended Repository Functions

```ts
createDrug()
updateDrug()
archiveDrug()
restoreDrug()
getDrugById()
getDrugBySlug()
getDrugByBarcode()
listDrugs()
searchDrugs()
updateDrugPrices()
updateDrugStock()
```

## Deliverable

A database layer that can be used by Server Actions, Route Handlers, and tests.

## Phase Completion Condition

No React component should call Mongoose directly.

---

# 10. Phase 5 — Authentication and Authorization

## Objective

Protect administrative and staff functionality.

## Tasks

- [ ] Install and configure Better Auth.
- [ ] Create login.
- [ ] Create logout.
- [ ] Create session retrieval.
- [ ] Create initial admin account.
- [ ] Add `ADMIN`, `PHARMACIST`, and `STAFF` roles.
- [ ] Protect dashboard routes.
- [ ] Protect admin routes.
- [ ] Protect Server Actions.
- [ ] Protect Route Handlers.
- [ ] Add unauthorized and forbidden states.
- [ ] Add session expiration handling.
- [ ] Add rate limiting to authentication endpoints.

## Authorization Helpers

Create reusable helpers:

```ts
requireUser()
requireRole()
requireAdmin()
requirePharmacistOrAdmin()
```

## Important Rule

Never rely only on middleware or hidden interface elements.

Every protected server operation must verify the session and role.

## Deliverable

Users can log in and only access authorized features.

## Phase Completion Condition

A staff account must be unable to:

- Open admin pages.
- Call admin APIs.
- Modify a drug.
- Change a price.
- Manage users.

---

# 11. Phase 6 — Drug Administration CRUD

## Objective

Allow administrators to manage reliable drug records.

## Create Drug Tasks

- [ ] Create form.
- [ ] Validate on client where helpful.
- [ ] Validate again on server.
- [ ] Check duplicate names.
- [ ] Check duplicate barcodes.
- [ ] Save record.
- [ ] Create audit log.
- [ ] Redirect to details page.
- [ ] Display success feedback.

## Edit Drug Tasks

- [ ] Load existing record.
- [ ] Populate form.
- [ ] Validate update.
- [ ] Compare previous and new values.
- [ ] Update record.
- [ ] Regenerate embedding only if searchable text changed.
- [ ] Create audit log.
- [ ] Display success feedback.

## Archive Tasks

- [ ] Use soft deletion.
- [ ] Require confirmation.
- [ ] Hide archived drugs from normal search.
- [ ] Allow administrators to restore records.
- [ ] Create audit event.

## Drug List Tasks

- [ ] Search.
- [ ] Filter.
- [ ] Sort.
- [ ] Paginate.
- [ ] Display stock state.
- [ ] Display primary price.
- [ ] Display location.
- [ ] Display last updated time.
- [ ] Support bulk archive where appropriate.

## Deliverable

A complete admin drug-management system.

## Phase Completion Condition

An administrator can create, view, edit, archive, and restore a drug without directly accessing MongoDB Atlas.

---

# 12. Phase 7 — Price Management

## Objective

Support multiple selling units and preserve price history.

## Tasks

- [ ] Add multiple prices to each drug.
- [ ] Enforce positive values.
- [ ] Enforce one primary price.
- [ ] Support custom units.
- [ ] Store currency as NGN.
- [ ] Show formatted Naira amounts.
- [ ] Record old and new values.
- [ ] Require an optional reason for price changes.
- [ ] Create audit logs.
- [ ] Show price history on the drug page.

## Example

```text
Panadol Extra

Tablet: ₦150
Strip: ₦1,500
Pack: ₦15,000
```

## Price Change Algorithm

```text
1. Load current price.
2. Validate requested price.
3. Compare old and new values.
4. If unchanged, return without writing.
5. Create a price-history record.
6. Update the drug price.
7. Update the drug's updatedAt field.
8. Create an audit event.
9. Return the updated drug.
```

## Deliverable

Reliable multi-unit pricing with history.

## Phase Completion Condition

Changing a price must never erase the previous price record.

---

# 13. Phase 8 — Stock Management

## Objective

Provide simple stock visibility without building a full accounting system.

## Tasks

- [ ] Add stock status.
- [ ] Add quantity.
- [ ] Add base unit.
- [ ] Add reorder level.
- [ ] Add nearest expiry date.
- [ ] Add stock adjustment form.
- [ ] Add adjustment reasons.
- [ ] Add stock history.
- [ ] Add low-stock indicators.
- [ ] Add out-of-stock indicators.
- [ ] Add audit events.

## Stock Adjustment Algorithm

```text
1. Receive adjustment type and quantity.
2. Validate quantity.
3. Load current stock.
4. Calculate new stock deterministically.
5. Reject impossible negative quantities.
6. Create stock-adjustment record.
7. Update drug stock.
8. Recalculate stock status.
9. Create audit log.
10. Return updated stock.
```

## Deliverable

Simple, auditable inventory status.

## Phase Completion Condition

The current quantity must be reproducible from stock adjustments or clearly marked as a manual correction.

---

# 14. Phase 9 — Old Database Migration

## Objective

Move existing Success Chemist records into the new structure safely.

## Existing Record Example

```json
{
  "name": "Panadol",
  "price": 300,
  "comnName": "none",
  "desc": "Used for mild to moderate pain and fever.",
  "location": "top-right shelf",
  "category": "common drug"
}
```

## Migration Tasks

- [ ] Export old records.
- [ ] Create backup.
- [ ] Write migration script.
- [ ] Map `comnName` to `commonName`.
- [ ] Convert `"none"` to `undefined`.
- [ ] Map `desc` to `description`.
- [ ] Map old price to the new price array.
- [ ] Choose or review a default unit.
- [ ] Normalize shelf locations.
- [ ] Normalize categories.
- [ ] Detect duplicate names.
- [ ] Validate every migrated object.
- [ ] Write invalid records to a separate report.
- [ ] Import valid records.
- [ ] Verify counts.
- [ ] Create a rollback plan.

## Migration Algorithm

```text
1. Read one old record.
2. Normalize text fields.
3. Convert legacy fields.
4. Build new prices array.
5. Generate slug.
6. Mark unknown fields for review.
7. Validate with Zod.
8. Check likely duplicates.
9. Save valid record.
10. Record migration result.
```

## Deliverables

```text
/scripts/migrate-old-drugs.ts
/reports/migration-results.json
/reports/migration-errors.json
```

## Phase Completion Condition

The number of imported, skipped, duplicate, and invalid records must be documented.

---

# 15. Phase 10 — Standard Search

## Objective

Make normal search fast and useful before adding embeddings.

## Search Priority

```text
1. Barcode exact match.
2. Exact name match.
3. Exact common-name match.
4. Prefix autocomplete.
5. Alias match.
6. Fuzzy text match.
7. Semantic vector search.
```

## Tasks

- [ ] Create search input.
- [ ] Debounce user input.
- [ ] Add loading state.
- [ ] Add empty state.
- [ ] Add keyboard navigation.
- [ ] Add recent searches.
- [ ] Add filters.
- [ ] Add pagination.
- [ ] Add exact name matching.
- [ ] Add common-name matching.
- [ ] Add aliases.
- [ ] Add fuzzy matching.
- [ ] Add MongoDB Search autocomplete index.
- [ ] Return only required summary fields.

## Search Result Fields

- Name.
- Common name.
- Strength.
- Dosage form.
- Primary price.
- Other prices.
- Availability.
- Shelf location.
- Image where available.

## Deliverable

A fast non-AI search experience.

## Phase Completion Condition

Common searches such as `Panadol`, `para`, and misspelled saved aliases must return useful results without calling an AI model.

---

# 16. Phase 11 — Staff Price Lookup Experience

## Objective

Make the application useful in the real chemist.

## Tasks

- [ ] Place search at the centre of the dashboard.
- [ ] Show primary price immediately.
- [ ] Show all selling units.
- [ ] Show stock status.
- [ ] Show shelf location.
- [ ] Show approved description.
- [ ] Add copyable product details.
- [ ] Add recent searches.
- [ ] Add frequently searched products.
- [ ] Add last updated time.
- [ ] Add a clear offline indicator later.

## Drug Details Layout

```text
Product name
Common name
Strength and dosage form

Prices
Stock
Shelf location

Approved basic information
Active ingredients
Manufacturer

Price history
Last reviewed
```

## Deliverable

A staff member can answer the main store enquiry from one screen.

## Phase Completion Condition

A user must not need more than one search and one click to see every price for a drug.

---

# 17. Phase 12 — Audit Logging

## Objective

Create accountability for important changes.

## Events to Log

- Drug created.
- Drug edited.
- Drug archived.
- Drug restored.
- Price changed.
- Stock adjusted.
- CSV imported.
- AI suggestion approved.
- Duplicate records merged.
- User role changed.

## Tasks

- [ ] Create audit service.
- [ ] Capture actor.
- [ ] Capture role.
- [ ] Capture action.
- [ ] Capture entity type.
- [ ] Capture entity ID.
- [ ] Capture previous values.
- [ ] Capture new values.
- [ ] Capture timestamp.
- [ ] Create admin audit-log screen.
- [ ] Add filtering.

## Deliverable

An administrator can determine who changed important data and when.

## Phase Completion Condition

Every price update and stock adjustment must have a matching audit event.

---

# 18. Phase 13 — Embedding Infrastructure

## Objective

Generate one embedding for each drug’s stable semantic information.

## Recommended Model

```text
Provider: Voyage AI
Model: voyage-4-lite
Dimensions: 512
Document input type: document
Query input type: query
```

## 18.1 Build Embedding Text

Create a deterministic function:

```ts
function buildDrugEmbeddingText(drug: Drug): string {
  return [
    `Product name: ${drug.name}`,
    drug.commonName && `Common name: ${drug.commonName}`,
    drug.activeIngredients.length &&
      `Active ingredients: ${drug.activeIngredients
        .map((item) => `${item.name} ${item.strength ?? ""}`.trim())
        .join(", ")}`,
    drug.aliases.length && `Aliases: ${drug.aliases.join(", ")}`,
    drug.commonMisspellings.length &&
      `Common misspellings: ${drug.commonMisspellings.join(", ")}`,
    drug.category && `Category: ${drug.category}`,
    drug.dosageForm && `Dosage form: ${drug.dosageForm}`,
    drug.strength && `Strength: ${drug.strength}`,
    drug.manufacturer && `Manufacturer: ${drug.manufacturer}`,
    drug.approvedInformation?.generalUse &&
      `Approved general use: ${drug.approvedInformation.generalUse}`,
  ]
    .filter(Boolean)
    .join("\n");
}
```

## Do Not Embed

- Current prices.
- Stock quantity.
- Stock status.
- Expiry dates.
- Audit logs.
- Price history.

These fields change often and should be retrieved directly from MongoDB.

## 18.2 Create Text Hash

- [ ] Normalize embedding text.
- [ ] Generate a hash.
- [ ] Store the hash.
- [ ] Compare hash during updates.
- [ ] Regenerate only when the hash changes.

## 18.3 Generate Drug Embedding

Algorithm:

```text
1. Build searchable text.
2. Generate text hash.
3. Compare with stored hash.
4. If unchanged, skip embedding.
5. Send text to Voyage as document input.
6. Validate vector length.
7. Store vector, model, dimensions, hash, and timestamp.
8. Log failure without corrupting the drug record.
```

## 18.4 Backfill Existing Records

Create:

```text
/scripts/backfill-drug-embeddings.ts
```

Requirements:

- [ ] Process records in batches.
- [ ] Retry temporary errors.
- [ ] Skip records with current hashes.
- [ ] Log failures.
- [ ] Respect API limits.
- [ ] Produce summary report.

## Deliverable

Every searchable drug has a valid embedding.

## Phase Completion Condition

The application can verify that all stored embeddings use the same model and dimensions.

---

# 19. Phase 14 — MongoDB Vector Search

## Objective

Retrieve drugs based on semantic meaning.

## Tasks

- [ ] Create MongoDB Vector Search index.
- [ ] Configure vector field.
- [ ] Set dimensions to 512.
- [ ] Choose similarity function.
- [ ] Create query-embedding service.
- [ ] Run vector queries.
- [ ] Return similarity scores.
- [ ] Exclude archived records.
- [ ] Limit candidate and result counts.
- [ ] Measure retrieval quality.

## Query Embedding Algorithm

```text
1. Receive user query.
2. Normalize whitespace.
3. Reject empty or excessive input.
4. Generate query embedding using the same model.
5. Validate vector length.
6. Send vector to MongoDB Vector Search.
7. Retrieve candidate drug IDs.
8. Load current drug facts from MongoDB.
9. Return verified results.
```

## Important Rule

Drug embeddings and query embeddings must use:

- The same provider.
- The same model family.
- The same output dimensions.

## Deliverable

A semantic search endpoint.

## Phase Completion Condition

Queries such as `children's fever syrup` should retrieve semantically relevant inventory records even when those exact words are absent.

---

# 20. Phase 15 — Hybrid Search

## Objective

Combine exact text search, fuzzy search, semantic search, and deterministic filters.

## Why Hybrid Search Is Required

Vector search understands meaning but is weak at enforcing:

- Exact prices.
- Stock states.
- Shelf locations.
- Barcodes.
- Exact units.
- Exact manufacturers.

## Hybrid Search Algorithm

```text
1. Receive query and explicit filters.
2. Check barcode exact match.
3. Run exact and autocomplete text search.
4. Run fuzzy search.
5. Decide whether semantic search is needed.
6. Generate query embedding when needed.
7. Run vector search.
8. Merge candidate results.
9. Remove duplicates.
10. Apply exact filters.
11. Rank results.
12. Load current prices and stock.
13. Return verified results.
```

## Suggested Ranking Inputs

- Exact name match.
- Common-name match.
- Alias match.
- Autocomplete score.
- Fuzzy score.
- Vector similarity score.
- Availability.
- Search popularity.
- Recent confirmation or review.

## Exact Filters

Support:

- Category.
- Dosage form.
- Manufacturer.
- Maximum price.
- Minimum price.
- Stock status.
- Shelf location.
- Selling unit.
- Prescription status.

## Deliverable

A single search service used by the dashboard.

## Phase Completion Condition

The query:

```text
available children's paracetamol syrup below 3000
```

must return semantically relevant products while correctly enforcing stock and price filters.

---

# 21. Phase 16 — Natural-Language Query Interpretation

## Objective

Use a language model only when query structure cannot be reliably extracted by normal code.

## First Try Deterministic Parsing

Before calling a language model:

- Detect amounts using regular expressions.
- Detect known dosage forms.
- Detect known stock words.
- Detect known shelf names.
- Detect known selling units.
- Detect categories and manufacturers.

## Use AI Only When Needed

Examples:

```text
the stronger Panadol in the small red pack
```

```text
show the children's fever syrups that are not expensive
```

## AI Output Schema

```ts
const naturalSearchSchema = z.object({
  semanticQuery: z.string(),
  dosageForm: z.string().optional(),
  manufacturer: z.string().optional(),
  minimumPrice: z.number().optional(),
  maximumPrice: z.number().optional(),
  stockStatus: z
    .enum(["in_stock", "low_stock", "out_of_stock"])
    .optional(),
  location: z.string().optional(),
});
```

## Algorithm

```text
1. Attempt deterministic parsing.
2. If enough structure exists, skip language model.
3. If query remains ambiguous, call low-cost model.
4. Validate structured output.
5. Reject unsupported fields.
6. Display interpreted filters where useful.
7. Run hybrid search.
8. Return database-grounded results.
```

## Deliverable

Complex human searches can become validated database filters.

## Phase Completion Condition

The language model must not return a drug list directly. It only returns search interpretation.

---

# 22. Phase 17 — AI-Assisted Label Extraction

## Objective

Reduce the time required to create new drug records.

## Workflow

```text
1. Administrator uploads product image.
2. Validate file type and size.
3. Store temporary image.
4. Send image to vision model.
5. Request structured fields.
6. Validate output with Zod.
7. Search for possible duplicates.
8. Display editable draft.
9. Administrator corrects fields.
10. Administrator approves.
11. Save drug record.
12. Generate embedding.
13. Create audit event.
14. Delete temporary image if appropriate.
```

## Suggested Extracted Fields

- Product name.
- Common name.
- Active ingredients.
- Strength.
- Dosage form.
- Manufacturer.
- Package size.
- Barcode.
- Visible warnings.

## Important Rules

- AI output is a suggestion.
- Price must be entered by the administrator.
- Shelf location must be entered by the administrator.
- Stock quantity must be entered by the administrator.
- Unclear fields must remain empty.
- Never infer prescription status without review.
- Do not save before explicit confirmation.

## Deliverable

An admin can create a draft drug record from a product image.

## Phase Completion Condition

No extracted field can be saved without passing validation and human review.

---

# 23. Phase 18 — AI Data-Quality Assistant

## Objective

Improve the quality of migrated and newly entered records.

## Checks

- [ ] Possible duplicate names.
- [ ] Similar active ingredients.
- [ ] Inconsistent dosage forms.
- [ ] Missing manufacturer.
- [ ] Missing strength.
- [ ] Missing location.
- [ ] Suspicious price differences.
- [ ] Invalid custom units.
- [ ] Literal `"none"` values.
- [ ] Old or unreviewed descriptions.

## Duplicate Algorithm

```text
1. Compare exact normalized names.
2. Compare aliases.
3. Compare active ingredients.
4. Compare dosage forms.
5. Compare strengths.
6. Compare vector similarity.
7. Calculate duplicate confidence.
8. Create review item.
9. Require administrator decision.
```

## Review Actions

- Approve suggestion.
- Edit and approve.
- Reject.
- Merge records.
- Keep records separate.
- Defer.

## Deliverable

An AI review queue.

## Phase Completion Condition

AI must never merge records automatically.

---

# 24. Phase 19 — Barcode Scanning

## Objective

Allow fast exact lookup from product packaging.

## Tasks

- [ ] Add camera permission flow.
- [ ] Add browser barcode scanner.
- [ ] Support connected keyboard-style scanners.
- [ ] Search local cache first where available.
- [ ] Search server by exact barcode.
- [ ] Display product immediately.
- [ ] Create unmatched-barcode queue.
- [ ] Allow manual search fallback.
- [ ] Add admin resolution screen.

## Barcode Algorithm

```text
1. Read barcode.
2. Normalize value.
3. Search exact barcode index.
4. If found, show current drug record.
5. If not found, save unmatched barcode.
6. Offer manual search.
7. Allow admin to link barcode later.
```

## Deliverable

Exact barcode lookup.

## Phase Completion Condition

Barcode lookup must not call an AI model when an exact database match exists.

---

# 25. Phase 20 — Offline Catalogue

## Objective

Allow staff to search recently synchronized drug information without internet.

## Offline Scope

Version one offline mode should be read-only.

Cache:

- Drug ID.
- Name.
- Common name.
- Aliases.
- Dosage form.
- Strength.
- Current prices.
- Stock status.
- Shelf location.
- Barcode.
- Last updated time.

## Do Not Support Offline Initially

- Drug creation.
- Price changes.
- Stock changes.
- User management.
- AI requests.
- CSV imports.

## Tasks

- [ ] Install Dexie.
- [ ] Design IndexedDB schema.
- [ ] Create catalogue synchronization endpoint.
- [ ] Store sync timestamp.
- [ ] Add online/offline indicator.
- [ ] Search local records when offline.
- [ ] Show stale-data warning.
- [ ] Refresh cache after successful login.
- [ ] Handle versioned local schemas.
- [ ] Add cache reset option.

## Sync Algorithm

```text
1. User opens application online.
2. Request records changed after last sync.
3. Validate response.
4. Update IndexedDB transactionally.
5. Remove archived records.
6. Store latest sync timestamp.
7. Notify interface that cache is current.
```

## Offline Search Algorithm

```text
1. Detect unavailable network.
2. Query IndexedDB.
3. Display cached results.
4. Show last synchronization time.
5. Disable administrative writes.
6. Retry synchronization when connection returns.
```

## Deliverable

Read-only offline search.

## Phase Completion Condition

A previously synchronized drug must remain searchable after the browser is put offline.

---

# 26. Phase 21 — Progressive Web App

## Objective

Make Success Chemist installable and app-like.

## Tasks

- [ ] Add manifest.
- [ ] Add application icons.
- [ ] Add theme colour.
- [ ] Add service worker.
- [ ] Cache application shell.
- [ ] Add install prompt where appropriate.
- [ ] Test standalone display.
- [ ] Test update behaviour.
- [ ] Test offline launch.
- [ ] Add recovery for outdated caches.

## Deliverable

Installable PWA.

## Phase Completion Condition

The application can be installed on a supported phone or desktop and open in standalone mode.

---

# 27. Phase 22 — Unit and Integration Testing

## Objective

Test business rules before relying on browser tests.

## Vitest Unit Tests

Test:

- [ ] Price validation.
- [ ] Naira formatting.
- [ ] Stock calculations.
- [ ] Search normalization.
- [ ] Slug generation.
- [ ] Embedding text generation.
- [ ] Embedding hash generation.
- [ ] AI output validation.
- [ ] CSV migration mapping.
- [ ] Permission helpers.
- [ ] Duplicate scoring.

## Integration Tests

Test:

- [ ] Drug creation.
- [ ] Drug update.
- [ ] Price history creation.
- [ ] Stock adjustment.
- [ ] Audit event creation.
- [ ] Search filters.
- [ ] Authorization.
- [ ] Embedding regeneration conditions.
- [ ] Import reports.
- [ ] AI review approval.

## Deliverable

Reliable test suite for business logic.

## Phase Completion Condition

Every critical deterministic service must have at least one successful and one failure test.

---

# 28. Phase 23 — End-to-End Testing

## Objective

Test real user workflows with Playwright.

## Required Tests

### Login

```text
User opens login
→ enters credentials
→ receives correct dashboard
```

### Staff Search

```text
Staff logs in
→ searches Panadol
→ opens result
→ sees prices and location
```

### Admin Drug Creation

```text
Admin creates drug
→ adds prices
→ saves
→ drug appears in search
```

### Price Change

```text
Admin edits price
→ new price appears
→ old price remains in history
→ audit event exists
```

### Semantic Search

```text
User searches children's fever syrup
→ relevant stored records appear
→ no invented product appears
```

### Authorization

```text
Staff opens admin URL
→ receives forbidden response
```

### Migration or Import

```text
Admin uploads file
→ preview appears
→ invalid records are identified
→ valid records are imported
```

### Offline Search

```text
Catalogue synchronizes
→ browser goes offline
→ cached drug remains searchable
```

## Deliverable

Playwright test suite with trace support.

## Phase Completion Condition

Critical flows must pass in CI before deployment.

---

# 29. Phase 24 — GitHub Actions CI

## Objective

Automatically validate every pull request.

## Workflow

```text
1. Check out repository.
2. Install Node.js LTS.
3. Restore dependency cache.
4. Install dependencies.
5. Run lint.
6. Run type-check.
7. Run unit tests.
8. Run integration tests.
9. Build application.
10. Run Playwright tests.
```

## Tasks

- [ ] Create CI workflow.
- [ ] Add environment test variables.
- [ ] Cache dependencies.
- [ ] Upload Playwright traces on failure.
- [ ] Prevent secrets from appearing in logs.
- [ ] Require CI on `main`.
- [ ] Add dependency update automation.

## Deliverable

```text
.github/workflows/ci.yml
```

## Phase Completion Condition

A deliberately broken type, test, or build must fail the workflow.

---

# 30. Phase 25 — Error Monitoring and Logging

## Objective

Make production failures diagnosable.

## Tasks

- [ ] Configure Sentry.
- [ ] Add server error capture.
- [ ] Add client error capture.
- [ ] Add request IDs.
- [ ] Add structured logs.
- [ ] Record AI failures.
- [ ] Record embedding failures.
- [ ] Record import failures.
- [ ] Record search latency.
- [ ] Avoid logging secrets.
- [ ] Avoid logging sensitive health information.

## Important Metrics

- Search latency.
- Search success rate.
- Empty-result rate.
- Embedding failure rate.
- AI output validation failure rate.
- Import failure rate.
- Offline synchronization failure rate.
- Most common searches.
- Most common misspellings.

## Deliverable

Production observability.

## Phase Completion Condition

A simulated production error must appear in monitoring with enough context to identify the failing feature.

---

# 31. Phase 26 — Security Review

## Objective

Protect the application and inventory data.

## Checklist

- [ ] Server-side authorization on every protected action.
- [ ] Secure session cookies.
- [ ] Rate limiting.
- [ ] Zod validation.
- [ ] Restricted file types.
- [ ] File size limits.
- [ ] Sanitized filenames.
- [ ] No database credentials in browser code.
- [ ] No AI API keys in browser code.
- [ ] Least-privilege MongoDB account.
- [ ] Environment validation.
- [ ] Audit logs.
- [ ] Backup plan.
- [ ] Protected production branch.
- [ ] Dependency review.
- [ ] No patient medical data.
- [ ] No unrestricted medical chatbot.
- [ ] No automatic AI database writes.

## Deliverable

Security review document.

## Phase Completion Condition

All high-risk issues must be fixed or documented before production launch.

---

# 32. Phase 27 — Performance Review

## Objective

Keep the application fast on ordinary devices and internet connections.

## Tasks

- [ ] Measure initial page load.
- [ ] Measure search response time.
- [ ] Optimize MongoDB indexes.
- [ ] Avoid sending full records in search results.
- [ ] Paginate admin tables.
- [ ] Debounce autocomplete.
- [ ] Cache appropriate data.
- [ ] Lazy-load barcode and image tools.
- [ ] Optimize images.
- [ ] Reduce client-side JavaScript.
- [ ] Avoid calling embeddings on every keystroke.
- [ ] Cache repeated query embeddings where appropriate.

## AI Cost Control

Use this order:

```text
Exact search
→ autocomplete
→ fuzzy search
→ semantic embedding search
→ language model interpretation only when necessary
```

Additional controls:

- [ ] Minimum query length before semantic search.
- [ ] Debounce semantic requests.
- [ ] Cache common query embeddings.
- [ ] Batch drug embedding generation.
- [ ] Regenerate only when searchable text changes.
- [ ] Set per-user and per-IP rate limits.
- [ ] Log token usage.
- [ ] Add monthly usage alerts.

## Deliverable

Performance and cost report.

## Phase Completion Condition

Normal search must work without an AI call, and semantic search must never run on every keystroke.

---

# 33. Phase 28 — Deployment

## Objective

Deploy a reliable production version.

## Tasks

- [ ] Create production MongoDB database.
- [ ] Create least-privilege database user.
- [ ] Configure MongoDB network access.
- [ ] Create search indexes.
- [ ] Create vector index.
- [ ] Configure Vercel project.
- [ ] Add environment variables.
- [ ] Configure custom domain.
- [ ] Configure Sentry.
- [ ] Run migrations.
- [ ] Backfill embeddings.
- [ ] Create first admin user.
- [ ] Run smoke tests.
- [ ] Verify authentication.
- [ ] Verify search.
- [ ] Verify price updates.
- [ ] Verify audit logs.
- [ ] Verify production AI calls.
- [ ] Verify backups.

## Deployment Order

```text
1. Deploy application without public access.
2. Configure database.
3. Run migration.
4. Verify imported records.
5. Generate embeddings.
6. Create search indexes.
7. Run automated smoke tests.
8. Test with real store staff.
9. Correct critical issues.
10. Open normal production access.
```

## Deliverable

Production deployment.

## Phase Completion Condition

A staff member can complete the core price-lookup flow using real store data.

---

# 34. Phase 29 — Real Store Validation

## Objective

Confirm the application solves the original problem.

## Test Participants

- You.
- Your mother.
- One or two other attendants.

## Validation Tasks

Ask each person to:

- Find a known drug.
- Find a partially remembered drug.
- Find a drug by common name.
- Find a price.
- Find a shelf location.
- Find an out-of-stock product.
- Add or update a drug if authorized.
- Search using a natural phrase.
- Use the application during poor connectivity.

## Record

- Time taken.
- Failed searches.
- Misspellings.
- Confusing labels.
- Missing fields.
- Incorrect shelf information.
- Unnecessary steps.
- Features users ignore.
- Features users request.

## Deliverable

```text
/docs/store-validation-report.md
```

## Phase Completion Condition

The core lookup task should be faster than the existing manual process.

---

# 35. Phase 30 — Documentation

## Objective

Make the project easy for recruiters and developers to understand.

## README Sections

- Project summary.
- Problem.
- Solution.
- Screenshots.
- Technology stack.
- Architecture.
- Search flow.
- AI role.
- AI safety boundaries.
- Local setup.
- Environment variables.
- Testing.
- Deployment.
- Known limitations.
- Roadmap.

## Architecture Documentation

Document:

```text
User
→ Next.js interface
→ Search service
→ MongoDB Search
→ Voyage query embedding
→ MongoDB Vector Search
→ Verified drug records
```

## AI Documentation

Explain:

- Why embeddings are generated once per drug.
- Why query embeddings are generated during semantic searches.
- Why exact data is not embedded.
- Why AI cannot save directly to the database.
- Why diagnosis is excluded.

## Deliverable

Professional repository documentation.

## Phase Completion Condition

A recruiter should understand the project’s engineering value without reading the source code.

---

# 36. Phase 31 — Portfolio Case Study

## Objective

Present the project as evidence of remote-role readiness.

## Case Study Structure

### Problem

You often help in your mother’s chemist but cannot remember every drug price, use, and location.

### Previous Version

Explain:

- Basic drug records.
- Single price.
- Limited search.
- No structured pricing.
- No audit history.
- No intelligent retrieval.
- No offline support.

### New Solution

Explain:

- Multi-unit pricing.
- Search and autocomplete.
- Embeddings.
- Hybrid search.
- Label extraction.
- Human review.
- Offline catalogue.
- Testing.
- CI/CD.
- Monitoring.

### Technical Decisions

Explain:

- Why MongoDB was retained.
- Why vector search was added.
- Why Voyage was selected.
- Why AI is not used for every search.
- Why diagnosis is excluded.
- Why offline mode is read-only initially.
- Why embeddings exclude prices and stock.

### Measurable Results

Measure:

- Average lookup time.
- Search success rate.
- Number of migrated records.
- Number of duplicate records corrected.
- Number of automated tests.
- Build and deployment reliability.
- Reduction in manual data-entry time.

## Portfolio Summary

Use:

> Built an AI-powered, offline-capable pharmacy inventory and price-lookup platform using Next.js, TypeScript, Node.js, and MongoDB. Implemented hybrid retrieval with autocomplete, fuzzy matching, and vector search; generated structured product data from medicine labels; and grounded all AI-assisted results in verified inventory records. Added role-based authorization, audit logs, price history, automated testing, CI/CD, and offline catalogue access.

## Deliverable

A complete portfolio case study.

## Phase Completion Condition

The case study must explain the engineering decisions, not merely list the technologies.

---

# 37. Suggested GitHub Milestones

## Milestone 1 — Foundation

- [ ] Repository setup.
- [ ] Design system.
- [ ] MongoDB connection.
- [ ] Models.
- [ ] Validation.
- [ ] Authentication.

## Milestone 2 — Core Inventory

- [ ] Drug CRUD.
- [ ] Multi-unit prices.
- [ ] Stock management.
- [ ] Price history.
- [ ] Audit logs.

## Milestone 3 — Migration and Search

- [ ] Migration script.
- [ ] Exact search.
- [ ] Autocomplete.
- [ ] Fuzzy search.
- [ ] Staff dashboard.

## Milestone 4 — AI Retrieval

- [ ] Embedding service.
- [ ] Embedding backfill.
- [ ] Vector index.
- [ ] Semantic search.
- [ ] Hybrid ranking.

## Milestone 5 — AI Administration

- [ ] Label extraction.
- [ ] AI review queue.
- [ ] Duplicate detection.
- [ ] Data-quality assistant.

## Milestone 6 — Reliability

- [ ] Vitest.
- [ ] Playwright.
- [ ] GitHub Actions.
- [ ] Monitoring.
- [ ] Security review.

## Milestone 7 — Offline and Launch

- [ ] IndexedDB.
- [ ] Offline search.
- [ ] PWA.
- [ ] Production deployment.
- [ ] Store validation.
- [ ] Case study.

---

# 38. Suggested First 30 Development Tasks

Use these as your first GitHub issues.

1. [ ] Initialize Next.js project.
2. [ ] Configure TypeScript strict mode.
3. [ ] Configure environment validation.
4. [ ] Create MongoDB connection utility.
5. [ ] Create drug TypeScript types.
6. [ ] Create drug Zod schemas.
7. [ ] Create Mongoose drug model.
8. [ ] Create price-history model.
9. [ ] Create stock-adjustment model.
10. [ ] Create audit-log model.
11. [ ] Configure Better Auth.
12. [ ] Add user roles.
13. [ ] Create login page.
14. [ ] Protect dashboard routes.
15. [ ] Protect admin routes.
16. [ ] Create admin layout.
17. [ ] Create drug-list page.
18. [ ] Create drug form.
19. [ ] Implement drug creation.
20. [ ] Implement drug editing.
21. [ ] Implement archiving and restoration.
22. [ ] Implement multi-unit pricing.
23. [ ] Implement price history.
24. [ ] Implement stock adjustment.
25. [ ] Implement audit logging.
26. [ ] Write old-data migration script.
27. [ ] Build staff dashboard.
28. [ ] Build exact drug search.
29. [ ] Add autocomplete.
30. [ ] Add fuzzy search.

After these are complete, begin embedding and semantic search work.

---

# 39. Suggested Next 20 AI and Reliability Tasks

31. [ ] Create deterministic embedding-text builder.
32. [ ] Create embedding-text hash function.
33. [ ] Integrate Voyage embedding API.
34. [ ] Generate embedding when drug is created.
35. [ ] Regenerate embedding when semantic fields change.
36. [ ] Backfill existing drug embeddings.
37. [ ] Create MongoDB Vector Search index.
38. [ ] Create query-embedding service.
39. [ ] Implement semantic search endpoint.
40. [ ] Implement hybrid result merging.
41. [ ] Add exact price filters.
42. [ ] Add stock filters.
43. [ ] Add search analytics.
44. [ ] Add AI query interpretation fallback.
45. [ ] Add label-image upload.
46. [ ] Add structured label extraction.
47. [ ] Add AI review queue.
48. [ ] Add Vitest suite.
49. [ ] Add Playwright suite.
50. [ ] Add GitHub Actions CI.

---

# 40. Daily Development Loop

Use this routine for each feature.

```text
1. Read the requirement.
2. Define the expected behaviour.
3. Write or update the data schema.
4. Write validation.
5. Write the server-side service.
6. Write authorization checks.
7. Write the interface.
8. Add loading and error states.
9. Add audit logging where required.
10. Write tests.
11. Run lint, type-check, and tests.
12. Commit with a clear message.
13. Open or update the pull request.
14. Update documentation.
```

Recommended commit examples:

```text
feat(drugs): add multi-unit pricing
feat(search): add autocomplete index
feat(ai): generate drug embeddings on create
test(pricing): cover price history updates
fix(auth): enforce admin role in drug update action
docs(search): explain hybrid retrieval flow
```

---

# 41. MVP Release Checklist

## Product

- [ ] Staff can log in.
- [ ] Admin can log in.
- [ ] Staff can search drugs.
- [ ] Prices are correct.
- [ ] Multiple selling units display correctly.
- [ ] Shelf location displays correctly.
- [ ] Stock status displays correctly.
- [ ] Admin can add and update drugs.
- [ ] Price history works.
- [ ] Audit logs work.
- [ ] Old records are migrated.

## Search

- [ ] Exact search works.
- [ ] Autocomplete works.
- [ ] Fuzzy search works.
- [ ] Semantic search works.
- [ ] Hybrid filters work.
- [ ] No invented products appear.
- [ ] Archived products are excluded.

## AI

- [ ] Drug embeddings are generated once per semantic change.
- [ ] Query embeddings are generated only when needed.
- [ ] AI output is validated.
- [ ] Label extraction requires approval.
- [ ] AI cannot change prices.
- [ ] AI cannot change stock.
- [ ] AI cannot diagnose or prescribe.

## Engineering

- [ ] TypeScript passes.
- [ ] Lint passes.
- [ ] Unit tests pass.
- [ ] End-to-end tests pass.
- [ ] Build passes.
- [ ] CI passes.
- [ ] Monitoring is connected.
- [ ] Production secrets are secured.
- [ ] Database backup exists.

## User Experience

- [ ] Mobile layout works.
- [ ] Desktop layout works.
- [ ] Keyboard navigation works.
- [ ] Loading states exist.
- [ ] Empty states exist.
- [ ] Errors are understandable.
- [ ] Primary price is visible immediately.
- [ ] Search is the most prominent action.

---

# 42. Final Definition of Done

Success Chemist version one is complete when:

1. Real drug records from the old application have been migrated.
2. Staff can retrieve a current price and shelf location quickly.
3. Administrators can safely update drugs, prices, and stock.
4. Every important change is auditable.
5. Exact, fuzzy, and semantic search work together.
6. AI-assisted results are grounded in MongoDB.
7. Embeddings are regenerated only when semantic fields change.
8. AI-generated product information requires human approval.
9. Automated tests cover critical workflows.
10. GitHub Actions prevents broken code from reaching production.
11. Production errors can be monitored.
12. The application has been tested by real users in the chemist.
13. The project is documented as a professional engineering case study.

---

# 43. Immediate Starting Point

Begin with these five tasks:

```text
1. Create the Next.js repository.
2. Finalize the new drug schema.
3. Configure MongoDB and Zod validation.
4. Implement authentication and roles.
5. Build the admin drug creation and editing workflow.
```

Do not start embeddings until normal drug creation, editing, pricing, and exact search are reliable.

The correct sequence is:

```text
Reliable inventory
→ reliable normal search
→ embeddings
→ vector search
→ hybrid search
→ AI-assisted administration
→ offline support
→ production hardening
```
