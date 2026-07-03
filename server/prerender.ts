import type { CartSummaryForSeo } from "./routes";

const PHONE_NUMBER = "1-888-840-4490";
const PHONE_TEL = "tel:1-888-840-4490";
const BASE_URL = "https://alaskagolfcarts.com";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatPrice(price: number | null): string {
  if (!price) return "Call for Price";
  return "$" + price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function breadcrumbHtml(items: { name: string; href: string }[]): string {
  const parts = items
    .map((item, i) => {
      const isLast = i === items.length - 1;
      return isLast
        ? `<li>${esc(item.name)}</li>`
        : `<li><a href="${esc(item.href)}">${esc(item.name)}</a></li>`;
    })
    .join("<li>/</li>");
  return `<nav aria-label="Breadcrumb"><ol>${parts}</ol></nav>`;
}

function cartCardHtml(cart: CartSummaryForSeo): string {
  return `<article>
    <a href="/golfcart/${esc(cart.slug)}">
      <h3>${esc(cart.title)}</h3>
    </a>
    <p>${esc(cart.isUsed ? "Used" : "New")} &middot; ${esc(cart.isElectric ? "Electric" : "Gas")}</p>
    <p>${esc(formatPrice(cart.price))}</p>
    <a href="/golfcart/${esc(cart.slug)}">View Details</a>
    <a href="${PHONE_TEL}">Call ${PHONE_NUMBER}</a>
  </article>`;
}

function callToActionHtml(): string {
  return `<p><a href="${PHONE_TEL}">Call ${PHONE_NUMBER}</a> or <a href="/inventory">Browse Inventory</a></p>`;
}

function renderHome(data: { newCarts: CartSummaryForSeo[]; usedCarts: CartSummaryForSeo[]; totalCarts: number }): string {
  return `<div>
    <h1>Golf Carts for Sale — New &amp; Used Inventory Updated Daily</h1>
    <p>Alaska Golf Carts sells new and used golf carts at MSRP pricing across all 67 counties in Florida, with statewide delivery. Our inventory of ${data.totalCarts || "hundreds of"} golf carts is refreshed every night, so prices and availability you see are current. Choose from 13 authorized brands including Club Car, EZGO, Yamaha, and Denago, plus street-legal LSVs and lifted carts. 0% APR financing is available through six lending partners.</p>
    ${callToActionHtml()}

    <section>
      <h2>New Golf Carts</h2>
      <p>Browse new golf carts from all 13 authorized brands, updated nightly with current pricing.</p>
      ${data.newCarts.length > 0 ? data.newCarts.map(cartCardHtml).join("\n") : "<p>New golf cart inventory is refreshed nightly — call for the latest availability.</p>"}
      <a href="/inventory?isNew=true">View All New Golf Carts</a>
    </section>

    <section>
      <h2>Used Golf Carts</h2>
      <p>Inspected and serviced pre-owned golf carts at great prices.</p>
      ${data.usedCarts.length > 0 ? data.usedCarts.map(cartCardHtml).join("\n") : "<p>Used golf cart inventory is refreshed nightly — call for the latest availability.</p>"}
      <a href="/inventory?isUsed=true">View All Used Golf Carts</a>
    </section>

    <section>
      <h2>Authorized Brands</h2>
      <p>American Custom Golf Carts, Bintelli, Club Car, COLEMAN, COLUMBIA, CRICKET, Denago, Evolution, EZGO, Icon, Star EV, Tara, Yamaha</p>
    </section>

    <section>
      <h2>Serving All of Florida</h2>
      <p>Alaska Golf Carts delivers to all 67 Florida counties statewide, from Miami-Dade and Broward to Duval, Hillsborough, and Orange. See our <a href="/service-area">full service area</a>.</p>
    </section>

    <section>
      <h2>0% APR Financing Available</h2>
      <p>Financing through six lending partners with terms up to 48 months. See <a href="/financing">financing options</a>.</p>
    </section>
  </div>`;
}

function renderInventory(data: { carts: CartSummaryForSeo[]; totalCarts: number }): string {
  return `<div>
    ${breadcrumbHtml([{ name: "Home", href: "/" }, { name: "Inventory", href: "/inventory" }])}
    <h1>Golf Cart Inventory — New &amp; Used Golf Carts for Sale</h1>
    <p>Browse ${data.totalCarts || "our full selection of"} new and used golf carts updated daily. Electric and gas golf carts from Club Car, EZGO, Yamaha, Denago, Evolution and more. 0% APR financing available. Serving all of Florida.</p>
    ${callToActionHtml()}
    <section>
      <h2>Available Golf Carts</h2>
      ${data.carts.length > 0 ? data.carts.map(cartCardHtml).join("\n") : "<p>Inventory is refreshed nightly — please call for current availability.</p>"}
    </section>
  </div>`;
}

function renderCartDetail(cartMeta: { title: string; description: string; schema: Record<string, any> }, slug: string): string {
  const schema = cartMeta.schema || {};
  const cartName = (schema.name as string) || "Golf Cart";
  const brand = (schema.brand as any)?.name as string | undefined;
  const model = schema.model as string | undefined;
  const color = schema.color as string | undefined;
  const year = schema.vehicleModelDate as string | undefined;
  const fuelType = schema.fuelType as string | undefined;
  const condition = (schema.itemCondition as string | undefined)?.includes("Used") ? "Used" : "New";
  const price = (schema.offers as any)?.price as number | undefined;
  const image = schema.image as string | undefined;

  return `<div>
    ${breadcrumbHtml([{ name: "Home", href: "/" }, { name: "Inventory", href: "/inventory" }, { name: cartName, href: `/golfcart/${slug}` }])}
    <h1>${esc(condition)} ${esc(cartName)}</h1>
    ${image ? `<img src="${esc(image)}" alt="${esc(cartName)}" />` : ""}
    <p>${esc(cartMeta.description)}</p>
    <ul>
      ${brand ? `<li>Brand: ${esc(brand)}</li>` : ""}
      ${model ? `<li>Model: ${esc(model)}</li>` : ""}
      ${year ? `<li>Year: ${esc(year)}</li>` : ""}
      ${color ? `<li>Color: ${esc(color)}</li>` : ""}
      ${fuelType ? `<li>Fuel Type: ${esc(fuelType)}</li>` : ""}
      <li>Condition: ${esc(condition)}</li>
      ${price ? `<li>Price: ${esc(formatPrice(price))}</li>` : ""}
    </ul>
    ${callToActionHtml()}
    <p>0% APR financing available on this unit through six lending partners. <a href="/financing">See financing options</a>.</p>
  </div>`;
}

function renderFinancing(): string {
  return `<div>
    ${breadcrumbHtml([{ name: "Home", href: "/" }, { name: "Financing", href: "/financing" }])}
    <h1>Golf Cart Financing — 0% APR, Up to 48 Months</h1>
    <p>Alaska Golf Carts offers financing on new golf carts, used golf carts, street-legal LSVs, and neighborhood electric vehicles (NEVs) through six lending partners. Programs include 0% APR for qualified buyers, rent-to-own for a path to ownership, and business financing for commercial fleets. Terms run up to 48 months. Most applications receive a decision in minutes.</p>
    <p>Call <a href="${PHONE_TEL}">${PHONE_NUMBER}</a> to discuss which financing program fits your budget. Available across all of Florida.</p>

    <section>
      <h2>Our Golf Cart Financing Partners</h2>
      <ul>
        <li><strong>Sheffield BBT</strong> — Prequalify with no impact to your credit.</li>
        <li><strong>BLI Heartland</strong> — Rent-to-own path to ownership.</li>
        <li><strong>DLL Financial Solutions</strong> — Low APR with no hidden fees.</li>
        <li><strong>Roadrunner / Octane</strong> — Consumer financing.</li>
        <li><strong>Univest Capital</strong> — Customized business financing solutions.</li>
        <li><strong>Dealer Direct</strong> — Buy now, pay later financing.</li>
      </ul>
    </section>

    <section>
      <h2>How Does Golf Cart Financing Work at Alaska Golf Carts?</h2>
      <p>Choose a cart from the <a href="/inventory">inventory page</a>, then call ${PHONE_NUMBER} or apply online through one of the six partner portals. Once approved, financing terms are set directly with the lender. Monthly payment amounts depend on the purchase price, term length (up to 48 months), and the program selected. All financing is subject to credit approval.</p>
      <h2>What Credit Score Do I Need to Finance a Golf Cart?</h2>
      <p>Requirements vary by lender. Sheffield Financial and DLL Financial Solutions typically work with good-to-excellent credit for the best rates. BLI Heartland's rent-to-own program is designed for a broader range of credit profiles.</p>
      <h2>Can I Finance a Used Golf Cart?</h2>
      <p>Yes. Most of the six partners finance both new and pre-owned golf carts. See the <a href="/inventory">used golf cart inventory</a> or call to discuss financing for a specific pre-owned unit.</p>
    </section>
    ${callToActionHtml()}
  </div>`;
}

function renderFaq(): string {
  const faqs: { q: string; a: string }[] = [
    { q: "How much do golf carts cost at Alaska Golf Carts?", a: "New golf carts start around $9,995 and pre-owned carts start around $4,500. All units are priced at MSRP with no dealer markup, and pricing updates nightly with our inventory." },
    { q: "Do you offer financing?", a: "Yes. We work with six lending partners offering 0% APR for qualified buyers, rent-to-own, and business financing, with terms up to 48 months." },
    { q: "What brands do you carry?", a: "We are an authorized dealer for 13 brands including Club Car, EZGO, Yamaha, Denago, Evolution, Bintelli, Star EV, and more." },
    { q: "Do you deliver?", a: "Yes. We deliver statewide across all 67 Florida counties, and we ship nationwide to the continental United States." },
    { q: "Are street-legal LSVs available?", a: "Yes. We carry FMVSS 500-compliant low speed vehicles (LSVs) equipped for street use." },
    { q: "How often is inventory updated?", a: "Inventory and pricing are updated every night at 10:55 PM ET directly from our dealer management system." },
  ];
  return `<div>
    ${breadcrumbHtml([{ name: "Home", href: "/" }, { name: "FAQ", href: "/faq" }])}
    <h1>Golf Cart FAQ — Common Questions Answered</h1>
    <p>Answers to common golf cart buying questions — pricing, brands, street legal requirements, financing, battery care, and more.</p>
    <section>
      ${faqs.map((f) => `<div><h2>${esc(f.q)}</h2><p>${esc(f.a)}</p></div>`).join("\n")}
    </section>
    ${callToActionHtml()}
  </div>`;
}

function renderAbout(): string {
  return `<div>
    ${breadcrumbHtml([{ name: "Home", href: "/" }, { name: "About", href: "/about" }])}
    <h1>About Alaska Golf Carts</h1>
    <p>Alaska Golf Carts is a golf cart dealership serving the entire state of Florida — all 67 counties, from the Panhandle to the Keys. We sell new and used golf carts, electric vehicles, street-legal low speed vehicles (LSVs), and lifted carts from 13 authorized manufacturers at MSRP pricing, with statewide delivery. Inventory is updated every day at 10:55 PM ET.</p>
    <ul>
      <li>14 Retail Locations</li>
      <li>9 States Served</li>
      <li>13 Authorized Brands</li>
      <li>Daily Inventory Updates</li>
    </ul>

    <section>
      <h2>What We Sell and How We Price It</h2>
      <p>Alaska Golf Carts sells at MSRP — the price you'd expect to pay at the manufacturer's suggested retail, without dealer markup. Our inventory includes new carts from all 13 authorized brands, pre-owned carts that have been inspected and serviced, street-legal LSVs with full DOT equipment, and lifted models with suspension upgrades already installed. Prices start around $9,995 for new units and $4,500 for pre-owned carts.</p>
      <h2>Services at Every Location</h2>
      <ul>
        <li>New Golf Cart Sales — 13 authorized brands at MSRP pricing.</li>
        <li>Used Golf Cart Sales — Inspected, serviced pre-owned carts at great prices.</li>
        <li>Street-Legal LSVs — FMVSS 500-compliant low speed vehicles for road use.</li>
        <li>Electric Carts — 36V, 48V, and 72V battery-powered golf carts.</li>
        <li>0% APR Financing — Six lending partners, terms up to 48 months.</li>
        <li>Nationwide Delivery — We ship to any address in the continental US.</li>
        <li>Service &amp; Repair — Factory-trained technicians for all major brands.</li>
        <li>Parts &amp; Accessories — OEM and aftermarket parts for all 13 brands.</li>
      </ul>
    </section>

    <section>
      <h2>Authorized Brands</h2>
      <p>We are an authorized dealer for all 13 of the following golf cart manufacturers: American Custom Golf Carts, Bintelli, Club Car, COLEMAN, COLUMBIA, CRICKET, Denago, Evolution, EZGO, Icon, Star EV, Tara, Yamaha.</p>
    </section>

    <section>
      <h2>How Financing Works</h2>
      <p>Alaska Golf Carts works with six lending partners to offer payment options for most credit profiles. Programs include 0% APR for qualified buyers, rent-to-own for those who prefer a lease path to ownership, and business financing for commercial customers. Terms run up to 48 months. Visit the <a href="/financing">financing page</a> to discuss options.</p>
    </section>

    <section>
      <h2>Where We Serve</h2>
      <p>Serving all 67 Florida counties with statewide delivery. See the full service area on the <a href="/service-area">service area page</a>.</p>
    </section>
    ${callToActionHtml()}
  </div>`;
}

function renderServiceArea(): string {
  const regions = [
    { name: "Northwest Florida & the Panhandle", count: 18 },
    { name: "North & Northeast Florida", count: 17 },
    { name: "Central Florida", count: 14 },
    { name: "Southwest Florida", count: 10 },
    { name: "Southeast Florida & the Keys", count: 8 },
  ];
  return `<div>
    ${breadcrumbHtml([{ name: "Home", href: "/" }, { name: "Service Area", href: "/service-area" }])}
    <h1>Florida Golf Cart Service Area — All 67 Counties</h1>
    <p>Alaska Golf Carts sells and delivers new and used golf carts across the entire state of Florida — every one of the state's 67 counties. Every order is backed by 13 authorized brands and on-site financing. Wherever you are in Florida, statewide delivery is available — call <a href="${PHONE_TEL}">${PHONE_NUMBER}</a> for a delivery quote to your address.</p>
    <section>
      ${regions.map((r) => `<article><h2>${esc(r.name)}</h2><p>${r.count} counties served</p></article>`).join("\n")}
    </section>
    <section>
      <h2>Statewide Florida Delivery</h2>
      <p>We deliver golf carts to every county in Florida — from the Panhandle to the Keys. Call ${PHONE_NUMBER} to get a delivery quote and confirm availability in your area.</p>
    </section>
    ${callToActionHtml()}
  </div>`;
}

interface PolicySection {
  h2: string;
  p: string;
}

interface PolicyPageDef {
  h1: string;
  dateLine: string;
  sections: PolicySection[];
}

const POLICY_PAGES: Record<string, PolicyPageDef> = {
  "/terms-conditions": {
    h1: "Terms &amp; Conditions",
    dateLine: "Last updated: June 2025",
    sections: [
      { h2: "Agreement to Terms", p: "By accessing or using alaskagolfcarts.com, you agree to be bound by these Terms &amp; Conditions. If you do not agree with any part of these terms, please do not use this website." },
      { h2: "Use of Website", p: "This website is provided for informational purposes to help customers browse golf cart inventory, pricing, and dealership information. You may not use this site for any unlawful purpose or in any way that could damage, disable, or impair the site." },
      { h2: "Pricing &amp; Inventory Accuracy", p: "Inventory, pricing, and availability are updated nightly from our dealer management system. While we strive for accuracy, errors may occur. All pricing is subject to change and final confirmation with our sales team prior to purchase." },
      { h2: "No Warranty on Website Content", p: "This website and its content are provided \"as is\" without warranties of any kind, express or implied. We do not guarantee the website will be uninterrupted, error-free, or free of viruses." },
      { h2: "Limitation of Liability", p: "Alaska Golf Carts shall not be liable for any indirect, incidental, or consequential damages arising from your use of this website." },
      { h2: "Governing Law", p: `These Terms &amp; Conditions are governed by the laws of the State of Florida. Contact us at <a href="${PHONE_TEL}">${PHONE_NUMBER}</a> with any questions.` },
    ],
  },
  "/return-policy": {
    h1: "Return Policy",
    dateLine: "Last updated: June 2025",
    sections: [
      { h2: "All Sales Are Final", p: "All golf cart sales at Alaska Golf Carts are considered final upon execution of a signed purchase agreement and receipt of payment or financing approval. We do not accept returns for buyer's remorse or change of mind." },
      { h2: "Defective or Damaged Units", p: `If your golf cart arrives with a manufacturer defect or shipping damage not disclosed at the time of sale, notify us within 48 hours of delivery by calling <a href="${PHONE_TEL}">${PHONE_NUMBER}</a>. We will work with you and the manufacturer or shipping carrier to resolve the issue.` },
      { h2: "Accessories &amp; Parts", p: "Accessories and parts that are unused, in original packaging, and purchased within the last 30 days may be returned for store credit or exchange. Installed accessories and electrical components are non-returnable." },
      { h2: "Deposits", p: "Deposits paid to hold a specific unit are non-refundable once the unit has been reserved for the buyer. If we are unable to deliver the agreed unit, your deposit will be refunded in full." },
      { h2: "Warranty Claims", p: "Warranty issues are handled through the manufacturer's warranty process. Our service team is available to assist you in filing a claim." },
      { h2: "Contact Us", p: `To discuss a return, defect claim, or warranty issue, call <a href="${PHONE_TEL}">${PHONE_NUMBER}</a>.` },
    ],
  },
  "/privacy-policy": {
    h1: "Privacy Policy",
    dateLine: "Last updated: June 2025",
    sections: [
      { h2: "Information We Collect", p: "When you visit alaskagolfcarts.com or contact us by phone, we may collect your name, phone number, email address, and general location, plus non-personal browsing data through standard web analytics tools." },
      { h2: "How We Use Your Information", p: "Information you provide is used solely to respond to inquiries, process purchases, arrange financing, coordinate delivery, and communicate about your order. We do not sell or rent your personal information." },
      { h2: "Cookies &amp; Tracking", p: "This website uses cookies and similar tracking technologies to improve user experience and measure advertising performance." },
      { h2: "Third-Party Services", p: "We use Google Analytics, Google Tag Manager, and Google Ads to measure website performance. We also share limited data with financing partners to process loan applications at your request." },
      { h2: "Data Security", p: "We take reasonable measures to protect your information, including HTTPS encryption, though no transmission method is 100% secure." },
      { h2: "Your Rights", p: "You may request to access, correct, or delete personal information we hold about you by contacting us directly." },
      { h2: "Contact", p: `Privacy questions may be directed to <a href="${PHONE_TEL}">${PHONE_NUMBER}</a>.` },
    ],
  },
  "/delivery-policy": {
    h1: "Delivery Policy",
    dateLine: "Last updated: June 2025",
    sections: [
      { h2: "Nationwide Delivery", p: "Alaska Golf Carts offers delivery to any address in the continental United States, coordinated through licensed transport carriers. We do not ship to Alaska, Hawaii, or US territories at this time." },
      { h2: "Local Pickup", p: "Alaska Golf Carts delivers statewide to all 67 Florida counties. Local pickup can also be arranged by appointment." },
      { h2: "Delivery Timeframes", p: "Local and regional deliveries typically take 3–10 business days. Long-distance deliveries may take 7–21 business days. Timeframes are estimates and are not guaranteed." },
      { h2: "Delivery Preparation", p: "All golf carts are inspected and prepped prior to delivery, including a pre-delivery inspection (PDI), battery check, and tire inflation." },
      { h2: "Receiving Your Delivery", p: `An adult (18+) must be present to receive and sign for delivery. If damage is noted, document it on the delivery paperwork and contact us immediately at <a href="${PHONE_TEL}">${PHONE_NUMBER}</a>.` },
      { h2: "Delivery Costs", p: "Delivery fees vary by distance and are quoted at the time of sale. Delivery fees are non-refundable once the unit has been dispatched." },
      { h2: "Questions", p: `For delivery inquiries, call ${PHONE_NUMBER}.` },
    ],
  },
  "/rental-policy": {
    h1: "Rental Policy",
    dateLine: "Last updated: June 2025",
    sections: [
      { h2: "Rental Availability", p: `Golf cart rentals are available at select Alaska Golf Carts locations. Call <a href="${PHONE_TEL}">${PHONE_NUMBER}</a> to inquire about current rental inventory and rates.` },
      { h2: "Eligibility", p: "Renters must be at least 18 years of age and possess a valid government-issued photo ID and a valid credit or debit card for the security deposit." },
      { h2: "Rental Agreement", p: "All rentals require a signed rental agreement outlining the rental period, usage terms, security deposit amount, and renter responsibilities." },
      { h2: "Security Deposit", p: "A refundable security deposit is required at the time of rental, returned within 5–7 business days of the unit's return, less any charges for damage or late fees." },
      { h2: "Permitted Use", p: "Rental golf carts may only be operated by the authorized renter. Off-road use, racing, or unlawful public road use is prohibited." },
      { h2: "Damage &amp; Liability", p: "The renter is responsible for all damage to the cart during the rental period, except for pre-existing documented damage." },
      { h2: "Returns", p: "Rental units must be returned on time and in the same condition as rented. Late returns are charged at the daily rental rate." },
    ],
  },
  "/storage-policy": {
    h1: "Storage Policy",
    dateLine: "Last updated: June 2025",
    sections: [
      { h2: "Storage Services", p: `Alaska Golf Carts offers seasonal and short-term golf cart storage at select locations. Contact us at <a href="${PHONE_TEL}">${PHONE_NUMBER}</a> to inquire about storage at your nearest location.` },
      { h2: "Storage Agreement", p: "All storage arrangements require a signed storage agreement detailing the storage period, monthly rate, and terms of access." },
      { h2: "Cart Condition at Drop-Off", p: "Customers are responsible for delivering their cart in reasonably clean condition. Carts with significant damage or hazardous materials may be refused for storage." },
      { h2: "While In Storage", p: "During storage, we maintain battery trickle charging for electric units where applicable. Physical access to stored units is by appointment only." },
      { h2: "Liability", p: "Our liability for loss or damage during storage is limited to the agreed storage fee paid for the current storage period." },
      { h2: "Retrieval &amp; Abandonment", p: "Storage customers must retrieve their unit by the end of the agreed storage period. Units abandoned for 90+ days may be disposed of in accordance with applicable state law." },
    ],
  },
  "/publishing-policy": {
    h1: "Publishing Policy",
    dateLine: "Last updated: June 2025",
    sections: [
      { h2: "Editorial Standards", p: "All content published on alaskagolfcarts.com is reviewed for accuracy before publication, providing clear, factual, and helpful information to golf cart buyers." },
      { h2: "Inventory Listings", p: "Inventory data is sourced directly from our dealership management system (DMS) and refreshed nightly. Users should verify all details with our sales team before purchase." },
      { h2: "Advertising &amp; Promotions", p: "Promotional pricing and financing offers reflect actual available offers at the time of publication, subject to availability and lender approval." },
      { h2: "User-Generated Content", p: "This website does not currently accept user-generated content submissions. All content is produced or reviewed by Alaska Golf Carts staff." },
      { h2: "Copyright", p: "All text, images, logos, and other content on alaskagolfcarts.com is the property of Alaska Golf Carts or is used with permission." },
      { h2: "Contact", p: `To report an inaccuracy, call <a href="${PHONE_TEL}">${PHONE_NUMBER}</a>.` },
    ],
  },
  "/feedback-policy": {
    h1: "Feedback Policy",
    dateLine: "Last updated: June 2025",
    sections: [
      { h2: "We Value Your Feedback", p: "Alaska Golf Carts is committed to continuous improvement through customer feedback from buyers, prospective customers, and community members." },
      { h2: "How to Submit Feedback", p: `Feedback can be submitted by calling us at <a href="${PHONE_TEL}">${PHONE_NUMBER}</a> or leaving a review on Google.` },
      { h2: "How We Handle Feedback", p: "All feedback is reviewed by our management team. We commit to acknowledging complaints within 2 business days and resolving them within 10 business days where possible." },
      { h2: "Online Reviews", p: "We encourage satisfied customers to leave honest reviews. We do not incentivize, solicit, or fabricate reviews." },
      { h2: "Feedback Confidentiality", p: "Feedback submitted privately is treated as confidential and used solely for internal improvement purposes." },
    ],
  },
  "/corrections-policy": {
    h1: "Corrections Policy",
    dateLine: "Last updated: June 2025",
    sections: [
      { h2: "Commitment to Accuracy", p: "Alaska Golf Carts is committed to providing accurate, current, and complete information on alaskagolfcarts.com." },
      { h2: "Pricing Errors", p: "In the event of a pricing error on a listed unit, Alaska Golf Carts reserves the right to correct the price without prior notice." },
      { h2: "Inventory Errors", p: `Inventory is updated nightly from our DMS. If you identify a listing error, call <a href="${PHONE_TEL}">${PHONE_NUMBER}</a> and we will verify current availability.` },
      { h2: "Policy &amp; Content Errors", p: "Confirmed content errors will be corrected within 5 business days. Material corrections to policy language will be noted with an updated \"Last updated\" date." },
      { h2: "How to Report an Error", p: `To report any error on alaskagolfcarts.com, call us at <a href="${PHONE_TEL}">${PHONE_NUMBER}</a>.` },
    ],
  },
  "/diversity-policy": {
    h1: "Diversity Policy",
    dateLine: "Last updated: June 2025",
    sections: [
      { h2: "Our Commitment", p: "Alaska Golf Carts is committed to building and maintaining a diverse, equitable, and inclusive workplace and customer environment across the state of Florida." },
      { h2: "Equal Opportunity Employment", p: "We are an equal opportunity employer. All employment decisions are made without regard to race, color, religion, sex, national origin, disability, age, or any other protected characteristic." },
      { h2: "Inclusive Customer Service", p: "We are committed to providing equal, respectful, and professional service to all customers regardless of background, identity, or circumstance." },
      { h2: "Supplier Diversity", p: "We seek to work with a diverse range of vendors and suppliers, including minority-owned, women-owned, and veteran-owned businesses." },
      { h2: "Accountability", p: "Our management team is responsible for upholding these standards at every location." },
    ],
  },
  "/ethics-policy": {
    h1: "Ethics Policy",
    dateLine: "Last updated: June 2025",
    sections: [
      { h2: "Our Core Values", p: "Alaska Golf Carts operates on a foundation of integrity, transparency, and respect for our customers, team members, business partners, and communities." },
      { h2: "Honest Business Practices", p: "We are committed to honest, transparent business practices including accurate pricing, truthful advertising, and clear communication about financing terms." },
      { h2: "Conflicts of Interest", p: "Employees must avoid situations in which personal interests conflict with the interests of the company or its customers." },
      { h2: "Compliance with Laws", p: "All employees are required to conduct business in full compliance with applicable federal, state, and local laws." },
      { h2: "Reporting Violations", p: "Employees are expected to report unethical behavior or policy violations to a manager or company leadership, with retaliation strictly prohibited." },
      { h2: "Customer Concerns", p: `Customers who believe they have been treated unethically are encouraged to call <a href="${PHONE_TEL}">${PHONE_NUMBER}</a>.` },
    ],
  },
  "/staffing-report": {
    h1: "Staffing Report",
    dateLine: "Reporting period: 2024–2025",
    sections: [
      { h2: "Overview", p: "This report provides a general overview of staffing at Alaska Golf Carts across our Florida operations, serving all 67 counties statewide." },
      { h2: "Workforce Size", p: "Alaska Golf Carts currently employs team members across sales, service, parts, delivery, and administrative functions." },
      { h2: "Roles &amp; Departments", p: "Sales Associates, Service Technicians, Parts &amp; Accessories staff, Delivery Drivers, Store Management, and Corporate &amp; Administrative teams support all locations." },
      { h2: "Hiring Practices", p: "We recruit locally across Florida, valuing work ethic and trainability equally with prior experience. All positions are posted publicly." },
      { h2: "Training &amp; Development", p: "New team members receive structured onboarding, and service technicians have access to brand-specific training from Club Car, EZGO, Yamaha, Denago, Evolution, and other authorized brands." },
      { h2: "Equal Opportunity", p: "Alaska Golf Carts is an equal opportunity employer. See our Diversity Policy for full details." },
    ],
  },
};

function renderPolicyPage(pathname: string): string | null {
  const def = POLICY_PAGES[pathname];
  if (!def) return null;
  return `<div>
    ${breadcrumbHtml([{ name: "Home", href: "/" }, { name: def.h1.replace(/&amp;/g, "&"), href: pathname }])}
    <h1>${def.h1}</h1>
    <p>${def.dateLine}</p>
    ${def.sections.map((s) => `<section><h2>${s.h2}</h2><p>${s.p}</p></section>`).join("\n")}
  </div>`;
}

function renderNotFound(): string {
  return `<div>
    <h1>Page Not Found</h1>
    <p>The page you're looking for doesn't exist or may have been moved. Browse our <a href="/inventory">golf cart inventory</a> or return to the <a href="/">homepage</a>.</p>
    ${callToActionHtml()}
  </div>`;
}

export interface PrerenderDeps {
  getHomeSnapshotForSeo: () => Promise<{ newCarts: CartSummaryForSeo[]; usedCarts: CartSummaryForSeo[]; totalCarts: number }>;
  getInventorySnapshotForSeo: (url: string) => Promise<{ carts: CartSummaryForSeo[]; totalCarts: number }>;
  getCartMetaForSeo: (slug: string) => Promise<{ title: string; description: string; schema: Record<string, unknown>; imageUrl: string | null } | null>;
}

export async function renderRouteContent(pathname: string, url: string, deps: PrerenderDeps): Promise<string | null> {
  if (pathname === "/") {
    const data = await deps.getHomeSnapshotForSeo();
    return renderHome(data);
  }

  if (pathname === "/inventory") {
    const data = await deps.getInventorySnapshotForSeo(url);
    return renderInventory(data);
  }

  const cartSlugMatch = pathname.match(/^\/golfcart\/([^/]+)$/);
  if (cartSlugMatch) {
    const slug = cartSlugMatch[1];
    const cartMeta = await deps.getCartMetaForSeo(slug);
    if (!cartMeta) return null;
    return renderCartDetail(cartMeta, slug);
  }

  if (pathname === "/financing") return renderFinancing();
  if (pathname === "/faq") return renderFaq();
  if (pathname === "/about") return renderAbout();
  if (pathname === "/service-area") return renderServiceArea();

  const policyHtml = renderPolicyPage(pathname);
  if (policyHtml) return policyHtml;

  return null;
}

export function renderNotFoundContent(): string {
  return renderNotFound();
}
