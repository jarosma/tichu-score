package ch.jaros.rest.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PlayerCreateRequest(@NotBlank @Size(max = 64) String name) {
}
