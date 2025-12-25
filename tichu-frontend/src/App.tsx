import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { CreateGamePage } from "@/pages/CreateGamePage";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SpectateGame } from "@/pages/SpectateGame";
import { SubmitScore } from "@/pages/SubmitScore";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="font-semibold">Tichu</h1>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/new-game" element={<CreateGamePage />} />
            <Route path="/spectate/:id" element={<SpectateGame />} />
            <Route path="/score/:id" element={<SubmitScore />} />
          </Routes>
        </BrowserRouter>
      </main>
    </div>
  );
}

export default App;
