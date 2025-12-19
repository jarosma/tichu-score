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

interface GameQrDialogProps {
  submitScoreUrl: string;
}

export function GameQrDialog({ submitScoreUrl }: GameQrDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        >
          <QrCode className="h-6 w-6" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle>Submit Score</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center py-6">
          <div className="rounded-xl bg-white p-4 shadow">
            <QRCodeCanvas
              value={submitScoreUrl}
              size={220}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground break-all">
          {submitScoreUrl}
        </p>
      </DialogContent>
    </Dialog>
  );
}
