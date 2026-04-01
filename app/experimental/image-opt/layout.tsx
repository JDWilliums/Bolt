import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import StyledComponentsRegistry from "@/lib/StyledComponentsRegistry";

export const metadata = {
  title: "Bolt Store — Image Optimised (Stage A)",
};

export default function ImageOptLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar basePath="/experimental/image-opt" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap"
        rel="stylesheet"
      />
      {process.env.NEXT_PUBLIC_BOLT_SIMULATE_DELAY !== "false" && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var start = Date.now();
                while (Date.now() - start < 200) {}
                console.log('[Bolt Stage A] Blocking script executed — simulated 200ms of third-party overhead');
              })();
            `,
          }}
        />
      )}
      <StyledComponentsRegistry>
        <div className="flex-1" style={{ fontFamily: "'Inter', sans-serif" }}>
          {children}
        </div>
      </StyledComponentsRegistry>
      <Footer />
    </>
  );
}
