import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export const metadata = {
  title: "Bolt Store | Server Components (Stage B)",
};

export default function RSCLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar basePath="/experimental/rsc" />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
