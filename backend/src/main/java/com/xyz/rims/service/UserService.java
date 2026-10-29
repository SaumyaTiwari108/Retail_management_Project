package com.xyz.rims.service;

import com.xyz.rims.dto.UserDto;
import com.xyz.rims.model.Role;

import java.util.List;

public interface UserService {
    List<UserDto> getAllUsers();
    UserDto getUserById(Long id);
    UserDto createUser(UserDto dto, String currentUsername);
    UserDto updateUser(Long id, UserDto dto, String currentUsername);
    UserDto toggleUserStatus(Long id, String currentUsername);
    UserDto changeUserRole(Long id, Role newRole, String currentUsername);
}
