package ch.jaros.rest.response;

import ch.jaros.entity.GameRound;

import java.util.List;

public record GameScoresResponse(List<GameRoundResponse> rounds) {

    public static GameScoresResponse from(final List<GameRound> rounds) {
        return new GameScoresResponse(rounds.stream().map(GameRoundResponse::from).toList());
    }
}
