package ch.jaros.rest.request;

import jakarta.validation.constraints.NotNull;

public record PlayerStatusRequest(@NotNull Boolean enabled) {
}
