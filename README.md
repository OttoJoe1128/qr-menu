# 📱 QR Menu - Digital Menu & Operations Management System

> A scalable, end-to-end QR-based menu and operations management system designed to streamline restaurant and cafe workflows.

## 🚀 Overview
QR Menu is a modern SaaS-style application that allows businesses to digitize their menus and manage daily operations seamlessly. Built with performance and user experience in mind, it provides lightning-fast load times and a highly responsive interface for end-users, while offering powerful management tools for business owners.

## 💻 Tech Stack
*   **Frontend:** React, Vite (for optimized build and instant server start)
*   **Environment:** UserLAnd (Android) for edge deployment/testing
*   **Version Control & CI/CD:** GitLab, Automated pipelines
*   **Deployment:** SSH-based automated remote server deployments

## ✨ Key Features
*   **Instant QR Access:** Customers can scan and view the digital menu instantly without downloading any app.
*   **Real-Time Operations:** Dynamic updates to menu items, pricing, and availability.
*   **Optimized Performance:** Powered by Vite + React for a smooth, app-like mobile experience in the browser.
*   **Continuous Integration:** Automated build and deployment pipelines ensure zero-downtime updates.

## ⚙️ CI/CD Pipeline & Architecture
This project utilizes a modern DevOps approach to ensure rapid and reliable feature releases:
1.  **Code Commit:** Pushing changes to the GitLab repository triggers the CI/CD pipeline.
2.  **Build Phase:** Vite compiles and minifies the React application for optimal production performance.
3.  **Deployment:** Using automated GitLab CI runners, the build artifacts are securely transferred via SSH and deployed to the production environment.

## 🛠️ Getting Started (Local Development)

```bash
# Clone the repository
git clone [https://gitlab.com/OttoJoe1128/qr-menu.git](https://gitlab.com/OttoJoe1128/qr-menu.git)

# Navigate to the project directory
cd qr-menu

# Install dependencies
npm install

# Start the development server
npm run dev
