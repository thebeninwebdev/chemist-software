# Success Chemist — AI-Powered Pharmacy Inventory and Price Retrieval Platform

## 1. Project Overview

Success Chemist is an AI-powered, offline-capable pharmacy inventory and price-retrieval platform designed for small community chemists.

The original purpose of the application is simple:

> Help an attendant quickly find a drug, view its current price, understand its basic approved use, and locate it inside the store.

The rebuilt version should preserve this purpose while introducing useful AI features that improve search, data entry, accessibility, and inventory management.

The system must not diagnose illnesses, prescribe medication, or replace a pharmacist. AI should help staff retrieve and understand verified information already stored in the application.

---

## 2. Core Product Principle

The application should follow this principle:

> AI helps staff find and understand verified store information faster; it does not replace professional medical judgement.

The application should always prefer verified database records over general AI knowledge.

AI may:

- Interpret natural-language searches.
- Correct likely spelling mistakes.
- Extract suggested fields from product labels.
- Simplify approved descriptions.
- Identify possible duplicate records.
- Answer questions using stored inventory information.

AI must not:

- Diagnose a customer.
- Recommend medication based only on symptoms.
- Invent stock availability or prices.
- Automatically save generated drug information without human review.
- Present unverified medical information as approved fact.

---

## 3. Main Users

### 3.1 Staff

Staff members are attendants who need fast access to drug information.

Staff should be able to:

- Search for drugs.
- Search using natural language.
- Search using voice.
- View current prices.
- View all available selling units.
- View shelf locations.
- View stock status.
- Read simple approved drug information.
- View related products already in the inventory.
- Continue searching when the internet connection is unavailable.

Staff should not be able to:

- Delete drugs.
- Manage users.
- Approve AI-generated medical information.
- Edit protected administrative settings.

### 3.2 Administrator

Administrators manage the application and inventory.

Administrators should be able to:

- Add, edit, archive, and restore drug records.
- Update prices.
- Manage stock.
- Import records from CSV.
- Review duplicate records.
- Review AI-generated suggestions.
- Manage users and roles.
- View audit logs.
- Review price history.
- Review stock adjustment history.
- Manage categories, dosage forms, aliases, and shelf locations.

### 3.3 Pharmacist or Authorised Reviewer

This role can be introduced when qualified personnel are available.

The pharmacist or authorised reviewer should be able to:

- Review and approve drug descriptions.
- Review warnings and usage information.
- Review related products.
- Approve AI-generated medical content.
- Correct active ingredients and prescription status.
- Review advanced enquiries.

---

## 4. User Roles

```ts
type UserRole = "ADMIN" | "PHARMACIST" | "STAFF";
```

Suggested permissions:

| Feature                     | Staff | Pharmacist | Admin |
| --------------------------- | ----: | ---------: | ----: |
| Search drugs                |   Yes |        Yes |   Yes |
| View prices                 |   Yes |        Yes |   Yes |
| View shelf location         |   Yes |        Yes |   Yes |
| View stock status           |   Yes |        Yes |   Yes |
| Edit drug records           |    No |    Limited |   Yes |
| Update prices               |    No |    Limited |   Yes |
| Approve medical information |    No |        Yes |   Yes |
| Import CSV                  |    No |         No |   Yes |
| Manage users                |    No |         No |   Yes |
| View audit logs             |    No |    Limited |   Yes |
| Review AI suggestions       |    No |        Yes |   Yes |

Every sensitive action must verify the user's role on the server. Hiding a button in the interface is not sufficient authorization.

---

## 5. Recommended Technology Stack

### Core Application

- Next.js App Router
- React
- TypeScript
- Node.js
- Tailwind CSS
- shadcn/ui

### Database and Search

- MongoDB Atlas
- Mongoose
- MongoDB Search

### Authentication and Validation

- Better Auth
- Zod

### AI

- Vercel AI SDK or another provider-independent TypeScript AI SDK
- Structured AI outputs
- Tool calling
- Human approval workflows

### Offline Support

- IndexedDB
- Dexie.js
- Service worker
- Progressive Web App manifest
- Serwist or another maintained Next.js service-worker solution

### Testing and Quality

- Vitest
- Playwright
- ESLint
- TypeScript strict mode

### Deployment and Operations

- GitHub Actions
- Vercel
- Sentry or equivalent monitoring
- MongoDB Atlas backups
- Structured server logs

---

## 6. Primary Application Experience

The dashboard should be designed around one main action: searching for a drug.

The home page should not begin with complicated reports or large analytics cards.

Suggested layout:

```text
Success Chemist

What drug are you looking for?

[ Search by name, brand, active ingredient, use, category or description ]

[Voice Search] [Scan Barcode]

Recent searches
Frequently requested drugs
Low-stock notices
Recently updated prices
```

The search field should receive focus automatically when the page opens on desktop.

---

## 7. Core Search Workflow

### 7.1 Standard Search

A user enters:

```text
Panadol
```

The application returns:

```text
Panadol Regular
Paracetamol 500mg
Panadol Extra
Panadol Children's Syrup
```

Each search result should show:

- Product name.
- Common or generic name.
- Strength.
- Dosage form.
- Current price.
- Primary selling unit.
- Availability.
- Shelf location.

Example result:

```text
Panadol Extra

Form: Tablet
Strength: Paracetamol 500mg + Caffeine 65mg

1 tablet: ₦150
1 strip: ₦1,500
1 pack: ₦15,000

Status: In stock
Location: Top-right shelf
```

Users should not need to open a separate page before seeing the main price.

### 7.2 Searchable Fields

The search index should include:

- Name.
- Common name.
- Active ingredients.
- Aliases.
- Common misspellings.
- Manufacturer.
- Category.
- Dosage form.
- Strength.
- Description.
- Shelf location.

### 7.3 Search Features

The search system should support:

- Autocomplete.
- Partial words.
- Fuzzy matching.
- Relevance ranking.
- Typo tolerance.
- Alias matching.
- Filters.
- Pagination.
- Keyboard navigation.
- Search analytics.

---

## 8. AI-Powered Natural-Language Search

The user should be able to type requests such as:

```text
Show me paracetamol syrups below ₦3,000.
```

The AI should convert the request into structured filters:

```ts
{
  searchTerm: "paracetamol",
  dosageForm: "syrup",
  maximumPrice: 3000,
  availability: "in_stock"
}
```

The structured filters must be validated before being used.

Recommended flow:

```text
User request
→ AI search interpreter
→ Structured output
→ Zod validation
→ MongoDB Search and filters
→ Verified inventory results
```

The AI must not generate product results from its own knowledge. Every displayed product must exist in the Success Chemist database.

### Example Natural-Language Queries

```text
Where is the small Panadol pack?
```

```text
Show me pain-relief tablets that are currently available.
```

```text
Find the white amoxicillin packet made by Emzor.
```

```text
Which paracetamol products can be sold as one tablet?
```

```text
Show me drugs below ₦2,000 on the top-right shelf.
```

```text
What drugs had their prices changed recently?
```

---

## 9. Misspelling and Query Correction

The application should understand common mistakes.

Example:

```text
amoxilin
```

Suggested response:

```text
Did you mean Amoxicillin?
```

The system should combine:

- MongoDB Search fuzzy matching.
- Saved aliases.
- Common misspellings.
- AI-assisted correction.
- Search history.

The interface should reveal the correction instead of silently changing the user's meaning.

Example:

```text
Showing results for "Amoxicillin"
Search instead for "amoxilin"
```

---

## 10. Voice Search

The user should be able to press a microphone button and say:

> How much is Panadol Extra per card?

Suggested flow:

```text
Capture voice
→ Convert speech to text
→ Display transcript
→ Interpret "card" as "strip"
→ Search verified inventory
→ Display the current result
```

Example result:

```text
Panadol Extra

Strip price: ₦1,500
Stock: 6 strips
Location: Top-right shelf
```

Requirements:

- Always display the transcript.
- Allow the user to edit the transcript.
- Do not execute uncertain searches without showing the interpretation.
- Handle Nigerian accents and local selling terms where possible.
- Store approved local vocabulary such as "card", "roll", or "satchet" as aliases.

---

## 11. Barcode Scanning

Users should be able to scan a barcode using a phone camera or connected scanner.

Workflow:

```text
Scan barcode
→ Search local or remote catalogue
→ Find matching product
→ Display price, location and availability
```

When no product matches:

```text
No product matches this barcode.

[Search manually]
[Send to administrator for review]
```

The unmatched barcode should be placed in an administrator review queue.

---

## 12. Drug Information Assistant

Each drug details page should include an `Ask about this drug` section.

Supported questions may include:

```text
What is this drug generally used for?
```

```text
Does this product come as a syrup?
```

```text
Where is it located?
```

```text
What units can we sell it in?
```

```text
Do we have another brand with the same active ingredient?
```

The assistant must answer using:

- The current drug record.
- Approved product information.
- Verified related inventory records.
- Approved internal notes.

The answer should separate store information from approved product information.

Example:

```text
Store information

Panadol Regular is available.
Tablet price: ₦100
Strip price: ₦1,000
Location: Top-right shelf.

Approved product information

Panadol contains paracetamol and is commonly used for the
temporary relief of mild to moderate pain and fever.
```

The response should display:

- The records used.
- The date the information was last reviewed.
- Whether the information was approved by an authorised reviewer.

---

## 13. Related Inventory Products

The user may ask:

```text
Do we have another brand of paracetamol?
```

The application can show related products with the same approved active ingredient.

Example:

```text
Related products in inventory

- Panadol Regular
- Emzor Paracetamol
- M&B Paracetamol
- Paracetamol Syrup
```

Display the following warning:

> Related products are shown for inventory reference. Confirm suitability with a pharmacist or authorised professional.

The system must not tell staff to substitute one medicine for another automatically.

---

## 14. Symptom-Based Questions

The first version must not prescribe medication from symptoms.

When a user enters:

```text
What can I take for stomach pain?
```

The application should respond safely:

```text
Success Chemist cannot diagnose a medical condition from symptoms alone.

I can help you:
- find a product requested by name;
- show approved information about products in this store;
- locate a pharmacist or authorised attendant;
- identify when professional medical attention may be required.
```

A future pharmacist-only decision-support mode may collect structured information, but it must support professional judgement rather than replace it.

---

## 15. AI-Assisted Product Entry

Administrators should be able to upload a photograph of a drug packet or label.

The AI may suggest:

```text
Product name: Amoxicillin
Strength: 500mg
Dosage form: Capsule
Manufacturer: Emzor
Pack size: 10 capsules
Active ingredient: Amoxicillin
Prescription status: Requires review
```

The application must label the output clearly:

```text
AI-generated suggestion — not yet saved
```

Workflow:

```text
Upload image
→ Extract visible text
→ AI returns structured fields
→ Validate fields
→ Compare against possible duplicates
→ Administrator reviews and edits
→ Administrator confirms
→ Save approved record
```

AI-generated data must never be written directly to the database without human confirmation.

---

## 16. Data Quality Assistant

The AI data-quality assistant should identify:

- Possible duplicate products.
- Missing active ingredients.
- Inconsistent spelling.
- Missing dosage forms.
- Missing strengths.
- Suspicious price differences.
- Conflicting package sizes.
- Unrecognised selling units.
- Products without shelf locations.
- Products without recent review dates.

Example message:

```text
Possible duplicate detected

"Panadol Extra 500mg"
"Panadol Extra Tablet"

Similarity: 94%

[Compare records]
[Merge]
[Keep separate]
```

The final decision must remain with an administrator.

---

## 17. Drug Data Model

```ts
interface Drug {
  id: string;

  name: string;
  slug: string;
  commonName?: string;
  aliases: string[];
  commonMisspellings: string[];

  activeIngredients: ActiveIngredient[];

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

  isArchived: boolean;

  lastReviewedAt?: Date;
  reviewedBy?: string;

  createdBy: string;
  updatedBy: string;

  createdAt: Date;
  updatedAt: Date;
}
```

### 17.1 Active Ingredient

```ts
interface ActiveIngredient {
  name: string;
  strength?: string;
}
```

### 17.2 Drug Price

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

interface DrugPrice {
  id: string;
  unit: PriceUnit;
  customUnit?: string;
  quantityPerUnit?: number;
  sellingPrice: number;
  currency: "NGN";
  isPrimary: boolean;
  updatedAt: Date;
}
```

### 17.3 Stock Information

```ts
interface StockInformation {
  status: "in_stock" | "low_stock" | "out_of_stock";
  quantity?: number;
  baseUnit?: string;
  reorderLevel?: number;
  nearestExpiryDate?: Date;
  lastUpdatedAt: Date;
}
```

### 17.4 Approved Drug Information

```ts
interface ApprovedDrugInformation {
  generalUse?: string;
  warnings?: string[];
  storageInstructions?: string;
  sourceReferences?: string[];
  approvalStatus: "draft" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: Date;
}
```

---

## 18. Price History

Every price change must create a history record.

```ts
interface PriceHistory {
  id: string;
  drugId: string;
  unit: string;
  oldPrice: number;
  newPrice: number;
  reason?: string;
  changedBy: string;
  changedAt: Date;
}
```

Example:

```text
Drug: Panadol Extra
Unit: Strip
Old price: ₦1,300
New price: ₦1,500
Changed by: Administrator
Changed at: July 31, 2026
Reason: Supplier price increase
```

The previous value must not disappear when a price changes.

---

## 19. Stock Management

The first stock-management version should support:

- In stock.
- Low stock.
- Out of stock.
- Quantity available.
- Reorder level.
- Expiry date.
- Stock adjustment history.

Suggested stock adjustment types:

```ts
type StockAdjustmentType =
  | "received"
  | "sold"
  | "damaged"
  | "expired"
  | "correction"
  | "returned";
```

Example:

```text
Received: 10 packs
Removed as damaged: 1 strip
Current quantity: 9 packs and 9 strips
```

The first version does not need to become a full accounting or point-of-sale platform.

---

## 20. Audit Logs

Important actions must create audit events.

Examples:

```text
Admin changed Panadol strip price.
Staff marked Amoxicillin as out of stock.
Admin imported 127 drugs.
Pharmacist approved a drug description.
Admin changed a shelf location.
Admin merged two duplicate products.
```

Suggested audit model:

```ts
interface AuditLog {
  id: string;
  actorId: string;
  actorRole: UserRole;
  action: string;
  entityType: "drug" | "price" | "stock" | "user" | "import" | "ai_review";
  entityId?: string;
  previousValue?: unknown;
  newValue?: unknown;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
```

---

## 21. Offline Operation

The application should store a read-only local copy of essential drug information.

Offline data may include:

- Name.
- Common name.
- Aliases.
- Current prices.
- Dosage form.
- Availability.
- Shelf location.
- Barcode.
- Last synchronised time.

Offline workflow:

```text
User opens application online
→ Download latest catalogue
→ Save catalogue to IndexedDB
→ Internet connection is lost
→ Search local catalogue
→ Display offline notice
→ Connection returns
→ Synchronise latest records
```

Offline notice:

```text
Offline mode

Showing prices last synchronised at 9:35 AM.
Confirm recently changed prices when the connection returns.
```

Initial offline scope:

- Read-only drug search.
- Read-only drug details.
- Barcode lookup using cached data.
- Last-sync status.

Administrative editing should initially require an internet connection.

---

## 22. CSV Import and Migration

The old application stores records similar to:

```json
{
  "name": "Panadol",
  "price": 300,
  "comnName": "none",
  "desc": "Used to treat mild to moderate pain and reduce fever.",
  "location": "top-right shelf",
  "category": "common drug"
}
```

The new application must provide a migration path.

### 22.1 Import Workflow

```text
Upload CSV or old JSON export
→ Parse records
→ Validate each row
→ Map old fields to new fields
→ Detect duplicates
→ Preview proposed changes
→ Correct invalid rows
→ Import valid records
→ Produce import report
```

### 22.2 Example Field Mapping

| Old Field   | New Field                          |
| ----------- | ---------------------------------- |
| `name`      | `name`                             |
| `comnName`  | `commonName`                       |
| `desc`      | `description`                      |
| `location`  | `location`                         |
| `category`  | `category`                         |
| `price`     | `prices[0].sellingPrice`           |
| No old unit | Administrator selects default unit |

### 22.3 Import Report

The import report should show:

```text
Total rows: 250
Imported: 218
Skipped duplicates: 12
Invalid rows: 20
AI suggestions awaiting review: 74
```

AI may suggest missing categories, dosage forms, aliases, and strengths, but those suggestions must remain pending until approved.

---

## 23. Admin Dashboard

Suggested navigation:

```text
Overview
Drugs
Prices
Stock
Imports
AI Review Queue
Search Analytics
Users
Activity Log
Settings
```

### 23.1 Overview

Show:

- Total active products.
- Out-of-stock products.
- Low-stock products.
- Products without a shelf location.
- Products awaiting AI review.
- Recently changed prices.
- Recent imports.
- Failed background operations.

### 23.2 Drugs

Features:

- Search.
- Filters.
- Create.
- Edit.
- Archive.
- Restore.
- Duplicate.
- Compare.
- Merge.
- Bulk update.
- Export.

### 23.3 AI Review Queue

Queue types:

- Label extraction.
- Duplicate suggestions.
- Description simplification.
- Missing field suggestions.
- Alias suggestions.
- Suspicious prices.
- Unmatched barcodes.

Each suggestion should support:

- Approve.
- Edit and approve.
- Reject.
- Mark for later review.

---

## 24. Recommended Pages and Routes

### Public or Staff Routes

```text
/login
/dashboard
/search
/drugs/[drugId]
/scan
/offline
/profile
```

### Administrator Routes

```text
/admin
/admin/drugs
/admin/drugs/new
/admin/drugs/[drugId]/edit
/admin/prices
/admin/stock
/admin/imports
/admin/imports/[importId]
/admin/ai-review
/admin/users
/admin/audit-logs
/admin/settings
```

### API or Route Handlers

```text
/api/auth/*
/api/search
/api/ai/search-interpretation
/api/ai/label-extraction
/api/ai/data-quality
/api/drugs
/api/drugs/[drugId]
/api/drugs/[drugId]/prices
/api/drugs/[drugId]/stock
/api/imports
/api/barcodes/[barcode]
/api/sync/catalogue
```

Use Server Actions where they simplify trusted form submissions. Use Route Handlers when a reusable HTTP endpoint is needed.

---

## 25. AI Tool Architecture

Do not build one unrestricted chatbot.

Create small tools with narrow responsibilities.

### 25.1 Search Interpreter

Input:

```text
Show me available paracetamol syrups below ₦3,000.
```

Output:

```ts
{
  query: "paracetamol",
  dosageForm: "syrup",
  maxPrice: 3000,
  availability: "in_stock"
}
```

### 25.2 Query Corrector

Input:

```text
amoxilin
```

Output:

```ts
{
  original: "amoxilin",
  suggested: "amoxicillin",
  confidence: 0.94
}
```

### 25.3 Label Extractor

Input:

- Product image.

Output:

```ts
{
  name: "Amoxicillin",
  manufacturer: "Emzor",
  dosageForm: "capsule",
  strength: "500mg",
  packSize: "10 capsules"
}
```

### 25.4 Description Simplifier

Input:

- Approved technical description.

Output:

- A simpler explanation that remains linked to the approved source.

### 25.5 Data-Quality Assistant

Input:

- Product record or group of similar records.

Output:

- Missing fields.
- Possible duplicate.
- Inconsistency.
- Suggested correction.

### 25.6 Inventory Assistant

Input:

```text
Which paracetamol products are in stock?
```

The tool must query the database and return only verified records.

### 25.7 Required AI Pattern

```text
User request
→ Select narrow AI tool
→ Generate structured output
→ Validate with Zod
→ Query verified data or create preview
→ Require human confirmation where necessary
```

---

## 26. Security Requirements

- Use secure session cookies.
- Hash passwords using a trusted authentication library.
- Validate every input on the server.
- Authorize every protected action on the server.
- Rate-limit authentication and AI endpoints.
- Do not expose AI provider keys to the browser.
- Do not expose MongoDB credentials to the browser.
- Log important administrative actions.
- Protect file uploads by type and size.
- Scan or reject unsupported uploads.
- Do not send unnecessary customer or patient information to AI providers.
- Store the minimum personal information required.
- Use environment-variable validation.
- Configure least-privilege database access.
- Back up the database.
- Protect production branches and required CI checks.

---

## 27. Privacy Requirements

The application is primarily an inventory system, not a patient-record system.

The first version should not store:

- Patient medical histories.
- Diagnoses.
- Prescriptions belonging to customers.
- Sensitive symptom conversations.
- Personally identifying health information.

Search analytics should avoid storing unnecessary personal data.

Voice transcripts should be deleted after processing unless explicit logging is required for debugging and has been safely anonymised.

---

## 28. Testing Strategy

### 28.1 Unit Tests with Vitest

Test:

- Price calculations.
- Unit conversion.
- Search normalisation.
- Permission helpers.
- Zod schemas.
- CSV field mapping.
- Migration functions.
- Stock status calculation.
- AI structured-output validation.
- Duplicate scoring helpers.

### 28.2 Integration Tests

Test:

- Drug creation.
- Price updates.
- Stock updates.
- Audit-log creation.
- Search queries.
- Role authorization.
- CSV imports.
- AI review approval.

### 28.3 End-to-End Tests with Playwright

#### Search Flow

```text
Staff logs in
→ Searches for Panadol
→ Opens result
→ Sees price and shelf location
```

#### Product Creation

```text
Admin logs in
→ Creates a drug
→ Adds multiple selling units
→ Saves
→ Searches for the drug
→ Confirms saved data
```

#### Price History

```text
Admin changes a price
→ New price is displayed
→ Old price remains in history
→ Audit log is created
```

#### CSV Import

```text
Admin uploads CSV
→ Invalid rows are rejected
→ Valid rows are previewed
→ Admin confirms import
→ Import report is displayed
```

#### AI Label Extraction

```text
Admin uploads label image
→ AI returns suggested fields
→ Admin edits a field
→ Admin approves
→ Product is saved
```

#### Offline Search

```text
Application synchronises catalogue
→ Browser goes offline
→ User searches cached drug
→ Cached price and last-sync time appear
```

#### Authorization

```text
Staff attempts to open admin route
→ Access is rejected
→ No sensitive data is returned
```

---

## 29. GitHub Actions Workflow

Every pull request should run:

```text
Install dependencies
→ Lint
→ Type-check
→ Run unit tests
→ Run integration tests
→ Build application
→ Run Playwright tests
```

Recommended branch rules:

- Protect `main`.
- Require passing CI.
- Require at least one review where possible.
- Prevent direct force pushes.
- Use Dependabot or another dependency update process.
- Keep secrets out of workflow logs.

---

## 30. Monitoring and Observability

Monitor:

- Server errors.
- Failed database operations.
- Failed AI requests.
- Slow search queries.
- Failed imports.
- Authentication failures.
- Service-worker errors.
- Offline synchronisation failures.
- Unexpected AI output validation failures.

Logs should include:

- Request ID.
- User ID where appropriate.
- Action.
- Entity ID.
- Error code.
- Duration.
- Timestamp.

Do not log secrets, passwords, or sensitive medical information.

---

## 31. Performance Requirements

- Search results should appear quickly.
- Use database indexes.
- Debounce search-as-you-type requests.
- Cache appropriate read-only data.
- Avoid sending complete drug records when summaries are sufficient.
- Paginate large result sets.
- Lazy-load heavy AI and scanning features.
- Optimise uploaded product images.
- Keep the initial dashboard bundle small.
- Allow keyboard-based operation for desktop attendants.

Suggested targets:

- Search response under one second for normal inventory size.
- Dashboard usable within three seconds on a moderate mobile connection.
- Offline search available immediately after the catalogue has been synchronised.

---

## 32. Accessibility Requirements

- Support keyboard navigation.
- Provide visible focus states.
- Use semantic labels.
- Ensure adequate contrast.
- Provide text alternatives for icons.
- Announce search result changes.
- Support screen readers.
- Avoid relying only on colour for stock status.
- Make buttons large enough for mobile use.
- Allow text enlargement without breaking the interface.

---

## 33. Implementation Phases

### Phase 1 — Reliable Core System

Build:

- Authentication.
- User roles.
- New drug schema.
- Migration scripts.
- Standard drug search.
- Drug details.
- Multi-unit pricing.
- Shelf location.
- Stock status.
- Admin drug management.
- Price history.
- Audit logging.

Success criteria:

- Staff can find any migrated drug.
- Admin can add and update drugs.
- Prices display correctly.
- Every price change creates history.
- Protected actions enforce roles.

### Phase 2 — Intelligent Search

Build:

- MongoDB Search index.
- Autocomplete.
- Fuzzy search.
- Alias matching.
- Search filters.
- AI search interpreter.
- Query correction.
- Search analytics.

Success criteria:

- Partial and misspelled queries return useful results.
- Natural-language queries produce valid filters.
- AI cannot return products absent from the database.

### Phase 3 — Production Reliability

Build:

- Vitest tests.
- Playwright tests.
- GitHub Actions.
- Sentry monitoring.
- CSV import.
- Import reports.
- Database backups.
- Structured logging.

Success criteria:

- CI blocks broken builds.
- Critical workflows have automated coverage.
- Failed imports produce understandable reports.
- Production errors can be traced.

### Phase 4 — Offline and PWA

Build:

- PWA manifest.
- Service worker.
- IndexedDB catalogue.
- Offline search.
- Last-sync indicator.
- Online/offline status.

Success criteria:

- Staff can search cached products without internet.
- Offline data clearly displays its last-sync time.
- Administrative writes remain disabled offline.

### Phase 5 — Multimodal AI

Build:

- Voice search.
- Barcode scanning.
- Label image extraction.
- AI review queue.
- Description simplification.
- Duplicate detection assistant.

Success criteria:

- AI output is schema-validated.
- Generated data cannot bypass review.
- Users can correct voice transcripts.
- Unmatched barcodes enter the review queue.

### Phase 6 — Advanced Operations

Consider later:

- Suppliers.
- Purchase orders.
- Stock batches.
- Expiry tracking.
- Sales.
- Receipts.
- Multiple branches.
- Advanced analytics.
- Pharmacist-only decision support.

---

## 34. Minimum Viable Product

The first deployable version should include:

- Login.
- Staff and admin roles.
- Drug migration.
- Search.
- Autocomplete.
- Drug details.
- Multiple price units.
- Shelf location.
- Availability.
- Admin drug creation and editing.
- Price history.
- Audit logs.
- Responsive interface.
- Basic tests.
- GitHub Actions.

Do not delay the first release for:

- Voice search.
- Image extraction.
- Advanced AI assistant.
- Full offline editing.
- Supplier management.
- Full point-of-sale features.

---

## 35. Definition of Done

A feature is complete when:

- It works on desktop and mobile.
- Inputs are validated.
- Authorization is enforced on the server.
- Loading, empty, success, and error states exist.
- Important actions create audit logs.
- Tests cover the main behaviour.
- Accessibility has been considered.
- No secrets are exposed.
- Documentation is updated.
- CI passes.

---

## 36. Portfolio Positioning

Project title:

> Success Chemist — AI-Powered Pharmacy Inventory and Price Retrieval Platform

Portfolio summary:

> Built an AI-powered, offline-capable pharmacy inventory and price-lookup platform using Next.js, TypeScript, Node.js, and MongoDB. The system converts natural-language and voice queries into validated inventory searches, supports fuzzy drug-name matching, multi-unit pricing, offline catalogue access, and AI-assisted label extraction. Implemented role-based access control, audit logs, price history, automated testing, and CI/CD while requiring human review before AI-generated data enters the inventory.

Key engineering themes:

- AI integration.
- Structured outputs.
- Retrieval from trusted data.
- Human-in-the-loop workflows.
- Search engineering.
- Offline-first architecture.
- Authentication and authorization.
- Data migration.
- Testing.
- CI/CD.
- Production monitoring.
- Responsible product design.

---

## 37. Final Product Statement

Success Chemist should not be presented as a general pharmacy chatbot.

It should be presented as:

> An AI-powered, offline-capable pharmacy inventory and price-retrieval platform built for small community chemists.

The product succeeds when an attendant can quickly answer:

- Do we have this drug?
- What is its current price?
- Which unit can we sell?
- Where is it kept?
- Is it currently in stock?
- What approved information do we have about it?
- Are there related products already in the inventory?

The AI layer should make these answers easier to retrieve while keeping the database, authorised staff, and approved sources as the final authority.
