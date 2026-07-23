package ch.jaros.rest.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;

public record SubmitScoreRequest(@NotNull Integer team1Score, @NotNull Integer team2Score) {

    @AssertTrue(message = "Scores must add up to a multiple of 100, while both are a multiple of 5")
    public boolean hasValidTotal() {
        return team1Score != null
                && team2Score != null
                && team1Score % 5 == 0
                && team2Score % 5 == 0
                && (team1Score + team2Score) % 100 == 0;
    }
}
