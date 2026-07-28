package ch.jaros.rest.resource;

import ch.jaros.rest.PathUuid;
import ch.jaros.rest.request.EndGameRequest;
import ch.jaros.rest.request.StartGameRequest;
import ch.jaros.rest.response.GameResponse;
import ch.jaros.service.GameService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@Path("games")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class GameResource {

    private final GameService gameService;

    @POST
    public Response startGame(@Valid @NotNull final StartGameRequest request) {
        return Response.status(Response.Status.CREATED)
                .entity(GameResponse.from(gameService.start(request.team1Id(), request.team2Id())))
                .build();
    }

    @GET
    @Path("/{gameId}")
    public Response getGame(@PathParam("gameId") final String gameIdValue) {
        final UUID gameId = PathUuid.parse(gameIdValue);
        return Response.ok(GameResponse.from(gameService.findById(gameId))).build();
    }

    @GET
    public Response getGames() {
        return Response.ok(gameService.findOngoing().stream().map(GameResponse::from).toList()).build();
    }

    @POST
    @Path("/{gameId}/end")
    public Response endGame(@PathParam("gameId") final String gameIdValue,
                            @Valid @NotNull final EndGameRequest request) {
        final UUID gameId = PathUuid.parse(gameIdValue);
        return Response.ok(GameResponse.from(gameService.end(gameId, request.winner()))).build();
    }
}
