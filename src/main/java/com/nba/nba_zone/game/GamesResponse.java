package com.nba.nba_zone.game;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class GamesResponse {
    private List<Game> data;
    private Meta meta;

    public List<Game> getData() {
        return data;
    }

    public void setData(List<Game> data) {
        this.data = data;
    }

    public Meta getMeta() {
        return meta;
    }

    public void setMeta(Meta meta) {
        this.meta = meta;
    }

    public static class Meta {
        @JsonProperty("next_cursor")
        private Integer nextCursor;

        @JsonProperty("per_page")
        private int perPage;

        public Integer getNextCursor() {
            return nextCursor;
        }

        public void setNextCursor(Integer nextCursor) {
            this.nextCursor = nextCursor;
        }

        public int getPerPage() {
            return perPage;
        }

        public void setPerPage(int perPage) {
            this.perPage = perPage;
        }
    }
}
