package ch.jaros.rest;

import ch.jaros.entity.Game;
import ch.jaros.repository.GameRepository;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@Path("play/{gameId}")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class PlayResource {

    private final GameRepository gameRepository;

    @Path("score")
    @POST
    @Transactional
    public Response submitScore(@PathParam("gameId") final UUID gameId, final SubmitScoreRequest request) {
        final Game game = gameRepository.findOngoingGameById(gameId);

        if (game == null) return Response.status(Response.Status.NOT_FOUND).build();

        game.getScores().addRound(request);

        gameRepository.persist(game);

        return Response.ok().build();
    }
}
