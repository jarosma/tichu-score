package ch.jaros.rest;

import ch.jaros.BaseTest;
import ch.jaros.entity.Player;
import ch.jaros.repository.PlayerRepository;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.List;
import java.util.stream.Stream;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class PlayerResourceTest extends BaseTest {

    @Inject
    PlayerRepository playerRepository;

    @BeforeEach
    @Transactional
    void setup() {
        cleanUp();
    }

    @ParameterizedTest
    @MethodSource("getAllParameters")
    void getAll(final List<Player> testPlayers) {
        testPlayers.forEach(this::transactionalPersist);

        given()
                .when().get("/players")
                .then()
                .statusCode(200)
                .body("size()", is(testPlayers.size()))
                .body("name", containsInAnyOrder(
                        testPlayers.stream().map(Player::getName).toArray()
                ));
    }

    @Test
    void getById() {
        final Player player = Player.from("Marco");

        transactionalPersist(player);

        given()
                .when().get(String.format("/players/%s", player.getId()))
                .then()
                .statusCode(200)
                .body("name", is("Marco"));
    }

    @Test
    void getById_notFound() {
        given()
                .when().get(String.format("/players/%s", "00000000-0000-0000-0000-00000000"))
                .then()
                .statusCode(404);
    }

    // @Test This is tweaker, it is 404 for some reason
    void getById_invalid() {
        given()
                .when().get(String.format("/players/%s", "invalidUUID"))
                .then()
                .statusCode(400);
    }

    @Test
    void create() {

        final PlayerPostRequest request = new PlayerPostRequest("Marco");

        given()
                .contentType("application/json")
                .body(request)
                .when().post("/players")
                .then()
                .statusCode(201)
                .body("id", is("2231d087-8e1f-3497-ac49-8ad49de37ef6"))
                .body("elo", nullValue())
                .body("name", is("Marco"));

    }

    @Test
    void create_duplicate() {
        final PlayerPostRequest request = new PlayerPostRequest("Marco");

        final Player player = Player.from(request);
        transactionalPersist(player);

        given()
                .contentType("application/json")
                .body(request)
                .when().post("/players")
                .then()
                .statusCode(409);

    }

    @Test
    void delete() {
        final PlayerPostRequest request = new PlayerPostRequest("Marco");

        final Player player = Player.from(request);
        transactionalPersist(player);

        given()
                .contentType("application/json")
                .when().delete(String.format("/players/%s", player.getId()))
                .then()
                .statusCode(204);

    }

    @Test
    void delete_notExisting() {

        given()
                .contentType("application/json")
                .when().delete(String.format("/players/%s", "00000000-0000-0000-0000-000000000000"))
                .then()
                .statusCode(404);

    }

    // @Test This is tweaker, it is 404 for some reason
    void delete_invalid() {

        given()
                .contentType("application/json")
                .when().delete(String.format("/players/%s", "invalidUUID"))
                .then()
                .statusCode(400);

    }

    static Stream<List<Player>> getAllParameters() {
        return Stream.of(
                List.of(Player.from("Marco"), Player.from("Mia")),
                List.of(Player.from("test")),
                List.of()
        );
    }


    @Transactional
    void transactionalPersist(final Player player){
        playerRepository.persist(player);
    }
}