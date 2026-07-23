package ch.jaros.rest;

import ch.jaros.BaseTest;
import ch.jaros.entity.Player;
import ch.jaros.entity.Team;
import ch.jaros.repository.PlayerRepository;
import ch.jaros.repository.TeamRepository;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class PlayerStatusResourceTest extends BaseTest {

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
    void disable() {
        final Player player = Player.from("Marco");
        player.setEnabled(true);

        transactionalPersist(player);

        given()
                .contentType("application/json")
                .body(new PlayerStatusRequest(false))
                .when().patch(String.format("/players/%s", player.getId()))
                .then()
                .statusCode(200);

        final Player finalPlayer = playerRepository.findById(player.getId());
        Assertions.assertEquals(player.getId(), finalPlayer.getId());
        Assertions.assertEquals("Marco", finalPlayer.getName());
        Assertions.assertFalse(finalPlayer.isEnabled());

    }

    @Test
    void enable() {
        final Player player = Player.from("Marco");
        player.setEnabled(false);

        transactionalPersist(player);

        given()
                .contentType("application/json")
                .body(new PlayerStatusRequest(true))
                .when().patch(String.format("/players/%s", player.getId()))
                .then()
                .statusCode(200);

        final Player finalPlayer = playerRepository.findById(player.getId());
        Assertions.assertEquals(player.getId(), finalPlayer.getId());
        Assertions.assertEquals("Marco", finalPlayer.getName());
        Assertions.assertTrue(finalPlayer.isEnabled());
    }


    @Test
    void disable_alreadyDisabled() {
        final Player player = Player.from("Marco");
        player.setEnabled(false);

        transactionalPersist(player);

        given()
                .contentType("application/json")
                .body(new PlayerStatusRequest(false))
                .when().patch(String.format("/players/%s", player.getId()))
                .then()
                .statusCode(200);

        final Player finalPlayer = playerRepository.findById(player.getId());
        Assertions.assertEquals(player.getId(), finalPlayer.getId());
        Assertions.assertEquals("Marco", finalPlayer.getName());
        Assertions.assertFalse(finalPlayer.isEnabled());

    }

    @Test
    void disable_inEnabledTeam() {
        final Player player = Player.from("Marco");
        final Player other = Player.from("Mia");
        final Team team = persistTeam(player, other);

        given().contentType("application/json")
                .body(new PlayerStatusRequest(false))
                .when().patch("/players/" + player.getId())
                .then().statusCode(409);

        final Player unchanged = playerRepository.findById(player.getId());
        Assertions.assertTrue(unchanged.isEnabled());
        Assertions.assertTrue(teamRepository.findById(team.getId()).isEnabled());
    }

    @Test
    void disable_inDisabledTeam() {
        final Player player = Player.from("Marco");
        final Player other = Player.from("Mia");
        final Team team = persistTeam(player, other);
        disableTeam(team);

        given().contentType("application/json")
                .body(new PlayerStatusRequest(false))
                .when().patch("/players/" + player.getId())
                .then().statusCode(200);

        Assertions.assertFalse(playerRepository.findById(player.getId()).isEnabled());
    }

    @Test
    void disable_notFound() {
        given()
                .contentType("application/json")
                .body(new PlayerStatusRequest(false))
                .when().patch("/players/00000000-0000-0000-0000-000000000000")
                .then()
                .statusCode(404);
    }

    @Test
    void enable_alreadyEnabled() {
        final Player player = Player.from("Marco");
        player.setEnabled(true);

        transactionalPersist(player);

        given()
                .contentType("application/json")
                .body(new PlayerStatusRequest(true))
                .when().patch(String.format("/players/%s", player.getId()))
                .then()
                .statusCode(200);

        final Player finalPlayer = playerRepository.findById(player.getId());
        Assertions.assertTrue(finalPlayer.isEnabled());
    }

    @Test
    void enable_notFound() {
        given()
                .contentType("application/json")
                .body(new PlayerStatusRequest(true))
                .when().patch("/players/00000000-0000-0000-0000-000000000000")
                .then()
                .statusCode(404);
    }

    @Test
    void updateStatus_nullEnabled() {
        final Player player = Player.from("Marco");
        transactionalPersist(player);

        given().contentType("application/json")
                .body("{\"enabled\":null}")
                .when().patch("/players/" + player.getId())
                .then().statusCode(400);

        final Player unchanged = playerRepository.findById(player.getId());
        Assertions.assertTrue(unchanged.isEnabled());
        Assertions.assertEquals("Marco", unchanged.getName());
    }

    @Test
    void updateStatus_invalidId() {
        given().contentType("application/json")
                .body(new PlayerStatusRequest(true))
                .when().patch("/players/invalidUUID")
                .then().statusCode(400);
    }

    @Transactional
    void transactionalPersist(final Player player){
        playerRepository.persist(player);
    }

    @Transactional
    Team persistTeam(final Player player, final Player other) {
        final Team team = Team.builder()
                .id(UUID.randomUUID())
                .name("TeamMarco")
                .player1(player)
                .player2(other)
                .build();
        playerRepository.persist(player);
        playerRepository.persist(other);
        teamRepository.persist(team);
        return team;
    }

    @Transactional
    void disableTeam(final Team team) {
        team.setEnabled(false);
        teamRepository.getEntityManager().merge(team);
    }
}
