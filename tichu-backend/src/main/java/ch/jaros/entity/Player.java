package ch.jaros.entity;

import ch.jaros.rest.PlayerPostRequest;
import jakarta.persistence.*;
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

    public static Player from(final PlayerPostRequest playerPostRequest) {
        return from(playerPostRequest.name());
    }

    public static Player from(final String name) {
        return Player.builder()
                .id(UUID.nameUUIDFromBytes(name.getBytes()))
                .name(name)
                .build();
    }

}

