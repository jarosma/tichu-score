package ch.jaros.rest.mapper;

import ch.jaros.exception.DomainConflictException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class DomainConflictExceptionMapper implements ExceptionMapper<DomainConflictException> {
    @Override
    public Response toResponse(final DomainConflictException exception) {
        return Response.status(Response.Status.CONFLICT).entity(exception.getMessage()).build();
    }
}
