package ch.jaros.rest;

import ch.jaros.entity.Game;
import ch.jaros.repository.GameRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@Path("games/{gameId}/round-results")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class PlayResource {

    private final GameRepository gameRepository;

    @POST
    @Transactional
    public Response submitScore(@PathParam("gameId") final String gameIdValue,
                                @NotNull @Valid final SubmitScoreRequest request) {
        final UUID gameId = PathUuid.parse(gameIdValue);
        final Game game = gameRepository.findOngoingGameById(gameId);

        if (game == null) return Response.status(Response.Status.NOT_FOUND).build();

        game.addRound(request.team1Score(), request.team2Score());

        gameRepository.persist(game);

        return Response.ok().build();
    }
}
