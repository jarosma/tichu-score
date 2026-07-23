package ch.jaros.exception;

public class TeamDoesNotExistException extends DomainNotFoundException {
    public TeamDoesNotExistException(final String message) {
        super(message);
    }
}
