package ch.jaros;

import ch.jaros.repository.GameRepository;
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

    protected void cleanUp() {
        gameRepository.deleteAll();
        teamRepository.deleteAll();
        playerRepository.deleteAll();
    }

}
