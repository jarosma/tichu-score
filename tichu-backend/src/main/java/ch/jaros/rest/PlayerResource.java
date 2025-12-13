package ch.jaros.rest;

import ch.jaros.entity.Player;
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

    @GET
    public List<Player> getAll() {
        return playerRepository.listAll();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") UUID id) {
        final Player player = playerRepository.findById(id);
        if (player == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(player).build();
    }

    @POST
    @Transactional
    public Response create(@NotNull @Valid final PlayerPostRequest request) {
        final Player player = Player.from(request);
        if (playerRepository.findById(player.getId()) != null) return Response.status(Response.Status.CONFLICT).build();
        playerRepository.persist(player);
        return Response.status(Response.Status.CREATED).entity(player).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") UUID id) {
        boolean deleted = playerRepository.deleteById(id);
        if (!deleted) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.noContent().build();
    }

}
