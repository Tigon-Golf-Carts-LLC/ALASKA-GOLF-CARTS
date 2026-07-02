export const SITE_URL = "https://discountedgolfcart.com";
export const SITE_NAME = "Discounted Golf Carts";

export interface PolicyRouteMeta {
  title: string;
  description: string;
  breadcrumbLabel: string;
}

export const POLICY_ROUTES: Record<string, PolicyRouteMeta> = {
  "/terms-conditions": {
    title: "Terms & Conditions | Discounted Golf Carts",
    description:
      "Terms and conditions for purchasing, financing, and using the services of Discounted Golf Carts.",
    breadcrumbLabel: "Terms & Conditions",
  },
  "/return-policy": {
    title: "Return Policy | Discounted Golf Carts",
    description: "Return and exchange policy for golf cart purchases at Discounted Golf Carts.",
    breadcrumbLabel: "Return Policy",
  },
  "/privacy-policy": {
    title: "Privacy Policy | Discounted Golf Carts",
    description:
      "Privacy policy for discountedgolfcart.com — how we collect, use, and protect your personal information.",
    breadcrumbLabel: "Privacy Policy",
  },
  "/delivery-policy": {
    title: "Delivery Policy | Discounted Golf Carts",
    description:
      "Golf cart delivery policy for Discounted Golf Carts — nationwide shipping and local delivery options.",
    breadcrumbLabel: "Delivery Policy",
  },
  "/rental-policy": {
    title: "Rental Policy | Discounted Golf Carts",
    description: "Golf cart rental terms and conditions at Discounted Golf Carts.",
    breadcrumbLabel: "Rental Policy",
  },
  "/storage-policy": {
    title: "Storage Policy | Discounted Golf Carts",
    description: "Golf cart storage terms and conditions at Discounted Golf Carts.",
    breadcrumbLabel: "Storage Policy",
  },
  "/publishing-policy": {
    title: "Publishing Policy | Discounted Golf Carts",
    description: "Content publishing standards and guidelines for discountedgolfcart.com.",
    breadcrumbLabel: "Publishing Policy",
  },
  "/feedback-policy": {
    title: "Feedback Policy | Discounted Golf Carts",
    description: "How Discounted Golf Carts collects and responds to customer feedback.",
    breadcrumbLabel: "Feedback Policy",
  },
  "/corrections-policy": {
    title: "Corrections Policy | Discounted Golf Carts",
    description: "How Discounted Golf Carts handles and corrects errors on discountedgolfcart.com.",
    breadcrumbLabel: "Corrections Policy",
  },
  "/diversity-policy": {
    title: "Diversity Policy | Discounted Golf Carts",
    description: "Diversity, equity, and inclusion policy for Discounted Golf Carts.",
    breadcrumbLabel: "Diversity Policy",
  },
  "/ethics-policy": {
    title: "Ethics Policy | Discounted Golf Carts",
    description: "Business ethics and code of conduct for Discounted Golf Carts.",
    breadcrumbLabel: "Ethics Policy",
  },
  "/staffing-report": {
    title: "Staffing Report | Discounted Golf Carts",
    description: "Annual staffing and workforce overview for Discounted Golf Carts.",
    breadcrumbLabel: "Staffing Report",
  },
};
