import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useRef, useState } from "react";
import { InlineMessage } from "@/components/feedback/InlineMessage";
import { focusIfConnected } from "@/lib/focus";

interface GameQrDialogProps {
  submitScoreUrl: string;
}

export function GameQrDialog({ submitScoreUrl }: GameQrDialogProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(submitScoreUrl);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          ref={triggerRef}
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
          aria-label="Punkteingabe per QR-Code öffnen"
          data-enter-primary="true"
        >
          <QrCode className="h-6 w-6" />
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-md text-center"
        closeButtonRef={closeButtonRef}
        onOpenAutoFocus={(event) => {
          if (focusIfConnected(closeButtonRef.current)) event.preventDefault();
        }}
        onCloseAutoFocus={(event) => {
          if (focusIfConnected(triggerRef.current)) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Punkteingabe öffnen</DialogTitle>
          <DialogDescription>
            Scanne den QR-Code oder kopiere den Link zur mobilen Punkteingabe.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-6">
          <div className="rounded-xl bg-white p-4 shadow">
            <QRCodeCanvas
              value={submitScoreUrl}
              size={180}
              className="h-auto max-w-full"
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
        </div>

        <a
          href={submitScoreUrl}
          target="_blank"
          rel="noreferrer"
          className="break-all text-sm text-primary underline underline-offset-4"
        >
          {submitScoreUrl}
        </a>
        <Button variant="outline" onClick={() => void copyLink()}>
          {copied ? "Link kopiert" : "Link kopieren"}
        </Button>
        {copyError && (
          <InlineMessage variant="warning">
            Der Link konnte nicht automatisch kopiert werden. Markiere ihn bitte
            manuell.
          </InlineMessage>
        )}
      </DialogContent>
    </Dialog>
  );
}
