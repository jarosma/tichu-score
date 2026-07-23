package ch.jaros.rest;

import ch.jaros.entity.Player;
import ch.jaros.repository.TeamRepository;
import ch.jaros.repository.PlayerRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

@Path("players")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class PlayerResource {

    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;

    @GET
    public List<Player> getAll() {
        return playerRepository.listAll();
    }

    @GET
    @Path("/{playerId}")
    public Response getById(@PathParam("playerId") String playerIdValue) {
        final UUID playerId = PathUuid.parse(playerIdValue);
        final Player player = playerRepository.findById(playerId);
        if (player == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(player).build();
    }

    @POST
    @Transactional
    public Response create(@NotNull @Valid final PlayerPostRequest request) {
        final Player player = Player.from(request);
        if (playerRepository.find("name", request.name()).firstResult() != null) {
            return Response.status(Response.Status.CONFLICT).build();
        }
        playerRepository.persist(player);
        return Response.status(Response.Status.CREATED).entity(player).build();
    }

    @PATCH
    @Path("/{playerId}")
    @Transactional
    public Response updateStatus(@PathParam("playerId") String playerIdValue,
                                 @NotNull @Valid final PlayerStatusRequest request) {
       final UUID playerId = PathUuid.parse(playerIdValue);
       final Player player = playerRepository.findById(playerId);
       if (player == null) return Response.status(Response.Status.NOT_FOUND).build();
       if (!request.enabled() && teamRepository.hasEnabledTeamForPlayer(playerId)) {
           return Response.status(Response.Status.CONFLICT).build();
       }
       player.setEnabled(request.enabled());
       playerRepository.update(player);
       return Response.ok().build();
    }

    @DELETE
    @Path("/{playerId}")
    @Transactional
    public Response delete(@PathParam("playerId") String playerIdValue) {
        final UUID playerId = PathUuid.parse(playerIdValue);
        if (playerRepository.findById(playerId) == null) return Response.status(Response.Status.NOT_FOUND).build();
        if (teamRepository.hasTeamForPlayer(playerId)) return Response.status(Response.Status.CONFLICT).build();
        boolean deleted = playerRepository.deleteById(playerId);
        if (!deleted) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.noContent().build();
    }

}
