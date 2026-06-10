import { SeoHead } from "@/components/seo-head";
import { PHONE_NUMBER, PHONE_TEL } from "@/lib/constants";

export default function TermsConditions() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <SeoHead
        title="Terms & Conditions | Discounted Golf Carts"
        description="Terms and conditions for purchasing, financing, and using the services of Discounted Golf Carts."
        canonical="https://discountedgolfcart.com/terms-conditions"
      />
      <h1 className="text-3xl font-extrabold mb-2">Terms &amp; Conditions</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: June 2025</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-3">1. Agreement to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">By accessing the website discountedgolfcart.com or purchasing any product or service from Discounted Golf Carts, you agree to be bound by these Terms &amp; Conditions. If you do not agree, please do not use our website or services. Discounted Golf Carts is a DBA (doing business as) of Tigon Golf Carts LLC, a registered limited liability company. Inventory listed on this site is sourced from multiple dealership entities including Tigon Golf Carts, Coastal Carts, and Tri State Carts.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">2. Pricing & Inventory</h2>
          <p className="text-muted-foreground leading-relaxed">All pricing displayed on discountedgolfcart.com reflects current wholesale MSRP and is updated nightly. Prices are subject to change without notice. Inventory availability is not guaranteed until a purchase agreement is signed and a deposit is received. Discounted Golf Carts reserves the right to correct pricing errors at any time.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">3. Purchase Agreements</h2>
          <p className="text-muted-foreground leading-relaxed">All sales are subject to a written purchase agreement executed between the buyer and the applicable dealership entity. Online inquiries, quote requests, and phone conversations do not constitute a binding purchase agreement. A deposit may be required to hold a specific unit.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">4. Financing</h2>
          <p className="text-muted-foreground leading-relaxed">Financing is offered through third-party lending partners. Approval, terms, and rates are subject to lender qualification criteria. Advertised 0% APR promotional rates may require approved credit and are subject to lender availability. Discounted Golf Carts is not a lender and makes no guarantee of financing approval.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">5. Warranties</h2>
          <p className="text-muted-foreground leading-relaxed">New golf carts are sold with the manufacturer's limited warranty as provided by the respective brand (Club Car, EZGO, Yamaha, Denago, Evolution, etc.). Used golf carts are sold as-is unless a separate written warranty is provided at the time of sale. No implied warranties are made beyond what is expressly stated in writing.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">6. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">To the fullest extent permitted by law, Discounted Golf Carts and Tigon Golf Carts LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from the use of our products, services, or website. Our total liability shall not exceed the amount paid for the specific product or service in question.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">7. Governing Law</h2>
          <p className="text-muted-foreground leading-relaxed">These Terms &amp; Conditions shall be governed by and construed in accordance with the laws of the Commonwealth of Pennsylvania, without regard to its conflict of law provisions.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">8. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">Questions regarding these terms may be directed to us by phone at <a href={PHONE_TEL} className="text-primary font-semibold hover:underline">{PHONE_NUMBER}</a> or in writing at any of our retail locations.</p>
        </section>
      </div>
    </div>
  );
}
