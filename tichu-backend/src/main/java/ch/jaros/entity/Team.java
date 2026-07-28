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

    @Column(nullable = false, length = 64)
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

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "team_stats_id", nullable = false, unique = true)
    @JsonIgnore
    private TeamStats teamStats;

    public static UUID createId() {
        return UUID.randomUUID();
    }

    public static Team create(final String name, final Player player1, final Player player2) {
        final Team team = Team.builder()
                .id(createId())
                .name(name)
                .player1(player1)
                .player2(player2)
                .build();

        team.setTeamStats(TeamStats.create(team));
        return team;
    }

    @PrePersist
    void initializeStats() {
        if (teamStats == null) {
            setTeamStats(TeamStats.create(this));
        }
    }

    public boolean isEnabled() {
        return enabled && hasEnabledPlayers();
    }

    public boolean hasEnabledPlayers() {
        return player1 != null && player2 != null
                && player1.isEnabled() && player2.isEnabled();
    }

    public boolean distinctTo(final Team team) {
        return !this.player1.getId().equals(team.player1.getId())
                && !this.player1.getId().equals(team.player2.getId())
                && !this.player2.getId().equals(team.player1.getId())
                && !this.player2.getId().equals(team.player2.getId());
    }

}
