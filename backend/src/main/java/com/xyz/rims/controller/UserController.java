package com.xyz.rims.controller;

import com.xyz.rims.dto.ApiResponse;
import com.xyz.rims.dto.UserDto;
import com.xyz.rims.model.Role;
import com.xyz.rims.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Admin endpoints for managing system users and security roles")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get all users (Admin only)")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users, "Users retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user details by ID")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        UserDto user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user, "User details retrieved successfully"));
    }

    @PostMapping
    @Operation(summary = "Create a new user account")
    public ResponseEntity<ApiResponse<UserDto>> createUser(@Valid @RequestBody UserDto dto, Authentication auth) {
        String currentUsername = auth != null ? auth.getName() : "admin";
        UserDto created = userService.createUser(dto, currentUsername);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "User created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user details")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserDto dto,
            Authentication auth) {
        String currentUsername = auth != null ? auth.getName() : "admin";
        UserDto updated = userService.updateUser(id, dto, currentUsername);
        return ResponseEntity.ok(ApiResponse.success(updated, "User updated successfully"));
    }

    @PutMapping("/{id}/toggle-status")
    @Operation(summary = "Toggle active/inactive status of a user")
    public ResponseEntity<ApiResponse<UserDto>> toggleStatus(@PathVariable Long id, Authentication auth) {
        String currentUsername = auth != null ? auth.getName() : "admin";
        UserDto updated = userService.toggleUserStatus(id, currentUsername);
        return ResponseEntity.ok(ApiResponse.success(updated, "User status updated successfully"));
    }

    @PutMapping("/{id}/role")
    @Operation(summary = "Change a user's role")
    public ResponseEntity<ApiResponse<UserDto>> changeRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            Authentication auth) {
        String currentUsername = auth != null ? auth.getName() : "admin";
        Role newRole = Role.valueOf(payload.get("role"));
        UserDto updated = userService.changeUserRole(id, newRole, currentUsername);
        return ResponseEntity.ok(ApiResponse.success(updated, "User role changed successfully"));
    }
}
