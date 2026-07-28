package ch.jaros.exception;

public class GameFinishPendingException extends DomainConflictException {
    public GameFinishPendingException() {
        super("Game is waiting for end confirmation");
    }
}
