package ch.jaros.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
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

    @Builder.Default
    @Column(nullable = false)
    private boolean enabled = true;

    @OneToOne(mappedBy = "team", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private TeamStats teamStats;

    public static UUID createId() {
        return UUID.randomUUID();
    }

    public boolean isEnabled() {
        return enabled && player1 != null && player2 != null
                && player1.isEnabled() && player2.isEnabled();
    }

    public boolean distinctTo(final Team team) {
        return this.player1 != team.player1
                && this.player1 != team.player2
                && this.player2 != team.player1
                && this.player2 != team.player2;
    }

}
