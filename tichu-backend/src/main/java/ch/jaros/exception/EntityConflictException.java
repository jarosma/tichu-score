package ch.jaros.exception;

public class EntityConflictException extends DomainConflictException {
    public EntityConflictException(final String message) {
        super(message);
    }
}
