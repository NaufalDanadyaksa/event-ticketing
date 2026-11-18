# Workflow Governance & Implementation Protocol

## Rules for Feature Creation, Revisions, and Bug Fixes

Whenever a user requests a new feature, revision, or bug fix in this repository:

1. **Step 1: Write `implementation_plan.md`**
   - Must be written in the project workspace or conversation artifact.
   - Must cover:
     - Feature / Bug summary and root cause analysis.
     - Clean Architecture mapping (Domain entities, Use cases, DTOs, Repositories, Controllers, UI views).
     - Database changes (Prisma schema modifications).
     - API contract (Endpoints, methods, payload schema, response shape).
     - Edge cases, error handling, security aspects (e.g. ticket duplication, QR tampering).

2. **Step 2: Write `task.md` (Extreme Detail, Phase-Based)**
   - Must be broken down into granular, sequential phases:
     - `Phase 1: Shared Models, Schemas & DTOs (packages/shared)`
     - `Phase 2: Database Layer & Prisma Migrations`
     - `Phase 3: Domain Entities, Repositories & Use Cases (apps/backend/src/domain, use-cases)`
     - `Phase 4: API Controllers, Routes & Middleware (apps/backend/src/controllers)`
     - `Phase 5: Frontend Views, State & Camera Scanners (apps/frontend/src)`
     - `Phase 6: Integration Testing, Error Handling & Edge Case Verification`
   - Every single task must have a checkbox `[ ]` and explicit acceptance criteria.

3. **Step 3: User Confirmation Gate (DO NOT EXECUTE PREMATURELY)**
   - Stop and present both documents to the user.
   - Do NOT run build, install, scaffold code, or modify source files until the user explicitly responds with an execution command (e.g., "eksekusi", "lanjutkan", "mulai coding", "proceed").
