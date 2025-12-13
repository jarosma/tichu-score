package ch.jaros.entity;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
public class GameDetails {

    public List<RoundScore> roundScores;

    public static class RoundScore {
        public int round;
        public int team1;
        public int team2;
    }
}

