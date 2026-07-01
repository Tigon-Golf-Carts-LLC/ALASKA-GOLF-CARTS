import { SeoHead } from "@/components/seo-head";
import { PHONE_NUMBER, PHONE_TEL } from "@/lib/constants";

export default function FeedbackPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <SeoHead
        title="Feedback Policy | Alaska Golf Carts"
        description="How Alaska Golf Carts collects and responds to customer feedback."
        canonical="https://alaskagolfcarts.com/feedback-policy"
      />
      <h1 className="text-3xl font-extrabold mb-2">Feedback Policy</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: June 2025</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-3">We Value Your Feedback</h2>
          <p className="text-muted-foreground leading-relaxed">Alaska Golf Carts is committed to continuous improvement through customer feedback. We welcome input from buyers, prospective customers, and community members on all aspects of our business — from website experience to in-store service to product quality.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">How to Submit Feedback</h2>
          <p className="text-muted-foreground leading-relaxed">Feedback can be submitted by calling us at <a href={PHONE_TEL} className="text-primary font-semibold hover:underline">{PHONE_NUMBER}</a>, reaching our team anywhere in Florida, or leaving a review on Google. We encourage honest and detailed feedback to help us understand your experience.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">How We Handle Feedback</h2>
          <p className="text-muted-foreground leading-relaxed">All feedback is reviewed by our management team. Positive feedback is shared with the relevant team members. Negative or critical feedback is treated as an opportunity for improvement. We commit to acknowledging complaints within 2 business days and resolving them within 10 business days where possible.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Online Reviews</h2>
          <p className="text-muted-foreground leading-relaxed">We encourage satisfied customers to leave honest reviews on Google and other platforms. We do not incentivize, solicit, or fabricate reviews. All responses to online reviews are written by authorized Alaska Golf Carts staff and aim to be helpful, respectful, and accurate.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Feedback Confidentiality</h2>
          <p className="text-muted-foreground leading-relaxed">Feedback submitted privately by phone or in person is treated as confidential and used solely for internal improvement purposes. We will not publicly attribute feedback to individual customers without their explicit consent.</p>
        </section>
      </div>
    </div>
  );
}
