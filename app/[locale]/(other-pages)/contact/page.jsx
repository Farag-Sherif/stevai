import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import Contact2 from "@/components/otherPages/Contact2";
import React from "react";

export const metadata = {
  title: "Contact || Stevia - Multipurpose React Nextjs eCommerce Template",
  description: "Stevia - Multipurpose React Nextjs eCommerce Template",
};

export default function ContactPage() {
  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <Header1 />
      <Contact2 />
      <Footer1 />
    </>
  );
}
