import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export const metadata = {
  title: "Bolt Store — Experimental (Optimised RSC)",
};

export default function ExperimentalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar basePath="/experimental/modern" />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
