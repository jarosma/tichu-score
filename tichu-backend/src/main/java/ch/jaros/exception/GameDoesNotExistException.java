package ch.jaros.exception;

public class GameDoesNotExistException extends DomainNotFoundException {
    public GameDoesNotExistException(final String message) {
        super(message);
    }
}
