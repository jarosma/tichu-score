package ch.jaros.rest;

import ch.jaros.BaseTest;
import ch.jaros.entity.Game;
import ch.jaros.entity.GameWinner;
import ch.jaros.entity.Player;
import ch.jaros.entity.Team;
import ch.jaros.repository.GameRepository;
import ch.jaros.repository.PlayerRepository;
import ch.jaros.repository.PlayerStatsRepository;
import ch.jaros.repository.TeamRepository;
import ch.jaros.repository.TeamStatsRepository;
import ch.jaros.rest.request.EndGameRequest;
import ch.jaros.rest.request.SubmitScoreRequest;
import ch.jaros.rest.request.TichuCallRequest;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static io.restassured.RestAssured.given;

@QuarkusTest
class StatsUpdateTest extends BaseTest {

    @Inject GameRepository gameRepository;
    @Inject PlayerRepository playerRepository;
    @Inject PlayerStatsRepository playerStatsRepository;
    @Inject TeamRepository teamRepository;
    @Inject TeamStatsRepository teamStatsRepository;

    private Team team1;
    private Team team2;

    @BeforeEach
    @Transactional
    void setup() {
        cleanUp();
        team1 = persistTeam("TeamMarco", "Marco", "Mia");
        team2 = persistTeam("TeamJana", "Jana", "Martin");
    }

    @Test
    void updatePlayerStats_whenGameEnds() {
        final Game game = persistGame();
        submitRound(game, 100, 0);
        endGame(game, GameWinner.team1);

        final var stats = playerStatsRepository.findById(team1.getPlayer1().getId());
        Assertions.assertEquals(1, stats.getTotalWins());
        Assertions.assertEquals(0, stats.getTotalLosses());
        Assertions.assertEquals(1, stats.getTotalGamesPlayed());
        Assertions.assertEquals(100, stats.getHighestPointDiffWin());
    }

    @Test
    void updateTeamStats_whenGameEnds() {
        final Game game = persistGame();
        submitRound(game, 100, 0);
        endGame(game, GameWinner.team1);

        final var stats = teamStatsRepository.findById(team1.getId());
        Assertions.assertEquals(1, stats.getTotalWins());
        Assertions.assertEquals(0, stats.getTotalLosses());
        Assertions.assertEquals(1, stats.getTotalGamesPlayed());
        Assertions.assertEquals(100, stats.getHighestPointDiffWin());
    }

    @Test
    void updateLosingStats_whenGameEnds() {
        final Game game = persistGame();
        submitRound(game, 100, 0);
        endGame(game, GameWinner.team1);

        final var playerStats = playerStatsRepository.findById(team2.getPlayer1().getId());
        final var teamStats = teamStatsRepository.findById(team2.getId());
        Assertions.assertEquals(0, playerStats.getTotalWins());
        Assertions.assertEquals(1, playerStats.getTotalLosses());
        Assertions.assertEquals(1, playerStats.getTotalGamesPlayed());
        Assertions.assertNull(playerStats.getHighestPointDiffWin());
        Assertions.assertEquals(0, teamStats.getTotalWins());
        Assertions.assertEquals(1, teamStats.getTotalLosses());
        Assertions.assertEquals(1, teamStats.getTotalGamesPlayed());
        Assertions.assertNull(teamStats.getHighestPointDiffWin());
    }

    @Test
    void updateTichuStats_whenGameEnds() {
        final Game game = persistGame();
        submitRound(game, 100, 0, List.of(
                new TichuCallRequest(team1.getPlayer1().getId(), true),
                new TichuCallRequest(team2.getPlayer1().getId(), false)));
        endGame(game, GameWinner.team1);

        final var successfulPlayerStats = playerStatsRepository.findById(team1.getPlayer1().getId());
        final var unsuccessfulTeamStats = teamStatsRepository.findById(team2.getId());
        Assertions.assertEquals(1, successfulPlayerStats.getSuccessfulTichus());
        Assertions.assertEquals(0, successfulPlayerStats.getUnsuccessfulTichus());
        Assertions.assertEquals(0, unsuccessfulTeamStats.getSuccessfulTichus());
        Assertions.assertEquals(1, unsuccessfulTeamStats.getUnsuccessfulTichus());
    }

    @Test
    void doNotUpdateStats_whenGameAlreadyEnded() {
        final Game game = persistGame();
        submitRound(game, 100, 0);
        endGame(game, GameWinner.team1);
        endGame(game, GameWinner.team2);

        final var stats = playerStatsRepository.findById(team1.getPlayer1().getId());
        Assertions.assertEquals(1, stats.getTotalGamesPlayed());
        Assertions.assertEquals(1, stats.getTotalWins());
        Assertions.assertEquals(0, stats.getTotalLosses());
    }

    @Test
    void aggregateStats_acrossMultipleRounds() {
        final Game game = persistGame();
        submitRound(game, 100, 0, List.of(new TichuCallRequest(team1.getPlayer1().getId(), false)));
        submitRound(game, 100, 0, List.of(new TichuCallRequest(team1.getPlayer1().getId(), true)));
        endGame(game, GameWinner.team1);

        final var stats = playerStatsRepository.findById(team1.getPlayer1().getId());
        Assertions.assertEquals(1, stats.getTotalGamesPlayed());
        Assertions.assertEquals(1, stats.getSuccessfulTichus());
        Assertions.assertEquals(1, stats.getUnsuccessfulTichus());
    }

    @Transactional
    Team persistTeam(final String name, final String firstName, final String secondName) {
        final Player first = Player.from(firstName);
        final Player second = Player.from(secondName);
        final Team team = Team.builder().id(UUID.randomUUID()).name(name)
                .player1(first).player2(second).build();
        playerRepository.persist(first);
        playerRepository.persist(second);
        teamRepository.persist(team);
        return team;
    }

    @Transactional
    Game persistGame() {
        final Game game = Game.builder().id(UUID.randomUUID())
                .team1(team1).team2(team2).startedAt(OffsetDateTime.now()).build();
        gameRepository.persist(game);
        return game;
    }

    void submitRound(final Game game, final int team1Score, final int team2Score) {
        submitRound(game, team1Score, team2Score, List.of());
    }

    void submitRound(final Game game, final int team1Score, final int team2Score,
                     final List<TichuCallRequest> tichuCalls) {
        given().contentType("application/json")
                .body(new SubmitScoreRequest(team1Score, team2Score, tichuCalls))
                .when().post("/games/" + game.getId() + "/round-results")
                .then().statusCode(200);
    }

    void endGame(final Game game, final GameWinner winner) {
        given().contentType("application/json")
                .body(new EndGameRequest(winner))
                .when().post("/games/" + game.getId() + "/end")
                .then().statusCode(200);
    }
}
