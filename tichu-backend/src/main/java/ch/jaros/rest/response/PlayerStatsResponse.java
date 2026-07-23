package ch.jaros.rest.response;

import ch.jaros.entity.PlayerStats;

public record PlayerStatsResponse(int totalWins, int totalLosses, int successfulTichus,
                                  int unsuccessfulTichus, int totalGamesPlayed,
                                  Integer highestPointDiffWin) {

    public static PlayerStatsResponse from(final PlayerStats stats) {
        return new PlayerStatsResponse(stats.getTotalWins(), stats.getTotalLosses(),
                stats.getSuccessfulTichus(), stats.getUnsuccessfulTichus(),
                stats.getTotalGamesPlayed(), stats.getHighestPointDiffWin());
    }
}
