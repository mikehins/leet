# Math Quest — Development Plan

A LeetCode-style math game for elementary school students (~10 years old).

---

## Phase 1: Core Data Model

### 1.1 Problem Types & Difficulty
- [x] Create `ProblemType` model/enum: addition, subtraction, multiplication, division, word_problem
- [x] Define difficulty tiers: easy (1–2 digits), medium (2–3 digits), hard (3+ digits, multi-step)
- [x] Create `problems` table: type, difficulty, question_text, correct_answer, metadata (e.g. operands)

### 1.2 Users & Progress
- [x] Extend User model for child profiles (or keep single user per child)
- [x] Create `problem_attempts` table: user_id, problem_id, answer, correct, time_spent
- [x] Create `user_progress` / `achievements` for streaks, levels, badges

---

## Phase 2: Problem Generation

### 2.1 Deterministic Generation
- [x] Build `ProblemGenerator` service for arithmetic problems
- [x] Configurable ranges per type and difficulty
- [x] Word problem templates with variable substitution

### 2.2 AI-Assisted Generation (Laravel AI SDK)
- [ ] Use AI to generate word problems at appropriate reading level
- [ ] Optional: AI-generated hints when stuck
- [ ] Validate AI output before persisting

---

## Phase 3: Game Flow

### 3.1 Session & Routing
- [x] `/` — Landing / dashboard (stats, streak, next problem)
- [x] `/play` — Active problem session
- [ ] `/history` — Past attempts, accuracy by type
- [ ] `/achievements` — Badges, levels, milestones

### 3.2 Problem Display
- [x] React component: problem text, input field, submit
- [x] Immediate feedback (correct/incorrect)
- [ ] Optional: show work / step hints
- [x] Timer (optional, configurable)

### 3.3 Scoring & Progression
- [x] Points per correct answer (bonus for speed/streak)
- [ ] Level-up thresholds
- [ ] Unlock new problem types as they progress

---

## Phase 4: UX & Polish

### 4.1 Child-Friendly UI
- [ ] Bright, playful design (Tailwind)
- [ ] Large touch targets, readable fonts
- [ ] Celebratory feedback (animations, sounds)
- [ ] Avoid intimidating “wrong” messaging; use “try again” / “almost”

### 4.2 Gamification
- [ ] Daily streak counter
- [ ] Badges: first 10 correct, 7-day streak, master of [type]
- [ ] Optional: leaderboard (family-only or anonymous)

### 4.3 Parent/Guardian View (Optional)
- [ ] Simple dashboard: time spent, accuracy by type, weak areas
- [ ] Ability to adjust difficulty or focus areas

---

## Phase 5: Technical & Quality

### 5.1 Testing (Pest)
- [ ] Unit tests for `ProblemGenerator`
- [ ] Feature tests for play flow, scoring, progress
- [ ] Test AI integration with mocked responses

### 5.2 Performance & Security
- [ ] Rate limit problem generation / API calls
- [ ] Ensure no PII in AI prompts if using cloud providers

---

## Tech Stack (Installed)

| Tool        | Purpose                    |
|------------|----------------------------|
| Laravel 12 | Backend, auth, API          |
| Inertia    | SPA bridge                 |
| React      | UI components              |
| Tailwind v4| Styling                    |
| Pest       | Testing                    |
| Laravel AI | Problem generation, hints  |
| Laravel Boost | AI dev tooling          |

---

## Suggested Order

1. **Phase 1** — Data model and migrations
2. **Phase 2.1** — Deterministic problem generation
3. **Phase 3.1–3.2** — Basic play flow and UI
4. **Phase 4.1** — Child-friendly polish
5. **Phase 2.2** — AI generation (when ready)
6. **Phase 3.3, 4.2–4.3** — Gamification and parent view
