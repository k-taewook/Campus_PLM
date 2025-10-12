package com.plm.api.dashboard;

import com.plm.api.dashboard.dto.DashboardDtos.ProjectList;
import com.plm.api.dashboard.dto.DashboardDtos.Summary;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DemoDataService demoDataService;

    public DashboardController(DemoDataService demoDataService) {
        this.demoDataService = demoDataService;
    }

    @GetMapping("/summary")
    public Summary summary() {
        return demoDataService.getSummary();
    }

    @GetMapping("/projects")
    public ProjectList projects() {
        return demoDataService.getProjects();
    }
}


