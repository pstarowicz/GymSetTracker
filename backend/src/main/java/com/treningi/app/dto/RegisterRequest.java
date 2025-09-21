package com.treningi.app.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String name;
    private Integer weight;
    private Integer height;
}
