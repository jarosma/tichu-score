package ch.jaros.rest.request;

import jakarta.validation.constraints.NotNull;

public record TeamStatusRequest(@NotNull Boolean enabled) {
}
