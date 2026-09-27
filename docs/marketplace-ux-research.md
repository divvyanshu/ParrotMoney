# ParrotMoney Marketplace UX & Trust Research

Updated: 2026-09-27

## Executive direction

ParrotMoney should behave like a **loan marketplace and decision tool**, not like a lender dashboard.

The primary customer journey should be:

1. Tell us what you need
2. Compare relevant options
3. Understand the total cost and key terms
4. Shortlist
5. Continue to the selected lender
6. Track the application

The visual system should stay minimalist: strong typography, generous whitespace, restrained colour, compact comparison surfaces, purposeful motion and clear disclosures.

## Research signals

### India / RBI

RBI's framework for web-aggregation of loan products explicitly describes aggregation as a service that lets borrowers compare loan offers from multiple lenders and focuses on transparency, customer centricity and informed choice. (RBI, 2023)

RBI's digital-lending guidance requires important loan information to be presented clearly. RBI material also states that digital displays should include lender name, loan amount, APR, tenor and associated terms, and that LSPs should not use dark patterns to push borrowers toward an unsuitable offer.

RBI guidance also emphasizes disclosure of the all-inclusive cost of a digital loan as APR and need-based data collection with explicit consent.

### International comparison products

MoneySuperMarket presents a direct comparison workflow with representative rates, loan amount bands and an eligibility action. It explicitly labels itself as a credit broker rather than a lender and explains what a representative rate means. This is a useful pattern for ParrotMoney: **show the comparison and explain the meaning of the displayed number immediately.**

NerdWallet's current comparison guidance recommends looking beyond the headline rate and considering fees, repayment terms, funding time and lender flexibility. Its pre-qualification experience also separates potential matches from final lender approval and explains that displayed rates are not guaranteed.

NerdWallet's matching documentation makes the same distinction: a matched or pre-qualified offer is not guaranteed approval and final terms depend on the lender's full review.

## Product principles

### 1. Comparison before conversion

The marketplace should optimize for **decision quality**, not simply the number of application clicks.

Primary CTA:
- Compare offers

Secondary:
- Calculate EMI
- Learn how comparison works

Avoid making "Apply Now" the dominant action before the user has seen the options.

### 2. Total-cost-first disclosure

A lender row should make these easy to see:

- Interest rate / rate type
- APR or applicable all-in cost measure where available
- EMI
- Tenure
- Processing fee
- Material additional charges
- Eligibility assumptions
- Offer freshness / last updated time
- Lender name
- Indicative vs confirmed status

Do not make the user open five accordions to discover material charges.

### 3. No black-box ranking

If ParrotMoney uses a matching score, explain:

- what inputs affect it
- which data is user supplied
- which lender criteria are known
- whether the score is a match indicator or an approval probability
- when the result was last calculated

Prefer user-controlled comparison preferences such as:
- lowest monthly payment
- lowest total cost
- higher eligibility fit
- faster processing
- lower fees

Do not present a mysterious score as if it were an objective financial verdict.

### 4. Clear marketplace role

Every relevant journey should make it obvious whether ParrotMoney is:
- a marketplace / aggregator,
- a lender,
- an LSP,
- or another intermediary.

Where required, identify the lender and make lender-specific terms accessible before the customer proceeds.

### 5. Data minimisation

Ask only for information needed for the current step.

Recommended funnel:

**Step 1:** loan purpose, amount, location  
**Step 2:** property / income basics  
**Step 3:** eligibility information  
**Step 4:** consent and documents only when required

Explain why sensitive information is needed before collecting it.

### 6. No dark-pattern conversion

Avoid:
- visually hiding alternatives
- preselecting a lender without clear explanation
- fake countdown timers
- misleading "guaranteed" labels
- fabricated savings
- invented approval rates
- ambiguous sponsored placement
- disabling the back path

Sponsored or commercial relationships should be disclosed in plain language.

## Recommended information architecture

### Public navigation

**Products**
- Home Loan
- Loan Transfer
- Loan Against Property
- Plot Loan
- Plot + Construction
- Commercial Property
- NRI

**Tools**
- EMI Calculator
- Eligibility Calculator
- Loan Comparison

**Learn**
- Guides
- RBI / rate updates
- FAQs

**About**
- How ParrotMoney works
- Lender relationships
- Disclosures
- Privacy

Primary header action:
**Compare offers**

Returning users:
**Sign in**

### Marketplace result page

Header:
- Search / profile summary
- Edit inputs
- Compare selected

Controls:
- Loan amount
- Tenure
- Rate type
- Lender type
- Eligibility filters
- Sort / compare preference

Result row:
- Lender identity
- Indicative rate
- EMI
- Total cost / applicable APR
- Fees
- Key eligibility note
- Updated timestamp
- Compare checkbox
- View details

### Offer detail

Use a compact "Key facts" panel first.

Then:
- Rate
- EMI
- Tenure
- Fees
- Total payable / interest
- Prepayment / foreclosure terms where relevant
- Eligibility conditions
- Required documents
- Lender disclosure
- Data freshness

CTA:
**Continue to lender**

## Visual direction

### Palette

- Background: near-white
- Primary text: deep ink
- Secondary text: slate
- Accent: restrained emerald
- Borders: soft grey
- Warning: reserved amber
- Error: reserved red

### Typography

Use one highly legible sans-serif family for the product UI.

Hierarchy should come primarily from:
- size
- weight
- spacing
- alignment

not from many colours.

### Cards

Use cards only when they create a useful grouping.

Avoid:
- excessive rounded containers
- giant shadows
- gradient-heavy backgrounds
- floating metric bubbles
- decorative dashboards on the homepage

### Charts

Use charts when they answer a customer question:

- EMI vs tenure
- principal vs interest
- total cost comparison
- rate-change history
- application progress

Do not use charts as decoration.

### Motion

Use short transitions for:
- filtering
- expanding details
- comparing
- calculator updates
- application progress

Respect the user's reduced-motion accessibility preference.

## Data-quality requirements

Before production launch, replace all illustrative/demo lender data with verified data feeds or clearly marked examples.

Every dynamic lender offer should have:

- source
- timestamp
- validity period
- lender
- product
- geography
- borrower assumptions
- rate type
- fees
- eligibility assumptions
- disclosure state

A stale or unavailable offer should not silently look identical to a current offer.

## Engineering workflow

Recommended release path:

1. Feature branch
2. Local build
3. Type-check + lint
4. Automated CI
5. Security/rules validation
6. UX review
7. Small production release
8. Monitor errors and funnel drop-off

main should remain deployable.

The repository CI workflow now runs for pushes to main and pull requests targeting main, with read-only workflow permissions, concurrency cancellation and a timeout.

## Success metrics

The marketplace should measure:

- percentage reaching comparison results
- time to first comparable offer
- comparison interaction rate
- offer-detail open rate
- shortlist rate
- application-start rate
- application completion rate
- abandonment by funnel step
- customer support contacts caused by unclear terms
- stale-offer incidence
- disclosure visibility / acknowledgement
- mobile completion rate

The most important product metric should not be raw application clicks. It should combine **qualified comparison engagement, completion and downstream customer outcomes**.

## Immediate implementation priorities

### P0
- Replace all fake lender / rate / savings claims in production-facing UI.
- Build the comparison result model around verified lender data.
- Add offer freshness and indicative/final status.
- Show material fees and terms without hiding them.
- Make the marketplace/lender role explicit.
- Verify consent and data-sharing flows.

### P1
- Rework comparison table for desktop.
- Create a mobile comparison pattern.
- Add side-by-side offer comparison.
- Add total-cost and EMI visualisation.
- Add transparent matching explanation.

### P2
- Personalised comparison preferences.
- Saved shortlist.
- Application tracking.
- Lender SLA / status tracking.
- Analytics and experiment framework.

## Bottom line

ParrotMoney's differentiation should come from **clarity of comparison, quality of data, transparency of relationships and ease of decision-making**.

The design should communicate sophistication through restraint rather than visual complexity.
