package ch.jaros.rest;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PlayerPostRequest(@NotBlank @Size(max = 64) String name) {
}
