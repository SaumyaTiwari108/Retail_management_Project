package com.xyz.rims.service;

import com.xyz.rims.dto.AuthRequest;
import com.xyz.rims.dto.AuthResponse;
import com.xyz.rims.dto.RegisterRequest;

public interface AuthService {
    AuthResponse login(AuthRequest request);
    AuthResponse register(RegisterRequest request);
}
