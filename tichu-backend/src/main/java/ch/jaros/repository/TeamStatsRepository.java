package ch.jaros.repository;

import ch.jaros.entity.TeamStats;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.UUID;

@ApplicationScoped
public class TeamStatsRepository implements PanacheRepositoryBase<TeamStats, UUID> {
}
