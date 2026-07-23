package ch.jaros.rest;

import ch.jaros.BaseTest;
import ch.jaros.entity.Player;
import ch.jaros.entity.Team;
import ch.jaros.entity.TeamStats;
import ch.jaros.repository.PlayerRepository;
import ch.jaros.repository.TeamRepository;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;

@QuarkusTest
class TeamStatsReadResourceTest extends BaseTest {

    @Inject
    TeamRepository teamRepository;
    @Inject
    PlayerRepository playerRepository;

    private Team team;

    @BeforeEach
    @Transactional
    void setup() {
        cleanUp();
        team = persist(team("TeamMarco", "Marco", "Mia"));
    }

    @Test
    void getStats() {
        given().when().get("/teams/" + team.getId() + "/stats")
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
        given().when().get("/teams/00000000-0000-0000-0000-000000000000/stats")
                .then().statusCode(404);
    }

    @Test
    void getStats_invalid() {
        given().when().get("/teams/invalidUUID/stats")
                .then().statusCode(400);
    }

    @Transactional
    Team persist(final Team value) {
        value.setTeamStats(TeamStats.create(value));
        playerRepository.persist(value.getPlayer1());
        playerRepository.persist(value.getPlayer2());
        teamRepository.persist(value);
        return value;
    }

    Team team(final String teamName, final String firstPlayerName, final String secondPlayerName) {
        return Team.builder()
                .id(UUID.randomUUID())
                .name(teamName)
                .player1(Player.from(firstPlayerName))
                .player2(Player.from(secondPlayerName))
                .build();
    }
}
