# Persistence Options

This document outlines approaches considered for storing league data beyond the in-memory mock data used during development.

## 1. Simple Backend

A lightweight backend could be created using Node.js and Express or a similar framework. Data could be stored in a small database like SQLite or as JSON files. The backend would expose REST endpoints for clubs, players and tournaments. Pros of this approach include centralised data management and easier multi-user synchronisation. However, it requires hosting and more setup to run locally.

## 2. Browser IndexedDB

Another option is to keep data entirely in the browser using IndexedDB. Libraries such as Dexie provide a convenient wrapper. Data is stored on the client and persists between page reloads. This is easy to set up and works offline but does not synchronise across devices unless additional server code is added.

## Decision

For now the project will store league data with **IndexedDB** so changes survive page refreshes without needing a backend. A future backend can still be added if multi-device sync becomes necessary.
