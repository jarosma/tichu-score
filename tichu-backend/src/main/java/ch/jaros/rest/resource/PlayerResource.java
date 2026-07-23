package ch.jaros.rest.resource;

import ch.jaros.rest.PathUuid;
import ch.jaros.rest.response.PlayerResponse;
import ch.jaros.rest.request.PlayerCreateRequest;
import ch.jaros.rest.request.PlayerStatusRequest;
import ch.jaros.service.PlayerService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;

import java.util.UUID;
import java.util.List;

@Path("players")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class PlayerResource {

    private final PlayerService playerService;

    @GET
    public List<PlayerResponse> getAll() {
        return playerService.getAll().stream().map(PlayerResponse::from).toList();
    }

    @GET
    @Path("/{playerId}")
    public Response getById(@PathParam("playerId") String playerIdValue) {
        final UUID playerId = PathUuid.parse(playerIdValue);
        return Response.ok(PlayerResponse.from(playerService.getById(playerId))).build();
    }

    @POST
    public Response create(@NotNull @Valid final PlayerCreateRequest request) {
        return Response.status(Response.Status.CREATED)
                .entity(PlayerResponse.from(playerService.create(request.name()))).build();
    }

    @PATCH
    @Path("/{playerId}")
    public Response updateStatus(@PathParam("playerId") String playerIdValue,
                                 @NotNull @Valid final PlayerStatusRequest request) {
       final UUID playerId = PathUuid.parse(playerIdValue);
       playerService.updateStatus(playerId, request.enabled());
       return Response.ok().build();
    }

    @DELETE
    @Path("/{playerId}")
    public Response delete(@PathParam("playerId") String playerIdValue) {
        final UUID playerId = PathUuid.parse(playerIdValue);
        playerService.delete(playerId);
        return Response.noContent().build();
    }

}
