package ch.jaros.exception;

public class PlayersNotDistinctException extends IllegalArgumentException {
    public PlayersNotDistinctException() {
        super("Players are not Distinct");
    }
}
