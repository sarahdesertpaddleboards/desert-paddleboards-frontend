import { QRCodeSVG } from "qrcode.react";
import { Navigation, Smartphone } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { directionsUrl, type Destination } from "@/lib/directions";
import { trackEvent } from "@/lib/analytics";

/**
 * "Directions" + "Send to phone" for a venue.
 *  - Directions: opens Google Maps directions (the Maps app on a phone, with
 *    turn-by-turn from the user's current location; google.com/maps on desktop).
 *  - Send to phone: a QR of that link. Only shown on ≥sm screens — on a phone,
 *    tapping Directions already opens the maps app, so a QR would be pointless.
 */
export default function DirectionsButton({
  dest,
  className = "",
}: {
  dest: Destination;
  className?: string;
}) {
  const url = directionsUrl(dest);

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("directions_click", { venue: dest.label })}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-primary px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
      >
        <Navigation className="h-3.5 w-3.5" />
        Directions
      </a>

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            onClick={() =>
              trackEvent("directions_send_to_phone", { venue: dest.label })
            }
            className="hidden cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-brand-dark sm:inline-flex"
          >
            <Smartphone className="h-3.5 w-3.5" />
            Send to phone
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-60 bg-white text-center">
          <p className="text-sm font-semibold text-foreground">
            Directions on your phone
          </p>
          <div className="mx-auto mt-3 w-fit rounded-lg border border-border bg-white p-2.5">
            <QRCodeSVG value={url} size={148} />
          </div>
          <p className="mt-3 text-xs leading-snug text-muted-foreground">
            Point your phone&apos;s camera at the code — it opens turn-by-turn
            directions in Maps.
          </p>
        </PopoverContent>
      </Popover>
    </div>
  );
}
