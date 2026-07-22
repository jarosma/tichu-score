package ch.jaros.rest;

import ch.jaros.BaseTest;
import ch.jaros.entity.Player;
import ch.jaros.repository.PlayerRepository;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.List;
import java.util.stream.Stream;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.is;

@QuarkusTest
class PlayerReadResourceTest extends BaseTest {

    @Inject
    PlayerRepository playerRepository;

    @BeforeEach
    @Transactional
    void setup() {
        cleanUp();
    }

    @ParameterizedTest
    @MethodSource("players")
    void getAll(final List<Player> players) {
        players.forEach(this::persist);

        given()
                .when().get("/players")
                .then()
                .statusCode(200)
                .body("size()", is(players.size()))
                .body("id", containsInAnyOrder(
                        players.stream().map(player -> player.getId().toString()).toArray()))
                .body("name", containsInAnyOrder(players.stream().map(Player::getName).toArray()))
                .body("enabled", containsInAnyOrder(
                        players.stream().map(Player::isEnabled).toArray()));
    }

    @Test
    void getById() {
        final Player player = persist(Player.from("Marco"));

        given()
                .when().get("/players/" + player.getId())
                .then()
                .statusCode(200)
                .body("id", is(player.getId().toString()))
                .body("name", is("Marco"))
                .body("enabled", is(true));
    }

    @Test
    void getById_notFound() {
        given()
                .when().get("/players/00000000-0000-0000-0000-000000000000")
                .then()
                .statusCode(404);
    }

    @Test
    void getById_invalid() {
        given()
                .when().get("/players/invalidUUID")
                .then()
                .statusCode(400);
    }

    @Transactional
    Player persist(final Player player) {
        playerRepository.persist(player);
        return player;
    }

    static Stream<List<Player>> players() {
        final Player disabled = Player.from("Mia");
        disabled.setEnabled(false);
        return Stream.of(
                List.of(Player.from("Marco"), disabled),
                List.of(Player.from("test")),
                List.of()
        );
    }
}
