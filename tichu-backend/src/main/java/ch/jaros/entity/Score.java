package ch.jaros.entity;

import lombok.Getter;
import lombok.ToString;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;

@ToString
public class Score {

    private final List<Round> rounds;

    private Score(final List<Round> rounds) {
        this.rounds = rounds;
    }

    static Score from(final List<GameRound> gameRounds) {
        return new Score(gameRounds.stream()
                .map(round -> new Round(round.getNumber(), round.getSubmittedAt(), round.getTeam1(), round.getTeam2()))
                .toList());
    }

    @Getter
    public static class Round {
        private final int number;
        private final OffsetDateTime submittedAt;
        private final int team1;
        private final int team2;

        private Round(final int number, final OffsetDateTime submittedAt, final int team1, final int team2) {
            this.number = number;
            this.submittedAt = submittedAt;
            this.team1 = team1;
            this.team2 = team2;
        }
    }

    public List<Round> getRounds() {
        return Collections.unmodifiableList(rounds);
    }

}
