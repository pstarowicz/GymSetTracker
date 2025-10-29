package com.treningi.app.dto;

import lombok.Data;

@Data
public class VolumeSetInfo {
    private Double weight;
    private Integer reps;
    private Double volumeContribution;

    public VolumeSetInfo(Double weight, Integer reps) {
        this.weight = weight;
        this.reps = reps;
        this.volumeContribution = weight * reps;
    }
}