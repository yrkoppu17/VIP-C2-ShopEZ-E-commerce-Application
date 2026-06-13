# Phase 2: Requirement Analysis

This phase translates user needs and business objectives into structured requirements, mapped through user personas, empathy canvases, and functional/non-functional criteria.

---

## 1. User Personas & Empathy Canvases

### Persona A: "The Convenience-Seeking Shopper" (End-User)
* **Demographics:** A busy professional, age 28, who frequently shops online for electronics, clothing, and home goods.
* **Goals:** Quick, friction-free purchasing, finding products matching price/rating thresholds, and secure tokenized checkouts.

#### Empathy Map Canvas - Shopper
* **Think & Feel:**
  * *"Is my personal billing address and credit card information fully secure?"*
  * *"I hope my shopping cart remains saved even if my browser updates or I switch devices."*
  * *Relieved* when the site shows active stock alerts, verified reviews, and free shipping triggers.
* **Hear:**
  * Friends saying, *"I only buy from stores that deliver in under 3-5 days."*
  * Online forums cautioning, *"Read customer reviews before placing orders to check quality!"*
* **See:**
  * Modern, minimal layouts on leading platforms like Amazon or ASOS.
  * Confusing checkouts on smaller retail sites with hidden fees.
* **Say & Do:**
  * Says: *"I will add this to my wishlist and decide on it later."*
  * Says: *"I can't find a way to filter shirts by low-to-high prices."*
  * Does: Abandons checkout pages immediately if there are more than 3 shipping forms or no coupon inputs.
* **Pain Points:**
  * Slow-loading image assets.
  * Log-in sessions expiring too quickly, wiping out active shopping carts.
* **Gains Expected:**
  * Immediate autocomplete suggestions on searches.
  * Instant checkout totals displaying exact breakdown of prices, coupon discounts, shipping costs, and taxes.

### Persona B: "The Efficiency-Focused Admin" (Store Owner / Seller)
* **Demographics:** A retail entrepreneur, age 35, running a direct-to-consumer brand.
* **Goals:** Real-time visibility into inventory stocks, order status updates, and overall sales trends.

#### Empathy Map Canvas - Admin/Seller
* **Think & Feel:**
  * *"I need to know which products are running low so I can reorder stock in advance."*
  * *"I want an easy way to upload product images and create flash sale discount codes."*
* **Hear:**
  * Customers asking: *"Where is my order? Is it shipped yet?"*
  * System alerts showing: *"Warning: Product X is out of stock!"*
* **See:**
  * Sales trends and distribution graphs.
  * Inventory tables showing current items, prices, and stock numbers.
* **Say & Do:**
  * Says: *"I need to update this product description and price immediately."*
  * Says: *"Let me check our monthly revenue to see if this discount code worked."*
  * Does: Manually shifts order fulfillment statuses from 'Processing' to 'Shipped' and 'Delivered'.
* **Pain Points:**
  * Clunky dashboard portals that take multiple steps to add items.
  * Slow inventory updates leading to oversells.
* **Gains Expected:**
  * Single-dashboard overview showing sales graphs, low stock alarms, and customer tables.

---

## 2. Functional Requirements (FR)

The system must deliver the following capabilities, structured by user access level (Role-Based Access Control):

### 1. User & Authentication Services
* **FR-1.1:** Standard users must be able to register an account with a unique email, name, and hashed password.
* **FR-1.2:** Users must be able to log in securely to retrieve a signed JSON Web Token (JWT) session.
* **FR-1.3:** The system must restrict administrative dashboard routes to users holding the `admin` or `seller` roles.
* **FR-1.4:** Standard users must be able to manage an address book containing multiple shipping locations, selecting a default address for checkouts.

### 2. Product Catalog & Discovery
* **FR-2.1:** The database must list products displaying name, description, price, stock inventory, categories, and images.
* **FR-2.2:** The frontend must provide full-text search with live autocomplete suggestions.
* **FR-2.3:** The interface must support dynamic filters based on Category, Price Range, Minimum Ratings, and Stock Availability.
* **FR-2.4:** The frontend must support sorting configurations: Price (Low to High, High to Low), Ratings, and Release Date (Newest).

### 3. Shopping Cart & Wishlist Lifecycle
* **FR-3.1:** The system must offer a persistent shopping cart linked to the user context.
* **FR-3.2:** Users must be able to modify item quantities in the cart, subject to real-time stock limits.
* **FR-3.3:** The system must maintain a saved Wishlist, permitting users to move saved favorites to the cart in a single click.

### 4. Checkout, Coupons & Payments
* **FR-4.1:** The system must guide the customer through a multi-step checkout wizard (Shipping Address -> Shipping Speed -> Coupon Apply -> Mock Payment -> Order Confirmation).
* **FR-4.2:** The coupon engine must validate active coupon codes, applying percentage or fixed discounts and recalculating itemized taxes and shipping fees.
* **FR-4.3:** The checkout must communicate with a mock payment intent endpoint to securely complete transactions.

### 5. Administrative Operations
* **FR-5.1:** Admins and sellers must hold complete CRUD (Create, Read, Update, Delete) privileges over products.
* **FR-5.2:** Sellers and admins must be able to upload product images, storing them on Cloudinary.
* **FR-5.3:** Admins must be able to modify order fulfillment milestones (e.g., Placed -> Confirmed -> Packed -> Shipped -> Out for Delivery -> Delivered).
* **FR-5.4:** Admins must be able to block/unblock customer accounts, instantly revoking active sessions.
* **FR-5.5:** Admins must be able to manage coupon campaigns (create, toggle active state, delete).

---

## 3. Non-Functional Requirements (NFR)

To ensure the shopEZ platform is secure, responsive, and robust, it must comply with these metrics:

### 1. Security & Protection
* **NFR-1.1:** Passwords must be hashed using the Bcrypt algorithm before database commits.
* **NFR-1.2:** Session JSON Web Tokens must be transmitted via HTTP-Only, Secure cookies to prevent XSS-based token extraction.
* **NFR-1.3:** Enforce strict API middleware validation to deny unauthenticated access to protected routes.

### 2. Performance & Optimization
* **NFR-2.1:** The application UI must maintain high responsiveness, utilizing React's virtual DOM to update components instantly without full-page reloads.
* **NFR-2.2:** Product images must be stored and distributed via Cloudinary's global Content Delivery Network (CDN) to ensure quick image loading.
* **NFR-2.3:** API responses for the catalog must complete within 200ms under standard loads.

### 3. Reliability & Integrity
* **NFR-3.1:** Database commits during checkout must ensure atomic stock deductions to prevent oversells.
* **NFR-3.2:** If the primary MongoDB cluster connection is unavailable, the backend seeder must automatically instantiate a local In-Memory MongoDB fallback to guarantee development and staging continuity.

### 4. Usability & Accessibility
* **NFR-4.1:** The user interface must utilize a fully responsive layout that fits mobile, tablet, and desktop viewports.
* **NFR-4.2:** Design styling must utilize Outfit or Inter fonts with clear typography hierarchies.
