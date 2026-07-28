package ch.jaros.rest;

import ch.jaros.rest.request.EndGameRequest;
import ch.jaros.rest.request.SubmitScoreRequest;

import ch.jaros.BaseTest;
import ch.jaros.entity.Game;
import ch.jaros.entity.GameWinner;
import ch.jaros.entity.Player;
import ch.jaros.entity.Team;
import ch.jaros.repository.GameRepository;
import ch.jaros.repository.PlayerRepository;
import ch.jaros.repository.TeamRepository;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@QuarkusTest
class GameEndResourceTest extends BaseTest {

    @Inject GameRepository gameRepository;
    @Inject PlayerRepository playerRepository;
    @Inject TeamRepository teamRepository;

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
    void endGame() {
        final Game game = persistGame(false);
        addRound(game, 0, 100);

        given().contentType("application/json")
                .body(new EndGameRequest(GameWinner.team2))
                .when().post("/games/" + game.getId() + "/end")
                .then().statusCode(200)
                .body("id", is(game.getId().toString()))
                .body("winner", is("team2"))
                .body("hasEnded", is(true))
                .body("endedAt", notNullValue());

        final Game persistedGame = gameRepository.findById(game.getId());
        assertEquals(GameWinner.team2, persistedGame.getWinner());
        assertNotNull(persistedGame.getEndedAt());
        assertTrue(persistedGame.getHasEnded());
    }

    @Test
    void endGame_team1Wins() {
        final Game game = persistGame(false);
        addRound(game, 100, 0);

        given().contentType("application/json")
                .body(new EndGameRequest(GameWinner.team1))
                .when().post("/games/" + game.getId() + "/end")
                .then().statusCode(200)
                .body("winner", is("team1"))
                .body("hasEnded", is(true));

        final Game persistedGame = gameRepository.findById(game.getId());
        assertEquals(GameWinner.team1, persistedGame.getWinner());
        assertTrue(persistedGame.getHasEnded());
        assertNotNull(persistedGame.getEndedAt());
    }

    @Test
    void endGame_draw() {
        final Game game = persistGame(false);
        addRound(game, 50, 50);

        given().contentType("application/json")
                .body(new EndGameRequest(GameWinner.draw))
                .when().post("/games/" + game.getId() + "/end")
                .then().statusCode(200)
                .body("winner", is("draw"))
                .body("hasEnded", is(true));

        assertEquals(GameWinner.draw, gameRepository.findById(game.getId()).getWinner());
    }

    @Test
    void endGame_rejectsStaleWinnerAfterAnotherRound() {
        final Game game = persistGame(false);
        given().contentType("application/json")
                .body(new SubmitScoreRequest(UUID.randomUUID(), 600, 400, List.of()))
                .when().post("/games/" + game.getId() + "/round-results")
                .then().statusCode(200);
        given().contentType("application/json")
                .body(new SubmitScoreRequest(UUID.randomUUID(), -100, 100, List.of()))
                .when().post("/games/" + game.getId() + "/round-results")
                .then().statusCode(200);

        given().contentType("application/json")
                .body(new EndGameRequest(GameWinner.team1))
                .when().post("/games/" + game.getId() + "/end")
                .then().statusCode(409);

        final Game unchanged = gameRepository.findById(game.getId());
        assertFalse(unchanged.getHasEnded());
        assertNull(unchanged.getWinner());

        given().contentType("application/json")
                .body(new EndGameRequest(GameWinner.draw))
                .when().post("/games/" + game.getId() + "/end")
                .then().statusCode(200)
                .body("winner", is("draw"));
    }

    @Test
    void endGame_alreadyEnded() {
        final Game game = persistGame(true);
        final OffsetDateTime originalEndedAt = game.getEndedAt();

        given().contentType("application/json")
                .body(new EndGameRequest(GameWinner.team1))
                .when().post("/games/" + game.getId() + "/end")
                .then().statusCode(200)
                .body("winner", is("team2"));

        final Game persistedGame = gameRepository.findById(game.getId());
        assertEquals(GameWinner.team2, persistedGame.getWinner());
        assertEquals(originalEndedAt.toInstant(), persistedGame.getEndedAt().toInstant());
    }

    @Test
    void endGame_missingRequest() {
        final Game game = persistGame(false);

        given().contentType("application/json")
                .when().post("/games/" + game.getId() + "/end")
                .then().statusCode(400);

        final Game unchanged = gameRepository.findById(game.getId());
        assertNull(unchanged.getWinner());
        assertFalse(unchanged.getHasEnded());
    }

    @Test
    void endGame_nullWinner() {
        final Game game = persistGame(false);

        given().contentType("application/json")
                .body("{\"winner\":null}")
                .when().post("/games/" + game.getId() + "/end")
                .then().statusCode(400);

        final Game unchanged = gameRepository.findById(game.getId());
        assertNull(unchanged.getWinner());
        assertFalse(unchanged.getHasEnded());
    }

    @Test
    void endGame_invalidWinner() {
        final Game game = persistGame(false);

        given().contentType("application/json")
                .body("{\"winner\":\"team3\"}")
                .when().post("/games/" + game.getId() + "/end")
                .then().statusCode(400);

        final Game unchanged = gameRepository.findById(game.getId());
        assertNull(unchanged.getWinner());
        assertFalse(unchanged.getHasEnded());
    }

    @Test
    void endGame_notFound() {
        given().contentType("application/json")
                .body(new EndGameRequest(GameWinner.team1))
                .when().post("/games/00000000-0000-0000-0000-000000000000/end")
                .then().statusCode(404);
    }

    @Test
    void endGame_invalidId() {
        given().contentType("application/json")
                .body(new EndGameRequest(GameWinner.team1))
                .when().post("/games/invalidUUID/end")
                .then().statusCode(400);
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
    Game persistGame(final boolean ended) {
        final Game game = Game.builder().id(UUID.randomUUID())
                .team1(team1).team2(team2).startedAt(OffsetDateTime.now()).build();
        if (ended) {
            game.setEndedAt(OffsetDateTime.now());
            game.setWinner(GameWinner.team2);
        }
        gameRepository.persist(game);
        return game;
    }

    @Transactional
    void addRound(final Game game, final int team1Score, final int team2Score) {
        final Game managedGame = gameRepository.findById(game.getId());
        managedGame.addRound(team1Score, team2Score);
    }
}
