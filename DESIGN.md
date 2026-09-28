# ParrotMoney Design Context

Updated: 2026-09-28

## Product Register

ParrotMoney is a lending marketplace and decision tool. The public experience should help borrowers compare home-loan options clearly before they share personal details.

Primary journey:

Landing -> basic requirement -> indicative comparison -> progressive customer details and consent -> personalized comparison -> lender selection or application intent.

## Visual Direction

- Palette: near-white background `#f7faf7`, white surfaces, deep ink `#0f172a`, slate secondary text, restrained emerald accents, soft slate borders.
- Typography: use the existing Inter-based product typography. Hierarchy should come from weight, scale and spacing, not many colours.
- Layout: whitespace-heavy, editorially quiet, mobile-first, with tables as the primary comparison visual.
- Radius: restrained 6-8px for product surfaces and controls.
- Decoration: minimal. Icons support scanning but should not become the design language.

## Marketplace Rules

- Do not fabricate lender rates, partnerships, testimonials, approval odds, savings claims or regulatory status.
- Label comparison outputs as indicative until lender verification.
- Show rate, EMI, fee and fit context together where possible.
- Explain that final eligibility, approval, sanction and disbursement remain with the selected lender.
- Ask for only the data needed at the current step and keep consent visible before contact or lender handoff.

## Runtime Mapping

- Global product tokens live in `src/index.css` under the existing Tailwind theme names.
- Landing page implementation lives in `src/components/ParrotLanding.tsx`.
- Lead capture and consent live in `src/components/LeadCaptureFlow.tsx`.
- Transparent lender comparison logic lives in `src/services/lenderRecommendationService.ts`.

