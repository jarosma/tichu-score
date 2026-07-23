# Tichu Backend Database

```mermaid
erDiagram
    PLAYER ||--|| PLAYER_STATS : has
    TEAM ||--|| TEAM_STATS : has

    PLAYER ||--o{ TEAM : player1
    PLAYER ||--o{ TEAM : player2

    TEAM ||--o{ GAME : team1
    TEAM ||--o{ GAME : team2

    GAME ||--o{ GAME_ROUND : contains
    GAME_ROUND ||--o{ TICHU_CALL : contains
    PLAYER ||--o{ TICHU_CALL : makes
    GAME ||--o{ TICHU_CALL : records

    PLAYER {
        UUID id PK
        VARCHAR name UK
        INT elo
        BOOLEAN enabled
        UUID stats_id FK, UK
    }

    PLAYER_STATS {
        UUID id PK
        INT total_wins
        INT total_losses
        INT successful_tichus
        INT unsuccessful_tichus
        INT total_games_played
        INT highest_point_diff_win
    }

    TEAM {
        UUID id PK
        VARCHAR name UK
        UUID player1 FK
        UUID player2 FK
        INT team_elo
        BOOLEAN enabled
        UUID team_stats_id FK, UK
    }

    TEAM_STATS {
        UUID id PK
        INT total_wins
        INT total_losses
        INT successful_tichus
        INT unsuccessful_tichus
        INT total_games_played
        INT highest_point_diff_win
    }

    GAME {
        UUID id PK
        TIMESTAMPTZ started_at
        TIMESTAMPTZ ended_at
        UUID team1_id FK
        UUID team2_id FK
        game_winner winner
    }

    GAME_ROUND {
        UUID id PK
        UUID game_id FK
        INT number
        TIMESTAMPTZ submitted_at
        INT team1_score
        INT team2_score
    }

    TICHU_CALL {
        UUID id PK
        UUID game_id FK
        UUID player_id FK
        UUID game_round_id FK
        BOOLEAN successful
    }
```

## Constraints

- Teams contain two distinct players.
- Games contain two distinct teams.
- A game contains multiple rounds.
- A round can contain multiple Tichu calls.
- A player can make only one Tichu call per round.
- A completed game has a winner and an end timestamp.
- Every player references exactly one player stats row.
- Every team references exactly one team stats row.
- Player and player-stats IDs are identical.
- Team and team-stats IDs are identical.
