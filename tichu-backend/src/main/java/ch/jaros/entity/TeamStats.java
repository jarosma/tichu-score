package ch.jaros.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "team_stats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TeamStats {

    @Id
    @Column(name = "id")
    private UUID id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id")
    private Team team;

    @Column(name = "total_wins")
    private int totalWins = 0;

    @Column(name = "total_losses")
    private int totalLosses = 0;

    @Column(name = "successful_tichus")
    private int successfulTichus = 0;

    @Column(name = "unsuccessful_tichus")
    private int unsuccessfulTichus = 0;

    @Column(name = "total_games_played")
    private int totalGamesPlayed = 0;

    @Column(name = "highest_point_diff_win")
    private Integer highestPointDiffWin;
}
