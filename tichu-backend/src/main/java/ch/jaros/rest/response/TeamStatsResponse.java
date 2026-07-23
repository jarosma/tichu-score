package ch.jaros.rest.response;

import ch.jaros.entity.TeamStats;

public record TeamStatsResponse(int totalWins, int totalLosses, int successfulTichus,
                                int unsuccessfulTichus, int totalGamesPlayed,
                                Integer highestPointDiffWin) {

    public static TeamStatsResponse from(final TeamStats stats) {
        return new TeamStatsResponse(stats.getTotalWins(), stats.getTotalLosses(),
                stats.getSuccessfulTichus(), stats.getUnsuccessfulTichus(),
                stats.getTotalGamesPlayed(), stats.getHighestPointDiffWin());
    }
}
