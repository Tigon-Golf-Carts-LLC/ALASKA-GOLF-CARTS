import { SeoHead } from "@/components/seo-head";
import { PHONE_NUMBER, PHONE_TEL } from "@/lib/constants";

export default function PublishingPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <SeoHead
        title="Publishing Policy | Alaska Golf Carts"
        description="Content publishing standards and guidelines for alaskagolfcarts.com."
        canonical="https://alaskagolfcarts.com/publishing-policy"
      />
      <h1 className="text-3xl font-extrabold mb-2">Publishing Policy</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: June 2025</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-3">Editorial Standards</h2>
          <p className="text-muted-foreground leading-relaxed">All content published on alaskagolfcarts.com — including inventory descriptions, pricing, promotional materials, blog posts, and informational pages — is reviewed for accuracy before publication. Our goal is to provide clear, factual, and helpful information to golf cart buyers across our service area.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Inventory Listings</h2>
          <p className="text-muted-foreground leading-relaxed">Inventory data is sourced directly from our dealership management system (DMS) and refreshed nightly. Listing details including make, model, year, color, condition, and price are populated from authoritative source data. While we strive for complete accuracy, occasional errors may occur. Users should verify all details directly with our sales team before making a purchase decision.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Advertising & Promotions</h2>
          <p className="text-muted-foreground leading-relaxed">Promotional pricing, financing offers, and special deals advertised on this site reflect actual available offers at the time of publication. All advertised offers are subject to availability and lender approval. Alaska Golf Carts does not engage in bait-and-switch advertising. If an advertised unit is no longer available, comparable alternatives will be offered.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">User-Generated Content</h2>
          <p className="text-muted-foreground leading-relaxed">This website does not currently accept user-generated content submissions such as reviews or forum posts. All content is produced or reviewed by Alaska Golf Carts staff.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Copyright</h2>
          <p className="text-muted-foreground leading-relaxed">All text, images, logos, and other content on alaskagolfcarts.com is the property of Alaska Golf Carts or is used with permission. Unauthorized reproduction, distribution, or use of any content from this site is prohibited.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Contact</h2>
          <p className="text-muted-foreground leading-relaxed">To report an inaccuracy or raise a content concern, call <a href={PHONE_TEL} className="text-primary font-semibold hover:underline">{PHONE_NUMBER}</a>.</p>
        </section>
      </div>
    </div>
  );
}
