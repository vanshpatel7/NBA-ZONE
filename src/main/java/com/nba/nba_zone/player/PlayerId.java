package com.nba.nba_zone.player;

import java.io.Serializable;
import java.util.Objects;

public class PlayerId implements Serializable {
    private Double rk;
    private String team;

    public PlayerId() {
    }

    public PlayerId(Double rk, String team) {
        this.rk = rk;
        this.team = team;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PlayerId playerId = (PlayerId) o;
        return Objects.equals(rk, playerId.rk) && Objects.equals(team, playerId.team);
    }

    @Override
    public int hashCode() {
        return Objects.hash(rk, team);
    }
}
