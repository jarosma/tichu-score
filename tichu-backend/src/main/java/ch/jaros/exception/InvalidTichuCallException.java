package ch.jaros.exception;

public class InvalidTichuCallException extends DomainValidationException {
    public InvalidTichuCallException(final String message) {
        super(message);
    }
}
