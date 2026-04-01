import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export const metadata = {
  title: "Bolt Store — No Delay (Stage D)",
};

export default function NoDelayLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar basePath="/experimental/nodelay" />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
