# Portfolio card: e4.learnchess

Every number here was measured, either in this repo's tests or with Lighthouse on a local production build. Re-check them before they go on a public page.

## One line

An opening trainer that teaches chess openings by playing them: annotated lines, drills from memory, and spaced-repetition review.

## Card

**e4.learnchess.** Learn chess openings by playing them, not watching them.

- Two annotated courses (Caro-Kann for Black, Jobava London for White), 21 lines. Every move you play is explained. Lines are drilled from memory and come back on a 1/3/7/14/30-day spaced-repetition schedule.
- Next.js 15 + NestJS 11 + MongoDB. JWT auth with rotating refresh tokens, served through a same-origin proxy so cookies are first-party and rate limits are per visitor.
- An optional AI coach (an open-weight model on Groq's free tier) jokes about your moves, but only builds on the checked notes, with a shared cache and a hard daily cap.
- 113 automated tests (33 API unit, 54 API end-to-end, 26 Playwright). Lighthouse mobile: accessibility 100 on every page measured. $0 hosting on Vercel, Render and Atlas free tiers.

Links: live demo https://e4-learnchess.vercel.app (one-click demo account) · code https://github.com/masabinhok/e4

## Case study (longer version)

**Problem.** Video courses are passive, and the good drilling tools cost money. I'm a club player (about 1200) and wanted to learn openings the way you learn vocabulary: see the line, play it from memory, and review it before you forget.

**What I built.** Each course is a set of lines stored as plain PGN files with a note on every move, so a chess player can review the content in a pull request. Three modes share one board:
- **Learn** steps through a line with the notes.
- **Drill** makes you play your side from memory. A wrong move shows the right one and why; if your move belongs to another line of the course, it says which one.
- **Review** brings lines back on a Leitner schedule: 1, 3, 7, 14, then 30 days, and back to tomorrow after any mistake.

**Design.** e4 has its own identity: a warm dark palette, Nunito and Inter, a hand-built logo, licensed piece sets (papercut, chessnut), and a sound set synthesised for the app. The original sounds turned out to be copied from chess.com and were replaced. Drills show ✓/✗ badges on the board and a coach panel that explains every move.

**AI coach.** "Ask the coach" sends only database facts to the model: the opening, the line, the move, the checked note, and the learner's wrong move if any. The browser can't send free text, so the key can't be abused as a chatbot. Replies are cached per situation and shared by everyone, a daily cap keeps it inside the free tier, and without a key or after an error the app shows the checked note.

**Content quality.** Tests replay every line in chess.js and check that each learner move has a note. They also compare every opening name with Lichess's open dataset by position; that check caught two of my own mislabels. A dev-only script asks Lichess's cloud engine about every learner move: 0 flags across the 21 lines.

**Engineering.**
- The app started as an unreviewed side project. The audit found:
  - any logged-in user could delete other users;
  - a database password was in public git history;
  - refresh tokens could be reused after rotation;
  - the profile showed made-up statistics;
  - there was no setup documentation.
- I fixed these in small, tested stages.
- The browser talks only to the Vercel domain. A Next.js route proxies `/api` to the NestJS API, so auth cookies are first-party (`SameSite=Lax`). It forwards the visitor's IP with a shared secret, so rate limits can't be spoofed.
- The UI was rebuilt mobile-first: bottom tabs, a board that sizes itself, tap-to-move. Playwright checks every page at 375, 768 and 1280 px for sideways scroll and 44 px tap targets.

**Numbers.**
- Tests: 33 API unit, 54 API end-to-end, 26 Playwright.
- Lighthouse 12, mobile (simulated throttling), performance / accessibility: landing 83 / 100, login 87 / 100, signed-in lesson 73 / 100. Best practices 100 on all three.
- Shared JavaScript: 103 kB.
- Hosting cost: $0.
- The free API instance sleeps when idle; the cold start measured during the audit was 52.6 s. [Confirm the 10-minute keep-alive ping is running before claiming the API stays warm.]

**What I'd do next.** The Slav and Italian courses (in progress), an engine for analysing your own games, and streaks and reminders.
