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
class TeamStatusResourceTest extends BaseTest {

    @Inject TeamRepository teamRepository;
    @Inject PlayerRepository playerRepository;

    @BeforeEach
    @Transactional
    void setup() {
        cleanUp();
    }

    @Test
    void disable() {
        final Team team = persistTeam(true, true);

        given().contentType("application/json")
                .body(new TeamStatusRequest(false))
                .when().patch("/teams/" + team.getId())
                .then().statusCode(200);

        Assertions.assertFalse(teamRepository.findById(team.getId()).isEnabled());
    }

    @Test
    void enable() {
        final Team team = persistTeam(true, true);
        disableTeam(team);

        given().contentType("application/json")
                .body(new TeamStatusRequest(true))
                .when().patch("/teams/" + team.getId())
                .then().statusCode(200);

        Assertions.assertTrue(teamRepository.findById(team.getId()).isEnabled());
    }

    @Test
    void enable_withDisabledPlayer() {
        final Team team = persistTeam(false, true);
        disableTeam(team);

        given().contentType("application/json")
                .body(new TeamStatusRequest(true))
                .when().patch("/teams/" + team.getId())
                .then().statusCode(409);

        final Team unchanged = teamRepository.findById(team.getId());
        Assertions.assertFalse(unchanged.isEnabled());
        Assertions.assertFalse(unchanged.getPlayer1().isEnabled());
    }

    @Test
    void enable_notFound() {
        given().contentType("application/json")
                .body(new TeamStatusRequest(true))
                .when().patch("/teams/00000000-0000-0000-0000-000000000000")
                .then().statusCode(404);
    }

    @Transactional
    Team persistTeam(final boolean firstEnabled, final boolean secondEnabled) {
        final Player first = Player.from("Marco");
        first.setEnabled(firstEnabled);
        final Player second = Player.from("Mia");
        second.setEnabled(secondEnabled);
        final Team team = Team.builder()
                .id(Team.createId("TeamMarco"))
                .name("TeamMarco")
                .player1(first)
                .player2(second)
                .build();
        playerRepository.persist(first);
        playerRepository.persist(second);
        teamRepository.persist(team);
        return team;
    }

    @Transactional
    void disableTeam(final Team team) {
        team.setEnabled(false);
        teamRepository.getEntityManager().merge(team);
    }
}
