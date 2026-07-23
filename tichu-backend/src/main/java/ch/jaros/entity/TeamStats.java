package ch.jaros.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "team_stats")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamStats {

    @Id
    @Column(name = "id")
    private UUID id;

    @OneToOne(mappedBy = "teamStats", fetch = FetchType.LAZY)
    private Team team;

    @Column(name = "total_wins")
    @Builder.Default
    private int totalWins = 0;

    @Column(name = "total_losses")
    @Builder.Default
    private int totalLosses = 0;

    @Column(name = "successful_tichus")
    @Builder.Default
    private int successfulTichus = 0;

    @Column(name = "unsuccessful_tichus")
    @Builder.Default
    private int unsuccessfulTichus = 0;

    @Column(name = "total_games_played")
    @Builder.Default
    private int totalGamesPlayed = 0;

    @Column(name = "highest_point_diff_win")
    private Integer highestPointDiffWin;

    public static TeamStats create(final Team team) {
        return TeamStats.builder()
                .id(team.getId())
                .team(team)
                .build();
    }
}
