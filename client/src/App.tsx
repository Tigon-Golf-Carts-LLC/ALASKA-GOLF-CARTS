import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Home from "@/pages/home";
import Inventory from "@/pages/inventory";
import CartDetail from "@/pages/cart-detail";
import Financing from "@/pages/financing";
import FAQ from "@/pages/faq";
import About from "@/pages/about";
import ServiceArea from "@/pages/service-area";
import TermsConditions from "@/pages/policies/terms-conditions";
import ReturnPolicy from "@/pages/policies/return-policy";
import PrivacyPolicy from "@/pages/policies/privacy-policy";
import DeliveryPolicy from "@/pages/policies/delivery-policy";
import RentalPolicy from "@/pages/policies/rental-policy";
import StoragePolicy from "@/pages/policies/storage-policy";
import PublishingPolicy from "@/pages/policies/publishing-policy";
import FeedbackPolicy from "@/pages/policies/feedback-policy";
import CorrectionsPolicy from "@/pages/policies/corrections-policy";
import DiversityPolicy from "@/pages/policies/diversity-policy";
import EthicsPolicy from "@/pages/policies/ethics-policy";
import StaffingReport from "@/pages/policies/staffing-report";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/golfcart/:slug" component={CartDetail} />
      <Route path="/financing" component={Financing} />
      <Route path="/faq" component={FAQ} />
      <Route path="/about" component={About} />
      <Route path="/service-area" component={ServiceArea} />
      <Route path="/terms-conditions" component={TermsConditions} />
      <Route path="/return-policy" component={ReturnPolicy} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/delivery-policy" component={DeliveryPolicy} />
      <Route path="/rental-policy" component={RentalPolicy} />
      <Route path="/storage-policy" component={StoragePolicy} />
      <Route path="/publishing-policy" component={PublishingPolicy} />
      <Route path="/feedback-policy" component={FeedbackPolicy} />
      <Route path="/corrections-policy" component={CorrectionsPolicy} />
      <Route path="/diversity-policy" component={DiversityPolicy} />
      <Route path="/ethics-policy" component={EthicsPolicy} />
      <Route path="/staffing-report" component={StaffingReport} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Header />
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
