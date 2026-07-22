package ch.jaros.rest;

import jakarta.ws.rs.BadRequestException;

import java.util.UUID;

final class PathUuid {

    private PathUuid() {
    }

    static UUID parse(final String value) {
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException("Invalid UUID: " + value, exception);
        }
    }
}
