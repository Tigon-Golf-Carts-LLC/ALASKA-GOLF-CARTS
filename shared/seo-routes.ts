export const SITE_URL = "https://alaskagolfcarts.com";
export const SITE_NAME = "Alaska Golf Carts";

export interface PolicyRouteMeta {
  title: string;
  description: string;
  breadcrumbLabel: string;
}

export const POLICY_ROUTES: Record<string, PolicyRouteMeta> = {
  "/terms-conditions": {
    title: "Terms & Conditions | Alaska Golf Carts",
    description:
      "Terms and conditions for purchasing, financing, and using the services of Alaska Golf Carts.",
    breadcrumbLabel: "Terms & Conditions",
  },
  "/return-policy": {
    title: "Return Policy | Alaska Golf Carts",
    description: "Return and exchange policy for golf cart purchases at Alaska Golf Carts.",
    breadcrumbLabel: "Return Policy",
  },
  "/privacy-policy": {
    title: "Privacy Policy | Alaska Golf Carts",
    description:
      "Privacy policy for alaskagolfcarts.com — how we collect, use, and protect your personal information.",
    breadcrumbLabel: "Privacy Policy",
  },
  "/delivery-policy": {
    title: "Delivery Policy | Alaska Golf Carts",
    description:
      "Golf cart delivery policy for Alaska Golf Carts — statewide Alaska delivery and local pickup options.",
    breadcrumbLabel: "Delivery Policy",
  },
  "/rental-policy": {
    title: "Rental Policy | Alaska Golf Carts",
    description: "Golf cart rental terms and conditions at Alaska Golf Carts.",
    breadcrumbLabel: "Rental Policy",
  },
  "/storage-policy": {
    title: "Storage Policy | Alaska Golf Carts",
    description: "Golf cart storage terms and conditions at Alaska Golf Carts.",
    breadcrumbLabel: "Storage Policy",
  },
  "/publishing-policy": {
    title: "Publishing Policy | Alaska Golf Carts",
    description: "Content publishing standards and guidelines for alaskagolfcarts.com.",
    breadcrumbLabel: "Publishing Policy",
  },
  "/feedback-policy": {
    title: "Feedback Policy | Alaska Golf Carts",
    description: "How Alaska Golf Carts collects and responds to customer feedback.",
    breadcrumbLabel: "Feedback Policy",
  },
  "/corrections-policy": {
    title: "Corrections Policy | Alaska Golf Carts",
    description: "How Alaska Golf Carts handles and corrects errors on alaskagolfcarts.com.",
    breadcrumbLabel: "Corrections Policy",
  },
  "/diversity-policy": {
    title: "Diversity Policy | Alaska Golf Carts",
    description: "Diversity, equity, and inclusion policy for Alaska Golf Carts.",
    breadcrumbLabel: "Diversity Policy",
  },
  "/ethics-policy": {
    title: "Ethics Policy | Alaska Golf Carts",
    description: "Business ethics and code of conduct for Alaska Golf Carts.",
    breadcrumbLabel: "Ethics Policy",
  },
  "/staffing-report": {
    title: "Staffing Report | Alaska Golf Carts",
    description: "Annual staffing and workforce overview for Alaska Golf Carts.",
    breadcrumbLabel: "Staffing Report",
  },
};
