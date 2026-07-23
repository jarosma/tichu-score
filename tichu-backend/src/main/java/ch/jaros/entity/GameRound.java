package ch.jaros.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "game_round", uniqueConstraints = @UniqueConstraint(columnNames = {"game_id", "number"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GameRound {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "game_id", nullable = false)
    @JsonIgnore
    private Game game;

    @Column(nullable = false)
    private int number;

    @Column(name = "submitted_at", nullable = false)
    private OffsetDateTime submittedAt;

    @Column(name = "team1_score", nullable = false)
    private int team1;

    @Column(name = "team2_score", nullable = false)
    private int team2;

    private GameRound(final Game game, final int number, final int team1, final int team2) {
        this.id = UUID.randomUUID();
        this.game = game;
        this.number = number;
        this.submittedAt = OffsetDateTime.now();
        this.team1 = team1;
        this.team2 = team2;
    }

    static GameRound create(final Game game, final int number, final int team1, final int team2) {
        return new GameRound(game, number, team1, team2);
    }
}
