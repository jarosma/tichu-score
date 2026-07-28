package ch.jaros.repository;

import ch.jaros.entity.GameRound;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.UUID;

@ApplicationScoped
public class GameRoundRepository implements PanacheRepositoryBase<GameRound, UUID> {

    public GameRound findByGameAndRoundKey(final UUID gameId, final UUID roundKey) {
        return find("game.id = ?1 and roundKey = ?2", gameId, roundKey).firstResult();
    }
}
