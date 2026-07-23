package ch.jaros.exception;

public abstract class DomainConflictException extends RuntimeException {
    protected DomainConflictException(final String message) {
        super(message);
    }
}
