package ch.jaros.exception;

import jakarta.ws.rs.NotFoundException;

public class PlayerDoesNotExistException extends NotFoundException {
    public PlayerDoesNotExistException(String message) {
        super(message);
    }
}
