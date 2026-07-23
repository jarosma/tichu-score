package ch.jaros.exception;

public class TeamsNotEnabledException extends DomainValidationException {
    public TeamsNotEnabledException() {
        super("At least one of the teams is not enabled");
    }
}
