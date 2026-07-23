package ch.jaros;

import ch.jaros.repository.GameRepository;
import ch.jaros.repository.GameRoundRepository;
import ch.jaros.repository.PlayerRepository;
import ch.jaros.repository.TeamRepository;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;

public abstract class BaseTest {

    @Inject
    TeamRepository teamRepository;
    @Inject
    PlayerRepository playerRepository;
    @Inject
    GameRepository gameRepository;
    @Inject
    GameRoundRepository gameRoundRepository;

    protected void cleanUp() {
        gameRoundRepository.deleteAll();
        gameRepository.deleteAll();
        teamRepository.deleteAll();
        playerRepository.deleteAll();
    }

}
