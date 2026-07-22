package ch.jaros.rest;

import jakarta.validation.constraints.NotNull;

public record TeamStatusRequest(@NotNull Boolean enabled) {
}
