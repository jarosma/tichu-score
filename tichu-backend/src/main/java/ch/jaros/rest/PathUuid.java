package ch.jaros.rest;

import jakarta.ws.rs.BadRequestException;

import java.util.UUID;

public final class PathUuid {

    private PathUuid() {
    }

    public static UUID parse(final String value) {
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException("Invalid UUID: " + value, exception);
        }
    }
}
