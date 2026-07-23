package ch.jaros.rest.response;

import ch.jaros.entity.GameRound;

import java.time.OffsetDateTime;

public record GameRoundResponse(int number, OffsetDateTime submittedAt, int team1, int team2) {

    public static GameRoundResponse from(final GameRound round) {
        return new GameRoundResponse(round.getNumber(), round.getSubmittedAt(), round.getTeam1(), round.getTeam2());
    }
}
