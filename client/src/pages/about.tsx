import { Link } from "wouter";
import { MapPin, Phone, ChevronRight, Zap, Truck, Shield, Award, Tag, RefreshCw, Wrench, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeoHead } from "@/components/seo-head";
import { PHONE_NUMBER, PHONE_TEL } from "@/lib/constants";

const brands = [
  "American Custom Golf Carts", "Bintelli", "Club Car", "COLEMAN",
  "COLUMBIA", "CRICKET", "Denago", "Evolution", "EZGO", "Icon",
  "Star EV", "Tara", "Yamaha"
];

const services = [
  { icon: Tag, label: "New Golf Cart Sales", desc: "13 authorized brands at wholesale MSRP pricing." },
  { icon: RefreshCw, label: "Used Golf Cart Sales", desc: "Inspected, serviced pre-owned carts at discounted prices." },
  { icon: Shield, label: "Street-Legal LSVs", desc: "FMVSS 500-compliant low speed vehicles for road use." },
  { icon: Zap, label: "Electric Carts", desc: "36V, 48V, and 72V battery-powered golf carts." },
  { icon: CreditCard, label: "0% APR Financing", desc: "Six lending partners, terms up to 48 months." },
  { icon: Truck, label: "Nationwide Delivery", desc: "We ship to any address in the continental US." },
  { icon: Wrench, label: "Service & Repair", desc: "Factory-trained technicians for all major brands." },
  { icon: Award, label: "Parts & Accessories", desc: "OEM and aftermarket parts for all 13 brands." },
];

const ABOUT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": "https://discountedgolfcart.com/about",
  "url": "https://discountedgolfcart.com/about",
  "name": "About Discounted Golf Carts — Multi-Location Golf Cart Dealer",
  "description": "Discounted Golf Carts is one of the largest multi-location golf cart dealerships in the eastern United States. 14 retail locations, 13 authorized brands, inventory updated daily.",
  "isPartOf": { "@id": "https://discountedgolfcart.com/#website" },
  "about": { "@id": "https://discountedgolfcart.com/#organization" },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://discountedgolfcart.com" },
      { "@type": "ListItem", "position": 2, "name": "About", "item": "https://discountedgolfcart.com/about" }
    ]
  }
};

export default function About() {
  return (
    <div className="min-h-screen">
      <SeoHead
        title="About Discounted Golf Carts — 14 Locations, 13 Brands | East Coast Dealer"
        description="Discounted Golf Carts is a multi-location golf cart dealer with 14 stores across 9 states. New and used golf carts, 13 authorized brands, 0% APR financing, daily-updated inventory. Call 1-888-840-4490."
        canonical="https://discountedgolfcart.com/about"
        schema={ABOUT_SCHEMA}
      />

      <section className="py-14 bg-card border-b">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center gap-1">
              <li><Link href="/" className="hover:text-primary">Home</Link></li>
              <li><ChevronRight className="h-3 w-3" /></li>
              <li className="text-foreground font-medium">About</li>
            </ol>
          </nav>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Who We Are</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-5">
            About Discounted Golf Carts
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
            Discounted Golf Carts is one of the largest multi-location golf cart dealerships in the eastern United States. The company operates 14 retail stores across Pennsylvania, New Jersey, Delaware, North Carolina, Indiana, Virginia, Florida, South Carolina, and Ohio. We sell new and used golf carts, electric vehicles, street-legal low speed vehicles (LSVs), and lifted carts from 13 authorized manufacturers at wholesale MSRP pricing. Inventory is updated every day at 10:55 PM ET.
          </p>
        </div>
      </section>

      <section className="py-12 border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "14", label: "Retail Locations" },
              { value: "9", label: "States Served" },
              { value: "13", label: "Authorized Brands" },
              { value: "Daily", label: "Inventory Updates" },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-lg bg-primary/5 border border-primary/15">
                <div className="text-3xl font-black text-primary">{stat.value}</div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 border-b">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-extrabold mb-2">What We Sell and How We Price It</h2>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed max-w-3xl">
            Discounted Golf Carts sells at wholesale MSRP — the price you'd expect to pay at the manufacturer's suggested retail, without dealer markup. Our inventory includes new carts from all 13 authorized brands, pre-owned carts that have been inspected and serviced, street-legal LSVs with full DOT equipment, and lifted models with suspension upgrades already installed. Prices start around $9,995 for new units and $4,500 for pre-owned carts.
          </p>
          <h2 className="text-2xl font-extrabold mb-6">Services at Every Location</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s) => (
              <div key={s.label} className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <div className="shrink-0 w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{s.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 border-b bg-card">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-extrabold mb-6">Authorized Brands</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-3xl leading-relaxed">
            We are an authorized dealer for all 13 of the following golf cart manufacturers. Authorized dealer status means we carry genuine parts, provide factory warranty service, and receive direct factory support for each brand.
          </p>
          <div className="flex flex-wrap gap-2">
            {brands.map((b) => (
              <span key={b} className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 border-b">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-extrabold mb-4">How Financing Works</h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-3xl mb-6">
            Discounted Golf Carts works with six lending partners to offer payment options for most credit profiles. Programs include 0% APR for qualified buyers, rent-to-own for those who prefer a lease path to ownership, and business financing for commercial customers. Terms run up to 48 months. Applications are reviewed quickly — most decisions come back within minutes. Visit the <Link href="/financing" className="text-primary hover:underline">financing page</Link> or call <a href={PHONE_TEL} className="text-primary hover:underline font-semibold">{PHONE_NUMBER}</a> to discuss options before you visit a store.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-extrabold mb-4">Where to Find Us</h2>
          <p className="text-sm text-muted-foreground mb-6">
            14 locations across 9 states — or call us and we'll deliver nationwide.
            See all addresses on the <Link href="/service-area" className="text-primary hover:underline">service area page</Link>.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
            {[
              "Hatfield, PA", "Long Pond, PA", "Scranton, PA",
              "Ocean View, NJ", "Bayville, NJ", "Waretown, NJ", "Rio Grande, NJ",
              "Dover, DE", "Raleigh, NC", "South Bend, IN",
              "Gloucester Point, VA", "Lecanto, FL", "Orangeburg, SC", "Swanton, OH"
            ].map((loc) => (
              <div key={loc} className="flex items-center gap-2 text-sm p-3 rounded-md border bg-card">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{loc}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href={PHONE_TEL}>
              <Button size="lg" className="font-bold" data-testid="button-about-call">
                <Phone className="h-4 w-4 mr-2" />
                {PHONE_NUMBER}
              </Button>
            </a>
            <Link href="/inventory">
              <Button variant="outline" size="lg" className="font-semibold" data-testid="button-about-inventory">
                Browse Inventory <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
