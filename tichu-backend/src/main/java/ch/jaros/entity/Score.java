package ch.jaros.entity;

import ch.jaros.rest.SubmitScoreRequest;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@NoArgsConstructor
@ToString
public class Score {

    private final List<Round> rounds = new ArrayList<>();

    @Getter
    @Builder
    public static class Round {
        private int number;
        private OffsetDateTime submittedAt;
        private int team1;
        private int team2;
    }

    public List<Round> getRounds() {
        return Collections.unmodifiableList(rounds);
    }

    public void addRound(final SubmitScoreRequest request) {
        addRound(request.team1Score(), request.team2Score());
    }

    public void addRound(final int team1Score, final int team2Score) {

        final int nextRoundNumber = rounds.isEmpty()? 0 : rounds.getLast().getNumber() + 1;

        rounds.add(Round.builder()
                .number(nextRoundNumber)
                .submittedAt(OffsetDateTime.now())
                .team1(team1Score)
                .team2(team2Score)
                .build());
    }
}

