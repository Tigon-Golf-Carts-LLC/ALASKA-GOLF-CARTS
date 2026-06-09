import { Link } from "wouter";
import { MapPin, Phone, ChevronRight, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeoHead } from "@/components/seo-head";
import { PHONE_NUMBER, PHONE_TEL } from "@/lib/constants";

const locations = [
  {
    id: "T1",
    name: "Discounted Golf Carts Hatfield",
    address: "2333 Bethlehem Pike",
    city: "Hatfield",
    state: "PA",
    zip: "19440",
    region: "Greater Philadelphia / Montgomery County",
    nearby: ["Lansdale", "North Wales", "Doylestown", "Montgomeryville", "Blue Bell"],
  },
  {
    id: "T2",
    name: "Discounted Golf Carts Ocean View",
    address: "101 NJ-50",
    city: "Ocean View",
    state: "NJ",
    zip: "08230",
    region: "Cape May County / Jersey Shore",
    nearby: ["Wildwood", "Cape May", "Sea Isle City", "Avalon", "Stone Harbor"],
  },
  {
    id: "T3",
    name: "Discounted Golf Carts Long Pond",
    address: "4738 PA-115",
    city: "Long Pond",
    state: "PA",
    zip: "18334",
    region: "Pocono Mountains / Monroe County",
    nearby: ["Stroudsburg", "Mount Pocono", "Tannersville", "East Stroudsburg", "Tobyhanna"],
  },
  {
    id: "T4",
    name: "Discounted Golf Carts Dover",
    address: "5158 N Dupont Hwy",
    city: "Dover",
    state: "DE",
    zip: "19901",
    region: "Kent County / Central Delaware",
    nearby: ["Smyrna", "Milford", "Middletown", "Camden", "Harrington"],
  },
  {
    id: "T5",
    name: "Discounted Golf Carts Scranton",
    address: "1225 N. Keyser Ave #2",
    city: "Scranton",
    state: "PA",
    zip: "18504",
    region: "Northeastern Pennsylvania / Lackawanna County",
    nearby: ["Wilkes-Barre", "Pittston", "Carbondale", "Dickson City", "Moosic"],
  },
  {
    id: "T6",
    name: "Discounted Golf Carts Raleigh",
    address: "2700 South Wilmington Street",
    city: "Raleigh",
    state: "NC",
    zip: "27603",
    region: "Research Triangle / Wake County",
    nearby: ["Durham", "Chapel Hill", "Cary", "Garner", "Clayton", "Apex"],
  },
  {
    id: "T7",
    name: "Discounted Golf Carts South Bend",
    address: "52129 State Highway 933",
    city: "South Bend",
    state: "IN",
    zip: "46637",
    region: "Northern Indiana / St. Joseph County",
    nearby: ["Mishawaka", "Elkhart", "Goshen", "Granger", "Niles MI"],
  },
  {
    id: "T8",
    name: "Discounted Golf Carts Gloucester Point",
    address: "2810 George Washington Memorial Highway",
    city: "Gloucester Point",
    state: "VA",
    zip: "23072",
    region: "Hampton Roads / Gloucester County",
    nearby: ["Williamsburg", "Newport News", "Yorktown", "Hayes", "Mathews"],
  },
  {
    id: "T9",
    name: "Discounted Golf Carts Bayville",
    address: "155 Atlantic City Boulevard",
    city: "Bayville",
    state: "NJ",
    zip: "08721",
    region: "Ocean County / Jersey Shore",
    nearby: ["Toms River", "Barnegat", "Forked River", "Lacey Township", "Berkeley Township"],
  },
  {
    id: "T10",
    name: "Discounted Golf Carts Waretown",
    address: "526 U.S. 9",
    city: "Waretown",
    state: "NJ",
    zip: "08758",
    region: "Ocean County / Jersey Shore",
    nearby: ["Barnegat", "Manahawkin", "Tuckerton", "Ship Bottom", "Long Beach Island"],
  },
  {
    id: "T11",
    name: "Discounted Golf Carts Orangeburg",
    address: "4166 North Road",
    city: "Orangeburg",
    state: "SC",
    zip: "29118",
    region: "Midlands / Orangeburg County",
    nearby: ["Columbia", "Sumter", "Santee", "Holly Hill", "Bamberg"],
  },
  {
    id: "T12",
    name: "Discounted Golf Carts Lecanto",
    address: "299 East Gulf to Lake Highway",
    city: "Lecanto",
    state: "FL",
    zip: "34461",
    region: "Nature Coast / Citrus County",
    nearby: ["Crystal River", "Inverness", "Homosassa", "Beverly Hills FL", "Dunnellon"],
  },
  {
    id: "T13",
    name: "Discounted Golf Carts Swanton",
    address: "10420 Airport Highway",
    city: "Swanton",
    state: "OH",
    zip: "43558",
    region: "Northwestern Ohio / Fulton County",
    nearby: ["Toledo", "Maumee", "Sylvania", "Bowling Green", "Defiance"],
  },
  {
    id: "T14",
    name: "Discounted Golf Carts Rio Grande",
    address: "1304 New Jersey 47, Unit B",
    city: "Rio Grande",
    state: "NJ",
    zip: "08242",
    region: "Cape May County",
    nearby: ["Cape May", "Wildwood", "Villas", "North Cape May", "Erma"],
  },
];

const SERVICE_AREA_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "url": "https://discountedgolfcart.com/service-area",
  "name": "Golf Cart Dealership Locations — 14 Stores Across 9 States | Discounted Golf Carts",
  "description": "Find a Discounted Golf Carts dealership near you. 14 retail locations across Pennsylvania, New Jersey, Delaware, North Carolina, Indiana, Virginia, Florida, South Carolina, and Ohio.",
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://discountedgolfcart.com" },
      { "@type": "ListItem", "position": 2, "name": "Service Area", "item": "https://discountedgolfcart.com/service-area" }
    ]
  }
};

export default function ServiceArea() {
  return (
    <div className="min-h-screen">
      <SeoHead
        title="Golf Cart Dealership Locations — 14 Stores Across 9 States | Discounted Golf Carts"
        description="Find a Discounted Golf Carts near you. 14 locations across PA, NJ, DE, NC, IN, VA, FL, SC, and OH. Nationwide delivery available. Call 1-888-840-4490."
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
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Find a Location</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Golf Cart Dealers Near You — 14 Locations Across 9 States
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-3xl mb-6">
            Discounted Golf Carts operates 14 retail dealerships across Pennsylvania, New Jersey, Delaware, North Carolina, Indiana, Virginia, Florida, South Carolina, and Ohio. Every location sells new and used golf carts from 13 authorized brands and offers on-site financing. Not near a store? <strong>Nationwide delivery</strong> is available from any location — call <a href={PHONE_TEL} className="text-primary font-semibold hover:underline">{PHONE_NUMBER}</a> for a shipping quote.
          </p>
          <div className="flex flex-wrap gap-2">
            {["PA", "NJ", "DE", "NC", "IN", "VA", "FL", "SC", "OH"].map((s) => (
              <span key={s} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">{s}</span>
            ))}
            <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold border">+ Nationwide Delivery</span>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {locations.map((loc) => (
              <article
                key={loc.id}
                className="p-5 rounded-xl border bg-card hover:border-primary/40 transition-colors"
                data-testid={`card-location-${loc.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center mt-0.5">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-extrabold text-base leading-tight">{loc.name}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{loc.region}</p>
                    <address className="not-italic text-sm mt-2 leading-relaxed">
                      {loc.address}<br />
                      {loc.city}, {loc.state} {loc.zip}
                    </address>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {loc.nearby.map((n) => (
                        <span key={n} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{n}</span>
                      ))}
                    </div>
                    <a
                      href={PHONE_TEL}
                      className="inline-flex items-center gap-1.5 mt-3 text-primary font-semibold text-sm hover:underline"
                      data-testid={`link-call-${loc.id}`}
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
              <h2 className="text-xl font-extrabold">Nationwide Delivery Available</h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
              Not near one of our 14 locations? We deliver golf carts anywhere in the continental United States.
              Call <a href={PHONE_TEL} className="text-primary font-semibold hover:underline">{PHONE_NUMBER}</a> to get a delivery quote and confirm availability at your nearest location.
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
