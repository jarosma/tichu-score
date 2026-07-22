package ch.jaros.repository;

import ch.jaros.entity.Team;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.UUID;

@ApplicationScoped
public class TeamRepository implements PanacheRepositoryBase<Team, UUID> {
    public boolean hasTeamForPlayer(final UUID playerId) {
        return count("player1.id = ?1 or player2.id = ?1", playerId) > 0;
    }

    public boolean hasEnabledTeamForPlayer(final UUID playerId) {
        return count("enabled = true and player1.enabled = true and player2.enabled = true "
                + "and (player1.id = ?1 or player2.id = ?1)", playerId) > 0;
    }
}
