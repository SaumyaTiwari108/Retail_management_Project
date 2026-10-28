package com.xyz.rims.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarehouseDto {
    private Long id;

    @NotBlank(message = "Warehouse code is required")
    private String code;

    @NotBlank(message = "Warehouse name is required")
    private String name;

    @NotBlank(message = "Type is required (WAREHOUSE / RETAIL_STORE)")
    private String type;

    private String address;
    private String city;
    private String phone;

    @Builder.Default
    private boolean active = true;

    private LocalDateTime createdAt;
}
