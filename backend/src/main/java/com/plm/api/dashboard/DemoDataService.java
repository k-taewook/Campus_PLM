package com.plm.api.dashboard;

import com.plm.api.dashboard.dto.DashboardDtos.ProjectItem;
import com.plm.api.dashboard.dto.DashboardDtos.ProjectList;
import com.plm.api.dashboard.dto.DashboardDtos.Summary;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class DemoDataService {

    public Summary getSummary() {
        return new Summary(1, 1, 0, 0, 0, 0);
    }

    public ProjectList getProjects() {
        List<ProjectItem> list = new ArrayList<>();
        list.add(new ProjectItem(1L, "웹사이트 리뉴얼 프로젝트", "김프로젝트", "WEB", 13, LocalDate.of(2024, 5, 31), "active"));
        return new ProjectList(list);
    }
}


