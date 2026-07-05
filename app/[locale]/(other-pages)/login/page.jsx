import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import LoginPageContent from "./LoginPageContent";

export const metadata = {
  title: "Login || Stevia - Multipurpose React Nextjs eCommerce Template",
  description: "Stevia - Multipurpose React Nextjs eCommerce Template",
};

export default function LoginPage() {
  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <Header1 />
      <LoginPageContent />
      <Footer1 />
    </>
  );
}
