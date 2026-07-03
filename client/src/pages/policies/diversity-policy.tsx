import { SeoHead } from "@/components/seo-head";
import { POLICY_ROUTES, SITE_URL } from "@shared/seo-routes";

const meta = POLICY_ROUTES["/diversity-policy"];

export default function DiversityPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <SeoHead
        title={meta.title}
        description={meta.description}
        canonical={`${SITE_URL}/diversity-policy`}
      />
      <h1 className="text-3xl font-extrabold mb-2">Diversity Policy</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: June 2025</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-3">Our Commitment</h2>
          <p className="text-muted-foreground leading-relaxed">Alaska Golf Carts is committed to building and maintaining a diverse, equitable, and inclusive workplace and customer environment. We believe that diversity of background, experience, and perspective makes our company stronger and better serves our customers across the state of Florida.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Equal Opportunity Employment</h2>
          <p className="text-muted-foreground leading-relaxed">We are an equal opportunity employer. All employment decisions — including hiring, promotion, compensation, training, and termination — are made without regard to race, color, religion, sex, national origin, disability, age, veteran status, sexual orientation, gender identity, or any other characteristic protected by applicable federal, state, or local law.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Inclusive Customer Service</h2>
          <p className="text-muted-foreground leading-relaxed">We are committed to providing equal, respectful, and professional service to all customers regardless of background, identity, or circumstance. Discrimination or harassment of any kind by any employee toward a customer or fellow employee will not be tolerated and may result in immediate termination.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Supplier Diversity</h2>
          <p className="text-muted-foreground leading-relaxed">We seek to work with a diverse range of vendors, suppliers, and business partners where possible. We encourage minority-owned, women-owned, and veteran-owned businesses to consider partnering with us.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Accountability</h2>
          <p className="text-muted-foreground leading-relaxed">Our management team is responsible for upholding these standards at every location. Employees who witness or experience discrimination, harassment, or inequitable treatment are encouraged to report it to a store manager or company leadership without fear of retaliation.</p>
        </section>
      </div>
    </div>
  );
}
