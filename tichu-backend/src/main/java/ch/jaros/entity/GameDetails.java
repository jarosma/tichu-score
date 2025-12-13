package ch.jaros.entity;

import java.util.List;

public class GameDetails {

    public List<RoundScore> roundScores;

    public static class RoundScore {
        public int round;
        public int team1;
        public int team2;
    }
}

