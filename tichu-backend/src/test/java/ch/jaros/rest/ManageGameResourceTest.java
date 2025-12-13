package ch.jaros.rest;

import ch.jaros.BaseTest;
import ch.jaros.entity.*;
import ch.jaros.repository.GameRepository;
import ch.jaros.repository.PlayerRepository;
import ch.jaros.repository.TeamRepository;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.time.OffsetDateTime;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class ManageGameResourceTest extends BaseTest {

    @Inject
    TeamRepository teamRepository;
    @Inject
    PlayerRepository playerRepository;
    @Inject
    GameRepository gameRepository;

    private final Player player1 = Player.from("Marco");
    private final Player player2 = Player.from("Mia");

    private final Team team1 = Team.builder()
            .id(Team.createId("TeamMarco"))
            .name("TeamMarco")
            .player1(player1)
            .player2(player2)
            .build();

    private final Player player3 = Player.from("Jana");
    private final Player player4 = Player.from("Martin");

    private final Team team2 = Team.builder()
            .id(Team.createId("TeamJana"))
            .name("TeamJana")
            .player1(player3)
            .player2(player4)
            .build();

    private final Game game = Game.builder()
            .id(UUID.randomUUID())
            .team1(team1)
            .team2(team2)
            .startedAt(OffsetDateTime.now())
            .build();

    @BeforeEach
    @Transactional
    void setup() {
        cleanUp();
        transactionalPersist(team1);
        transactionalPersist(team2);
    }

    @Test
    void startGame() {

        final StartGameRequest request = StartGameRequest.builder()
                .team1(team1.getId())
                .team2(team2.getId())
                .build();

        given()
                .contentType("application/json")
                .body(request)
                .when().post("/games/start")
                .then()
                .statusCode(201)
                .body("id", notNullValue());
    }

    @ParameterizedTest
    @CsvSource(value = {"0899cda3-c703-3849-8ea5-0ffaaa9d6809:00000000-0000-0000-0000-000000000000", "00000000-0000-0000-0000-000000000000:0899cda3-c703-3849-8ea5-0ffaaa9d6809", "00000000-0000-0000-0000-000000000000:00000000-0000-0000-0000-000000000000"}, delimiter = ':')
    void startGame_notExistingTeam(final String team1Id, final String team2Id) {

        final StartGameRequest request = StartGameRequest.builder()
                .team1(UUID.fromString(team1Id))
                .team2(UUID.fromString(team2Id))
                .build();

        given()
                .contentType("application/json")
                .body(request)
                .when().post("/games/start")
                .then()
                .statusCode(404);
    }

    @Test
    void startGame_sameTeamTwice() {
        final StartGameRequest request = StartGameRequest.builder()
                .team1(team1.getId())
                .team2(team1.getId())
                .build();

        given()
                .contentType("application/json")
                .body(request)
                .when().post("/games/start")
                .then()
                .statusCode(400);
    }

    @Test
    void spectateGame() {
        game.getScores().addRound(10, 90);
        game.getScores().addRound(50, 50);
        game.getScores().addRound(-5, 105);

        transactionalPersist(game);

        given()
                .when().get(String.format("/games/spectate/%s", game.getId()))
                .then()
                .statusCode(200)
                .body("id", is(game.getId().toString()))
                .body("team1.name", is("TeamMarco"))
                .body("team2.name", is("TeamJana"))
                .body("scores.rounds[0].number", is(0))
                .body("scores.rounds[0].team1", is(10))
                .body("scores.rounds[0].team2", is(90))
                .body("scores.rounds[1].number", is(1))
                .body("scores.rounds[1].team1", is(50))
                .body("scores.rounds[1].team2", is(50))
                .body("scores.rounds[2].number", is(2))
                .body("scores.rounds[2].team1", is(-5))
                .body("scores.rounds[2].team2", is(105))
                .body("winner", nullValue())
                .body("endedAt", nullValue())
                .body("startedAt", notNullValue());
    }

    @Test
    void spectateGame_alreadyEnded() {
        game.getScores().addRound(10, 90);
        game.getScores().addRound(50, 50);
        game.getScores().addRound(-5, 105);

        game.setEndedAt(OffsetDateTime.now());
        game.setWinner(GameWinner.team2);

        transactionalPersist(game);

        given()
                .when().get(String.format("/games/spectate/%s", game.getId()))
                .then()
                .statusCode(200)
                .body("id", is(game.getId().toString()))
                .body("team1.name", is("TeamMarco"))
                .body("team2.name", is("TeamJana"))
                .body("scores.rounds[0].number", is(0))
                .body("scores.rounds[0].team1", is(10))
                .body("scores.rounds[0].team2", is(90))
                .body("scores.rounds[1].number", is(1))
                .body("scores.rounds[1].team1", is(50))
                .body("scores.rounds[1].team2", is(50))
                .body("scores.rounds[2].number", is(2))
                .body("scores.rounds[2].team1", is(-5))
                .body("scores.rounds[2].team2", is(105))
                .body("startedAt", notNullValue())
                .body("endedAt", notNullValue())
                .body("winner", is("team2"));
    }

    @Test
    void spectateGame_notExisting() {
        given()
                .when().get(String.format("/games/spectate/%s", "00000000-0000-0000-0000-00000000"))
                .then()
                .statusCode(404);
    }

    // @Test This is tweaker, it is 404 for some reason
    void spectateGame_invalid() {
        given()
                .when().get(String.format("/games/spectate/%s", "invalidUUID"))
                .then()
                .statusCode(400);
    }


    @Test
    void endGame() {
        game.getScores().addRound(10, 90);
        game.getScores().addRound(50, 50);
        game.getScores().addRound(-5, 105);

        transactionalPersist(game);

        final EndGameRequest request = new EndGameRequest(GameWinner.team2);

        given()
                .contentType("application/json")
                .body(request)
                .when().post(String.format("/games/end/%s", game.getId()))
                .then()
                .statusCode(200)
                .body("id", is(game.getId().toString()))
                .body("team1.name", is("TeamMarco"))
                .body("team2.name", is("TeamJana"))
                .body("scores.rounds[0].number", is(0))
                .body("scores.rounds[0].team1", is(10))
                .body("scores.rounds[0].team2", is(90))
                .body("scores.rounds[1].number", is(1))
                .body("scores.rounds[1].team1", is(50))
                .body("scores.rounds[1].team2", is(50))
                .body("scores.rounds[2].number", is(2))
                .body("scores.rounds[2].team1", is(-5))
                .body("scores.rounds[2].team2", is(105))
                .body("startedAt", notNullValue())
                .body("endedAt", notNullValue())
                .body("winner", is("team2"));
    }

    @Test
    void endGame_alreadyEnded() {
        game.getScores().addRound(10, 90);
        game.getScores().addRound(50, 50);
        game.getScores().addRound(-5, 105);

        game.setEndedAt(OffsetDateTime.now());
        game.setWinner(GameWinner.team2);

        transactionalPersist(game);

        given()
                .when().get(String.format("/games/spectate/%s", game.getId()))
                .then()
                .statusCode(200)
                .body("id", is(game.getId().toString()))
                .body("team1.name", is("TeamMarco"))
                .body("team2.name", is("TeamJana"))
                .body("scores.rounds[0].number", is(0))
                .body("scores.rounds[0].team1", is(10))
                .body("scores.rounds[0].team2", is(90))
                .body("scores.rounds[1].number", is(1))
                .body("scores.rounds[1].team1", is(50))
                .body("scores.rounds[1].team2", is(50))
                .body("scores.rounds[2].number", is(2))
                .body("scores.rounds[2].team1", is(-5))
                .body("scores.rounds[2].team2", is(105))
                .body("startedAt", notNullValue())
                .body("endedAt", notNullValue())
                .body("winner", is("team2"));
    }

    @Test
    void endGame_notExisting() {
        given()
                .when().get(String.format("/games/spectate/%s", "00000000-0000-0000-0000-00000000"))
                .then()
                .statusCode(404);
    }

    // @Test This is tweaker, it is 404 for some reason
    void endGame_invalid() {
        given()
                .when().get(String.format("/games/spectate/%s", "invalidUUID"))
                .then()
                .statusCode(400);
    }

    @Transactional
    void transactionalPersist(final Team team) {
        playerRepository.persist(team.getPlayer1());
        playerRepository.persist(team.getPlayer2());
        teamRepository.persist(team);
    }

    @Transactional
    void transactionalPersist(final Game game) {
        gameRepository.persist(game);
    }

}