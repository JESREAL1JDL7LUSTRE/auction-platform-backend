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

| File Name            | What It Does                                                            | Example Use                                                |
| -------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------- |
| `user.controller.js` | Handles incoming HTTP requests and sends responses                      | `res.json(await userService.getUsers())`                   |
| `user.service.js`    | Contains business logic (e.g. how users are fetched, saved, calculated) | `fetch user from DB, apply discounts, return result`       |
| `user.routes.js`     | Defines the actual API paths and links them to controller methods       | `router.get('/', userController.getUsers)`                 |
| `user.model.js`      | Schema definition for database (Mongoose, Sequelize, etc.)              | Defines a `User` with `name`, `email`, `password`          |
| `user.validator.js`  | Validates input data (e.g. signup form fields)                          | Using Joi: check `email` is valid and `password` is strong |


This app uses three types of databases to optimize for different responsibilities across development and production:

1. Relational Database (SQL)
Dev: MySQL (lightweight, easier setup)

Prod: PostgreSQL (robust, feature-rich, better for scale)
Used for structured data like users, bids, and transactions, ensuring ACID compliance and relational integrity.

2. Non-Relational Database (MongoDB)
Stores flexible, nested data like product listings, categories, and metadata.

Ideal for content that doesn’t require strict schema enforcement.

3. Redis (In-Memory Cache)
Used for performance optimizations — caching frequently accessed data like product lists, leaderboard scores, or session data.

Reduces load on primary databases and boosts response times.