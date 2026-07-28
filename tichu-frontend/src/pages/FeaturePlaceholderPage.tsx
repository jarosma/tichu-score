import { ArrowLeft, Construction } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FeaturePlaceholderPageProps {
  title: string;
  description: string;
}

export function FeaturePlaceholderPage({
  title,
  description,
}: FeaturePlaceholderPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const canReturnToApp = Boolean(
    returnTo?.startsWith("/") && !returnTo.startsWith("//"),
  );

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader title={title} />
      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Construction className="size-6" />
          </div>
          <p className="text-muted-foreground">{description}</p>
          <Button
            variant="outline"
            onClick={() => {
              if (canReturnToApp) navigate(returnTo!);
              else navigate(-1);
            }}
          >
            <ArrowLeft />
            {canReturnToApp ? "Zurück zum Spiel" : "Zurück"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
