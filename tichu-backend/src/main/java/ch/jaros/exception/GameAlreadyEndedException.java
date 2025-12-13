package ch.jaros.exception;

public class GameAlreadyEndedException extends IllegalStateException {
    public GameAlreadyEndedException() {
        super("Cannot end an already ended game");
    }
}
