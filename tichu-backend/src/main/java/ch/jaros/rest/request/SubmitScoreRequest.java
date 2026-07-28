package ch.jaros.rest.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

public record SubmitScoreRequest(@NotNull Integer team1Score, @NotNull Integer team2Score,
                                 List<@NotNull @Valid TichuCallRequest> tichuCalls,
                                 @NotNull UUID roundKey) {

    public SubmitScoreRequest(final UUID roundKey, final Integer team1Score, final Integer team2Score,
                              final List<@NotNull @Valid TichuCallRequest> tichuCalls) {
        this(team1Score, team2Score, tichuCalls, roundKey);
    }

    public SubmitScoreRequest(final Integer team1Score, final Integer team2Score) {
        this(team1Score, team2Score, List.of(), UUID.randomUUID());
    }

    public SubmitScoreRequest(final Integer team1Score, final Integer team2Score,
                              final List<@NotNull @Valid TichuCallRequest> tichuCalls) {
        this(team1Score, team2Score, tichuCalls, UUID.randomUUID());
    }

    @AssertTrue(message = "Scores must add up to a multiple of 100, while individual scores" +
            " are a multiple of 5")
    public boolean hasValidTotal() {
        return team1Score != null
                && team2Score != null
                && team1Score % 5 == 0
                && team2Score % 5 == 0
                && (team1Score + team2Score) % 100 == 0;
    }
}
