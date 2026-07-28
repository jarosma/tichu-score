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
@Table(name = "game", uniqueConstraints = @UniqueConstraint(name = "uq_game_start_key", columnNames = "start_key"))
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

    @Column(name = "start_key")
    private UUID startKey;

    @Builder.Default
    @Column(name = "pending_finish", nullable = false)
    private boolean pendingFinish = false;

    @ManyToOne(optional = false)
    @JoinColumn(name = "team1_id")
    private Team team1;

    @ManyToOne(optional = false)
    @JoinColumn(name = "team2_id")
    private Team team2;

    @Builder.Default
    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("number ASC")
    @Getter(AccessLevel.NONE)
    private List<GameRound> rounds = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(columnDefinition = "game_winner")
    private GameWinner winner;

    public static Game create(final Team team1, final Team team2, final OffsetDateTime startedAt) {
        return create(team1, team2, startedAt, null);
    }

    public static Game create(final Team team1, final Team team2, final OffsetDateTime startedAt,
                              final UUID startKey) {
        return Game.builder()
                .id(UUID.randomUUID())
                .startedAt(startedAt)
                .startKey(startKey)
                .team1(team1)
                .team2(team2)
                .build();
    }

    public void endGame(final GameWinner winner) throws GameAlreadyEndedException {
        if (getHasEnded()) throw new GameAlreadyEndedException();
        setEndedAt(OffsetDateTime.now());
        setWinner(winner);
        setPendingFinish(false);
    }

    public boolean getHasEnded() {
        return getEndedAt() != null;
    }

    public GameRound addRound(final int team1Score, final int team2Score) {
        return addRound(team1Score, team2Score, null);
    }

    public GameRound addRound(final int team1Score, final int team2Score, final UUID roundKey) {
        final int nextRoundNumber = rounds.isEmpty() ? 0 : getLastRoundNumber() + 1;
        final GameRound round = GameRound.create(this, nextRoundNumber, team1Score, team2Score, roundKey);
        rounds.add(round);
        if (hasReachedFinishThreshold()) setPendingFinish(true);
        return round;
    }

    public boolean hasReachedFinishThreshold() {
        final int team1Score = rounds.stream().mapToInt(GameRound::getTeam1).sum();
        final int team2Score = rounds.stream().mapToInt(GameRound::getTeam2).sum();
        return team1Score >= 1000 || team2Score >= 1000;
    }

    public GameWinner calculateWinner() {
        final int team1Score = rounds.stream().mapToInt(GameRound::getTeam1).sum();
        final int team2Score = rounds.stream().mapToInt(GameRound::getTeam2).sum();
        if (team1Score == team2Score) return GameWinner.draw;
        return team1Score > team2Score ? GameWinner.team1 : GameWinner.team2;
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
