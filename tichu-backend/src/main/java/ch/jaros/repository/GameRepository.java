package ch.jaros.repository;

import ch.jaros.entity.Game;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class GameRepository implements PanacheRepositoryBase<Game, UUID> {
    public boolean hasGameForTeam(final UUID teamId) {
        return count("team1.id = ?1 or team2.id = ?1", teamId) > 0;
    }

    public Game findOngoingGameById(final UUID id) {
        final Game game = findById(id);
        return (game == null || game.getHasEnded())? null : game;
    }

    public List<Game> findOngoingGames() {
        return list("endedAt is null");
    }
}
