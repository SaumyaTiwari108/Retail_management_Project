package com.xyz.rims.controller;

import com.xyz.rims.dto.ApiResponse;
import com.xyz.rims.dto.DashboardStatsDto;
import com.xyz.rims.dto.ReorderRecommendationDto;
import com.xyz.rims.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics & Reports", description = "Dashboard statistics, reorder intelligence, and CSV exports")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get live aggregated KPI cards and trend metrics for main dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getDashboardStats()));
    }

    @GetMapping("/recommendations")
    @Operation(summary = "Get rule-based smart reorder and replenishment recommendations")
    public ResponseEntity<ApiResponse<List<ReorderRecommendationDto>>> getReorderRecommendations() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getReorderRecommendations()));
    }

    @GetMapping("/export-inventory")
    @Operation(summary = "Export complete inventory report as CSV")
    public ResponseEntity<byte[]> exportInventoryCsv() {
        byte[] csvData = analyticsService.exportInventoryCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=inventory_report_" + System.currentTimeMillis() + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }
}
