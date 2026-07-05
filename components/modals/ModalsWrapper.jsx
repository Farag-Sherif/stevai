"use client";

import dynamic from "@/utils/dynamic";
import { Toaster } from "react-hot-toast";

// Dynamically import heavy modals for code splitting and faster initial load
const CartModal = dynamic(() => import("@/components/modals/CartModal"), {
  ssr: false, // Modals don't need SSR
});
const QuickView = dynamic(() => import("@/components/modals/QuickView"), {
  ssr: false,
});
const QuickAdd = dynamic(() => import("@/components/modals/QuickAdd"), {
  ssr: false,
});
const Compare = dynamic(() => import("@/components/modals/Compare"), {
  ssr: false,
});
const MobileMenu = dynamic(() => import("@/components/modals/MobileMenu"), {
  ssr: false,
});
const SearchModal = dynamic(() => import("@/components/modals/SearchModal"), {
  ssr: false,
});
const SizeGuide = dynamic(() => import("@/components/modals/SizeGuide"), {
  ssr: false,
});
const Wishlist = dynamic(() => import("@/components/modals/Wishlist"), {
  ssr: false,
});
const DemoModal = dynamic(() => import("@/components/modals/DemoModal"), {
  ssr: false,
});
const Categories = dynamic(() => import("@/components/modals/Categories"), {
  ssr: false,
});
const AccountSidebar = dynamic(() => import("@/components/modals/AccountSidebar"), {
  ssr: false,
});
const CategoriesSidebarToggle = dynamic(() => import("@/components/common/CategoriesSidebarToggle"), {
  ssr: false,
});

export default function ModalsWrapper() {
  return (
    <>
      <CartModal />
      <QuickView />
      <QuickAdd />
      <Compare />
      <MobileMenu />
      <Toaster />
      <SearchModal />
      <SizeGuide />
      <Wishlist />
      <DemoModal />
      <Categories />
      <AccountSidebar />
      <CategoriesSidebarToggle />
    </>
  );
}

