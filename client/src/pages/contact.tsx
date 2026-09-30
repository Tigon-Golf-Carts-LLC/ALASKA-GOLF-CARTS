import { Link } from "wouter";
import { ChevronRight, Clock, MapPin, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SeoHead } from "@/components/seo-head";
import { LeadForm } from "@/components/lead-form";
import { PHONE_NUMBER, PHONE_TEL } from "@/lib/constants";

const CONTACT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": "https://alaskagolfcarts.com/contact",
  "url": "https://alaskagolfcarts.com/contact",
  "name": "Contact Alaska Golf Carts",
  "description": "Contact Alaska Golf Carts about new and used golf carts, financing, delivery, and service anywhere in Alaska.",
  "isPartOf": { "@id": "https://alaskagolfcarts.com/#website" },
  "about": { "@id": "https://alaskagolfcarts.com/#organization" },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://alaskagolfcarts.com" },
      { "@type": "ListItem", "position": 2, "name": "Contact", "item": "https://alaskagolfcarts.com/contact" }
    ]
  }
};

export default function Contact() {
  return (
    <div className="min-h-screen">
      <SeoHead
        title="Contact Alaska Golf Carts — Questions, Quotes & Delivery"
        description="Contact Alaska Golf Carts about new and used golf carts, 0% APR financing, statewide delivery, and service. Send us a message or call 1-888-840-4490."
        canonical="https://alaskagolfcarts.com/contact"
        schema={CONTACT_SCHEMA}
      />

      <section className="py-14 bg-card border-b">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center gap-1">
              <li><Link href="/" className="hover:text-primary">Home</Link></li>
              <li><ChevronRight className="h-3 w-3" /></li>
              <li className="text-foreground font-medium">Contact</li>
            </ol>
          </nav>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Get In Touch</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-5">Contact Alaska Golf Carts</h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
            Questions about a cart, a delivery quote, financing, or service? Send us a message and our Alaska team will get back to you — or call us for the fastest answer.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-xl font-extrabold mb-5">Send Us a Message</h2>
            <LeadForm />
          </Card>

          <div className="space-y-4">
            <Card className="p-5">
              <h2 className="font-bold mb-2 flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> Call Us</h2>
              <a href={PHONE_TEL} className="text-primary font-extrabold text-lg hover:opacity-80" data-testid="link-contact-phone">
                {PHONE_NUMBER}
              </a>
            </Card>
            <Card className="p-5">
              <h2 className="font-bold mb-2 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Service Area</h2>
              <p className="text-sm text-muted-foreground">
                Statewide delivery across Alaska. See our <Link href="/service-area" className="text-primary hover:underline">service area</Link>.
              </p>
            </Card>
            <Card className="p-5">
              <h2 className="font-bold mb-2 flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Inventory</h2>
              <p className="text-sm text-muted-foreground">
                Updated every night at 10:55 PM ET. <Link href="/inventory" className="text-primary hover:underline">Browse carts</Link>.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
