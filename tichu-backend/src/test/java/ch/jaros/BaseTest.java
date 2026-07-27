package ch.jaros;

import ch.jaros.repository.GameRepository;
import ch.jaros.repository.GameRoundRepository;
import ch.jaros.repository.TichuCallRepository;
import ch.jaros.repository.PlayerRepository;
import ch.jaros.repository.PlayerStatsRepository;
import ch.jaros.repository.TeamRepository;
import ch.jaros.repository.TeamStatsRepository;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;

public abstract class BaseTest {

    @Inject
    protected TeamRepository teamRepository;
    @Inject
    protected PlayerRepository playerRepository;
    @Inject
    GameRepository gameRepository;
    @Inject
    GameRoundRepository gameRoundRepository;
    @Inject
    TichuCallRepository tichuCallRepository;
    @Inject
    PlayerStatsRepository playerStatsRepository;
    @Inject
    TeamStatsRepository teamStatsRepository;

    protected void cleanUp() {
        tichuCallRepository.deleteAll();
        gameRoundRepository.deleteAll();
        gameRepository.deleteAll();
        teamRepository.deleteAll();
        playerRepository.deleteAll();
        teamStatsRepository.deleteAll();
        playerStatsRepository.deleteAll();
    }

}
