package ch.jaros.rest;

import ch.jaros.BaseTest;
import ch.jaros.entity.GameWinner;
import ch.jaros.entity.Player;
import ch.jaros.entity.Team;
import ch.jaros.repository.PlayerRepository;
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
class GameResourceTest extends BaseTest {

    @Inject
    TeamRepository teamRepository;
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
                .id(Team.createId("TeamMaMi"))
                .name("TeamMaMi")
                .player1(player1)
                .player2(player2)
                .build();

        transactionalPersist(team1);

        final Player player3 = Player.from("Jana");
        final Player player4 = Player.from("Martin");

        final Team team2 = Team.builder()
                .id(Team.createId("TeamJaMa"))
                .name("TeamJaMa")
                .player1(player3)
                .player2(player4)
                .build();

        transactionalPersist(team2);

        final StartGameRequest startGameRequest = new StartGameRequest(team1.getId(), team2.getId());

        given()
                .contentType("application/json")
                .body(startGameRequest)
                .when().post("/game/start")
                .then()
                .statusCode(201)
                .body("id", notNullValue(UUID.class))
                .body("startedAt", notNullValue(OffsetDateTime.class))
                .body("endedAt", nullValue(OffsetDateTime.class))
                .body("team1", notNullValue(Team.class))
                .body("team2", notNullValue(Team.class))
                .body("winner", nullValue(GameWinner.class))
                .body("scores.rounds", empty())
                .body("hasEnded", is(false));

    }

    @Test
    void startGame_nonDistinctPlayers() {
        final Player player1 = Player.from("Marco");
        final Player player2 = Player.from("Mia");

        final Team team1 = Team.builder()
                .id(Team.createId("TeamMaMi"))
                .name("TeamMaMi")
                .player1(player1)
                .player2(player2)
                .build();

        transactionalPersist(team1);

        final Player player3 = Player.from("Jana");

        transactionalPersist(player3);

        final Team team2 = Team.builder()
                .id(Team.createId("TeamJaMa"))
                .name("TeamJaMa")
                .player1(player3)
                .player2(player1)
                .build();

        transactionalPersistNonCascade(team2);

        final StartGameRequest startGameRequest = new StartGameRequest(team1.getId(), team2.getId());

        given()
                .contentType("application/json")
                .body(startGameRequest)
                .when().post("/game/start")
                .then()
                .statusCode(400);
    }

    @Test
    void startGame_nonDistinctTeams() {
        final Player player1 = Player.from("Marco");
        final Player player2 = Player.from("Mia");

        final Team team1 = Team.builder()
                .id(Team.createId("TeamMaMi"))
                .name("TeamMaMi")
                .player1(player1)
                .player2(player2)
                .build();

        transactionalPersist(team1);

        final StartGameRequest startGameRequest = new StartGameRequest(team1.getId(), team1.getId());

        given()
                .contentType("application/json")
                .body(startGameRequest)
                .when().post("/game/start")
                .then()
                .statusCode(400);
    }

    @Test
    void startGame_notExistingTeam() {
        final Player player1 = Player.from("Marco");
        final Player player2 = Player.from("Mia");

        final Team team1 = Team.builder()
                .id(Team.createId("TeamMaMi"))
                .name("TeamMaMi")
                .player1(player1)
                .player2(player2)
                .build();

        transactionalPersist(team1);

        final StartGameRequest startGameRequest = new StartGameRequest(team1.getId(), UUID.randomUUID());

        given()
                .contentType("application/json")
                .body(startGameRequest)
                .when().post("/game/start")
                .then()
                .statusCode(404);
    }

    @Test
    void startGame_disabledTeam() {

        final Player player1 = Player.from("Marco");
        final Player player2 = Player.from("Mia");

        final Team team1 = Team.builder()
                .id(Team.createId("TeamMaMi"))
                .name("TeamMaMi")
                .player1(player1)
                .player2(player2)
                .build();

        transactionalPersist(team1);

        final Player player3 = Player.from("Jana");
        final Player player4 = Player.from("Martin");
        player4.setEnabled(false);

        final Team team2 = Team.builder()
                .id(Team.createId("TeamJaMa"))
                .name("TeamJaMa")
                .player1(player3)
                .player2(player4)
                .build();

        transactionalPersist(team2);

        final StartGameRequest startGameRequest = new StartGameRequest(team1.getId(), team2.getId());

        given()
                .contentType("application/json")
                .body(startGameRequest)
                .when().post("/game/start")
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
    void transactionalPersist(final Player player) {
        playerRepository.persist(player);
    }

    @Transactional
    void transactionalPersistNonCascade(final Team team) {
        teamRepository.persist(team);
    }
}