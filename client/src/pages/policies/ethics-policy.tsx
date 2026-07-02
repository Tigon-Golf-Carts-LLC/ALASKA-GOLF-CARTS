import { SeoHead } from "@/components/seo-head";
import { PHONE_NUMBER, PHONE_TEL } from "@/lib/constants";
import { POLICY_ROUTES, SITE_URL } from "@shared/seo-routes";

const meta = POLICY_ROUTES["/ethics-policy"];

export default function EthicsPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <SeoHead
        title={meta.title}
        description={meta.description}
        canonical={`${SITE_URL}/ethics-policy`}
      />
      <h1 className="text-3xl font-extrabold mb-2">Ethics Policy</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: June 2025</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-3">Our Core Values</h2>
          <p className="text-muted-foreground leading-relaxed">Discounted Golf Carts operates on a foundation of integrity, transparency, and respect — for our customers, our team members, our business partners, and the communities we serve. These values are not aspirational; they are operational requirements that guide every decision at every level of our company.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Honest Business Practices</h2>
          <p className="text-muted-foreground leading-relaxed">We are committed to honest, transparent business practices. This includes accurate pricing, truthful advertising, full disclosure of known vehicle conditions, and clear communication about financing terms. We do not engage in deceptive sales tactics, hidden fees, or misleading representations of any kind.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Conflicts of Interest</h2>
          <p className="text-muted-foreground leading-relaxed">Employees must avoid situations in which personal interests conflict — or could appear to conflict — with the interests of the company or its customers. Acceptance of gifts, kickbacks, or undisclosed compensation from vendors, suppliers, or customers is prohibited.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Compliance with Laws</h2>
          <p className="text-muted-foreground leading-relaxed">All employees are required to conduct business in full compliance with applicable federal, state, and local laws, including consumer protection statutes, dealer licensing requirements, truth-in-advertising regulations, and employment law. Ignorance of a legal requirement is not an excuse for non-compliance.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Reporting Violations</h2>
          <p className="text-muted-foreground leading-relaxed">Employees who are aware of, or who suspect, unethical behavior or policy violations are expected to report it to a manager or company leadership. Reports may also be made anonymously. Retaliation against anyone who makes a good-faith report of a potential violation is strictly prohibited.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Customer Concerns</h2>
          <p className="text-muted-foreground leading-relaxed">Customers who believe they have been treated unethically are encouraged to call <a href={PHONE_TEL} className="text-primary font-semibold hover:underline">{PHONE_NUMBER}</a> to speak with management. We take every concern seriously and commit to a prompt and fair response.</p>
        </section>
      </div>
    </div>
  );
}
