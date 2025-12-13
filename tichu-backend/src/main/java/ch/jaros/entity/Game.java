package ch.jaros.entity;

import ch.jaros.exception.GameAlreadyEndedException;
import ch.jaros.rest.EndGameRequest;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
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
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "scores", nullable = false)
    private Score scores = new Score();

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(columnDefinition = "game_winner")
    private GameWinner winner;

    public static UUID createId(final UUID team1, final UUID team2, final OffsetDateTime time) {
        String data = team1.toString() + "-" + team2.toString() + "-" + time.toString();

        return UUID.nameUUIDFromBytes(data.getBytes());
    }

    public void endGame(final EndGameRequest request) throws GameAlreadyEndedException {
        if (getHasEnded()) throw new GameAlreadyEndedException();
        setEndedAt(OffsetDateTime.now());
        setWinner(request.winner());
    }

    public boolean getHasEnded() {
        return getEndedAt() != null;
    }
}

