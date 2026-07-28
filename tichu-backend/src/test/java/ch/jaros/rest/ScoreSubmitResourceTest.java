package ch.jaros.rest;

import ch.jaros.rest.request.SubmitScoreRequest;
import ch.jaros.rest.request.TichuCallRequest;

import ch.jaros.BaseTest;
import ch.jaros.entity.*;
import ch.jaros.repository.GameRepository;
import ch.jaros.repository.GameRoundRepository;
import ch.jaros.repository.TichuCallRepository;
import ch.jaros.rest.response.GameScoresResponse;
import ch.jaros.repository.PlayerRepository;
import ch.jaros.repository.TeamRepository;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.List;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.is;

@QuarkusTest
class ScoreSubmitResourceTest extends BaseTest {

    @Inject
    TeamRepository teamRepository;
    @Inject
    PlayerRepository playerRepository;
    @Inject
    GameRepository gameRepository;
    @Inject
    GameRoundRepository gameRoundRepository;
    @Inject
    TichuCallRepository tichuCallRepository;

    private final Player player1 = Player.from("Marco");
    private final Player player2 = Player.from("Mia");

    private final Team team1 = Team.builder()
            .id(UUID.randomUUID())
            .name("TeamMarco")
            .player1(player1)
            .player2(player2)
            .build();

    private final Player player3 = Player.from("Jana");
    private final Player player4 = Player.from("Martin");

    private final Team team2 = Team.builder()
            .id(UUID.randomUUID())
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

        final var rounds = GameScoresResponse.from(gameAfter.getRounds()).rounds();

        Assertions.assertEquals(1, rounds.size());
        Assertions.assertNotNull(rounds.getFirst().submittedAt());
        Assertions.assertEquals(0, rounds.getFirst().number());
        Assertions.assertEquals(10, rounds.getFirst().team1());
        Assertions.assertEquals(90, rounds.getFirst().team2());
    }

    @Test
    void submitScore_sameRoundKey_reusesRoundAndTichuCalls() {
        final UUID roundKey = UUID.randomUUID();
        final SubmitScoreRequest request = new SubmitScoreRequest(roundKey, 100, 0, List.of(
                new TichuCallRequest(player1.getId(), true)));

        given()
                .contentType("application/json")
                .body(request)
                .when().post(String.format("/games/%s/round-results", game.getId()))
                .then().statusCode(200)
                .body("number", is(0));

        given()
                .contentType("application/json")
                .body(request)
                .when().post(String.format("/games/%s/round-results", game.getId()))
                .then().statusCode(200)
                .body("number", is(0));

        Assertions.assertEquals(1, gameRoundRepository.count("game.id", game.getId()));
        Assertions.assertEquals(1, tichuCallRepository.count("game.id", game.getId()));
    }

    @Test
    void submitScore_thresholdCrossing_setsPendingAndRejectsNewRound() {
        final SubmitScoreRequest firstRequest = new SubmitScoreRequest(
                UUID.randomUUID(), 1000, 0, List.of());

        given()
                .contentType("application/json")
                .body(firstRequest)
                .when().post(String.format("/games/%s/round-results", game.getId()))
                .then().statusCode(200);

        Assertions.assertTrue(gameRepository.findById(game.getId()).isPendingFinish());
        given().when().get(String.format("/games/%s", game.getId()))
                .then().statusCode(200)
                .body("pendingFinish", is(true));

        given()
                .contentType("application/json")
                .body(new SubmitScoreRequest(UUID.randomUUID(), 0, 100, List.of()))
                .when().post(String.format("/games/%s/round-results", game.getId()))
                .then().statusCode(409);

        Assertions.assertEquals(1, gameRoundRepository.count("game.id", game.getId()));
    }

    @Test
    void submitScore_retryAfterPendingStillReusesCommittedRound() {
        final SubmitScoreRequest request = new SubmitScoreRequest(
                UUID.randomUUID(), 1000, 0, List.of());

        given().contentType("application/json")
                .body(request)
                .when().post(String.format("/games/%s/round-results", game.getId()))
                .then().statusCode(200);

        given().contentType("application/json")
                .body(request)
                .when().post(String.format("/games/%s/round-results", game.getId()))
                .then().statusCode(200)
                .body("number", is(0));

        Assertions.assertEquals(1, gameRoundRepository.count("game.id", game.getId()));
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
        final var rounds = GameScoresResponse.from(gameAfter.getRounds()).rounds();
        final var firstRound = rounds.getFirst();
        final var secondRound = rounds.get(1);
        final var thirdRound = rounds.getLast();

        Assertions.assertEquals(3, rounds.size());
        Assertions.assertNotNull(firstRound.submittedAt());
        Assertions.assertEquals(0, firstRound.number());
        Assertions.assertEquals(10, firstRound.team1());
        Assertions.assertEquals(90, firstRound.team2());
        Assertions.assertNotNull(secondRound.submittedAt());
        Assertions.assertEquals(1, secondRound.number());
        Assertions.assertEquals(50, secondRound.team1());
        Assertions.assertEquals(50, secondRound.team2());
        Assertions.assertNotNull(thirdRound.submittedAt());
        Assertions.assertEquals(2, thirdRound.number());
        Assertions.assertEquals(-5, thirdRound.team1());
        Assertions.assertEquals(105, thirdRound.team2());
        Assertions.assertEquals(3, gameRoundRepository.count("game.id", game.getId()));
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
        Assertions.assertEquals(0, unchanged.getRounds().size());
    }

    @Test
    void submitScore_notExisting() {

        final SubmitScoreRequest request = new SubmitScoreRequest(10, 90);

        given()
                .contentType("application/json")
                .body(request)
                .when().post(String.format("/games/%s/round-results", "00000000-0000-0000-0000-000000000000"))
                .then()
                .statusCode(404)
                .body(is("Ongoing game does not exist"));

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
    void submitScore_invalidTotal() {
        final SubmitScoreRequest request = new SubmitScoreRequest(10, 80);

        given().contentType("application/json")
                .body(request)
                .when().post(String.format("/games/%s/round-results", game.getId()))
                .then().statusCode(400);

        Assertions.assertEquals(0, gameRepository.findById(game.getId()).getRounds().size());
    }

    @Test
    void submitScore_scoreNotDivisibleByFive() {
        final SubmitScoreRequest request = new SubmitScoreRequest(11, 89);

        given().contentType("application/json")
                .body(request)
                .when().post(String.format("/games/%s/round-results", game.getId()))
                .then().statusCode(400);

        Assertions.assertEquals(0, gameRepository.findById(game.getId()).getRounds().size());
    }

    @Test
    void submitScore_multipleSuccessfulTichus() {
        final SubmitScoreRequest request = new SubmitScoreRequest(100, 0, List.of(
                new TichuCallRequest(player1.getId(), true),
                new TichuCallRequest(player2.getId(), true)));

        given().contentType("application/json")
                .body(request)
                .when().post(String.format("/games/%s/round-results", game.getId()))
                .then().statusCode(400);

        Assertions.assertEquals(0, gameRepository.findById(game.getId()).getRounds().size());
    }

    @Test
    void submitScore_duplicatePlayerTichu() {
        final SubmitScoreRequest request = new SubmitScoreRequest(100, 0, List.of(
                new TichuCallRequest(player1.getId(), true),
                new TichuCallRequest(player1.getId(), false)));

        given().contentType("application/json")
                .body(request)
                .when().post(String.format("/games/%s/round-results", game.getId()))
                .then().statusCode(400);

        Assertions.assertEquals(0, gameRepository.findById(game.getId()).getRounds().size());
    }

    @Test
    void submitScore_unknownTichuPlayer() {
        final SubmitScoreRequest request = new SubmitScoreRequest(100, 0, List.of(
                new TichuCallRequest(UUID.randomUUID(), true)));

        given().contentType("application/json")
                .body(request)
                .when().post(String.format("/games/%s/round-results", game.getId()))
                .then().statusCode(400);

        Assertions.assertEquals(0, gameRepository.findById(game.getId()).getRounds().size());
    }

    @Test
    void submitScore_nullTichuCallField() {
        final SubmitScoreRequest request = new SubmitScoreRequest(100, 0, List.of(
                new TichuCallRequest(null, true)));

        given().contentType("application/json")
                .body(request)
                .when().post(String.format("/games/%s/round-results", game.getId()))
                .then().statusCode(400);

        Assertions.assertEquals(0, gameRepository.findById(game.getId()).getRounds().size());
    }

    @Test
    void submitScore_missingRequest() {
        given()
                .contentType("application/json")
                .when().post(String.format("/games/%s/round-results", game.getId()))
                .then()
                .statusCode(400);
        Assertions.assertEquals(0, gameRepository.findById(game.getId()).getRounds().size());
    }

    @Test
    void submitScore_missingRoundKey() {
        given()
                .contentType("application/json")
                .body("{\"team1Score\":100,\"team2Score\":0}")
                .when().post(String.format("/games/%s/round-results", game.getId()))
                .then().statusCode(400);

        Assertions.assertEquals(0, gameRoundRepository.count("game.id", game.getId()));
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
