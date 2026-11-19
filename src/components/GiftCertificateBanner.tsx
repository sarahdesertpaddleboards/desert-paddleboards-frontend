import { Gift } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useFareHarborEmbed } from "@/components/FareHarborButton";
import { GIFT_CERTIFICATE_URL } from "@/data/locations";
import { trackEvent } from "@/lib/analytics";
import { fareHarborUrl } from "@/lib/utm";

/**
 * Slim site-wide announcement bar above the header — makes gift certificates
 * the first thing visitors see. Opens the FareHarbor gift-certificate
 * lightframe directly (same item as the Shop page's gift section).
 */
export default function GiftCertificateBanner() {
  useFareHarborEmbed();
  const { pathname } = useLocation();

  // Track on pointerdown/Enter, not onClick — FareHarbor's autolightframe
  // script swallows the click (see FareHarborButton).
  const track = () => trackEvent("shop_click", { product: "Gift certificate", placement: "top_banner" });

  return (
    <a
      href={fareHarborUrl(GIFT_CERTIFICATE_URL, { page: pathname, placement: "top_banner" })}
      onPointerDown={(e) => {
        if (e.button === 0) track();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") track();
      }}
      className="group block bg-brand px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
    >
      <span className="inline-flex items-center gap-2">
        <Gift className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          <span className="hidden sm:inline">Give the gift of floating — </span>
          <span className="font-semibold underline underline-offset-2">
            Buy a gift certificate
          </span>
          <span aria-hidden="true" className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </span>
    </a>
  );
}
