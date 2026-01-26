package ch.jaros.repository;

import ch.jaros.entity.Player;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.UUID;

@ApplicationScoped
public class PlayerRepository implements PanacheRepositoryBase<Player, UUID> {
    public void update(final Player player) {
        getEntityManager().merge(player);
    }
}
