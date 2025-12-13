package ch.jaros.entity;

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
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
public class Game {

    @Id
    @EqualsAndHashCode.Include
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

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "game_details", nullable = false)
    private GameDetails gameDetails;

    @Column(nullable = false)
    private int score;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(columnDefinition = "game_winner")
    private GameWinner winner;

    public static UUID createId(final UUID team1, final UUID team2, final OffsetDateTime time) {
        String data = team1.toString() + "-" + team2.toString() + "-" + time.toString();

        return UUID.nameUUIDFromBytes(data.getBytes());
    }
}

