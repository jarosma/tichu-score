package ch.jaros.rest.response;

import ch.jaros.entity.Team;

import java.util.UUID;

public record TeamResponse(UUID id, String name, PlayerResponse player1, PlayerResponse player2,
                           Integer teamElo, boolean enabled) {

    public static TeamResponse from(final Team team) {
        return new TeamResponse(
                team.getId(),
                team.getName(),
                PlayerResponse.from(team.getPlayer1()),
                PlayerResponse.from(team.getPlayer2()),
                team.getTeamElo(),
                team.isEnabled());
    }
}
