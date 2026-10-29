package com.xyz.rims.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettingDto {
    private Long id;
    private String settingKey;
    private String settingValue;
    private String description;
}
