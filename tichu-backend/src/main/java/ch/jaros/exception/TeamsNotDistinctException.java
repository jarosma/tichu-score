package ch.jaros.exception;

import jakarta.ws.rs.NotFoundException;

public class TeamsNotDistinctException extends IllegalArgumentException {
    public TeamsNotDistinctException() {
        super("Teams are not Distinct");
    }
}
