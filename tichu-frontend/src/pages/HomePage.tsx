import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, PlusCircle, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

type SplashScreenProps = {
  onNewGame?: () => void;
  onSpectate?: () => void;
  onStats?: () => void;
};

export function HomePage({ onSpectate, onStats }: SplashScreenProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold">Tichu Score</CardTitle>
          <p className="text-muted-foreground text-sm">by Marco</p>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <Button
            size="lg"
            className="w-full justify-start gap-3"
            onClick={() => navigate("/new-game")}
          >
            <PlusCircle className="h-5 w-5" />
            Neues Spiel starten
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={onSpectate}
          >
            <Eye className="h-5 w-5" />
            Spiel ansehen
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={onStats}
          >
            <BarChart3 className="h-5 w-5" />
            Statistiken
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
