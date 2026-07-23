package ch.jaros.exception;

public class InvalidScoreException extends DomainValidationException {
    public InvalidScoreException() {
        super("Scores must add up to a multiple of 100, while both are a multiple of 5");
    }
}
