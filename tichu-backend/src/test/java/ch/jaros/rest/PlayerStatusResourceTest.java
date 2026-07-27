package ch.jaros.rest;

import ch.jaros.rest.request.PlayerStatusRequest;

import ch.jaros.BaseTest;
import ch.jaros.entity.Player;
import ch.jaros.entity.Team;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.stream.Stream;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@QuarkusTest
class PlayerStatusResourceTest extends BaseTest {

    @BeforeEach
    @Transactional
    void setup() {
        cleanUp();
    }

    @ParameterizedTest(name = "{0} -> {1}")
    @MethodSource("statusChanges")
    void updateStatus_withoutTeam(final boolean initialStatus, final boolean requestedStatus) {
        final Player player = Player.from("Marco");
        player.setEnabled(initialStatus);

        transactionalPersist(player);

        given()
                .contentType("application/json")
                .body(new PlayerStatusRequest(requestedStatus))
                .when().patch(String.format("/players/%s", player.getId()))
                .then()
                .statusCode(200);

        final Player finalPlayer = playerRepository.findById(player.getId());
        assertEquals(player.getId(), finalPlayer.getId());
        assertEquals("Marco", finalPlayer.getName());
        assertEquals(requestedStatus, finalPlayer.isEnabled());
    }

    @Test
    void disable_inEnabledTeam() {
        final Player player = Player.from("Marco");
        final Player other = Player.from("Mia");
        final Team team = persistTeam(player, other);

        given().contentType("application/json")
                .body(new PlayerStatusRequest(false))
                .when().patch("/players/" + player.getId())
                .then()
                .statusCode(409)
                .body(is("Player belongs to an enabled team"));

        final Player unchanged = playerRepository.findById(player.getId());
        assertTrue(unchanged.isEnabled());
        assertTrue(teamRepository.findById(team.getId()).isEnabled());
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

        assertFalse(playerRepository.findById(player.getId()).isEnabled());
        assertFalse(teamRepository.findById(team.getId()).isEnabled());
    }


    @Test
    void enable_inEnabledTeam() {
        final Player player = Player.from("Marco");
        final Player other = Player.from("Mia");
        final Team team = persistTeam(player, other);

        given().contentType("application/json")
                .body(new PlayerStatusRequest(true))
                .when().patch("/players/" + player.getId())
                .then()
                .statusCode(200);

        final Player unchanged = playerRepository.findById(player.getId());
        assertTrue(unchanged.isEnabled());
        assertTrue(teamRepository.findById(team.getId()).isEnabled());
    }

    @Test
    void enable_inDisabledTeam() {
        final Player player = Player.from("Marco");
        final Player other = Player.from("Mia");
        final Team team = persistTeam(player, other);
        disableTeam(team);

        given().contentType("application/json")
                .body(new PlayerStatusRequest(true))
                .when().patch("/players/" + player.getId())
                .then()
                .statusCode(200);

        assertTrue(playerRepository.findById(player.getId()).isEnabled());
        assertFalse(teamRepository.findById(team.getId()).isEnabled());
    }

    @Test
    void updateStatus_notFound() {
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
        assertTrue(unchanged.isEnabled());
        assertEquals("Marco", unchanged.getName());
    }

    @Test
    void updateStatus_missingBody() {
        final Player player = Player.from("Marco");
        transactionalPersist(player);

        given()
                .contentType("application/json")
                .when().patch("/players/" + player.getId())
                .then()
                .statusCode(400);

        assertTrue(playerRepository.findById(player.getId()).isEnabled());
    }

    @Test
    void updateStatus_invalidId() {
        given().contentType("application/json")
                .body(new PlayerStatusRequest(true))
                .when().patch("/players/invalidUUID")
                .then().statusCode(400);
    }

    static Stream<Arguments> statusChanges() {
        return Stream.of(
                Arguments.of(true, false),
                Arguments.of(false, true),
                Arguments.of(true, true),
                Arguments.of(false, false)
        );
    }

    @Transactional
    void transactionalPersist(final Player player){
        playerRepository.persist(player);
    }

    @Transactional
    Team persistTeam(final Player player, final Player other) {
        final Team team = Team.create("TeamMarco", player, other);
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
