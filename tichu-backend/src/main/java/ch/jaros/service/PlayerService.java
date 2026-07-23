package ch.jaros.service;

import ch.jaros.entity.Player;
import ch.jaros.entity.PlayerStats;
import ch.jaros.exception.EntityConflictException;
import ch.jaros.exception.PlayerDoesNotExistException;
import ch.jaros.repository.PlayerRepository;
import ch.jaros.repository.PlayerStatsRepository;
import ch.jaros.repository.TeamRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
@RequiredArgsConstructor
public class PlayerService {

    private final PlayerRepository playerRepository;
    private final PlayerStatsRepository playerStatsRepository;
    private final TeamRepository teamRepository;

    public List<Player> getAll() {
        return playerRepository.listAll();
    }

    public Player getById(final UUID playerId) {
        final Player player = playerRepository.findById(playerId);
        if (player == null) throw new PlayerDoesNotExistException("Player does not exist");
        return player;
    }

    @Transactional
    public Player create(final String name) {
        if (playerRepository.find("name", name).firstResult() != null) {
            throw new EntityConflictException("Player name already exists");
        }
        final Player player = Player.create(name);
        playerRepository.persist(player);
        return player;
    }

    public PlayerStats getStats(final UUID playerId) {
        final Player player = getById(playerId);
        if (player.getPlayerStats() == null) {
            throw new IllegalStateException("Player stats do not exist");
        }
        return player.getPlayerStats();
    }

    @Transactional
    public void updateStatus(final UUID playerId, final boolean enabled) {
        final Player player = getById(playerId);
        if (!enabled && teamRepository.hasEnabledTeamForPlayer(playerId)) {
            throw new EntityConflictException("Player belongs to an enabled team");
        }
        player.setEnabled(enabled);
    }

    @Transactional
    public void delete(final UUID playerId) {
        final Player player = getById(playerId);
        if (teamRepository.hasTeamForPlayer(playerId)) {
            throw new EntityConflictException("Player is referenced by a team");
        }
        final UUID statsId = player.getPlayerStats().getId();
        playerRepository.delete(player);
        playerStatsRepository.deleteById(statsId);
    }
}
