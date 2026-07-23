# Tichu Backend

Quarkus REST backend for managing Tichu players, teams, games and round scores.

## Requirements

- Java 21
- Docker with Docker Compose
- Maven Wrapper (`./mvnw`)

## Local Development

Start PostgreSQL from this directory:

```shell
docker compose -f docker-compose.dev.yml up -d
```

Start Quarkus in dev mode:

```shell
./mvnw quarkus:dev
```

The API is available at `http://localhost:8080`. The dev CORS origin defaults to
`http://localhost:5173` and can be changed with `TICHU_CORS_ORIGINS`.

Stop PostgreSQL with:

```shell
docker compose -f docker-compose.dev.yml down
```

The database schema is created and migrated by Flyway. Hibernate does not create
or update the schema. The initial migration is in
`src/main/resources/db/migration/V1.0.0__Init.sql`.

## Tests

Run the complete test suite with:

```shell
./mvnw test
```

## REST API

### Players

- `GET /players`
- `POST /players`
- `PATCH /players/{playerId}`
- `DELETE /players/{playerId}`

### Teams

- `GET /teams`
- `POST /teams`
- `PATCH /teams/{teamId}`
- `DELETE /teams/{teamId}`

### Games

- `POST /games`
- `GET /games/{gameId}`
- `POST /games/{gameId}/round-results`
- `POST /games/{gameId}/end`

Path parameters must be UUIDs. Invalid UUID syntax returns `400`; valid but
unknown resources return `404`.

## Score Rules

For every round:

- Both team scores must be divisible by `5`.
- The sum of both scores must be divisible by `100`.
- Negative scores are allowed when they satisfy both rules.

The rules are validated at the REST boundary and again in the domain model.

## Production Configuration

Set `TICHU_CORS_ORIGINS` to the allowed browser origin or comma-separated origins
before starting the application with the `prod` profile. The root
`docker-compose.yml` uses `http://localhost:81` as a local deployment default.

The production container uses `src/main/docker/Dockerfile.jvm`.

## Package Structure

- `entity`: JPA entities and domain behavior
- `repository`: Panache persistence access
- `service`: application use cases and transactions
- `rest/request`: incoming API models
- `rest/response`: outgoing API models
- `rest/resource`: REST endpoints
- `rest/mapper`: exception-to-response mappings
- `exception`: domain exceptions
