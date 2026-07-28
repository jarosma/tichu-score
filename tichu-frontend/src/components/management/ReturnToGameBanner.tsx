import { ArrowLeft } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InlineMessage } from "@/components/feedback/InlineMessage";

export function ReturnToGameBanner() {
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const canReturn = Boolean(
    returnTo?.startsWith("/") && !returnTo.startsWith("//"),
  );

  if (!canReturn) return null;

  return (
    <InlineMessage variant="info">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>Du bist aus dem Spielsetup hierher gekommen.</span>
        <Button asChild size="sm" variant="outline">
          <Link to={returnTo!}>
            <ArrowLeft />
            Zurück zum Spiel
          </Link>
        </Button>
      </div>
    </InlineMessage>
  );
}
