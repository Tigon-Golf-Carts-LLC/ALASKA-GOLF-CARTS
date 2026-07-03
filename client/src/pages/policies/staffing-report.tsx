import { SeoHead } from "@/components/seo-head";
import { POLICY_ROUTES, SITE_URL } from "@shared/seo-routes";

const meta = POLICY_ROUTES["/staffing-report"];

export default function StaffingReport() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <SeoHead
        title={meta.title}
        description={meta.description}
        canonical={`${SITE_URL}/staffing-report`}
      />
      <h1 className="text-3xl font-extrabold mb-2">Staffing Report</h1>
      <p className="text-muted-foreground text-sm mb-8">Reporting period: 2024–2025</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-3">Overview</h2>
          <p className="text-muted-foreground leading-relaxed">This report provides a general overview of staffing at Alaska Golf Carts across our Florida operations, serving all 67 counties statewide. Our workforce is the foundation of our customer experience and reflects our commitment to growth, diversity, and local employment.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Workforce Size</h2>
          <p className="text-muted-foreground leading-relaxed">Alaska Golf Carts currently employs team members across sales, service, parts, delivery, and administrative functions. Staffing levels vary by location and season. We continue to add positions as we expand into new markets.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Roles & Departments</h2>
          <div className="space-y-2 text-muted-foreground">
            {[
              { role: "Sales Associates", desc: "Front-line staff assisting customers with inventory selection, pricing, and financing at each retail location." },
              { role: "Service Technicians", desc: "Factory-trained technicians performing PDIs, warranty repairs, and customer service work." },
              { role: "Parts & Accessories", desc: "Team members managing parts inventory, fulfillment, and customer orders." },
              { role: "Delivery Drivers", desc: "Licensed drivers coordinating local and regional cart deliveries." },
              { role: "Store Management", desc: "Location managers and assistant managers responsible for daily operations." },
              { role: "Corporate & Administrative", desc: "Finance, marketing, HR, and operations staff supporting all locations." },
            ].map((item) => (
              <div key={item.role} className="flex gap-3">
                <span className="font-semibold text-foreground min-w-[180px]">{item.role}</span>
                <span className="leading-relaxed">{item.desc}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Hiring Practices</h2>
          <p className="text-muted-foreground leading-relaxed">We recruit locally across Florida, prioritizing community members with an interest in outdoor power equipment, automotive sales, or customer service. We value work ethic and trainability equally with prior experience. All positions are posted publicly through standard job listing platforms.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Training & Development</h2>
          <p className="text-muted-foreground leading-relaxed">New team members receive structured onboarding covering product knowledge, sales process, compliance requirements, and customer service standards. Service technicians have access to brand-specific training through manufacturer programs from Club Car, EZGO, Yamaha, Denago, Evolution, and other authorized brands.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Equal Opportunity</h2>
          <p className="text-muted-foreground leading-relaxed">Alaska Golf Carts is an equal opportunity employer. All qualified applicants will receive consideration without regard to race, color, religion, sex, national origin, disability, age, or any other protected characteristic. See our Diversity Policy for full details.</p>
        </section>
      </div>
    </div>
  );
}
