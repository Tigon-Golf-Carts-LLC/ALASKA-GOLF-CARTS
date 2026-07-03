import { Link } from "wouter";
import { ChevronDown, Phone, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SeoHead } from "@/components/seo-head";
import { PHONE_NUMBER, PHONE_TEL } from "@/lib/constants";

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much does a golf cart cost?",
      "acceptedAnswer": {"@type": "Answer", "text": "New golf carts at Alaska Golf Carts start at approximately $9,995. Used golf carts typically range from $4,500 to $12,000 depending on brand, age, and condition. Street-legal LSVs and lifted models may cost more. Call 1-888-840-4490 for current pricing on specific units."}
    },
    {
      "@type": "Question",
      "name": "What brands of golf carts does Alaska Golf Carts carry?",
      "acceptedAnswer": {"@type": "Answer", "text": "Alaska Golf Carts is an authorized dealer for 13 brands: American Custom Golf Carts, Bintelli, Club Car, COLEMAN, COLUMBIA, CRICKET, Denago, Evolution, EZGO (E-Z-GO), Icon, Star EV, Tara, and Yamaha."}
    },
    {
      "@type": "Question",
      "name": "Does Alaska Golf Carts offer financing?",
      "acceptedAnswer": {"@type": "Answer", "text": "Yes. Financing is available through six lending partners including Sheffield Financial (0% APR), BLI Heartland (rent-to-own), DLL Financial Solutions, Roadrunner/Octane, Univest Capital, and Dealer Direct. Terms up to 48 months."}
    },
    {
      "@type": "Question",
      "name": "What is a street-legal golf cart (LSV)?",
      "acceptedAnswer": {"@type": "Answer", "text": "A Low Speed Vehicle (LSV) meets FMVSS 500 federal standards for use on roads with posted limits of 35 mph or less. Required equipment includes headlights, taillights, turn signals, mirrors, seat belts, horn, windshield, and a VIN."}
    },
    {
      "@type": "Question",
      "name": "What is the difference between electric and gas golf carts?",
      "acceptedAnswer": {"@type": "Answer", "text": "Electric golf carts run on battery packs (36V, 48V, or 72V). They are quieter and produce no exhaust. Gas golf carts use combustion engines and are preferred where charging is inconvenient or for longer range. Both types are available at Alaska Golf Carts."}
    },
    {
      "@type": "Question",
      "name": "Does Alaska Golf Carts deliver across Florida?",
      "acceptedAnswer": {"@type": "Answer", "text": "Yes. Statewide delivery is available to all 67 Florida counties. Call 1-888-840-4490 for a delivery quote."}
    },
    {
      "@type": "Question",
      "name": "What areas does Alaska Golf Carts serve?",
      "acceptedAnswer": {"@type": "Answer", "text": "Alaska Golf Carts serves the entire state of Florida — all 67 counties, including Miami-Dade, Broward, Palm Beach, Hillsborough, Orange, Duval, Pinellas, Lee, Polk, Brevard, and every other Florida county. Statewide delivery is available."}
    },
    {
      "@type": "Question",
      "name": "Does Alaska Golf Carts accept trade-ins?",
      "acceptedAnswer": {"@type": "Answer", "text": "Yes. Trade-ins are accepted throughout Florida. Call 1-888-840-4490 to get a trade-in estimate."}
    },
    {
      "@type": "Question",
      "name": "How often is the inventory updated?",
      "acceptedAnswer": {"@type": "Answer", "text": "The inventory feed is refreshed daily at 10:55 PM Eastern Time. All prices and availability reflect the most recent nightly update."}
    },
    {
      "@type": "Question",
      "name": "Does Alaska Golf Carts service and repair golf carts?",
      "acceptedAnswer": {"@type": "Answer", "text": "Yes. Services include routine maintenance, battery diagnostics and replacement, motor and controller repair, brake service, electrical diagnostics, body repair, and warranty service for all carried brands."}
    }
  ]
};

const faqs = [
  {
    q: "How much does a golf cart cost?",
    a: "New golf carts at Alaska Golf Carts start at approximately $9,995. Used golf carts typically range from $4,500 to $12,000 depending on brand, age, and condition. Street-legal LSVs and lifted models may cost more. Call 1-888-840-4490 for current pricing on specific units."
  },
  {
    q: "What brands of golf carts does Alaska Golf Carts carry?",
    a: "Alaska Golf Carts is an authorized dealer for 13 brands: American Custom Golf Carts, Bintelli, Club Car, COLEMAN, COLUMBIA, CRICKET, Denago, Evolution, EZGO (E-Z-GO), Icon, Star EV, Tara, and Yamaha."
  },
  {
    q: "Does Alaska Golf Carts offer financing?",
    a: "Yes. Financing is available through six lending partners: Sheffield Financial (0% APR options), BLI Heartland (rent-to-own), DLL Financial Solutions (low APR), Roadrunner/Octane (consumer financing), Univest Capital (business financing), and Dealer Direct (buy now, pay later). Terms up to 48 months. See the financing page for details."
  },
  {
    q: "What is a street-legal golf cart (LSV)?",
    a: "A Low Speed Vehicle (LSV) meets FMVSS 500 federal safety standards for operation on public roads with posted speed limits of 35 mph or less. Required equipment includes headlights, taillights, turn signals, brake lights, mirrors, seat belts, horn, windshield, and a Vehicle Identification Number (VIN). Alaska Golf Carts stocks LSVs from multiple brands."
  },
  {
    q: "What is the difference between electric and gas golf carts?",
    a: "Electric golf carts run on battery packs (typically 36V, 48V, or 72V lithium-ion or lead-acid). They are quieter, produce no exhaust, and have lower per-mile energy costs. Gas golf carts use small combustion engines and are preferred where charging infrastructure is limited or for longer-range applications. Both types are stocked at Alaska Golf Carts."
  },
  {
    q: "What is a lifted golf cart?",
    a: "A lifted golf cart has an aftermarket suspension lift kit installed, raising the vehicle's ground clearance by 3 to 6 inches. Lifted carts can accommodate larger tires and are popular for off-road use, hunting, farm, and rough terrain. Alaska Golf Carts stocks pre-lifted models in our Florida inventory."
  },
  {
    q: "Does Alaska Golf Carts deliver across Florida?",
    a: "Yes. Statewide delivery is available to all 67 Florida counties. Call 1-888-840-4490 for a delivery quote to your address."
  },
  {
    q: "What areas does Alaska Golf Carts serve?",
    a: "Alaska Golf Carts serves the entire state of Florida — all 67 counties, including Miami-Dade, Broward, Palm Beach, Hillsborough, Orange, Duval, Pinellas, Lee, Polk, Brevard, and every other Florida county. Statewide delivery is available on new and used golf carts."
  },
  {
    q: "Does Alaska Golf Carts accept trade-ins?",
    a: "Yes. Trade-ins are accepted throughout Florida. Call 1-888-840-4490 to get an estimated value."
  },
  {
    q: "How often is the inventory updated?",
    a: "The inventory feed is refreshed daily at 10:55 PM Eastern Time. All prices and availability reflect the most recent nightly update. Because of this, it is best to call 1-888-840-4490 to confirm a specific unit is still available before making the trip."
  },
  {
    q: "Does Alaska Golf Carts service and repair golf carts?",
    a: "Yes. Services include routine maintenance, battery diagnostics and replacement, motor and controller repair, brake service, electrical system diagnostics, body repair and refurbishment, and warranty service for all 13 carried brands."
  },
  {
    q: "What is the phone number for Alaska Golf Carts?",
    a: "Call 1-888-840-4490. This toll-free number connects you to the sales team who can assist with inventory, pricing, financing, delivery, and store locations."
  }
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-b-0">
      <button
        className="w-full flex items-center justify-between text-left py-5 px-1 gap-4"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-semibold text-sm sm:text-base">{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-primary transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <p className="text-sm text-muted-foreground leading-relaxed pb-5 px-1">{a}</p>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="min-h-screen">
      <SeoHead
        title="Golf Cart FAQ — Buying, Financing & Street-Legal Questions | Alaska Golf Carts"
        description="Golf cart buying questions answered: how much do they cost, what brands are available, how does financing work, and what is a street-legal LSV. Serving all of Florida — call 1-888-840-4490."
        canonical="https://alaskagolfcarts.com/faq"
        schema={FAQ_SCHEMA}
      />

      <section className="py-14 bg-card border-b">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <nav className="text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center gap-1">
              <li><Link href="/" className="hover:text-primary">Home</Link></li>
              <li><ChevronRight className="h-3 w-3" /></li>
              <li className="text-foreground font-medium">FAQ</li>
            </ol>
          </nav>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Golf Cart Buying Guide</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Frequently Asked Questions About Golf Carts
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-2xl mx-auto">
            Alaska Golf Carts sells new and used golf carts, electric vehicles, street-legal LSVs, and lifted carts from 13 authorized brands across all of Florida. Below are answers to the most common questions. Call <a href={PHONE_TEL} className="text-primary font-semibold hover:underline">{PHONE_NUMBER}</a> for specifics on current inventory and pricing.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-xl font-extrabold mb-2">Pricing &amp; Inventory</h2>
          <p className="text-sm text-muted-foreground mb-6">How much golf carts cost and what's in stock.</p>
          <div className="rounded-lg border bg-card divide-y mb-12">
            {faqs.slice(0, 2).map((f) => <FaqItem key={f.q} {...f} />)}
            <FaqItem q={faqs[9].q} a={faqs[9].a} />
          </div>

          <h2 className="text-xl font-extrabold mb-2">Financing Options</h2>
          <p className="text-sm text-muted-foreground mb-6">0% APR and other payment plans for golf cart purchases.</p>
          <div className="rounded-lg border bg-card divide-y mb-12">
            {faqs.slice(2, 3).map((f) => <FaqItem key={f.q} {...f} />)}
          </div>

          <h2 className="text-xl font-extrabold mb-2">Cart Types — LSV, Electric, Gas &amp; Lifted</h2>
          <p className="text-sm text-muted-foreground mb-6">What the different types of golf carts are and how they differ.</p>
          <div className="rounded-lg border bg-card divide-y mb-12">
            {faqs.slice(3, 6).map((f) => <FaqItem key={f.q} {...f} />)}
          </div>

          <h2 className="text-xl font-extrabold mb-2">Locations, Delivery &amp; Trade-Ins</h2>
          <p className="text-sm text-muted-foreground mb-6">Where to buy, how to get your cart delivered, and trade-in policy.</p>
          <div className="rounded-lg border bg-card divide-y mb-12">
            {faqs.slice(6, 9).map((f) => <FaqItem key={f.q} {...f} />)}
          </div>

          <h2 className="text-xl font-extrabold mb-2">Service &amp; Contact</h2>
          <div className="rounded-lg border bg-card divide-y mb-12">
            {faqs.slice(10).map((f) => <FaqItem key={f.q} {...f} />)}
          </div>

          <div className="mt-4 p-6 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-extrabold">Still have questions?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Call our team or <Link href="/inventory" className="text-primary hover:underline">browse current inventory</Link> to find your next golf cart.
              </p>
            </div>
            <a href={PHONE_TEL}>
              <Button size="lg" className="font-bold shrink-0" data-testid="button-faq-call">
                <Phone className="h-4 w-4 mr-2" />
                {PHONE_NUMBER}
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
