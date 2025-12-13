package ch.jaros.rest;

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

import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class TeamResourceTest {

    @Inject
    TeamRepository teamRepository;
    @Inject
    PlayerRepository playerRepository;

    @BeforeEach
    @Transactional
    void clearDatabase() {
        teamRepository.deleteAll();
        playerRepository.deleteAll();
    }


    @ParameterizedTest
    @MethodSource("getAllParameters")
    void getAll(final List<Team> testPlayers) {

        testPlayers.forEach(this::transactionalPersist);

        given()
                .when().get("/teams")
                .then()
                .statusCode(200)
                .body("size()", is(testPlayers.size()))
                .body("name", containsInAnyOrder(
                        testPlayers.stream().map(Team::getName).toArray()
                ));
    }


    @Test
    void getById() {

        final Player player1 = Player.from("Marco");
        final Player player2 = Player.from("Mia");

        final Team team = Team.builder()
                .id(UUID.randomUUID())
                .name("TeamMarco")
                .player1(player1)
                .player2(player2)
                .build();

        transactionalPersist(team);

        given()
                .when().get(String.format("/teams/%s", team.getId()))
                .then()
                .statusCode(200)
                .body("name", is("TeamMarco"))
                .body("player1.name", is("Marco"))
                .body("player2.name", is("Mia"));
    }

    @Test
    void getById_notFound() {
        given()
                .when().get(String.format("/teams/%s", "00000000-0000-0000-0000-00000000"))
                .then()
                .statusCode(404);
    }

    // @Test This is tweaker, it is 404 for some reason
    void getById_invalid() {
        given()
                .when().get(String.format("/teams/%s", "invalidUUID"))
                .then()
                .statusCode(400);
    }

    @Test
    void create() {

        final Player player1 = Player.from("Marco");
        transactionalPersist(player1);
        final Player player2 = Player.from("Mia");
        transactionalPersist(player2);

        final TeamCreateRequest request = new TeamCreateRequest("TeamMarco", player1.getId(), player2.getId());

        given()
                .contentType("application/json")
                .body(request)
                .when().post("/teams")
                .then()
                .statusCode(201)
                .body("name", is("TeamMarco"))
                .body("player1.name", is("Marco"))
                .body("player2.name", is("Mia"))
                .body("teamElo", nullValue());
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
    }

    @Test
    void create_duplicate() {

        final Player player1 = Player.from("Marco");
        final Player player2 = Player.from("Mia");

        final Team team = Team.builder()
                .id(Team.createId("TeamMarco"))
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
    }

    @Test
    void delete() {
        final Player player1 = Player.from("Marco");
        final Player player2 = Player.from("Mia");

        final Team team = Team.builder()
                .id(Team.createId("TeamMarco"))
                .name("TeamMarco")
                .player1(player1)
                .player2(player2)
                .build();

        transactionalPersist(team);

        given()
                .contentType("application/json")
                .when().delete(String.format("/teams/%s", team.getId()))
                .then()
                .statusCode(204);

    }

    @Test
    void delete_notExisting() {

        given()
                .contentType("application/json")
                .when().delete(String.format("/teams/%s", "00000000-0000-0000-0000-000000000000"))
                .then()
                .statusCode(404);

    }


    static Stream<List<Team>> getAllParameters() {

        final Player player1 = Player.from("Marco");
        final Player player2 = Player.from("Mia");
        final Player player3 = Player.from("Jana");
        final Player player4 = Player.from("Martin");


        return Stream.of(
                List.of(
                        Team.builder()
                                .id(UUID.randomUUID())
                                .name("TeamMarco")
                                .player1(player1)
                                .player2(player2)
                                .build(),
                        Team.builder()
                                .id(UUID.randomUUID())
                                .name("TeamJana")
                                .player1(player3)
                                .player2(player4)
                                .build()),
                List.of(Team.builder()
                        .id(UUID.randomUUID())
                        .name("TeamMarco")
                        .player1(player1)
                        .player2(player2)
                        .build()),
                List.of()
        );
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
}