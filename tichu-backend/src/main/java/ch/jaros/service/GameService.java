package ch.jaros.service;

import ch.jaros.entity.Game;
import ch.jaros.entity.GameRound;
import ch.jaros.entity.TichuCall;
import ch.jaros.entity.Player;
import ch.jaros.entity.Team;
import ch.jaros.exception.InvalidTichuCallException;
import ch.jaros.repository.TichuCallRepository;
import ch.jaros.repository.GameRoundRepository;
import ch.jaros.rest.request.TichuCallRequest;
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
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@ApplicationScoped
@RequiredArgsConstructor
public class GameService {

    private final TeamRepository teamRepository;
    private final GameRepository gameRepository;
    private final TichuCallRepository tichuCallRepository;
    private final GameRoundRepository gameRoundRepository;
    private final StatsService statsService;

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
        return game;
    }

    @Transactional
    public Game end(final UUID gameId, final ch.jaros.entity.GameWinner winner) {
        final Game game = getById(gameId);
        if (!game.getHasEnded()) {
            game.endGame(winner);
            statsService.updateForCompletedGame(game);
        }
        return game;
    }


    public void submitScore(final UUID gameId, final int team1Score, final int team2Score) {
        submitScore(gameId, team1Score, team2Score, List.of());
    }

    @Transactional
    public void submitScore(final UUID gameId, final int team1Score, final int team2Score,
                            final List<TichuCallRequest> tichuCalls) {
        final Game game = gameRepository.findOngoingGameById(gameId);
        if (game == null) throw new GameDoesNotExistException("Ongoing game does not exist");

        validateTichuCalls(game, tichuCalls);

        final GameRound round = game.addRound(team1Score, team2Score);
        gameRoundRepository.persist(round);

        tichuCalls.forEach(tichuCall -> tichuCallRepository.persist(
                TichuCall.create(game, findPlayer(game, tichuCall.playerId()), round, tichuCall.successful())));
    }

    private void validateTichuCalls(final Game game, final List<TichuCallRequest> tichuCalls) {
        final Set<UUID> playerIds = new HashSet<>();
        boolean successful = false;
        for (final TichuCallRequest tichuCall : tichuCalls) {
            if (tichuCall == null || tichuCall.playerId() == null || tichuCall.successful() == null) {
                throw new InvalidTichuCallException("Tichu calls must contain a player and success status");
            }
            if (!playerIds.add(tichuCall.playerId())) {
                throw new InvalidTichuCallException("A player cannot submit duplicate Tichu calls");
            }
            findPlayer(game, tichuCall.playerId());
            if (tichuCall.successful() && successful) {
                throw new InvalidTichuCallException("Only one successful Tichu call is allowed per round");
            }
            successful |= tichuCall.successful();
        }
    }

    private Player findPlayer(final Game game, final UUID playerId) {
        if (game.getTeam1().getPlayer1().getId().equals(playerId)) return game.getTeam1().getPlayer1();
        if (game.getTeam1().getPlayer2().getId().equals(playerId)) return game.getTeam1().getPlayer2();
        if (game.getTeam2().getPlayer1().getId().equals(playerId)) return game.getTeam2().getPlayer1();
        if (game.getTeam2().getPlayer2().getId().equals(playerId)) return game.getTeam2().getPlayer2();
        throw new InvalidTichuCallException("Tichu player does not participate in this game");
    }

    private Team getTeam(final UUID teamId, final String message) {
        final Team team = teamRepository.findById(teamId);
        if (team == null) throw new TeamDoesNotExistException(message);
        return team;
    }
}
