package ch.jaros.rest;

import ch.jaros.BaseTest;
import ch.jaros.entity.Player;
import ch.jaros.entity.Team;
import ch.jaros.repository.PlayerRepository;
import ch.jaros.repository.TeamRepository;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;

@QuarkusTest
class PlayerDeleteResourceTest extends BaseTest {

    @Inject
    PlayerRepository playerRepository;
    @Inject
    TeamRepository teamRepository;

    @BeforeEach
    @Transactional
    void setup() {
        cleanUp();
    }

    @Test
    void delete() {
        final Player player = persist(Player.from("Marco"));

        given()
                .contentType("application/json")
                .when().delete("/players/" + player.getId())
                .then()
                .statusCode(204);

        given()
                .when().get("/players/" + player.getId())
                .then()
                .statusCode(404);

        Assertions.assertNull(playerRepository.findById(player.getId()));
    }

    @Test
    void delete_notExisting() {
        given()
                .when().delete("/players/00000000-0000-0000-0000-000000000000")
                .then()
                .statusCode(404);
    }

    @Test
    void delete_disabledPlayer() {
        final Player player = Player.from("Marco");
        player.setEnabled(false);
        persist(player);

        given().when().delete("/players/" + player.getId())
                .then().statusCode(204);

        Assertions.assertNull(playerRepository.findById(player.getId()));
    }

    @Test
    void delete_referencedPlayer() {
        final Player player = Player.from("Marco");
        final Player other = Player.from("Mia");
        persistTeam(player, other);

        given().when().delete("/players/" + player.getId())
                .then().statusCode(409);

        Assertions.assertEquals(player, playerRepository.findById(player.getId()));
    }

    @Test
    void delete_invalid() {
        given()
                .when().delete("/players/invalidUUID")
                .then()
                .statusCode(400);
    }

    @Transactional
    Player persist(final Player player) {
        playerRepository.persist(player);
        return player;
    }

    @Transactional
    void persistTeam(final Player player, final Player other) {
        final Team team = Team.builder()
                .id(Team.createId("TeamMarco"))
                .name("TeamMarco")
                .player1(player)
                .player2(other)
                .build();
        playerRepository.persist(player);
        playerRepository.persist(other);
        teamRepository.persist(team);
    }
}
