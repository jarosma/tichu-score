package ch.jaros.rest.response;

import ch.jaros.entity.Game;
import ch.jaros.entity.GameWinner;

import java.time.OffsetDateTime;
import java.util.UUID;

public record GameResponse(UUID id, OffsetDateTime startedAt, OffsetDateTime endedAt,
                            TeamResponse team1, TeamResponse team2, GameScoresResponse scores,
                            GameWinner winner, boolean hasEnded, boolean pendingFinish) {

    public static GameResponse from(final Game game) {
        return new GameResponse(
                game.getId(),
                game.getStartedAt(),
                game.getEndedAt(),
                TeamResponse.from(game.getTeam1()),
                TeamResponse.from(game.getTeam2()),
                GameScoresResponse.from(game.getRounds()),
                game.getWinner(),
                game.getHasEnded(),
                game.isPendingFinish());
    }
}
