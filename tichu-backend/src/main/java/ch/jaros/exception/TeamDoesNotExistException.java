package ch.jaros.exception;

import jakarta.ws.rs.NotFoundException;

public class TeamDoesNotExistException extends NotFoundException {
    public TeamDoesNotExistException(final String message) {
        super(message);
    }
}
