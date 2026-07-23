package ch.jaros.rest.mapper;

import ch.jaros.exception.DomainValidationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class DomainValidationExceptionMapper implements ExceptionMapper<DomainValidationException> {
    @Override
    public Response toResponse(final DomainValidationException exception) {
        return Response.status(Response.Status.BAD_REQUEST).entity(exception.getMessage()).build();
    }
}
