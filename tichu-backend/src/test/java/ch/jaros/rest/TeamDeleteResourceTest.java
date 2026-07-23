package ch.jaros.rest;

import ch.jaros.BaseTest;
import ch.jaros.entity.Player;
import ch.jaros.entity.Team;
import ch.jaros.entity.Game;
import ch.jaros.repository.GameRepository;
import ch.jaros.repository.PlayerRepository;
import ch.jaros.repository.TeamRepository;
import ch.jaros.repository.TeamStatsRepository;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.is;

@QuarkusTest
class TeamDeleteResourceTest extends BaseTest {

    @Inject TeamRepository teamRepository;
    @Inject PlayerRepository playerRepository;
    @Inject GameRepository gameRepository;
    @Inject TeamStatsRepository teamStatsRepository;

    @BeforeEach
    @Transactional
    void setup() { cleanUp(); }

    @Test
    void delete() {
        final Team team = persist(TeamReadResourceTest.team("TeamMarco", "Marco", "Mia"));

        given().contentType("application/json").when().delete("/teams/" + team.getId())
                .then().statusCode(204);
        given().when().get("/teams/" + team.getId()).then().statusCode(404);

        Assertions.assertNull(teamRepository.findById(team.getId()));
        Assertions.assertNull(teamStatsRepository.findById(team.getId()));
    }

    @Test
    void delete_notExisting() {
        given().when().delete("/teams/00000000-0000-0000-0000-000000000000")
                .then().statusCode(404);
    }

    @Test
    void delete_disabledTeam() {
        final Team team = TeamReadResourceTest.team("TeamMarco", "Marco", "Mia");
        team.setEnabled(false);
        persist(team);

        given().when().delete("/teams/" + team.getId())
                .then().statusCode(204);

        Assertions.assertNull(teamRepository.findById(team.getId()));
    }

    @Test
    void delete_teamWithGame() {
        final Team team = persist(TeamReadResourceTest.team("TeamMarco", "Marco", "Mia"));
        final Team other = persist(TeamReadResourceTest.team("TeamJana", "Jana", "Martin"));
        final Game game = Game.builder()
                .id(java.util.UUID.randomUUID())
                .team1(team)
                .team2(other)
                .startedAt(java.time.OffsetDateTime.now())
                .build();
        persistGame(game);

        given().when().delete("/teams/" + team.getId())
                .then().statusCode(409)
                .body(is("Team is referenced by a game"));

        Assertions.assertNotNull(teamRepository.findById(team.getId()));
        Assertions.assertEquals(1, gameRepository.count());
    }

    @Test
    void delete_invalidId() {
        given().when().delete("/teams/invalidUUID")
                .then().statusCode(400);
    }

    @Transactional
    Team persist(final Team team) {
        playerRepository.persist(team.getPlayer1());
        playerRepository.persist(team.getPlayer2());
        teamRepository.persist(team);
        return team;
    }

    @Transactional
    void persistGame(final Game game) {
        gameRepository.persist(game);
    }
}
