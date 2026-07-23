package ch.jaros.rest;

import ch.jaros.BaseTest;
import ch.jaros.entity.Player;
import ch.jaros.entity.PlayerStats;
import ch.jaros.repository.PlayerRepository;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;

@QuarkusTest
class PlayerStatsReadResourceTest extends BaseTest {

    @Inject
    PlayerRepository playerRepository;

    private Player player;

    @BeforeEach
    @Transactional
    void setup() {
        cleanUp();
        player = persist(Player.from("Marco"));
    }

    @Test
    void getStats() {
        given().when().get("/players/" + player.getId() + "/stats")
                .then().statusCode(200)
                .body("totalWins", is(0))
                .body("totalLosses", is(0))
                .body("successfulTichus", is(0))
                .body("unsuccessfulTichus", is(0))
                .body("totalGamesPlayed", is(0))
                .body("highestPointDiffWin", nullValue());
    }

    @Test
    void getStats_notFound() {
        given().when().get("/players/00000000-0000-0000-0000-000000000000/stats")
                .then().statusCode(404);
    }

    @Test
    void getStats_invalid() {
        given().when().get("/players/invalidUUID/stats")
                .then().statusCode(400);
    }

    @Transactional
    Player persist(final Player value) {
        value.setPlayerStats(PlayerStats.create(value));
        playerRepository.persist(value);
        return value;
    }
}
