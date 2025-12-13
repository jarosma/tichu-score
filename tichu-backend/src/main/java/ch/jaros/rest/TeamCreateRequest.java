package ch.jaros.rest;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record TeamCreateRequest(@NotNull String name, @NotNull UUID player1, @NotNull UUID player2) {
}
