package com.plm.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
public class PlmController {

    @GetMapping("/dashboard/summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalProducts", 156);
        summary.put("activeProjects", 12);
        summary.put("pendingApprovals", 8);
        summary.put("recentChanges", 24);
        
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/dashboard/recent-activities")
    public ResponseEntity<List<Map<String, Object>>> getRecentActivities() {
        List<Map<String, Object>> activities = new ArrayList<>();
        
        Map<String, Object> activity1 = new HashMap<>();
        activity1.put("id", 1);
        activity1.put("type", "Product Update");
        activity1.put("description", "Updated specifications for Product A");
        activity1.put("timestamp", "2024-10-13T10:30:00Z");
        activity1.put("user", "John Doe");
        activities.add(activity1);
        
        Map<String, Object> activity2 = new HashMap<>();
        activity2.put("id", 2);
        activity2.put("type", "Approval");
        activity2.put("description", "Approved design changes for Product B");
        activity2.put("timestamp", "2024-10-13T09:15:00Z");
        activity2.put("user", "Jane Smith");
        activities.add(activity2);
        
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/products")
    public ResponseEntity<List<Map<String, Object>>> getProducts() {
        List<Map<String, Object>> products = new ArrayList<>();
        
        Map<String, Object> product1 = new HashMap<>();
        product1.put("id", 1);
        product1.put("name", "Product Alpha");
        product1.put("version", "v2.1.0");
        product1.put("status", "In Development");
        product1.put("lastModified", "2024-10-13");
        products.add(product1);
        
        Map<String, Object> product2 = new HashMap<>();
        product2.put("id", 2);
        product2.put("name", "Product Beta");
        product2.put("version", "v1.5.2");
        product2.put("status", "Released");
        product2.put("lastModified", "2024-10-12");
        products.add(product2);
        
        return ResponseEntity.ok(products);
    }
}