package ch.jaros.rest;

import ch.jaros.BaseTest;
import ch.jaros.entity.Player;
import ch.jaros.entity.Team;
import ch.jaros.repository.PlayerRepository;
import ch.jaros.repository.TeamRepository;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

import static io.restassured.RestAssured.given;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class TeamCreateResourceTest extends BaseTest {

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
    void create() {

        final Player player1 = Player.from("Marco");
        transactionalPersist(player1);
        final Player player2 = Player.from("Mia");
        transactionalPersist(player2);

        final TeamCreateRequest request = new TeamCreateRequest("TeamMarco", player1.getId(), player2.getId());

        final String teamId = given()
                .contentType("application/json")
                .body(request)
                .when().post("/teams")
                .then()
                .statusCode(201)
                .body("id", notNullValue(UUID.class))
                .body("name", is("TeamMarco"))
                .body("player1.id", is(player1.getId().toString()))
                .body("player1.name", is("Marco"))
                .body("player2.id", is(player2.getId().toString()))
                .body("player2.name", is("Mia"))
                .body("enabled", is(true))
                .body("teamElo", nullValue())
                .extract().path("id");

        final Team persisted = teamRepository.findById(UUID.fromString(teamId));
        assertNotNull(persisted);
        assertEquals("TeamMarco", persisted.getName());
        assertEquals(player1.getId(), persisted.getPlayer1().getId());
        assertEquals(player2.getId(), persisted.getPlayer2().getId());
    }

    @Test
    void create_missingPlayer() {

        final Player player1 = Player.from("Marco");
        final Player player2 = Player.from("Mia");

        final TeamCreateRequest request = new TeamCreateRequest("TeamMarco", player1.getId(), player2.getId());

        given()
                .contentType("application/json")
                .body(request)
                .when().post("/teams")
                .then()
                .statusCode(404);

        assertEquals(0, teamRepository.count());
    }

    @Test
    void create_missingPlayer1Id() {
        given().contentType("application/json")
                .body("{\"name\":\"TeamMarco\",\"player2Id\":\"00000000-0000-0000-0000-000000000000\"}")
                .when().post("/teams").then().statusCode(400);

        assertEquals(0, teamRepository.count());
    }

    @Test
    void create_missingPlayer2Id() {
        given().contentType("application/json")
                .body("{\"name\":\"TeamMarco\",\"player1Id\":\"00000000-0000-0000-0000-000000000000\"}")
                .when().post("/teams").then().statusCode(400);

        assertEquals(0, teamRepository.count());
    }

    @Test
    void create_invalidPlayerId() {
        given().contentType("application/json")
                .body("{\"name\":\"TeamMarco\",\"player1Id\":\"invalidUUID\",\"player2Id\":\"00000000-0000-0000-0000-000000000000\"}")
                .when().post("/teams").then().statusCode(400);

        assertEquals(0, teamRepository.count());
    }

    @Test
    void create_samePlayer() {
        final Player player = Player.from("Marco");
        transactionalPersist(player);

        final TeamCreateRequest request = new TeamCreateRequest("TeamMarco", player.getId(), player.getId());

        given()
                .contentType("application/json")
                .body(request)
                .when().post("/teams")
                .then()
                .statusCode(400);

        assertEquals(0, teamRepository.count());
    }

    @Test
    void create_missingBody() {
        given()
                .contentType("application/json")
                .when().post("/teams")
                .then()
                .statusCode(400);

        assertEquals(0, teamRepository.count());
    }

    @Test
    void create_nullName() {
        given()
                .contentType("application/json")
                .body("{\"name\":null,\"player1Id\":null,\"player2Id\":null}")
                .when().post("/teams")
                .then()
                .statusCode(400);

        assertEquals(0, teamRepository.count());
    }

    @Test
    void create_duplicate() {

        final Player player1 = Player.from("Marco");
        final Player player2 = Player.from("Mia");

        final Team team = Team.builder()
                .id(UUID.randomUUID())
                .name("TeamMarco")
                .player1(player1)
                .player2(player2)
                .build();

        transactionalPersist(team);

        final TeamCreateRequest request = new TeamCreateRequest("TeamMarco", player1.getId(), player2.getId());

        given()
                .contentType("application/json")
                .body(request)
                .when().post("/teams")
                .then()
                .statusCode(409);

        assertEquals(1, teamRepository.count());
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "   "})
    void create_invalidName(final String name) {
        final Player player1 = Player.from("Marco");
        final Player player2 = Player.from("Mia");
        transactionalPersist(player1);
        transactionalPersist(player2);

        final TeamCreateRequest request = new TeamCreateRequest(name, player1.getId(), player2.getId());

        given()
                .contentType("application/json")
                .body(request)
                .when().post("/teams")
                .then()
                .statusCode(400);

        assertEquals(0, teamRepository.count());
    }

    @Test
    void create_nameTooLong() {
        final Player player1 = Player.from("Marco");
        final Player player2 = Player.from("Mia");
        transactionalPersist(player1);
        transactionalPersist(player2);

        final TeamCreateRequest request = new TeamCreateRequest("a".repeat(65), player1.getId(), player2.getId());

        given()
                .contentType("application/json")
                .body(request)
                .when().post("/teams")
                .then()
                .statusCode(400);

        assertEquals(0, teamRepository.count());
    }

    @Test
    void create_nameExactly64Characters() {
        final Player player1 = Player.from("Marco");
        final Player player2 = Player.from("Mia");
        transactionalPersist(player1);
        transactionalPersist(player2);
        final String name = "a".repeat(64);

        final String teamId = given().contentType("application/json")
                .body(new TeamCreateRequest(name, player1.getId(), player2.getId()))
                .when().post("/teams").then().statusCode(201)
                .body("name", is(name))
                .extract().path("id");

        final Team persisted = teamRepository.findById(UUID.fromString(teamId));
        assertNotNull(persisted);
        assertEquals(player1.getId(), persisted.getPlayer1().getId());
        assertEquals(player2.getId(), persisted.getPlayer2().getId());
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
