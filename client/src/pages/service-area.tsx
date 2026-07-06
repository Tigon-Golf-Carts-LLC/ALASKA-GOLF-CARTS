import { Link } from "wouter";
import { MapPin, Phone, ChevronRight, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeoHead } from "@/components/seo-head";
import { PHONE_NUMBER, PHONE_TEL } from "@/lib/constants";

const regions = [
  {
    id: "southcentral",
    name: "Southcentral Alaska",
    towns: [
      "Anchorage", "Eagle River", "Chugiak", "Wasilla", "Palmer", "Houston",
      "Sutton", "Girdwood", "Whittier", "Talkeetna", "Willow", "Big Lake",
    ],
  },
  {
    id: "kenai",
    name: "Kenai Peninsula & Prince William Sound",
    towns: [
      "Kenai", "Soldotna", "Sterling", "Nikiski", "Kasilof", "Homer",
      "Anchor Point", "Seward", "Kodiak", "Valdez", "Cordova",
    ],
  },
  {
    id: "interior",
    name: "Interior Alaska",
    towns: [
      "Fairbanks", "North Pole", "Delta Junction", "Tok", "Nenana",
      "Healy", "Ester", "Salcha", "Glennallen", "Fort Yukon",
    ],
  },
  {
    id: "southeast",
    name: "Southeast Alaska (Inside Passage)",
    towns: [
      "Juneau", "Ketchikan", "Sitka", "Petersburg", "Wrangell",
      "Haines", "Skagway", "Craig", "Klawock", "Metlakatla", "Hoonah",
    ],
  },
  {
    id: "northwest",
    name: "Northern, Arctic & Western Alaska",
    towns: [
      "Utqiagvik (Barrow)", "Nome", "Kotzebue", "Bethel", "Dillingham",
      "Unalaska (Dutch Harbor)", "King Salmon", "Deadhorse", "Galena",
    ],
  },
];

const SERVICE_AREA_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "url": "https://alaskagolfcarts.com/service-area",
  "name": "Alaska Golf Cart Service Area — Statewide Delivery | Alaska Golf Carts",
  "description":
    "Alaska Golf Carts serves communities across the entire state of Alaska. New and used golf carts with statewide delivery.",
  "about": {
    "@type": "State",
    "name": "Alaska",
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://alaskagolfcarts.com" },
      { "@type": "ListItem", "position": 2, "name": "Service Area", "item": "https://alaskagolfcarts.com/service-area" },
    ],
  },
};

export default function ServiceArea() {
  return (
    <div className="min-h-screen">
      <SeoHead
        title="Alaska Golf Cart Service Area — Statewide Delivery | Alaska Golf Carts"
        description="Alaska Golf Carts serves communities across the entire state of Alaska — from Anchorage and Fairbanks to Juneau, the Kenai Peninsula, and beyond. Statewide delivery available. Call 1-888-840-4490."
        canonical="https://alaskagolfcarts.com/service-area"
        schema={SERVICE_AREA_SCHEMA}
      />

      <section className="py-14 bg-card border-b">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center gap-1">
              <li><Link href="/" className="hover:text-primary">Home</Link></li>
              <li><ChevronRight className="h-3 w-3" /></li>
              <li className="text-foreground font-medium">Service Area</li>
            </ol>
          </nav>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Serving All of Alaska</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Alaska Golf Cart Service Area — Statewide Delivery
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-3xl mb-6">
            Alaska Golf Carts sells and delivers new and used golf carts to communities across the entire state of Alaska — from Southcentral and the Interior to Southeast, the Arctic, and Western Alaska. Every order is backed by 13 authorized brands and on-site financing. Wherever you are in Alaska, <strong>statewide delivery</strong> is available — call <a href={PHONE_TEL} className="text-primary font-semibold hover:underline">{PHONE_NUMBER}</a> for a delivery quote to your address.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">Alaska</span>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">Statewide Coverage</span>
            <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold border">+ Statewide Delivery</span>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {regions.map((region) => (
              <article
                key={region.id}
                className="p-5 rounded-xl border bg-card hover:border-primary/40 transition-colors"
                data-testid={`card-region-${region.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center mt-0.5">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-extrabold text-base leading-tight">{region.name}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{region.towns.length} communities served</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {region.towns.map((town) => (
                        <span key={town} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{town}</span>
                      ))}
                    </div>
                    <a
                      href={PHONE_TEL}
                      className="inline-flex items-center gap-1.5 mt-3 text-primary font-semibold text-sm hover:underline"
                      data-testid={`link-call-${region.id}`}
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {PHONE_NUMBER}
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-card border-t">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Truck className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-extrabold">Statewide Alaska Delivery</h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
              We deliver golf carts to communities across Alaska — from Southeast to the Arctic.
              Call <a href={PHONE_TEL} className="text-primary font-semibold hover:underline">{PHONE_NUMBER}</a> to get a delivery quote and confirm availability in your area.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a href={PHONE_TEL}>
              <Button size="lg" className="font-bold" data-testid="button-service-area-call">
                <Phone className="h-4 w-4 mr-2" />
                {PHONE_NUMBER}
              </Button>
            </a>
            <Link href="/inventory">
              <Button variant="outline" size="lg" className="font-semibold" data-testid="button-service-area-inventory">
                Browse Inventory <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
