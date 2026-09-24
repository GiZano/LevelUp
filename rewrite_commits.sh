#!/bin/bash
git filter-branch -f --msg-filter '
  sed \
  -e "s/feat: force inject new default categories and allow editing category target hours/feat: force inject new default categories and allow editing category target hours/g" \
  -e "s/📅 feat: Weekly Planner (Fase 2)/feat: Weekly Planner (Phase 2)/g" \
  -e "s/🏔️ feat: MVP Vette e Campi (Fase 1)/feat: MVP Peaks and Camps (Phase 1)/g" \
  -e "s/🏔️ init: scaffold progetto LevelUp (Expo SDK 57 + TypeScript)/init: scaffold LevelUp project (Expo SDK 57 + TypeScript)/g"
'
