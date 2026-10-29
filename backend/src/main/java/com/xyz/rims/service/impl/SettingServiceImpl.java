package com.xyz.rims.service.impl;

import com.xyz.rims.dto.SettingDto;
import com.xyz.rims.model.AppSetting;
import com.xyz.rims.repository.AppSettingRepository;
import com.xyz.rims.service.AuditService;
import com.xyz.rims.service.SettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettingServiceImpl implements SettingService {

    private final AppSettingRepository appSettingRepository;
    private final AuditService auditService;

    @Override
    public List<SettingDto> getAllSettings() {
        return appSettingRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, String> getSettingsMap() {
        Map<String, String> map = new HashMap<>();
        appSettingRepository.findAll().forEach(s -> map.put(s.getSettingKey(), s.getSettingValue()));
        return map;
    }

    @Override
    public String getSettingValue(String key, String defaultValue) {
        return appSettingRepository.findBySettingKey(key)
                .map(AppSetting::getSettingValue)
                .orElse(defaultValue);
    }

    @Override
    @Transactional
    public void updateSettings(Map<String, String> keyValues, String currentUsername) {
        if (keyValues == null) return;

        for (Map.Entry<String, String> entry : keyValues.entrySet()) {
            AppSetting setting = appSettingRepository.findBySettingKey(entry.getKey())
                    .orElseGet(() -> AppSetting.builder()
                            .settingKey(entry.getKey())
                            .description("Application configuration parameter")
                            .build());

            setting.setSettingValue(entry.getValue());
            appSettingRepository.save(setting);
        }

        auditService.log("AppSetting", 0L, "UPDATE_BATCH", currentUsername,
                "Updated application configuration properties (" + keyValues.size() + " items)");
    }

    @Override
    @Transactional
    public SettingDto saveSetting(String key, String value, String description, String currentUsername) {
        AppSetting setting = appSettingRepository.findBySettingKey(key)
                .orElseGet(() -> AppSetting.builder().settingKey(key).build());

        setting.setSettingValue(value);
        if (description != null) {
            setting.setDescription(description);
        }

        AppSetting saved = appSettingRepository.save(setting);
        auditService.log("AppSetting", saved.getId(), "UPDATE", currentUsername,
                "Updated setting " + key + " = " + value);
        return mapToDto(saved);
    }

    private SettingDto mapToDto(AppSetting setting) {
        return SettingDto.builder()
                .id(setting.getId())
                .settingKey(setting.getSettingKey())
                .settingValue(setting.getSettingValue())
                .description(setting.getDescription())
                .build();
    }
}
