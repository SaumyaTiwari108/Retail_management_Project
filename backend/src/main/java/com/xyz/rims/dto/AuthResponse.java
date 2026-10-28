package com.xyz.rims.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String tokenType;
    private String username;
    private String fullName;
    private String email;
    private String role;
}
