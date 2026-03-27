import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export const metadata = {
  title: "Bolt Store — Control (Legacy CSR)",
};

export default function ControlLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar basePath="/control/legacy" />

      {/*
        BLOCKING THIRD-PARTY SCRIPT SIMULATION
        This inline script deliberately blocks the main thread for ~200ms,
        simulating the cost of loading analytics, chat widgets, or consent
        managers synchronously — a common anti-pattern in production sites.
      */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var start = Date.now();
              while (Date.now() - start < 200) {} // Block main thread for 200ms
              console.log('[Bolt Control] Blocking script executed — simulated 200ms of third-party overhead');
            })();
          `,
        }}
      />

      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
