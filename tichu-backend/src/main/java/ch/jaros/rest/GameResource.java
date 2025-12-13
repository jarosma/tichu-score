package ch.jaros.rest;


import ch.jaros.entity.Game;
import ch.jaros.entity.Score;
import ch.jaros.entity.Team;
import ch.jaros.exception.TeamDoesNotExistException;
import ch.jaros.exception.TeamsNotDistinctException;
import ch.jaros.repository.GameRepository;
import ch.jaros.repository.TeamRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;

import java.time.OffsetDateTime;


@Path("game")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class GameResource {

    private final TeamRepository teamRepository;
    private final GameRepository gameRepository;

    @POST
    @Path("start")
    @Transactional
    public Response startGame(@Valid @NotNull final StartGameRequest request) {
        final Game game;

        try {
            game = createNewGame(request);
        } catch (final TeamDoesNotExistException e) {
            return Response.status(Response.Status.NOT_FOUND).entity(e.getMessage()).build();
        } catch (final TeamsNotDistinctException e) {
            return Response.status(Response.Status.BAD_REQUEST).entity(e.getMessage()).build();
        }

        if (gameRepository.findById(game.getId()) != null) return Response.status(Response.Status.CONFLICT).build();
        gameRepository.persist(game);
        return Response.status(Response.Status.CREATED).entity(game).build();
    }

    private Game createNewGame(final StartGameRequest request) throws TeamDoesNotExistException, TeamsNotDistinctException {
        final OffsetDateTime now = OffsetDateTime.now();

        final Team team1 = teamRepository.findById(request.team1());
        if (team1 == null) throw new TeamDoesNotExistException("Team 1 does not exist");

        final Team team2 = teamRepository.findById(request.team2());
        if (team2 == null) throw new TeamDoesNotExistException("Team 2 does not exist");

        if (team2 == team1) throw new TeamsNotDistinctException();

        return Game.builder()
                .id(Game.createId(request.team1(), request.team2(), now))
                .startedAt(now)
                .team1(team1)
                .team2(team2)
                .scores(new Score())
                .build();
    }
}
