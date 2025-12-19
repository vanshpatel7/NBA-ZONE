package com.nba.nba_zone.player;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.IdClass;

@Entity
@Table(name = "player_stats")
@IdClass(PlayerId.class)
public class Player {
    @Id
    @Column(name = "rk")
    private Double rk;

    @Column(name = "player")
    private String name;

    private Double age;

    private Double g;

    private Double gs;

    private Double mp;

    private Double fg;

    private Double fga;

    @Column(name = "fg_pct")
    private Double fgPct;

    @Column(name = "three_p")
    private Double threeP;

    @Column(name = "three_pa")
    private Double threePA;

    @Column(name = "three_p_pct")
    private Double threePPct;

    @Column(name = "two_p")
    private Double twoP;

    @Column(name = "two_pa")
    private Double twoPA;

    @Column(name = "two_p_pct")
    private Double twoPPct;

    @Column(name = "efg_pct")
    private Double efgPct;

    private Double ft;

    private Double fta;

    @Column(name = "ft_pct")
    private Double ftPct;

    private Double orb;

    private Double drb;

    private Double trb;

    private Double ast;

    private Double stl;

    private Double blk;

    private Double tov;

    private Double pf;

    private Double pts;

    @Id
    @Column(name = "team")
    private String team;
    private String pos;

    @Column(name = "source_table")
    private String sourceTable;

    @Column(name = "trp_dbl")
    private Double trpDbl;

    private String awards;

    public Player() {
    }

    public Player(Double rk, String name, Double age, Double g, Double gs, Double mp, Double fg, Double fga,
            Double fgPct, Double threeP, Double threePA, Double threePPct, Double twoP, Double twoPA, Double twoPPct,
            Double efgPct, Double ft, Double fta, Double ftPct, Double orb, Double drb, Double trb, Double ast,
            Double stl, Double blk, Double tov, Double pf, Double pts, String team, String pos, String sourceTable,
            Double trpDbl, String awards) {
        this.rk = rk;
        this.name = name;
        this.age = age;
        this.g = g;
        this.gs = gs;
        this.mp = mp;
        this.fg = fg;
        this.fga = fga;
        this.fgPct = fgPct;
        this.threeP = threeP;
        this.threePA = threePA;
        this.threePPct = threePPct;
        this.twoP = twoP;
        this.twoPA = twoPA;
        this.twoPPct = twoPPct;
        this.efgPct = efgPct;
        this.ft = ft;
        this.fta = fta;
        this.ftPct = ftPct;
        this.orb = orb;
        this.drb = drb;
        this.trb = trb;
        this.ast = ast;
        this.stl = stl;
        this.blk = blk;
        this.tov = tov;
        this.pf = pf;
        this.pts = pts;
        this.team = team;
        this.pos = pos;
        this.sourceTable = sourceTable;
        this.trpDbl = trpDbl;
        this.awards = awards;
    }

    public String getPos() {
        return pos;
    }

    public void setPos(String pos) {
        this.pos = pos;
    }

    public Double getRk() {
        return rk;
    }

    public String getName() {
        return name;
    }

    public Double getAge() {
        return age;
    }

    public Double getG() {
        return g;
    }

    public Double getGs() {
        return gs;
    }

    public Double getMp() {
        return mp;
    }

    public Double getFg() {
        return fg;
    }

    public Double getFga() {
        return fga;
    }

    public Double getFgPct() {
        return fgPct;
    }

    public Double getThreeP() {
        return threeP;
    }

    public Double getThreePA() {
        return threePA;
    }

    public Double getThreePPct() {
        return threePPct;
    }

    public Double getTwoP() {
        return twoP;
    }

    public Double getTwoPA() {
        return twoPA;
    }

    public Double getTwoPPct() {
        return twoPPct;
    }

    public Double getEfgPct() {
        return efgPct;
    }

    public Double getFt() {
        return ft;
    }

    public Double getFta() {
        return fta;
    }

    public Double getFtPct() {
        return ftPct;
    }

    public Double getOrb() {
        return orb;
    }

    public Double getDrb() {
        return drb;
    }

    public Double getTrb() {
        return trb;
    }

    public Double getAst() {
        return ast;
    }

    public Double getStl() {
        return stl;
    }

    public Double getBlk() {
        return blk;
    }

    public Double getTov() {
        return tov;
    }

    public Double getPf() {
        return pf;
    }

    public Double getPts() {
        return pts;
    }

    public String getTeam() {
        return team;
    }

    public String getSourceTable() {
        return sourceTable;
    }

    public Double getTrpDbl() {
        return trpDbl;
    }

    public String getAwards() {
        return awards;
    }

    public void setRk(Double rk) {
        this.rk = rk;
    }

    public void setName(String player) {
        this.name = player;
    }

    public void setAge(Double age) {
        this.age = age;
    }

    public void setG(Double g) {
        this.g = g;
    }

    public void setGs(Double gs) {
        this.gs = gs;
    }

    public void setMp(Double mp) {
        this.mp = mp;
    }

    public void setFg(Double fg) {
        this.fg = fg;
    }

    public void setFga(Double fga) {
        this.fga = fga;
    }

    public void setFgPct(Double fgPct) {
        this.fgPct = fgPct;
    }

    public void setThreeP(Double threeP) {
        this.threeP = threeP;
    }

    public void setThreePA(Double threePA) {
        this.threePA = threePA;
    }

    public void setThreePPct(Double threePPct) {
        this.threePPct = threePPct;
    }

    public void setTwoP(Double twoP) {
        this.twoP = twoP;
    }

    public void setTwoPA(Double twoPA) {
        this.twoPA = twoPA;
    }

    public void setTwoPPct(Double twoPPct) {
        this.twoPPct = twoPPct;
    }

    public void setEfgPct(Double efgPct) {
        this.efgPct = efgPct;
    }

    public void setFt(Double ft) {
        this.ft = ft;
    }

    public void setFta(Double fta) {
        this.fta = fta;
    }

    public void setFtPct(Double ftPct) {
        this.ftPct = ftPct;
    }

    public void setOrb(Double orb) {
        this.orb = orb;
    }

    public void setDrb(Double drb) {
        this.drb = drb;
    }

    public void setTrb(Double trb) {
        this.trb = trb;
    }

    public void setAst(Double ast) {
        this.ast = ast;
    }

    public void setStl(Double stl) {
        this.stl = stl;
    }

    public void setBlk(Double blk) {
        this.blk = blk;
    }

    public void setTov(Double tov) {
        this.tov = tov;
    }

    public void setPf(Double pf) {
        this.pf = pf;
    }

    public void setPts(Double pts) {
        this.pts = pts;
    }

    public void setTeam(String team) {
        this.team = team;
    }

    public void setSourceTable(String sourceTable) {
        this.sourceTable = sourceTable;
    }

    public void setTrpDbl(Double trpDbl) {
        this.trpDbl = trpDbl;
    }

    public void setAwards(String awards) {
        this.awards = awards;
    }
}
