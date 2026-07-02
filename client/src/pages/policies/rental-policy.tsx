import { SeoHead } from "@/components/seo-head";
import { PHONE_NUMBER, PHONE_TEL } from "@/lib/constants";
import { POLICY_ROUTES, SITE_URL } from "@shared/seo-routes";

const meta = POLICY_ROUTES["/rental-policy"];

export default function RentalPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <SeoHead
        title={meta.title}
        description={meta.description}
        canonical={`${SITE_URL}/rental-policy`}
      />
      <h1 className="text-3xl font-extrabold mb-2">Rental Policy</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: June 2025</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-3">Rental Availability</h2>
          <p className="text-muted-foreground leading-relaxed">Golf cart rentals are available at select Discounted Golf Carts locations. Rental availability, pricing, and unit selection vary by location. Please call <a href={PHONE_TEL} className="text-primary font-semibold hover:underline">{PHONE_NUMBER}</a> or visit your nearest location to inquire about current rental inventory and rates.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Eligibility</h2>
          <p className="text-muted-foreground leading-relaxed">Renters must be at least 18 years of age and possess a valid government-issued photo ID. A valid credit or debit card is required at the time of rental for the security deposit. Discounted Golf Carts reserves the right to refuse rental to any individual at its discretion.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Rental Agreement</h2>
          <p className="text-muted-foreground leading-relaxed">All rentals require a signed rental agreement outlining the rental period, mileage or usage terms (if applicable), security deposit amount, and renter responsibilities. The rental agreement is a binding contract and supersedes any verbal representations.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Security Deposit</h2>
          <p className="text-muted-foreground leading-relaxed">A refundable security deposit is required at the time of rental. The deposit amount is determined by the unit type and rental duration. The deposit will be returned within 5–7 business days of the unit's return, less any charges for damage, excessive cleaning, or late return fees.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Permitted Use</h2>
          <p className="text-muted-foreground leading-relaxed">Rental golf carts may only be operated by the authorized renter listed on the rental agreement. Sub-leasing or allowing unauthorized operators is strictly prohibited. Carts must be operated in accordance with all applicable local, state, and federal laws. Off-road use, racing, or use on public roads where not legally permitted is prohibited.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Damage & Liability</h2>
          <p className="text-muted-foreground leading-relaxed">The renter is responsible for all damage to the cart that occurs during the rental period, regardless of fault, except for pre-existing damage documented at the time of rental. Renters are strongly encouraged to carry personal liability insurance. Discounted Golf Carts assumes no liability for accidents, injuries, or property damage arising from the use of a rental unit.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Returns</h2>
          <p className="text-muted-foreground leading-relaxed">Rental units must be returned on time and in the same condition as rented. Late returns will be charged at the daily rental rate for each additional day or portion thereof. Carts returned with significantly depleted batteries or excessive dirt may incur cleaning or recharging fees.</p>
        </section>
      </div>
    </div>
  );
}
