package ch.jaros.rest.request;

import ch.jaros.entity.GameWinner;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record EndGameRequest(@NotNull GameWinner winner) {
}
