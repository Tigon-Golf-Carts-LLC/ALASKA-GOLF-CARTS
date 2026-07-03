import { SeoHead } from "@/components/seo-head";
import { PHONE_NUMBER, PHONE_TEL } from "@/lib/constants";
import { POLICY_ROUTES, SITE_URL } from "@shared/seo-routes";

const meta = POLICY_ROUTES["/privacy-policy"];

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <SeoHead
        title={meta.title}
        description={meta.description}
        canonical={`${SITE_URL}/privacy-policy`}
      />
      <h1 className="text-3xl font-extrabold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: June 2025</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-3">Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">When you visit alaskagolfcarts.com or contact us by phone, we may collect personal information including your name, phone number, email address, and general location. We also collect non-personal browsing data such as IP address, browser type, pages visited, and referral source through standard web analytics tools including Google Analytics and Google Tag Manager.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">How We Use Your Information</h2>
          <p className="text-muted-foreground leading-relaxed">Information you provide is used solely to respond to inquiries, process purchases, arrange financing, coordinate delivery, and communicate about your order. We do not sell, rent, or share your personal information with unaffiliated third parties for marketing purposes. Analytics data is used to improve our website and advertising performance.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Cookies & Tracking</h2>
          <p className="text-muted-foreground leading-relaxed">This website uses cookies and similar tracking technologies to improve user experience and measure advertising performance. By using this site, you consent to the placement of cookies. You may disable cookies in your browser settings, though this may affect certain functionality of the site.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Third-Party Services</h2>
          <p className="text-muted-foreground leading-relaxed">We use Google Analytics, Google Tag Manager, and Google Ads to measure website performance and reach potential customers. These services may collect data subject to Google's own privacy policies. We also share limited customer data with financing partners solely for the purpose of processing loan applications at your request.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">We take reasonable measures to protect the information you provide to us. Our website uses HTTPS encryption. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">You may request to access, correct, or delete personal information we have collected about you by contacting us directly. We will respond to reasonable requests within 30 days.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Contact</h2>
          <p className="text-muted-foreground leading-relaxed">Privacy questions or requests may be directed to <a href={PHONE_TEL} className="text-primary font-semibold hover:underline">{PHONE_NUMBER}</a> or submitted in writing at any Alaska Golf Carts retail location.</p>
        </section>
      </div>
    </div>
  );
}
