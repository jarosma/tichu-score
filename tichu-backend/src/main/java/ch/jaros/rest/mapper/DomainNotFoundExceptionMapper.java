package ch.jaros.rest.mapper;

import ch.jaros.exception.DomainNotFoundException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class DomainNotFoundExceptionMapper implements ExceptionMapper<DomainNotFoundException> {
    @Override
    public Response toResponse(final DomainNotFoundException exception) {
        return Response.status(Response.Status.NOT_FOUND).entity(exception.getMessage()).build();
    }
}
