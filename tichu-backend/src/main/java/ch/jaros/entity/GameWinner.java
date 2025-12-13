package ch.jaros.entity;


import jakarta.persistence.Table;

@Table(name = "game_winner")
public enum GameWinner {
    team1,
    team2
}
