package ch.jaros.rest;

import jakarta.validation.constraints.NotNull;

public record PlayerStatusRequest(@NotNull Boolean enabled) {
}
