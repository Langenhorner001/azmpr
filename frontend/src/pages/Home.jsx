import React, { useState } from "react";
import TopPromoBar from "../components/v2/TopPromoBar";
import Header from "../components/v2/Header";
import Hero from "../components/v2/Hero";
import TrustBadges from "../components/v2/TrustBadges";
import ProductSection from "../components/v2/ProductSection";
import ProductMarquee from "../components/v2/ProductMarquee";
import WhyAZ from "../components/v2/WhyAZ";
import Testimonials from "../components/v2/Testimonials";
import StatsStrip from "../components/v2/StatsStrip";
import FinalCTA from "../components/v2/FinalCTA";
import Footer from "../components/v2/SiteFooter";
import FloatingWhatsApp from "../components/FloatingWhatsApp";
import CartDrawer from "../components/v2/CartDrawer";
import RecentPurchaseToast from "../components/v2/RecentPurchaseToast";
import { SiteSettingsProvider } from "../context/SiteSettingsContext";

const Home = () => {
  const [productList, setProductList] = useState([]);
  return (
    <SiteSettingsProvider>
    <div className="min-h-screen bg-white dark:bg-stone-950 antialiased" data-testid="home-page">
      <TopPromoBar />
      <Header />
      <main>
        <Hero />
        <TrustBadges />
        <ProductMarquee products={productList} />
        <ProductSection onProductsLoaded={setProductList} />
        <WhyAZ />
        <Testimonials />
        <StatsStrip />
        <FinalCTA />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <CartDrawer />
      <RecentPurchaseToast products={productList} />
    </div>
    </SiteSettingsProvider>
  );
};

export default Home;
