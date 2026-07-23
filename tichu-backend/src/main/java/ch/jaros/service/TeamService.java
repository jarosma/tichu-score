package ch.jaros.service;

import ch.jaros.entity.Player;
import ch.jaros.entity.Team;
import ch.jaros.exception.EntityConflictException;
import ch.jaros.exception.PlayerDoesNotExistException;
import ch.jaros.exception.PlayersNotDistinctException;
import ch.jaros.exception.TeamDoesNotExistException;
import ch.jaros.repository.GameRepository;
import ch.jaros.repository.PlayerRepository;
import ch.jaros.repository.TeamRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
@RequiredArgsConstructor
public class TeamService {

    private final PlayerRepository playerRepository;
    private final GameRepository gameRepository;
    private final TeamRepository teamRepository;

    public List<Team> getAll() {
        return teamRepository.listAll();
    }

    public Team getById(final UUID teamId) {
        final Team team = teamRepository.findById(teamId);
        if (team == null) throw new TeamDoesNotExistException("Team does not exist");
        return team;
    }

    @Transactional
    public Team create(final String name, final UUID player1Id, final UUID player2Id)
            throws PlayerDoesNotExistException, PlayersNotDistinctException {
        if (teamRepository.find("name", name).firstResult() != null) {
            throw new EntityConflictException("Team name already exists");
        }
        final Player player1 = playerRepository.findById(player1Id);
        if (player1 == null) throw new PlayerDoesNotExistException("Player 1 does not exist");
        final Player player2 = playerRepository.findById(player2Id);
        if (player2 == null) throw new PlayerDoesNotExistException("Player 2 does not exist");
        if (player1 == player2) throw new PlayersNotDistinctException();

        final Team team = Team.create(name, player1, player2);
        teamRepository.persist(team);
        return team;
    }

    @Transactional
    public void updateStatus(final UUID teamId, final boolean enabled) {
        final Team team = getById(teamId);
        if (enabled && !team.hasEnabledPlayers()) {
            throw new EntityConflictException("Team has a disabled player");
        }
        team.setEnabled(enabled);
    }

    @Transactional
    public void delete(final UUID teamId) {
        getById(teamId);
        if (gameRepository.hasGameForTeam(teamId)) {
            throw new EntityConflictException("Team is referenced by a game");
        }
        teamRepository.deleteById(teamId);
    }
}
