package ch.jaros.rest;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record StartGameRequest(@NotNull UUID team1, @NotNull UUID team2) {
}
