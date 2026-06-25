import { useEffect } from "react";
import { fareHarborBookUrl } from "@/data/locations";
import { trackEvent } from "@/lib/analytics";
import { appendUtms } from "@/lib/utm";

/**
 * FareHarbor Lightframe.
 *
 * The autolightframe API script watches the page for clicks on links that
 * point at fareharbor.com/embeds/book/... and opens them in an overlay
 * ("lightframe") instead of navigating away. So we just need to (a) ensure
 * the script is loaded once, and (b) render a normal <a> with the embed URL.
 */
const FH_SCRIPT_SRC =
  "https://fareharbor.com/embeds/api/v1/?autolightframe=yes";

/** Inject the FareHarbor embed API script once per document. */
export function useFareHarborEmbed(): void {
  useEffect(() => {
    if (document.querySelector(`script[src="${FH_SCRIPT_SRC}"]`)) return;
    const script = document.createElement("script");
    script.src = FH_SCRIPT_SRC;
    script.async = true;
    document.head.appendChild(script);
  }, []);
}

interface FareHarborButtonProps {
  itemId: number;
  children?: React.ReactNode;
  className?: string;
}

const defaultClassName =
  "inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 " +
  "text-sm font-semibold text-primary-foreground shadow-sm transition-colors " +
  "hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 " +
  "focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer";

export default function FareHarborButton({
  itemId,
  children = "Check dates & book",
  className,
}: FareHarborButtonProps) {
  useFareHarborEmbed();

  return (
    <a
      href={appendUtms(fareHarborBookUrl(itemId))}
      className={className ?? defaultClassName}
      onClick={() => trackEvent("book_click", { item_id: itemId })}
    >
      {children}
    </a>
  );
}
