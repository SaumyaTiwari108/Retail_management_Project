package com.xyz.rims.service.impl;

import com.xyz.rims.dto.UserDto;
import com.xyz.rims.exception.BadRequestException;
import com.xyz.rims.exception.ResourceNotFoundException;
import com.xyz.rims.model.Role;
import com.xyz.rims.model.User;
import com.xyz.rims.repository.UserRepository;
import com.xyz.rims.service.AuditService;
import com.xyz.rims.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        return mapToDto(user);
    }

    @Override
    @Transactional
    public UserDto createUser(UserDto dto, String currentUsername) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new BadRequestException("Username is already taken: " + dto.getUsername());
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email is already registered: " + dto.getEmail());
        }
        if (dto.getPassword() == null || dto.getPassword().trim().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters long");
        }

        User user = User.builder()
                .username(dto.getUsername().trim())
                .password(passwordEncoder.encode(dto.getPassword()))
                .fullName(dto.getFullName().trim())
                .email(dto.getEmail().trim())
                .role(dto.getRole() != null ? dto.getRole() : Role.ROLE_STAFF)
                .active(true)
                .build();

        User saved = userRepository.save(user);
        auditService.log("User", saved.getId(), "CREATE", currentUsername,
                "Created operator account: " + saved.getUsername() + " (" + saved.getRole() + ")");
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public UserDto updateUser(Long id, UserDto dto, String currentUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        if (!user.getEmail().equalsIgnoreCase(dto.getEmail()) && userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email is already registered by another user: " + dto.getEmail());
        }

        user.setFullName(dto.getFullName().trim());
        user.setEmail(dto.getEmail().trim());
        if (dto.getRole() != null) {
            user.setRole(dto.getRole());
        }
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            if (dto.getPassword().length() < 6) {
                throw new BadRequestException("Password must be at least 6 characters long");
            }
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        User updated = userRepository.save(user);
        auditService.log("User", updated.getId(), "UPDATE", currentUsername,
                "Updated user account profile: " + updated.getUsername());
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public UserDto toggleUserStatus(Long id, String currentUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        if (user.getUsername().equalsIgnoreCase(currentUsername)) {
            throw new BadRequestException("Administrators cannot deactivate their own account");
        }

        user.setActive(!user.isActive());
        User updated = userRepository.save(user);
        auditService.log("User", updated.getId(), "STATUS_CHANGE", currentUsername,
                "User " + updated.getUsername() + " status set to: " + (updated.isActive() ? "ACTIVE" : "INACTIVE"));
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public UserDto changeUserRole(Long id, Role newRole, String currentUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        user.setRole(newRole);
        User updated = userRepository.save(user);
        auditService.log("User", updated.getId(), "ROLE_CHANGE", currentUsername,
                "Changed role for " + updated.getUsername() + " to: " + newRole.name());
        return mapToDto(updated);
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
