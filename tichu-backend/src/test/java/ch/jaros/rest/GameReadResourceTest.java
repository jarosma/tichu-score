package ch.jaros.rest;

import ch.jaros.BaseTest;
import ch.jaros.entity.Game;
import ch.jaros.entity.GameWinner;
import ch.jaros.entity.Player;
import ch.jaros.entity.Team;
import ch.jaros.repository.GameRepository;
import ch.jaros.repository.PlayerRepository;
import ch.jaros.repository.TeamRepository;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.hamcrest.Matchers.notNullValue;

@QuarkusTest
class GameReadResourceTest extends BaseTest {

    @Inject GameRepository gameRepository;
    @Inject PlayerRepository playerRepository;
    @Inject TeamRepository teamRepository;

    private Team team1;
    private Team team2;

    @BeforeEach
    @Transactional
    void setup() {
        cleanUp();
        team1 = persistTeam("TeamMarco", "Marco", "Mia");
        team2 = persistTeam("TeamJana", "Jana", "Martin");
    }

    @Test
    void spectateGame() {
        final Game game = persistGame(false);
        game.getScores().addRound(10, 90);
        game.getScores().addRound(50, 50);
        game.getScores().addRound(-5, 105);
        update(game);

        given().when().get("/games/" + game.getId())
                .then().statusCode(200)
                .body("id", is(game.getId().toString()))
                .body("team1.id", is(team1.getId().toString()))
                .body("team1.name", is("TeamMarco"))
                .body("team2.id", is(team2.getId().toString()))
                .body("team2.name", is("TeamJana"))
                .body("scores.rounds[0].number", is(0))
                .body("scores.rounds[0].team1", is(10))
                .body("scores.rounds[0].team2", is(90))
                .body("scores.rounds[1].number", is(1))
                .body("scores.rounds[1].team1", is(50))
                .body("scores.rounds[1].team2", is(50))
                .body("scores.rounds[2].number", is(2))
                .body("scores.rounds[2].team1", is(-5))
                .body("scores.rounds[2].team2", is(105))
                .body("winner", nullValue())
                .body("endedAt", nullValue())
                .body("startedAt", notNullValue());
    }

    @Test
    void spectateGame_alreadyEnded() {
        final Game game = persistGame(true);

        given().when().get("/games/" + game.getId())
                .then().statusCode(200)
                .body("winner", is("team2"))
                .body("startedAt", notNullValue())
                .body("endedAt", notNullValue());
    }

    @Test
    void spectateGame_notFound() {
        given().when().get("/games/00000000-0000-0000-0000-000000000000")
                .then().statusCode(404);
    }

    @Test
    void spectateGame_invalidId() {
        given().when().get("/games/invalidUUID")
                .then().statusCode(400);
    }

    @Transactional
    Team persistTeam(final String name, final String firstName, final String secondName) {
        final Player first = Player.from(firstName);
        final Player second = Player.from(secondName);
        final Team team = Team.builder().id(Team.createId(name)).name(name)
                .player1(first).player2(second).build();
        playerRepository.persist(first);
        playerRepository.persist(second);
        teamRepository.persist(team);
        return team;
    }

    @Transactional
    Game persistGame(final boolean ended) {
        final Game game = Game.builder().id(UUID.randomUUID())
                .team1(team1).team2(team2).startedAt(OffsetDateTime.now()).build();
        if (ended) {
            game.setEndedAt(OffsetDateTime.now());
            game.setWinner(GameWinner.team2);
        }
        gameRepository.persist(game);
        return game;
    }

    @Transactional
    void update(final Game game) {
        gameRepository.getEntityManager().merge(game);
    }
}
