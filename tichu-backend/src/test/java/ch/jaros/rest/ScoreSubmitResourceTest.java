package ch.jaros.rest;

import ch.jaros.BaseTest;
import ch.jaros.entity.*;
import ch.jaros.repository.GameRepository;
import ch.jaros.repository.PlayerRepository;
import ch.jaros.repository.TeamRepository;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class ScoreSubmitResourceTest extends BaseTest {

    @Inject
    TeamRepository teamRepository;
    @Inject
    PlayerRepository playerRepository;
    @Inject
    GameRepository gameRepository;

    private final Player player1 = Player.from("Marco");
    private final Player player2 = Player.from("Mia");

    private final Team team1 = Team.builder()
            .id(Team.createId("TeamMarco"))
            .name("TeamMarco")
            .player1(player1)
            .player2(player2)
            .build();

    private final Player player3 = Player.from("Jana");
    private final Player player4 = Player.from("Martin");

    private final Team team2 = Team.builder()
            .id(Team.createId("TeamJana"))
            .name("TeamJana")
            .player1(player3)
            .player2(player4)
            .build();

    private final Game game = Game.builder()
            .id(UUID.randomUUID())
            .team1(team1)
            .team2(team2)
            .startedAt(OffsetDateTime.now())
            .build();

    @BeforeEach
    @Transactional
    void setup() {
        cleanUp();
        transactionalPersist(game);
    }

    @Test
    void submitScore() {
        final SubmitScoreRequest request = new SubmitScoreRequest(10, 90);

        given()
                .contentType("application/json")
                .body(request)
                .when().post(String.format("/games/%s/round-results", game.getId()))
                .then()
                .statusCode(200);

        final Game gameAfter = gameRepository.findById(game.getId());

        final var rounds = gameAfter.getScores().getRounds();

        Assertions.assertEquals(1, rounds.size());
        Assertions.assertNotNull(rounds.getFirst().getSubmittedAt());
        Assertions.assertEquals(0, rounds.getFirst().getNumber());
        Assertions.assertEquals(10, rounds.getFirst().getTeam1());
        Assertions.assertEquals(90, rounds.getFirst().getTeam2());
    }

    @Test
    void submitScore_multiple() {
        final SubmitScoreRequest request = new SubmitScoreRequest(10, 90);
        final SubmitScoreRequest request1 = new SubmitScoreRequest(50, 50);
        final SubmitScoreRequest request2 = new SubmitScoreRequest(-5, 105);

        given()
                .contentType("application/json")
                .body(request)
                .when().post(String.format("/games/%s/round-results", game.getId()))
                .then()
                .statusCode(200);

        given()
                .contentType("application/json")
                .body(request1)
                .when().post(String.format("/games/%s/round-results", game.getId()))
                .then()
                .statusCode(200);

        given()
                .contentType("application/json")
                .body(request2)
                .when().post(String.format("/games/%s/round-results", game.getId()))
                .then()
                .statusCode(200);

        final Game gameAfter = gameRepository.findById(game.getId());
        final var rounds = gameAfter.getScores().getRounds();
        final var firstRound = rounds.getFirst();
        final var secondRound = rounds.get(1);
        final var thirdRound = rounds.getLast();

        Assertions.assertEquals(3, rounds.size());
        Assertions.assertNotNull(firstRound.getSubmittedAt());
        Assertions.assertEquals(0, firstRound.getNumber());
        Assertions.assertEquals(10, firstRound.getTeam1());
        Assertions.assertEquals(90, firstRound.getTeam2());
        Assertions.assertNotNull(secondRound.getSubmittedAt());
        Assertions.assertEquals(1, secondRound.getNumber());
        Assertions.assertEquals(50, secondRound.getTeam1());
        Assertions.assertEquals(50, secondRound.getTeam2());
        Assertions.assertNotNull(thirdRound.getSubmittedAt());
        Assertions.assertEquals(2, thirdRound.getNumber());
        Assertions.assertEquals(-5, thirdRound.getTeam1());
        Assertions.assertEquals(105, thirdRound.getTeam2());
    }

    @Test
    void submitScore_gameAlreadyEnded() {

        game.setEndedAt(OffsetDateTime.now());
        game.setWinner(GameWinner.team2);

        transactionalUpdate(game);

        final SubmitScoreRequest request = new SubmitScoreRequest(10, 90);

        given()
                .contentType("application/json")
                .body(request)
                .when().post(String.format("/games/%s/round-results", game.getId()))
                .then()
                .statusCode(404);

        final Game unchanged = gameRepository.findById(game.getId());
        Assertions.assertTrue(unchanged.getHasEnded());
        Assertions.assertEquals(0, unchanged.getScores().getRounds().size());
    }

    @Test
    void submitScore_notExisting() {

        final SubmitScoreRequest request = new SubmitScoreRequest(10, 90);

        given()
                .contentType("application/json")
                .body(request)
                .when().post(String.format("/games/%s/round-results", "00000000-0000-0000-0000-000000000000"))
                .then()
                .statusCode(404);

    }

    @Test
    void submitScore_invalidId() {
        final SubmitScoreRequest request = new SubmitScoreRequest(10, 90);

        given().contentType("application/json")
                .body(request)
                .when().post("/games/invalidUUID/round-results")
                .then().statusCode(400);
    }

    @Test
    void submitScore_missingRequest() {
        given()
                .contentType("application/json")
                .when().post(String.format("/games/%s/round-results", game.getId()))
                .then()
                .statusCode(400);
        Assertions.assertEquals(0, gameRepository.findById(game.getId()).getScores().getRounds().size());
    }

    @Transactional
    void transactionalPersist(final Game game) {
        playerRepository.persist(game.getTeam1().getPlayer1());
        playerRepository.persist(game.getTeam1().getPlayer2());
        playerRepository.persist(game.getTeam2().getPlayer1());
        playerRepository.persist(game.getTeam2().getPlayer2());
        teamRepository.persist(game.getTeam1());
        teamRepository.persist(game.getTeam2());
        gameRepository.persist(game);
    }

    @Transactional
    void transactionalUpdate(final Game game) {
        gameRepository.getEntityManager().merge(game);
    }
}
