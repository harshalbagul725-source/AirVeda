# Contributing to AirVeda

Thanks for helping improve AirVeda. Contributions should preserve user trust, accessible interaction, and clear provenance for all environmental data.

## Development setup

Follow the frontend and backend setup instructions in [README.md](README.md). Run both services locally when testing API-connected changes.

## Before opening a pull request

1. Keep changes scoped to the issue and follow existing project patterns.
2. Add focused tests for new behavior or regressions.
3. Run `npm test` and `npm run build` in `app/frontend/`.
4. Run `python -m pytest` in `app/backend/`.
5. Check that unavailable external data is reported as unavailable; never add hard-coded sample readings to runtime paths.
6. Do not include personal location data, credentials, `.env`, or generated environment files.

## Pull requests

Describe the user impact, implementation, and validation performed. Include screenshots for visual changes when possible, and note any limitations or data-source changes.

## Reporting issues

Use the GitHub issue templates for bugs and feature ideas. Do not include API keys, private location information, or other sensitive data.
