package ch.jaros.repository;

import ch.jaros.entity.PlayerStats;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.UUID;

@ApplicationScoped
public class PlayerStatsRepository implements PanacheRepositoryBase<PlayerStats, UUID> {
}
