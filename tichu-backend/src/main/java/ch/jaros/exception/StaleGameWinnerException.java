package ch.jaros.exception;

public class StaleGameWinnerException extends DomainConflictException {
    public StaleGameWinnerException() {
        super("Winner does not match the current game score");
    }
}
