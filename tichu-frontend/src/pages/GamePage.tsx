import { useParams } from "react-router-dom";

export function GamePage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Tichu Spiel</h1>
        <p className="text-lg">
          Game ID: <span className="font-mono">{id}</span>
        </p>
      </div>
    </div>
  );
}
