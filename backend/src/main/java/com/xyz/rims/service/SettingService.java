package com.xyz.rims.service;

import com.xyz.rims.dto.SettingDto;

import java.util.List;
import java.util.Map;

public interface SettingService {
    List<SettingDto> getAllSettings();
    Map<String, String> getSettingsMap();
    String getSettingValue(String key, String defaultValue);
    void updateSettings(Map<String, String> keyValues, String currentUsername);
    SettingDto saveSetting(String key, String value, String description, String currentUsername);
}
