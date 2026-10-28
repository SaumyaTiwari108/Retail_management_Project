package com.xyz.rims.service;

import com.xyz.rims.dto.DashboardStatsDto;
import com.xyz.rims.dto.ReorderRecommendationDto;
import java.util.List;

public interface AnalyticsService {
    DashboardStatsDto getDashboardStats();
    List<ReorderRecommendationDto> getReorderRecommendations();
    byte[] exportInventoryCsv();
}
