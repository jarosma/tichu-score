package ch.jaros.repository;

import ch.jaros.entity.Team;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.UUID;

@ApplicationScoped
public class TeamRepository implements PanacheRepositoryBase<Team, UUID> {
}
