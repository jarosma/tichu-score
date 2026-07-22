package ch.jaros.rest;

import ch.jaros.entity.Player;
import ch.jaros.entity.Team;
import ch.jaros.exception.PlayerDoesNotExistException;
import ch.jaros.exception.PlayersNotDistinctException;
import ch.jaros.repository.PlayerRepository;
import ch.jaros.repository.GameRepository;
import ch.jaros.repository.TeamRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

@Path("teams")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class TeamResource {

    private final PlayerRepository playerRepository;
    private final GameRepository gameRepository;
    private final TeamRepository teamRepository;

    @PATCH
    @Path("/{teamId}")
    @Transactional
    public Response updateStatus(@PathParam("teamId") final String teamIdValue,
                                 @NotNull @Valid final TeamStatusRequest request) {
        final UUID teamId = PathUuid.parse(teamIdValue);
        final Team team = teamRepository.findById(teamId);
        if (team == null) return Response.status(Response.Status.NOT_FOUND).build();

        if (request.enabled() && (team.getPlayer1() == null || team.getPlayer2() == null
                || !team.getPlayer1().isEnabled() || !team.getPlayer2().isEnabled())) {
            return Response.status(Response.Status.CONFLICT).build();
        }

        team.setEnabled(request.enabled());
        return Response.ok().build();
    }

    @GET
    public List<Team> getAll() {
        return teamRepository.listAll();
    }

    @GET
    @Path("/{teamId}")
    public Response getById(@PathParam("teamId") String teamIdValue) {
        final UUID teamId = PathUuid.parse(teamIdValue);
        final Team team = teamRepository.findById(teamId);
        if (team == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(team).build();
    }

    @POST
    @Transactional
    public Response create(@NotNull @Valid final TeamCreateRequest request) {
        final Team team;
        try {
            team = createNewTeam(request);
        } catch (PlayerDoesNotExistException e) {
            return Response.status(Response.Status.NOT_FOUND).entity(e.getMessage()).build();
        } catch (final PlayersNotDistinctException e) {
            return Response.status(Response.Status.BAD_REQUEST).entity(e.getMessage()).build();
        }

        if (teamRepository.findById(team.getId()) != null) return Response.status(Response.Status.CONFLICT).build();
        teamRepository.persist(team);
        return Response.status(Response.Status.CREATED).entity(team).build();
    }

    @DELETE
    @Path("/{teamId}")
    @Transactional
    public Response delete(@PathParam("teamId") String teamIdValue) {
        final UUID teamId = PathUuid.parse(teamIdValue);
        if (teamRepository.findById(teamId) == null) return Response.status(Response.Status.NOT_FOUND).build();
        if (gameRepository.hasGameForTeam(teamId)) return Response.status(Response.Status.CONFLICT).build();
        boolean deleted = teamRepository.deleteById(teamId);
        if (!deleted) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.noContent().build();
    }

    Team createNewTeam(final TeamCreateRequest request) throws PlayerDoesNotExistException, PlayersNotDistinctException {

        final Player player1 = playerRepository.findById(request.player1Id());
        if (player1 == null) throw new PlayerDoesNotExistException("Player 1 does not exist");

        final Player player2 = playerRepository.findById(request.player2Id());
        if (player2 == null) throw new PlayerDoesNotExistException("Player 2 does not exist");

        if (player1 == player2) throw new PlayersNotDistinctException();

        return Team.builder()
                .id(Team.createId(request.name()))
                .name(request.name())
                .player1(player1)
                .player2(player2)
                .build();
    }

}
