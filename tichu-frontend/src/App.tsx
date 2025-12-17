import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { NewGamePage } from "@/pages/NewGamePage";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GamePage } from "@/pages/GamePage";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="font-semibold">Tichu</h1>
        <ThemeToggle />
      </header>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onSpectate={() => console.log("Spectate")}
                onStats={() => console.log("Stats")}
              />
            }
          />
          <Route path="/new-game" element={<NewGamePage />} />
          <Route path="/game/:id" element={<GamePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
