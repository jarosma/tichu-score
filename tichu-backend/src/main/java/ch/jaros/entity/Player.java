package ch.jaros.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "player")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
public class Player {

    @Id
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(nullable = false, length = 64)
    private String name;

    private Integer elo;

    private boolean enabled;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stats_id", nullable = false, unique = true)
    @JsonIgnore
    private PlayerStats playerStats;

    public static Player create(final String name) {
        final Player player = Player.builder()
                .id(UUID.randomUUID())
                .name(name)
                .enabled(true)
                .build();

        player.setPlayerStats(PlayerStats.create(player));
        return player;
    }

    public static Player from(final String name) {
        return create(name);
    }

}
