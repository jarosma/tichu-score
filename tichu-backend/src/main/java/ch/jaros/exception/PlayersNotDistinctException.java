package ch.jaros.exception;

public class PlayersNotDistinctException extends DomainValidationException {
    public PlayersNotDistinctException() {
        super("Players are not Distinct");
    }
}
