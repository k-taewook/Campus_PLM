package com.plm.api.dashboard.dto;

import java.time.LocalDate;
import java.util.List;

public class DashboardDtos {

    public record Summary(int totalProjects, int inProgress, int assignedTasks, int completedTasks, int delayedTasks, int upcomingDeadlines) { }

    public record ProjectItem(long id, String name, String lead, String team, int progressPercent, LocalDate dueDate, String status) { }

    public record ProjectList(List<ProjectItem> items) { }
}


