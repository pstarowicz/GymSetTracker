package com.treningi.app.dto;

import lombok.Data;

@Data
public class PersonalRecordResponse {
    private Long exerciseId;
    private String exerciseName;
    private Double maxWeight;
    private Double maxVolume;
    private Integer maxWeightReps;
    private String maxWeightDate;
    private String maxVolumeDate;
}