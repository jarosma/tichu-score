package ch.jaros.service;

import ch.jaros.entity.Game;
import ch.jaros.entity.Team;
import ch.jaros.exception.GameDoesNotExistException;
import ch.jaros.exception.TeamDoesNotExistException;
import ch.jaros.exception.TeamsNotDistinctException;
import ch.jaros.exception.TeamsNotEnabledException;
import ch.jaros.repository.GameRepository;
import ch.jaros.repository.TeamRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@ApplicationScoped
@RequiredArgsConstructor
public class GameService {

    private final TeamRepository teamRepository;
    private final GameRepository gameRepository;

    @Transactional
    public Game start(final UUID team1Id, final UUID team2Id) {
        final Team team1 = getTeam(team1Id, "Team 1 does not exist");
        final Team team2 = getTeam(team2Id, "Team 2 does not exist");
        if (team1 == team2 || !team1.distinctTo(team2)) throw new TeamsNotDistinctException();
        if (!team1.isEnabled() || !team2.isEnabled()) throw new TeamsNotEnabledException();

        final Game game = Game.create(team1, team2, OffsetDateTime.now());
        gameRepository.persist(game);
        return game;
    }

    @Transactional
    public Game getById(final UUID gameId) {
        final Game game = gameRepository.findById(gameId);
        if (game == null) throw new GameDoesNotExistException("Game does not exist");
        game.getRounds().size();
        return game;
    }

    @Transactional
    public Game end(final UUID gameId, final ch.jaros.entity.GameWinner winner) {
        final Game game = getById(gameId);
        if (!game.getHasEnded()) game.endGame(winner);
        game.getRounds().size();
        return game;
    }

    @Transactional
    public void submitScore(final UUID gameId, final int team1Score, final int team2Score) {
        final Game game = gameRepository.findOngoingGameById(gameId);
        if (game == null) throw new GameDoesNotExistException("Ongoing game does not exist");
        game.addRound(team1Score, team2Score);
    }

    private Team getTeam(final UUID teamId, final String message) {
        final Team team = teamRepository.findById(teamId);
        if (team == null) throw new TeamDoesNotExistException(message);
        return team;
    }
}
