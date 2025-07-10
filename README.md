generate-module.js

Purpose:
Creates a new feature module folder (e.g., users/) with 5 standard files: controller, routes, service, model, and validator. This follows a domain-driven structure, keeping each feature self-contained and organized.

Why this file convention?
Using consistent, named files per feature (e.g., user.controller.ts) mirrors how real-world scalable apps are built. It makes the codebase easier to navigate, onboard, and maintain.

Why automate it?
Manually creating these files for every new feature is repetitive and error-prone. This script saves time and ensures naming consistency across my codebase.

Benefits:
Keeps my folder structure clean, modular, and aligned with professional back-end project architecture. Also reduces boilerplate effort so you can focus on writing actual logic.

How to use:
From the project root, run node generate-module.js path/to/feature (e.g., node generate-module.js api/users). It will create a folder and auto-generate user.controller.ts, etc., using the last path segment in singular form.