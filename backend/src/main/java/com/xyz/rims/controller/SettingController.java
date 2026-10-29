package com.xyz.rims.controller;

import com.xyz.rims.dto.ApiResponse;
import com.xyz.rims.dto.SettingDto;
import com.xyz.rims.service.SettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
@Tag(name = "Application Settings", description = "Endpoints for viewing and updating system configurations")
public class SettingController {

    private final SettingService settingService;

    @GetMapping
    @Operation(summary = "Get all application settings as a key-value dictionary")
    public ResponseEntity<ApiResponse<Map<String, String>>> getSettingsMap() {
        Map<String, String> map = settingService.getSettingsMap();
        return ResponseEntity.ok(ApiResponse.success(map, "Settings retrieved successfully"));
    }

    @GetMapping("/list")
    @Operation(summary = "Get all application settings as a structured list")
    public ResponseEntity<ApiResponse<List<SettingDto>>> getAllSettingsList() {
        List<SettingDto> list = settingService.getAllSettings();
        return ResponseEntity.ok(ApiResponse.success(list, "Settings list retrieved successfully"));
    }

    @PutMapping
    @Operation(summary = "Update multiple settings in bulk (Admin/Manager)")
    public ResponseEntity<ApiResponse<Void>> updateSettings(
            @RequestBody Map<String, String> keyValues,
            Authentication auth) {
        String currentUsername = auth != null ? auth.getName() : "admin";
        settingService.updateSettings(keyValues, currentUsername);
        return ResponseEntity.ok(ApiResponse.success(null, "Settings updated successfully"));
    }

    @PostMapping
    @Operation(summary = "Create or update a single setting property")
    public ResponseEntity<ApiResponse<SettingDto>> saveSingleSetting(
            @RequestBody SettingDto dto,
            Authentication auth) {
        String currentUsername = auth != null ? auth.getName() : "admin";
        SettingDto saved = settingService.saveSetting(dto.getSettingKey(), dto.getSettingValue(), dto.getDescription(), currentUsername);
        return ResponseEntity.ok(ApiResponse.success(saved, "Setting saved successfully"));
    }
}
