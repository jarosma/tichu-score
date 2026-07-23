package ch.jaros.exception;

public class TeamsNotDistinctException extends DomainValidationException {
    public TeamsNotDistinctException() {
        super("Teams are not Distinct");
    }
}
