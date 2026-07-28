package ch.jaros.rest.resource;

import ch.jaros.rest.PathUuid;
import ch.jaros.rest.request.SubmitScoreRequest;
import ch.jaros.rest.response.GameRoundResponse;
import ch.jaros.service.GameService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;

import java.util.UUID;
import java.util.List;

@Path("games/{gameId}/round-results")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class PlayResource {

    private final GameService gameService;

    @POST
    public Response submitScore(@PathParam("gameId") final String gameIdValue,
                                @NotNull @Valid final SubmitScoreRequest request) {
        final UUID gameId = PathUuid.parse(gameIdValue);
        final var round = gameService.submitScore(
                gameId,
                request.team1Score(),
                request.team2Score(),
                request.roundKey(),
                request.tichuCalls() == null ? List.of() : request.tichuCalls());
        return Response.ok(GameRoundResponse.from(round)).build();
    }
}
