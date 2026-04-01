import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import StyledComponentsRegistry from "@/lib/StyledComponentsRegistry";

export const metadata = {
  title: "Bolt Store — Control (Legacy CSR)",
};

export default function ControlLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar basePath="/control/legacy" />

      {/*
        ANTI-PATTERN: RENDER-BLOCKING EXTERNAL FONT
        This <link> forces the browser to make a cross-origin DNS lookup,
        TCP connection, and download of the Google Fonts CSS + font files
        before it can render text — delaying FCP and LCP.
        The experimental group uses next/font which self-hosts and preloads.
      */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap"
        rel="stylesheet"
      />

      {/*
        BLOCKING THIRD-PARTY SCRIPT SIMULATION
        This inline script deliberately blocks the main thread for ~200ms,
        simulating the cost of loading analytics, chat widgets, or consent
        managers synchronously — a common anti-pattern in production sites.
      */}
      {process.env.NEXT_PUBLIC_BOLT_SIMULATE_DELAY !== "false" && (
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
      )}

      {/*
        ANTI-PATTERN: CSS-IN-JS RUNTIME OVERHEAD
        StyledComponentsRegistry wraps children so styled-components can
        inject <style> tags at runtime, adding to Total Blocking Time.
      */}
      <StyledComponentsRegistry>
        <div className="flex-1" style={{ fontFamily: "'Inter', sans-serif" }}>
          {children}
        </div>
      </StyledComponentsRegistry>
      <Footer />
    </>
  );
}
