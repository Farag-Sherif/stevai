import BannerTab2 from "@/components/common/BannerTab2";
import Features from "@/components/common/Features";
import MarqueeSection2 from "@/components/common/MarqueeSection2";
import Products5 from "@/components/products/Products5";

import ShopGram4 from "@/components/common/ShopGram4";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import SidebarDrawer from "@/components/modals/SidebarDrawer";
import Banner from "@/components/homes/cosmetic/Banner";
import Collections from "@/components/homes/cosmetic/Collections";
import Hero from "@/components/homes/cosmetic/Hero";
import NewOffers from "@/components/common/NewOffers";
import BrandCategories from "@/components/products/BrandCategories";
import React from "react";

export const metadata = {
  title: "Home Stevia",
  description: "Home Stevia",
};

export default function HomeCosmeticPage() {
  return (
    <>
      <Header1 />
      <SidebarDrawer />
      <section className="container py-4">
        <div className="row g-4">
          <div className="col-12 d-flex flex-column gap-4">
            <div id="beauty">
              <Hero />
            </div>
            <MarqueeSection2 />
            <div id="body">
              <Collections />
            </div>
            <div id="bestsellers">
              <Products5 />
            </div>
            <Banner />
            <div id="new-offers">
              <NewOffers parentClass="flat-spacing" />
            </div>
            <div id="offers">
              <BannerTab2 parentClass="flat-spacing" />
            </div>
            <div id="brands">
              <BrandCategories />
            </div>
            <Features parentClass="flat-spacing line-top-container" />
            <ShopGram4 />
          </div>
        </div>
      </section>
      <Footer1 />
    </>
  );
}
