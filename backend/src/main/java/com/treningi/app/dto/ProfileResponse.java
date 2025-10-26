package com.treningi.app.dto;

public class ProfileResponse {
    private String name;
    private String email;
    private Double weight;
    private Double height;

    public ProfileResponse(String name, String email, Double weight, Double height) {
        this.name = name;
        this.email = email;
        this.weight = weight;
        this.height = height;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public Double getWeight() {
        return weight;
    }

    public Double getHeight() {
        return height;
    }
}