package ch.jaros.exception;

public class TeamsNotEnabledException extends IllegalArgumentException {
    public TeamsNotEnabledException() {
        super("At least one of the teams is not enabled");
    }
}
