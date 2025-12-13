package ch.jaros.repository;

import ch.jaros.entity.Game;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.UUID;

@ApplicationScoped
public class GameRepository implements PanacheRepositoryBase<Game, UUID> {
    public Game findOngoingGameById(final UUID id) {
        final Game game = findById(id);
        return (game == null || game.getHasEnded())? null : game;
    }
}

