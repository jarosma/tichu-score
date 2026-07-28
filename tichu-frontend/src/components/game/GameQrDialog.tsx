import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useState } from "react";
import { InlineMessage } from "@/components/feedback/InlineMessage";

interface GameQrDialogProps {
  submitScoreUrl: string;
}

export function GameQrDialog({ submitScoreUrl }: GameQrDialogProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

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
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          window.requestAnimationFrame(() => {
            document
              .querySelector<HTMLElement>('[data-slot="dialog-close"]')
              ?.focus();
          });
        }}
      >
        <DialogHeader>
          <DialogTitle>Punkteingabe öffnen</DialogTitle>
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
