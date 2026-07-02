import { Link } from "wouter";
import { MapPin, Phone, ChevronRight, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeoHead } from "@/components/seo-head";
import { PHONE_NUMBER, PHONE_TEL } from "@/lib/constants";

const regions = [
  {
    id: "northwest",
    name: "Northwest Florida & the Panhandle",
    counties: [
      "Escambia County", "Santa Rosa County", "Okaloosa County", "Walton County",
      "Holmes County", "Washington County", "Bay County", "Jackson County",
      "Calhoun County", "Gulf County", "Liberty County", "Gadsden County",
      "Leon County", "Wakulla County", "Franklin County", "Jefferson County",
      "Madison County", "Taylor County",
    ],
  },
  {
    id: "north",
    name: "North & Northeast Florida",
    counties: [
      "Hamilton County", "Suwannee County", "Lafayette County", "Columbia County",
      "Baker County", "Nassau County", "Duval County", "Union County",
      "Bradford County", "Clay County", "St. Johns County", "Putnam County",
      "Flagler County", "Alachua County", "Gilchrist County", "Dixie County",
      "Levy County",
    ],
  },
  {
    id: "central",
    name: "Central Florida",
    counties: [
      "Marion County", "Citrus County", "Hernando County", "Sumter County",
      "Lake County", "Volusia County", "Seminole County", "Orange County",
      "Osceola County", "Brevard County", "Polk County", "Pasco County",
      "Hillsborough County", "Pinellas County",
    ],
  },
  {
    id: "southwest",
    name: "Southwest Florida",
    counties: [
      "Manatee County", "Sarasota County", "Hardee County", "DeSoto County",
      "Highlands County", "Charlotte County", "Glades County", "Lee County",
      "Hendry County", "Collier County",
    ],
  },
  {
    id: "southeast",
    name: "Southeast Florida & the Keys",
    counties: [
      "Indian River County", "Okeechobee County", "St. Lucie County", "Martin County",
      "Palm Beach County", "Broward County", "Miami-Dade County", "Monroe County",
    ],
  },
];

const SERVICE_AREA_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "url": "https://discountedgolfcart.com/service-area",
  "name": "Florida Golf Cart Service Area — All 67 Counties | Discounted Golf Carts",
  "description":
    "Discounted Golf Carts serves the entire state of Florida — all 67 counties. New and used golf carts with statewide delivery.",
  "about": {
    "@type": "State",
    "name": "Florida",
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://discountedgolfcart.com" },
      { "@type": "ListItem", "position": 2, "name": "Service Area", "item": "https://discountedgolfcart.com/service-area" },
    ],
  },
};

export default function ServiceArea() {
  return (
    <div className="min-h-screen">
      <SeoHead
        title="Florida Golf Cart Service Area — All 67 Counties | Discounted Golf Carts"
        description="Discounted Golf Carts serves the entire state of Florida — all 67 counties, from Miami-Dade and Broward to Duval, Hillsborough, and Orange. Statewide delivery available. Call 1-888-840-4490."
        canonical="https://discountedgolfcart.com/service-area"
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
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Serving All of Florida</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Florida Golf Cart Service Area — All 67 Counties
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-3xl mb-6">
            Discounted Golf Carts sells and delivers new and used golf carts across the entire state of Florida — every one of the state's <strong>67 counties</strong>. Every order is backed by 13 authorized brands and on-site financing. Wherever you are in Florida, <strong>statewide delivery</strong> is available — call <a href={PHONE_TEL} className="text-primary font-semibold hover:underline">{PHONE_NUMBER}</a> for a delivery quote to your address.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">Florida</span>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">All 67 Counties</span>
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
                    <p className="text-xs text-muted-foreground mt-0.5">{region.counties.length} counties served</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {region.counties.map((county) => (
                        <span key={county} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{county}</span>
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
              <h2 className="text-xl font-extrabold">Statewide Florida Delivery</h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
              We deliver golf carts to every county in Florida — from the Panhandle to the Keys.
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
