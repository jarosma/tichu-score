package ch.jaros.repository;

import ch.jaros.entity.GameRound;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.UUID;

@ApplicationScoped
public class GameRoundRepository implements PanacheRepositoryBase<GameRound, UUID> {
}
