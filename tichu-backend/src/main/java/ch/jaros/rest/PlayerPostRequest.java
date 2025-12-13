package ch.jaros.rest;

import jakarta.validation.constraints.NotNull;

public record PlayerPostRequest(@NotNull String name) {
}
