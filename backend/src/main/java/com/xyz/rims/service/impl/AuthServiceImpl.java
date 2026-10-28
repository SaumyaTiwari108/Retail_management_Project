package com.xyz.rims.service.impl;

import com.xyz.rims.dto.AuthRequest;
import com.xyz.rims.dto.AuthResponse;
import com.xyz.rims.dto.RegisterRequest;
import com.xyz.rims.exception.BadRequestException;
import com.xyz.rims.model.User;
import com.xyz.rims.repository.UserRepository;
import com.xyz.rims.security.CustomUserDetails;
import com.xyz.rims.security.JwtUtils;
import com.xyz.rims.service.AuditService;
import com.xyz.rims.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final AuditService auditService;

    @Override
    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority();
        String token = jwtUtils.generateToken(userDetails, role, userDetails.getFullName());

        auditService.log("User", userDetails.getId(), "LOGIN", userDetails.getUsername(), "Successful user login");

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .username(userDetails.getUsername())
                .fullName(userDetails.getFullName())
                .email(userDetails.getEmail())
                .role(role)
                .build();
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .role(request.getRole())
                .active(true)
                .build();

        User saved = userRepository.save(user);
        auditService.log("User", saved.getId(), "CREATE", "SYSTEM", "Registered new account: " + saved.getUsername());

        CustomUserDetails userDetails = new CustomUserDetails(saved);
        String role = saved.getRole().name();
        String token = jwtUtils.generateToken(userDetails, role, saved.getFullName());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .username(saved.getUsername())
                .fullName(saved.getFullName())
                .email(saved.getEmail())
                .role(role)
                .build();
    }
}
