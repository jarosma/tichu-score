package ch.jaros.exception;

public class PlayerDoesNotExistException extends DomainNotFoundException {
    public PlayerDoesNotExistException(String message) {
        super(message);
    }
}
