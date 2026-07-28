package ch.jaros.rest;

import ch.jaros.rest.request.StartGameRequest;

import ch.jaros.BaseTest;
import ch.jaros.entity.GameWinner;
import ch.jaros.entity.Game;
import ch.jaros.entity.Player;
import ch.jaros.entity.Team;
import ch.jaros.repository.PlayerRepository;
import ch.jaros.repository.GameRepository;
import ch.jaros.repository.TeamRepository;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class GameStartResourceTest extends BaseTest {

    @Inject
    TeamRepository teamRepository;
    @Inject
    GameRepository gameRepository;
    @Inject
    PlayerRepository playerRepository;

    @BeforeEach
    @Transactional
    void setup() {
        cleanUp();
    }


    @Test
    void startGame() {

        final Player player1 = Player.from("Marco");
        final Player player2 = Player.from("Mia");

        final Team team1 = Team.builder()
                .id(UUID.randomUUID())
                .name("TeamMaMi")
                .player1(player1)
                .player2(player2)
                .build();

        transactionalPersist(team1);

        final Player player3 = Player.from("Jana");
        final Player player4 = Player.from("Martin");

        final Team team2 = Team.builder()
                .id(UUID.randomUUID())
                .name("TeamJaMa")
                .player1(player3)
                .player2(player4)
                .build();

        transactionalPersist(team2);

        final StartGameRequest startGameRequest = new StartGameRequest(team1.getId(), team2.getId());

        final String gameId = given()
                .contentType("application/json")
                .body(startGameRequest)
                .when().post("/games")
                .then()
                .statusCode(201)
                .body("id", notNullValue(UUID.class))
                .body("startedAt", notNullValue(OffsetDateTime.class))
                .body("endedAt", nullValue(OffsetDateTime.class))
                .body("team1.id", is(team1.getId().toString()))
                .body("team1.name", is("TeamMaMi"))
                .body("team1.player1.name", is("Marco"))
                .body("team1.player2.name", is("Mia"))
                .body("team2.id", is(team2.getId().toString()))
                .body("team2.name", is("TeamJaMa"))
                .body("team2.player1.name", is("Jana"))
                .body("team2.player2.name", is("Martin"))
                .body("winner", nullValue(GameWinner.class))
                .body("scores.rounds", empty())
                .body("hasEnded", is(false))
                .body("pendingFinish", is(false))
                .extract().path("id");

        final Game persisted = gameRepository.findById(UUID.fromString(gameId));
        assertNotNull(persisted);
        assertEquals(team1.getId(), persisted.getTeam1().getId());
        assertEquals(team2.getId(), persisted.getTeam2().getId());
        assertNotNull(persisted.getStartedAt());
        assertNull(persisted.getEndedAt());
        assertNull(persisted.getWinner());
        assertTrue(persisted.getRounds().isEmpty());

    }

    @Test
    void startGame_sameIdempotencyKey_reusesGame() {
        final Player player1 = Player.from("Marco");
        final Player player2 = Player.from("Mia");
        final Team team1 = Team.builder()
                .id(UUID.randomUUID())
                .name("TeamMaMi")
                .player1(player1)
                .player2(player2)
                .build();
        transactionalPersist(team1);

        final Player player3 = Player.from("Jana");
        final Player player4 = Player.from("Martin");
        final Team team2 = Team.builder()
                .id(UUID.randomUUID())
                .name("TeamJaMa")
                .player1(player3)
                .player2(player4)
                .build();
        transactionalPersist(team2);

        final StartGameRequest request = new StartGameRequest(
                UUID.randomUUID(), team1.getId(), team2.getId());

        final String firstGameId = given()
                .contentType("application/json")
                .body(request)
                .when().post("/games")
                .then().statusCode(201)
                .extract().path("id");

        given()
                .contentType("application/json")
                .body(request)
                .when().post("/games")
                .then().statusCode(201)
                .body("id", is(firstGameId));

        assertEquals(1, gameRepository.count());
        assertNotNull(gameRepository.findById(UUID.fromString(firstGameId)));
    }

    @Test
    void startGame_missingTeam1Id() {
        given().contentType("application/json")
                .body("{\"team2Id\":\"00000000-0000-0000-0000-000000000000\"}")
                .when().post("/games").then().statusCode(400);

        assertEquals(0, gameRepository.count());
    }

    @Test
    void startGame_missingTeam2Id() {
        given().contentType("application/json")
                .body("{\"team1Id\":\"00000000-0000-0000-0000-000000000000\"}")
                .when().post("/games").then().statusCode(400);

        assertEquals(0, gameRepository.count());
    }

    @Test
    void startGame_invalidTeamId() {
        given().contentType("application/json")
                .body("{\"team1Id\":\"invalidUUID\",\"team2Id\":\"00000000-0000-0000-0000-000000000000\"}")
                .when().post("/games").then().statusCode(400);

        assertEquals(0, gameRepository.count());
    }

    @Test
    void startGame_nonDistinctPlayers() {
        final Player player1 = Player.from("Marco");
        final Player player2 = Player.from("Mia");

        final Team team1 = Team.builder()
                .id(UUID.randomUUID())
                .name("TeamMaMi")
                .player1(player1)
                .player2(player2)
                .build();

        transactionalPersist(team1);

        final Player player3 = Player.from("Jana");

        transactionalPersist(player3);

        final Team team2 = Team.builder()
                .id(UUID.randomUUID())
                .name("TeamJaMa")
                .player1(player3)
                .player2(player1)
                .build();

        transactionalPersistNonCascade(team2);

        final StartGameRequest startGameRequest = new StartGameRequest(team1.getId(), team2.getId());

        given()
                .contentType("application/json")
                .body(startGameRequest)
                .when().post("/games")
                .then()
                .statusCode(400);

        assertEquals(0, gameRepository.count());
    }

    @Test
    void startGame_nonDistinctTeams() {
        final Player player1 = Player.from("Marco");
        final Player player2 = Player.from("Mia");

        final Team team1 = Team.builder()
                .id(UUID.randomUUID())
                .name("TeamMaMi")
                .player1(player1)
                .player2(player2)
                .build();

        transactionalPersist(team1);

        final StartGameRequest startGameRequest = new StartGameRequest(team1.getId(), team1.getId());

        given()
                .contentType("application/json")
                .body(startGameRequest)
                .when().post("/games")
                .then()
                .statusCode(400);

        assertEquals(0, gameRepository.count());
    }

    @Test
    void startGame_notExistingTeam() {
        final Player player1 = Player.from("Marco");
        final Player player2 = Player.from("Mia");

        final Team team1 = Team.builder()
                .id(UUID.randomUUID())
                .name("TeamMaMi")
                .player1(player1)
                .player2(player2)
                .build();

        transactionalPersist(team1);

        final StartGameRequest startGameRequest = new StartGameRequest(team1.getId(), UUID.randomUUID());

        given()
                .contentType("application/json")
                .body(startGameRequest)
                .when().post("/games")
                .then()
                .statusCode(404)
                .body(is("Team 2 does not exist"));

        assertEquals(0, gameRepository.count());
    }

    @Test
    void startGame_disabledTeam() {

        final Player player1 = Player.from("Marco");
        final Player player2 = Player.from("Mia");

        final Team team1 = Team.builder()
                .id(UUID.randomUUID())
                .name("TeamMaMi")
                .player1(player1)
                .player2(player2)
                .build();

        transactionalPersist(team1);

        final Player player3 = Player.from("Jana");
        final Player player4 = Player.from("Martin");
        player4.setEnabled(false);

        final Team team2 = Team.builder()
                .id(UUID.randomUUID())
                .name("TeamJaMa")
                .player1(player3)
                .player2(player4)
                .build();

        transactionalPersist(team2);

        final StartGameRequest startGameRequest = new StartGameRequest(team1.getId(), team2.getId());

        given()
                .contentType("application/json")
                .body(startGameRequest)
                .when().post("/games")
                .then()
                .statusCode(400);

        assertEquals(0, gameRepository.count());
    }

    @Transactional
    void transactionalPersist(final Team team) {
        playerRepository.persist(team.getPlayer1());
        playerRepository.persist(team.getPlayer2());
        teamRepository.persist(team);
    }

    @Transactional
    void transactionalPersist(final Player player) {
        playerRepository.persist(player);
    }

    @Transactional
    void transactionalPersistNonCascade(final Team team) {
        teamRepository.persist(team);
    }
}
