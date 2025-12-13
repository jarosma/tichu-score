package ch.jaros.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "team")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
@Builder
public class Team {

    @Id
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(length = 64)
    private String name;

    @ManyToOne(optional = false)
    @JoinColumn(name = "player1")
    private Player player1;

    @ManyToOne(optional = false)
    @JoinColumn(name = "player2")
    private Player player2;

    @Column(name = "team_elo")
    private Integer teamElo;

    public static UUID createId(final String name) {
        return UUID.nameUUIDFromBytes(name.getBytes());
    }
}

