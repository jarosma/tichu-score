package ch.jaros.rest.response;

import ch.jaros.entity.Player;

import java.util.UUID;

public record PlayerResponse(UUID id, String name, Integer elo, boolean enabled) {

    public static PlayerResponse from(final Player player) {
        return new PlayerResponse(player.getId(), player.getName(), player.getElo(), player.isEnabled());
    }
}
