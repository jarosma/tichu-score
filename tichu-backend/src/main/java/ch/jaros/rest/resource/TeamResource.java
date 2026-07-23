package ch.jaros.rest.resource;

import ch.jaros.rest.PathUuid;
import ch.jaros.rest.response.TeamResponse;
import ch.jaros.rest.request.TeamCreateRequest;
import ch.jaros.rest.request.TeamStatusRequest;
import ch.jaros.service.TeamService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;

import java.util.UUID;
import java.util.List;

@Path("teams")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class TeamResource {

    private final TeamService teamService;

    @PATCH
    @Path("/{teamId}")
    public Response updateStatus(@PathParam("teamId") final String teamIdValue,
                                 @NotNull @Valid final TeamStatusRequest request) {
        final UUID teamId = PathUuid.parse(teamIdValue);
        teamService.updateStatus(teamId, request.enabled());
        return Response.ok().build();
    }

    @GET
    public List<TeamResponse> getAll() {
        return teamService.getAll().stream().map(TeamResponse::from).toList();
    }

    @GET
    @Path("/{teamId}")
    public Response getById(@PathParam("teamId") String teamIdValue) {
        final UUID teamId = PathUuid.parse(teamIdValue);
        return Response.ok(TeamResponse.from(teamService.getById(teamId))).build();
    }

    @POST
    public Response create(@NotNull @Valid final TeamCreateRequest request) {
        return Response.status(Response.Status.CREATED)
                .entity(TeamResponse.from(teamService.create(
                        request.name(), request.player1Id(), request.player2Id()))).build();
    }

    @DELETE
    @Path("/{teamId}")
    public Response delete(@PathParam("teamId") String teamIdValue) {
        final UUID teamId = PathUuid.parse(teamIdValue);
        teamService.delete(teamId);
        return Response.noContent().build();
    }

}
