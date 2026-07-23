package ch.jaros.rest.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record TeamCreateRequest(@NotBlank @Size(max = 64) String name,
                                @NotNull UUID player1Id,
                                @NotNull UUID player2Id) {
}
