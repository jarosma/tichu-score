package ch.jaros.rest;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.util.UUID;

@Builder
public record StartGameRequest(@NotNull UUID team1, @NotNull UUID team2) {
}
