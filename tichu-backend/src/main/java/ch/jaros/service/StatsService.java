package ch.jaros.service;

import ch.jaros.entity.Game;
import ch.jaros.entity.TichuCall;
import ch.jaros.entity.GameWinner;
import ch.jaros.entity.Player;
import ch.jaros.entity.PlayerStats;
import ch.jaros.entity.Team;
import ch.jaros.entity.TeamStats;
import ch.jaros.repository.TichuCallRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@ApplicationScoped
@RequiredArgsConstructor
public class StatsService {

    private final TichuCallRepository tichuCallRepository;

    @Transactional
    public void updateForCompletedGame(final Game game) {
        final Team winningTeam = game.getWinner() == GameWinner.team1 ? game.getTeam1() : game.getTeam2();
        final Team losingTeam = game.getWinner() == GameWinner.team1 ? game.getTeam2() : game.getTeam1();
        final int winningScore = totalScore(game, game.getWinner() == GameWinner.team1);
        final int losingScore = totalScore(game, game.getWinner() != GameWinner.team1);
        final int pointDifference = winningScore - losingScore;

        updateTeam(winningTeam, true, pointDifference);
        updateTeam(losingTeam, false, pointDifference);
        updatePlayer(winningTeam.getPlayer1(), true, pointDifference);
        updatePlayer(winningTeam.getPlayer2(), true, pointDifference);
        updatePlayer(losingTeam.getPlayer1(), false, pointDifference);
        updatePlayer(losingTeam.getPlayer2(), false, pointDifference);

        for (final TichuCall tichuCall : tichuCallRepository.findByGame(game.getId())) {
            final int successful = tichuCall.isSuccessful() ? 1 : 0;
            final int unsuccessful = tichuCall.isSuccessful() ? 0 : 1;
            final PlayerStats playerStats = tichuCall.getPlayer().getPlayerStats();
            playerStats.setSuccessfulTichus(playerStats.getSuccessfulTichus() + successful);
            playerStats.setUnsuccessfulTichus(playerStats.getUnsuccessfulTichus() + unsuccessful);
            final Team tichuTeam = containsPlayer(game.getTeam1(), tichuCall.getPlayer()) ? game.getTeam1() : game.getTeam2();
            final TeamStats teamStats = tichuTeam.getTeamStats();
            teamStats.setSuccessfulTichus(teamStats.getSuccessfulTichus() + successful);
            teamStats.setUnsuccessfulTichus(teamStats.getUnsuccessfulTichus() + unsuccessful);
        }
    }

    private void updateTeam(final Team team, final boolean won, final int pointDifference) {
        final TeamStats stats = team.getTeamStats();
        stats.setTotalGamesPlayed(stats.getTotalGamesPlayed() + 1);
        if (won) {
            stats.setTotalWins(stats.getTotalWins() + 1);
            updateHighestPointDifference(stats, pointDifference);
        } else {
            stats.setTotalLosses(stats.getTotalLosses() + 1);
        }
    }

    private void updatePlayer(final Player player, final boolean won, final int pointDifference) {
        final PlayerStats stats = player.getPlayerStats();
        stats.setTotalGamesPlayed(stats.getTotalGamesPlayed() + 1);
        if (won) {
            stats.setTotalWins(stats.getTotalWins() + 1);
            updateHighestPointDifference(stats, pointDifference);
        } else {
            stats.setTotalLosses(stats.getTotalLosses() + 1);
        }
    }

    private int totalScore(final Game game, final boolean team1) {
        return game.getRounds().stream().mapToInt(round -> team1 ? round.getTeam1() : round.getTeam2()).sum();
    }

    private boolean containsPlayer(final Team team, final Player player) {
        return team.getPlayer1().getId().equals(player.getId()) || team.getPlayer2().getId().equals(player.getId());
    }

    private void updateHighestPointDifference(final TeamStats stats, final int difference) {
        if (stats.getHighestPointDiffWin() == null || difference > stats.getHighestPointDiffWin()) {
            stats.setHighestPointDiffWin(difference);
        }
    }

    private void updateHighestPointDifference(final PlayerStats stats, final int difference) {
        if (stats.getHighestPointDiffWin() == null || difference > stats.getHighestPointDiffWin()) {
            stats.setHighestPointDiffWin(difference);
        }
    }

}
