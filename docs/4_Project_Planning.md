# Phase 4: Project Planning Phase

This phase outlines the Agile development methodology, establishing the product backlog, user stories with acceptance criteria, sprint schedules, and project velocity metrics.

---

## 1. Product Backlog & Sprint Schedule

Development was executed across three main sprints, targeting key feature increments:

| Sprint | Epic | USN ID | User Story / Task | Story Points | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Sprint 1** | Foundation & Auth | **USN-001** | Project setup: Express API server, React frontend compilation structure, MongoDB initial model bindings. | 3 | High | Completed |
| **Sprint 1** | Foundation & Auth | **USN-002** | Secure user registration with Bcrypt hashing and validation checks. | 2 | High | Completed |
| **Sprint 1** | Foundation & Auth | **USN-003** | User login session initialization returning signed JWT tokens in HTTP-Only cookies. | 2 | High | Completed |
| **Sprint 2** | Discovery & Cart | **USN-004** | Product catalog search with live autocomplete suggestions and category filters. | 3 | High | Completed |
| **Sprint 2** | Discovery & Cart | **USN-005** | Persistent shopping cart context preserving products, totals, and quantities on page reload. | 3 | High | Completed |
| **Sprint 2** | Discovery & Cart | **USN-006** | Product wishlist management: saving favorites and supporting "One-Click Move to Cart". | 2 | Medium | Completed |
| **Sprint 2** | Checkout & Fulfill | **USN-007** | Multi-step checkout wizard integrating active coupon rules validation and tax estimations. | 3 | High | Completed |
| **Sprint 3** | Checkout & Fulfill | **USN-008** | Stripe mock integration to generate payment intents and verify checkouts. | 3 | High | Completed |
| **Sprint 3** | Feedback & Logs | **USN-009** | Order history lookup and visual timeline fulfillment tracking. | 2 | Medium | Completed |
| **Sprint 3** | Feedback & Logs | **USN-010** | Verified buyer reviews and helpful feedback upvote system. | 2 | Medium | Completed |
| **Sprint 3** | Administration | **USN-011** | Unified Admin Dashboard panel with sales growth charts, inventory tables, and coupon configuration controls. | 5 | High | Completed |

---

## 2. Detailed User Stories & Acceptance Criteria

### USN-002: User Registration
* **User Story:** As a new customer, I can register a profile by entering my name, email, and password, so that I can shop and track orders.
* **Acceptance Criteria:**
  * Must block submissions with duplicate emails or weak passwords (< 6 characters).
  * Password must be securely encrypted using Bcrypt before saving to MongoDB.
  * Successful registration redirects the user directly to the home screen with an active session.

### USN-004: Autocomplete Product Search
* **User Story:** As a shopper, I can input search words and select categories, so that I can find matching electronics or clothing immediately.
* **Acceptance Criteria:**
  * Submitting text queries instantly queries the `/api/products/suggestions` API.
  * Results must respect category selections, price ranges, and minimum rating stars filters.
  * Sorting options (price, rating, date) must re-order results immediately on-screen.

### USN-007: Coupon Code Validation
* **User Story:** As a customer, I can apply coupon codes during checkout, so that I receive active promotional discounts on my orders.
* **Acceptance Criteria:**
  * Coupon validation endpoint `/api/coupons/validate` checks active flags and expiry dates.
  * Applied discounts must be itemized (fixed vs percentage) and deducted from the subtotal.
  * Taxes (e.g. 15% VAT) and shipping speeds (e.g., Express vs Standard) must recalculate automatically.

### USN-011: Unified Admin Dashboard
* **User Story:** As a store admin, I can view visual monthly sales graphs and inventory tables, so that I can manage my shop operations.
* **Acceptance Criteria:**
  * Metrics charts must compile monthly revenue, category shares, and new user enrollments.
  * Product inventory tables must render alerts for items dropping below set stock thresholds.
  * Admin can instantly block/unblock customer logins and toggle coupon statuses.

---

## 3. Sprint Metrics & Velocity Tracker

* **Development Methodology:** Scrum framework.
* **Sprint Duration:** 2-week iterations.
* **Planned Team Velocity:** 10 Story Points per sprint.

### Sprint Progress Summary

```
Story Points
  12 |========================
  10 |=============          
   8 |             ==========
   6 |                       
   4 |                       
   2 |                       
   0 +-----+-----+-----+-----+
     Spr 1 Spr 2 Spr 3 Target
```

* **Sprint 1 (Weeks 1-2):** Planned: 7 SP | Completed: 7 SP
  * *Focus:* Base Express structure, database models, user registry, and JWT sessions.
* **Sprint 2 (Weeks 3-4):** Planned: 11 SP | Completed: 11 SP
  * *Focus:* Product catalogs, search suggestions, persistent cart context, address books, and coupon validation logic.
* **Sprint 3 (Weeks 5-6):** Planned: 12 SP | Completed: 12 SP
  * *Focus:* Stripe Mock payments gateway, visual order tracking timeline, buyer review scores, and Admin sales dashboard analytics.
* **Average Velocity achieved:** 10 SP per Sprint.
