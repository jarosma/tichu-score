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
    @OneToOne
    @JoinColumn(name = "team_stats")
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

    @OneToOne(mappedBy = "player", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private TeamStats teamStats;

    public static UUID createId(final String name) {
        return UUID.nameUUIDFromBytes(name.getBytes());
    }

    public boolean isEnabled() {
        return player1.isEnabled() && player2.isEnabled();
    }

    public boolean distinctTo(final Team team) {
        return this.player1 != team.player1
                && this.player1 != team.player2
                && this.player2 != team.player1
                && this.player2 != team.player2;
    }

}

