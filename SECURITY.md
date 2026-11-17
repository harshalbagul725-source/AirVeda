# Security Policy

## Supported version

Security fixes are applied to the latest version on the default branch.

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting feature for this repository when it is enabled. If it is unavailable, contact the repository maintainers privately before creating a public issue. Do not include secrets, personal location data, or sensitive information in a public report.

## Security practices

- Gemini credentials belong only in the backend environment.
- `.env` files are ignored by Git; use `backend/.env.example` as a template.
- API request models apply size and range constraints, and AI requests are rate limited.
- CORS allows configured origins only. Production deployments should configure the exact frontend origin.
- External data and AI responses must not be treated as clinical advice.

Before publishing, review `git status` and the staged file list for `.env`, tokens, credentials, or user data.
