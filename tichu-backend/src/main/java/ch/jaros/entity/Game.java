package ch.jaros.entity;

import ch.jaros.exception.GameAlreadyEndedException;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "game")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@ToString
public class Game {

    @Id
    private UUID id;

    @Column(name = "started_at", nullable = false)
    private OffsetDateTime startedAt;

    @Column(name = "ended_at")
    private OffsetDateTime endedAt;

    @ManyToOne(optional = false)
    @JoinColumn(name = "team1_id")
    private Team team1;

    @ManyToOne(optional = false)
    @JoinColumn(name = "team2_id")
    private Team team2;

    @Builder.Default
    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("number ASC")
    @Getter(AccessLevel.NONE)
    private List<GameRound> rounds = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(columnDefinition = "game_winner")
    private GameWinner winner;

    public static Game create(final Team team1, final Team team2, final OffsetDateTime startedAt) {
        return Game.builder()
                .id(UUID.randomUUID())
                .startedAt(startedAt)
                .team1(team1)
                .team2(team2)
                .build();
    }

    public void endGame(final GameWinner winner) throws GameAlreadyEndedException {
        if (getHasEnded()) throw new GameAlreadyEndedException();
        setEndedAt(OffsetDateTime.now());
        setWinner(winner);
    }

    public boolean getHasEnded() {
        return getEndedAt() != null;
    }

    public void addRound(final int team1Score, final int team2Score) {
        final int nextRoundNumber = rounds.isEmpty() ? 0 : getLastRoundNumber() + 1;
        rounds.add(GameRound.create(this, nextRoundNumber, team1Score, team2Score));
    }

    public int getLastRoundNumber() {
        return rounds.stream()
                .max(Comparator.comparingInt(GameRound::getNumber))
                .map(GameRound::getNumber)
                .orElse(0);
    }

    @JsonIgnore
    public List<GameRound> getRounds() {
        return List.copyOf(rounds);
    }
}
