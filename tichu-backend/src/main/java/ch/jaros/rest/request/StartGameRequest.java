package ch.jaros.rest.request;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.util.UUID;

@Builder
public record StartGameRequest(@NotNull UUID idempotencyKey, @NotNull UUID team1Id, @NotNull UUID team2Id) {
    public StartGameRequest(final UUID team1Id, final UUID team2Id) {
        this(UUID.randomUUID(), team1Id, team2Id);
    }
}
