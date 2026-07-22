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
import org.junit.jupiter.params.provider.ValueSource;

import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class PlayerCreateResourceTest extends BaseTest {

    @Inject
    PlayerRepository playerRepository;

    @BeforeEach
    @Transactional
    void setup() {
        cleanUp();
    }

    @Test
    void create() {
        given().contentType("application/json")
                .body(new PlayerPostRequest("Marco"))
                .when().post("/players")
                .then().statusCode(201)
                .body("id", is("2231d087-8e1f-3497-ac49-8ad49de37ef6"))
                .body("elo", nullValue())
                .body("name", is("Marco"))
                .body("enabled", is(true));

        final Player persisted = playerRepository.findById(UUID.fromString("2231d087-8e1f-3497-ac49-8ad49de37ef6"));
        assertNotNull(persisted);
        assertEquals("Marco", persisted.getName());
        assertTrue(persisted.isEnabled());
        assertNull(persisted.getElo());
    }

    @Test
    void create_missingBody() {
        given().contentType("application/json").when().post("/players")
                .then().statusCode(400);

        assertEquals(0, playerRepository.count());
    }

    @Test
    void create_nullName() {
        given().contentType("application/json").body("{\"name\":null}")
                .when().post("/players").then().statusCode(400);

        assertEquals(0, playerRepository.count());
    }

    @Test
    void create_duplicate() {
        final Player player = Player.from("Marco");
        persist(player);

        given().contentType("application/json")
                .body(new PlayerPostRequest("Marco"))
                .when().post("/players").then().statusCode(409);

        assertEquals(1, playerRepository.count());
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "   "})
    void create_invalidName(final String name) {
        given().contentType("application/json")
                .body(new PlayerPostRequest(name))
                .when().post("/players").then().statusCode(400);

        assertEquals(0, playerRepository.count());
    }

    @Test
    void create_nameTooLong() {
        given().contentType("application/json")
                .body(new PlayerPostRequest("a".repeat(65)))
                .when().post("/players").then().statusCode(400);

        assertEquals(0, playerRepository.count());
    }

    @Test
    void create_nameExactly64Characters() {
        final String name = "a".repeat(64);
        given().contentType("application/json")
                .body(new PlayerPostRequest(name))
                .when().post("/players")
                .then().statusCode(201)
                .body("name", is(name));

        assertNotNull(playerRepository.findById(Player.from(name).getId()));
    }

    @Transactional
    void persist(final Player player) {
        playerRepository.persist(player);
    }
}
