package ch.jaros.repository;

import ch.jaros.entity.Game;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class GameRepository implements PanacheRepositoryBase<Game, UUID> {

    public Game findByStartKey(final UUID startKey) {
        return find("startKey", startKey).firstResult();
    }

    public Game findByIdForUpdate(final UUID id) {
        return getEntityManager().find(Game.class, id, LockModeType.PESSIMISTIC_WRITE);
    }

    public boolean insertIfStartKeyAbsent(final Game game) {
        final int inserted = getEntityManager().createNativeQuery("""
                INSERT INTO game (id, started_at, team1_id, team2_id, start_key)
                VALUES (:id, :startedAt, :team1Id, :team2Id, :startKey)
                ON CONFLICT (start_key) DO NOTHING
                """)
                .setParameter("id", game.getId())
                .setParameter("startedAt", game.getStartedAt())
                .setParameter("team1Id", game.getTeam1().getId())
                .setParameter("team2Id", game.getTeam2().getId())
                .setParameter("startKey", game.getStartKey())
                .executeUpdate();
        return inserted == 1;
    }

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
