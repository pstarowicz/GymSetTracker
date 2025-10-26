package com.treningi.app.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String name;
    private Double weight;
    private Double height;
}
