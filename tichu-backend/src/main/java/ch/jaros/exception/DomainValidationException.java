package ch.jaros.exception;

public abstract class DomainValidationException extends RuntimeException {
    protected DomainValidationException(final String message) {
        super(message);
    }
}
