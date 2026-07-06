import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Phone, ArrowRight, CreditCard, DollarSign, Shield, Clock, ChevronRight } from "lucide-react";
import { SeoHead } from "@/components/seo-head";
import { PHONE_NUMBER, PHONE_TEL } from "@/lib/constants";

const FINANCING_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "url": "https://alaskagolfcarts.com/financing",
  "name": "Golf Cart Financing — 0% APR Up to 48 Months | Alaska Golf Carts",
  "description": "Apply for golf cart financing through six lending partners. 0% APR options available. Quick approvals. New and used carts, LSVs, and NEVs. Call 1-888-840-4490.",
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://alaskagolfcarts.com" },
      { "@type": "ListItem", "position": 2, "name": "Financing", "item": "https://alaskagolfcarts.com/financing" }
    ]
  },
  "mainEntity": {
    "@type": "Service",
    "name": "Golf Cart Financing",
    "provider": { "@id": "https://alaskagolfcarts.com/#organization" },
    "description": "Golf cart financing through six lending partners. 0% APR available, terms up to 48 months, quick approval for new and used golf carts.",
    "offers": {
      "@type": "Offer",
      "description": "0% APR financing on golf carts, terms up to 48 months",
      "seller": { "@id": "https://alaskagolfcarts.com/#organization" }
    }
  }
};

const financingPartners = [
  {
    name: "Sheffield BBT",
    heading: "Prequalify Now!",
    description: "Get prequalified with no impact to your credit.*",
    url: "https://prequalify.sheffieldfinancial.com/Apply/Dealer/56712?source=web",
  },
  {
    name: "BLI Heartland",
    heading: "Rent To Own",
    description: "Helping Golf Cart Customers Achieve Ownership.*",
    url: "https://blirentals.com",
  },
  {
    name: "DLL Financial Solutions",
    heading: "DLL Financial Solutions",
    description: "Get the lowest APR without hidden fees.*",
    url: "https://applynow-cica-prd.dllgroup.com/?entityId=4&dealerCode=015639",
  },
  {
    name: "Roadrunner / Octane",
    heading: "Consumer Financing",
    description: "Get Ready To Ride With Consumer Financing.",
    url: "https://octane.co/flex/034170",
  },
  {
    name: "Univest Capital",
    heading: "Univest Capital",
    description: "Customized a solution for your specific business needs.",
    url: "https://form.jotform.com/UnivestCapital/credit-application-bakos?utm_source=Alaska+Golf+Carts&utm_medium=Financing&utm_campaign=Business&utm_term=Best+Golf+Cart+Financing",
  },
  {
    name: "Dealer Direct",
    heading: "Dealer Direct Financing",
    description: "Buy Now, Pay Later With Dealer Direct Financing.*",
    url: "https://dealerdirect.apptraker.com/my/guest?dealer=10735",
  },
];

const benefits = [
  {
    icon: CreditCard,
    title: "Flexible Options",
    description: "Six financing partners covering 0% APR, rent-to-own, and business programs.",
  },
  {
    icon: Clock,
    title: "Quick Approval",
    description: "Most applications receive a credit decision in minutes.",
  },
  {
    icon: DollarSign,
    title: "Competitive Rates",
    description: "0% APR available on qualifying purchases with terms up to 48 months.",
  },
  {
    icon: Shield,
    title: "No Hidden Fees",
    description: "Transparent payment terms with no surprise charges at closing.",
  },
];

export default function Financing() {
  return (
    <div className="min-h-screen">
      <SeoHead
        title="Golf Cart Financing — 0% APR Up to 48 Months | Alaska Golf Carts"
        description="Apply for golf cart financing at Alaska Golf Carts. 0% APR options, six lending partners, terms up to 48 months. New and used carts, LSVs, and NEVs. Call 1-888-840-4490."
        canonical="https://alaskagolfcarts.com/financing"
        schema={FINANCING_SCHEMA}
      />

      <section className="relative py-16 md:py-24 bg-card border-b">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center gap-1">
              <li><Link href="/" className="hover:text-primary">Home</Link></li>
              <li><ChevronRight className="h-3 w-3" /></li>
              <li className="text-foreground font-medium">Financing</li>
            </ol>
          </nav>
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Golf Cart Financing</p>
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5"
              data-testid="text-financing-title"
            >
              Golf Cart Financing — 0% APR, Up to 48 Months
            </h1>
            <p
              className="text-muted-foreground text-base md:text-lg leading-relaxed mb-4"
              data-testid="text-financing-intro"
            >
              Alaska Golf Carts offers financing on new golf carts, used golf carts, street-legal LSVs, and neighborhood electric vehicles (NEVs) through six lending partners. Programs include 0% APR for qualified buyers, rent-to-own for a path to ownership, and business financing for commercial fleets. Terms run up to 48 months. Most applications receive a decision in minutes.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Call <a href={PHONE_TEL} className="text-primary font-semibold hover:underline">{PHONE_NUMBER}</a> to discuss which financing program fits your budget, or apply directly through any of the six partner portals below. Available <Link href="/service-area" className="text-primary hover:underline">across all of Alaska</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="text-center p-6"
                data-testid={`benefit-${benefit.title.toLowerCase().replace(/\s/g, "-")}`}
              >
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-3"
            data-testid="text-partners-heading"
          >
            Our Golf Cart Financing Partners
          </h2>
          <p className="text-center text-sm text-muted-foreground mb-10 max-w-xl mx-auto">
            Six programs covering a wide range of credit profiles — from 0% APR to rent-to-own to business financing.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {financingPartners.map((partner) => (
              <Card
                key={partner.name}
                className="overflow-visible flex flex-col"
                data-testid={`card-partner-${partner.name.toLowerCase().replace(/[\s\/]/g, "-")}`}
              >
                <a
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="w-full h-48 rounded-t-md bg-gradient-to-br from-primary/15 via-primary/5 to-transparent flex flex-col items-center justify-center gap-3 border-b">
                    <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center">
                      <CreditCard className="w-7 h-7 text-primary" />
                    </div>
                    <span className="text-lg font-extrabold tracking-tight text-center px-4">{partner.name}</span>
                  </div>
                </a>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-semibold mb-1" data-testid={`text-partner-name-${partner.name.toLowerCase().replace(/[\s\/]/g, "-")}`}>
                    {partner.heading}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">
                    {partner.description}
                  </p>
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full" data-testid={`button-apply-${partner.name.toLowerCase().replace(/[\s\/]/g, "-")}`}>
                      Quick Apply
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14 bg-card border-t">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold mb-4">
            How Does Golf Cart Financing Work at Alaska Golf Carts?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            Choose a cart from the <Link href="/inventory" className="text-primary hover:underline">inventory page</Link>, then call <a href={PHONE_TEL} className="text-primary font-semibold hover:underline">{PHONE_NUMBER}</a> or apply online through one of the six partner portals above. Once approved, financing terms are set directly with the lender. Monthly payment amounts depend on the purchase price, term length (up to 48 months), and the program selected. All financing is subject to credit approval.
          </p>
          <h2 className="text-xl md:text-2xl font-bold mb-4 mt-8">
            What Credit Score Do I Need to Finance a Golf Cart?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            Requirements vary by lender. Sheffield Financial and DLL Financial Solutions typically work with good-to-excellent credit for the best rates. BLI Heartland's rent-to-own program is designed for a broader range of credit profiles. Call <a href={PHONE_TEL} className="text-primary font-semibold hover:underline">{PHONE_NUMBER}</a> to discuss which partner is the best fit before applying.
          </p>
          <h2 className="text-xl md:text-2xl font-bold mb-4 mt-8">
            Can I Finance a Used Golf Cart?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Yes. Most of the six partners finance both new and pre-owned golf carts. Used cart financing terms may differ slightly from new cart programs. See the <Link href="/inventory" className="text-primary hover:underline">used golf cart inventory</Link> or call to discuss current availability and financing for a specific pre-owned unit.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-primary/5 border-t">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" data-testid="text-cta-heading">
            Apply for Golf Cart Financing — Call Now
          </h2>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            Not sure which program is right for you? Call the sales team and they'll match you with the best lending partner for your situation.
          </p>
          <a href={PHONE_TEL}>
            <Button size="lg" className="font-bold" data-testid="button-call-financing">
              <Phone className="w-5 h-5 mr-2" />
              {PHONE_NUMBER}
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
