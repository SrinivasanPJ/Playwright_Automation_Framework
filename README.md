# Playwright 101 – TestMu AI Certification Assignment

This TypeScript project automates all three assignment scenarios using Playwright Test and Page Object Model:

1. Simple Form Demo
2. Drag & Drop Sliders
3. Input Form Submit

The default cloud configuration executes every scenario in parallel on:

- Chrome latest / Windows 11
- Playwright Firefox latest / macOS Ventura

TestMu AI capabilities enable network logs, video, console logs, and visual screenshots. The framework also attaches Playwright traces and text logs to the HTML report.

## Project structure

```text
playwright-101-assignment/
├── src/
│   ├── fixtures/test-fixtures.ts
│   ├── pages/
│   │   ├── base.page.ts
│   │   ├── selenium-playground.page.ts
│   │   ├── simple-form.page.ts
│   │   ├── slider.page.ts
│   │   └── input-form.page.ts
│   └── test-data/contact-form.data.ts
├── tests/
│   ├── simple-form.spec.ts
│   ├── slider.spec.ts
│   └── input-form.spec.ts
├── .env.example
├── .gitignore
├── package.json
├── playwright.config.ts
├── playwright.local.config.ts
└── tsconfig.json
```

## 1. Prerequisites

Install:

- Node.js 20 or newer
- Visual Studio Code
- Git
- A TestMu AI account created with the same email used for certification

## 2. Open the project

Extract the ZIP and open the `playwright-101-assignment` folder in Visual Studio Code.

Open **Terminal → New Terminal**.

## 3. Install dependencies

```powershell
npm install
npx playwright install
```

## 4. Configure TestMu AI credentials

In PowerShell:

```powershell
Copy-Item .env.example .env
```

Open `.env` and replace the placeholders:

```env
LT_USERNAME=your_actual_testmu_username
LT_ACCESS_KEY=your_actual_testmu_access_key
LT_BUILD_NAME=Playwright 101 Certification Assignment
```

Do not commit `.env`. It is already included in `.gitignore`.

## 5. Verify locally first

```powershell
npm run test:local
```

Run in visible browsers when debugging:

```powershell
npm run test:local:headed
```

Open Playwright Inspector:

```powershell
npm run test:debug
```

View the HTML report:

```powershell
npm run report
```

## 6. Run on TestMu AI cloud

```powershell
npm run test:cloud
```

The configuration uses `workers: 2`, so two cloud sessions can execute concurrently. Three tests across two projects produce six cloud sessions.

## 7. Verify evidence in TestMu AI

Open the TestMu AI Automation Dashboard and select the build:

```text
Playwright 101 Certification Assignment
```

For every session, verify:

- Passed status
- Network logs
- Console logs
- Video
- Screenshots/visual logs
- Correct browser and operating system

Copy the Test Session IDs. A submission note can look like this:

```text
GitHub Repository URL:
https://github.com/<your-username>/<your-private-repository>

TestMu AI Build:
Playwright 101 Certification Assignment

Test Session IDs:
1. <session-id>
2. <session-id>
3. <session-id>
4. <session-id>
5. <session-id>
6. <session-id>
```

## 8. Push to a private GitHub repository

Create a new **private** repository in GitHub without adding a README or `.gitignore`, then execute:

```powershell
git init
git add .
git commit -m "Complete Playwright 101 certification assignment"
git branch -M main
git remote add origin https://github.com/<your-username>/<repository-name>.git
git push -u origin main
```

## 9. Share the private repository

In GitHub:

1. Open the repository.
2. Select **Settings**.
3. Open **Collaborators** or **Collaborators and teams**.
4. Add `admin@testmuaicertifications.com` as a collaborator.
5. Confirm that the invitation was sent.

## 10. Submit on the exam portal

Submit:

- Private GitHub repository URL
- TestMu AI Test Session IDs

Before submission, confirm that `.env` is not visible in GitHub and that the dashboard sessions contain the required logs and recordings.

## Locator requirement mapping

The tests intentionally use more than three locator approaches:

- Role locator: `getByRole(...)`
- Visible-text locator: `getByText(...)`
- CSS ID locator: `locator('#user-message')`
- CSS attribute/name locator: `locator('input[name="name"]')`

## Useful commands

```powershell
npm run typecheck
npm run test:local
npm run test:local:headed
npm run test:cloud
npm run report
```
