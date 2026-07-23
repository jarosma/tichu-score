package ch.jaros.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "tichu_call")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TichuCall {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "game_round_id", nullable = false)
    private GameRound round;

    @Column(nullable = false)
    private boolean successful;

    private TichuCall(final Game game, final Player player, final GameRound round,
                      final boolean successful) {
        this.id = UUID.randomUUID();
        this.game = game;
        this.player = player;
        this.round = round;
        this.successful = successful;
    }

    public static TichuCall create(final Game game, final Player player, final GameRound round,
                                   final boolean successful) {
        return new TichuCall(game, player, round, successful);
    }
}
