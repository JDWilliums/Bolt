export default function Footer() {
  return (
    <footer className="bg-black text-white mt-auto">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4">Shop</h3>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>Running</li>
              <li>Training</li>
              <li>Lifestyle</li>
              <li>Basketball</li>
              <li>Football</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4">Help</h3>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>Order Status</li>
              <li>Delivery</li>
              <li>Returns</li>
              <li>Contact Us</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4">About</h3>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>News</li>
              <li>Careers</li>
              <li>Sustainability</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4">Bolt</h3>
            <p className="text-sm text-neutral-300">
              Engineered for zero latency. Designed for peak performance.
            </p>
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-300">
          <p>&copy; 2026 Bolt. BSc Dissertation Artifact - Jack Williams.</p>
          <p>Cardiff Metropolitan University - ST20271634</p>
        </div>
      </div>
    </footer>
  );
}
