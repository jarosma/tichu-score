package ch.jaros.rest.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record TichuCallRequest(@NotNull UUID playerId, @NotNull Boolean successful) {
}
