# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`index.html` is a single-file, no-build web app (React 18 + Babel standalone + Tailwind via CDN) that designs a personalised reading roadmap from a user's interests. Open it directly in a browser; there are no build or test commands.

## Architecture (all inside `index.html`)

- `BOOKS` / `TOPICS`: curated catalog. Each book has difficulty `d` (1-3), `core` (key skill) and `mission` (practice task). Topics (incl. humanities, literature, science) list book keys and keywords used by `matchTopics` for auto-recommendation.
- `generatePlan(profile)`: interleaves books from selected topics, filters/sorts by difficulty level, and distributes them across weeks.
- Tabs: `DesignTab` (profile input) → `RoadmapTab` (view/edit plan) → `WorksheetTab` (1-1-1 per book) → `ReviewTab` (weekly review).
- State persists to `localStorage` under `reading_planner_v2` (reads/writes are wrapped in try/catch).
- To add a new interest area, add books to `BOOKS` and a topic entry to `TOPICS`.
