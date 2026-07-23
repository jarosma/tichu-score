package ch.jaros.repository;

import ch.jaros.entity.TichuCall;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class TichuCallRepository implements PanacheRepositoryBase<TichuCall, UUID> {

    public List<TichuCall> findByGame(final UUID gameId) {
        return list("game.id", gameId);
    }
}
