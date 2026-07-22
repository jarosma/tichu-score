package ch.jaros.rest;

import ch.jaros.BaseTest;
import ch.jaros.entity.Player;
import ch.jaros.entity.Team;
import ch.jaros.repository.PlayerRepository;
import ch.jaros.repository.TeamRepository;
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
class TeamReadResourceTest extends BaseTest {

    @Inject TeamRepository teamRepository;
    @Inject PlayerRepository playerRepository;

    @BeforeEach
    @Transactional
    void setup() { cleanUp(); }

    @ParameterizedTest
    @MethodSource("teams")
    void getAll(final List<Team> teams) {
        teams.forEach(this::persist);

        given().when().get("/teams")
                .then().statusCode(200)
                .body("size()", is(teams.size()))
                .body("id", containsInAnyOrder(
                        teams.stream().map(team -> team.getId().toString()).toArray()))
                .body("name", containsInAnyOrder(teams.stream().map(Team::getName).toArray()))
                .body("enabled", containsInAnyOrder(
                        teams.stream().map(Team::isEnabled).toArray()));
    }

    @Test
    void getById() {
        final Team team = persist(team("TeamMarco", "Marco", "Mia"));

        given().when().get("/teams/" + team.getId())
                .then().statusCode(200)
                .body("id", is(team.getId().toString()))
                .body("name", is("TeamMarco"))
                .body("player1.name", is("Marco"))
                .body("player2.name", is("Mia"))
                .body("enabled", is(true));
    }

    @Test
    void disabledTeams() {
        final Player disabled = Player.from("Marco");
        disabled.setEnabled(false);
        final Player active = Player.from("Mia");
        final Team team = Team.builder().id(Team.createId("TeamMarco"))
                .name("TeamMarco").player1(disabled).player2(active).build();
        persist(team);

        given().when().get("/teams/" + team.getId())
                .then().statusCode(200).body("enabled", is(false));
    }

    @Test
    void getById_notFound() {
        given().when().get("/teams/00000000-0000-0000-0000-000000000000")
                .then().statusCode(404);
    }

    @Test
    void getById_invalid() {
        given().when().get("/teams/invalidUUID")
                .then().statusCode(400);
    }

    @Transactional
    Team persist(final Team team) {
        playerRepository.persist(team.getPlayer1());
        playerRepository.persist(team.getPlayer2());
        teamRepository.persist(team);
        return team;
    }

    static Team team(final String name, final String player1, final String player2) {
        return Team.builder().id(Team.createId(name)).name(name)
                .player1(Player.from(player1)).player2(Player.from(player2)).build();
    }

    static Stream<List<Team>> teams() {
        return Stream.of(List.of(team("TeamMarco", "Marco", "Mia"), team("TeamJana", "Jana", "Martin")),
                List.of(team("TeamMarco", "Marco", "Mia")), List.of());
    }
}
