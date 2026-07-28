import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { HomePage } from "@/pages/HomePage";
import { CreateGamePage } from "@/pages/CreateGamePage";
import { SpectateGame } from "@/pages/SpectateGame";
import { SubmitScore } from "@/pages/SubmitScore";
import { SpectateEntryPage } from "@/pages/SpectateEntryPage";
import { FeaturePlaceholderPage } from "@/pages/FeaturePlaceholderPage";
import { PlayersPage } from "@/pages/PlayersPage";
import { TeamsPage } from "@/pages/TeamsPage";
import { StatisticsPage } from "@/pages/StatisticsPage";

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game/new" element={<CreateGamePage />} />
          <Route path="/game/spectate" element={<SpectateEntryPage />} />
          <Route path="/game/:id/spectate" element={<SpectateGame />} />
          <Route path="/game/:id/score" element={<SubmitScore />} />
          <Route
            path="/manage"
            element={<Navigate to="/manage/players" replace />}
          />
          <Route path="/manage/players" element={<PlayersPage />} />
          <Route path="/manage/teams" element={<TeamsPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route
            path="*"
            element={
              <FeaturePlaceholderPage
                title="Seite nicht gefunden"
                description="Diese Seite existiert nicht oder wurde verschoben."
              />
            }
          />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
