package com.treningi.app.dto;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String type;
    private Long userId;
    private String email;
    private String name;
}
