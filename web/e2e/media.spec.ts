import { expect, Page, test } from "@playwright/test";

// Records the README walkthrough and screenshots. Skipped unless MEDIA=1:
//   MEDIA=1 npx playwright test e2e/media.spec.ts
// then convert test-results/media/*.webm to docs/media/walkthrough.gif (see README).
test.skip(!process.env.MEDIA, "only when recording README media");
test.setTimeout(180_000);

const pause = (page: Page, ms = 900) => page.waitForTimeout(ms);
const tap = async (page: Page, from: string, to: string) => {
  await page.locator(`[data-square="${from}"]`).click();
  await pause(page, 250);
  await page.locator(`[data-square="${to}"]`).click();
};

test("walkthrough", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: "test-results/media",
      size: { width: 1280, height: 720 },
    },
  });
  const page = await context.newPage();
  await page.goto("/");
  await pause(page, 3500); // the hero board plays a few moves
  await page.getByRole("button", { name: "Try the demo, no signup" }).click();
  await page.waitForURL("**/lessons");
  await page.goto("/lessons/carokann");
  await page.getByLabel("Line", { exact: true }).selectOption({ index: 0 });
  await pause(page, 1500);

  // Learn: step through with the notes.
  const next = page.getByRole("button", { name: "Next", exact: true });
  for (let i = 0; i < 6; i++) {
    await next.click();
    await pause(page, 1300);
  }
  await page.screenshot({ path: "../docs/media/learn.png" });

  // Drill: one wrong move to show the correction, then the line from memory.
  await page.getByRole("radio", { name: "Drill" }).click();
  await expect(page.getByText("Your move.")).toBeVisible();
  await tap(page, "e7", "e5");
  await expect(page.getByText("Not e5. This line plays c6.")).toBeVisible();
  await pause(page, 2200);
  await page.screenshot({ path: "../docs/media/drill-correction.png" });
  await tap(page, "c7", "c6"); // the correction is still showing, so no "Your move." yet
  for (const [from, to] of [
    ["d7", "d5"],
    ["c8", "f5"],
    ["e7", "e6"],
    ["c6", "c5"],
    ["b8", "c6"],
    ["c5", "d4"],
    ["g8", "e7"],
  ]) {
    await expect(page.getByText("Your move.")).toBeVisible();
    await tap(page, from, to);
    await pause(page, 500);
  }
  await expect(
    page.getByText(/You'll see this line again tomorrow/),
  ).toBeVisible();
  await pause(page, 2500);

  // Review and the dashboard.
  await page.getByRole("link", { name: "Review" }).first().click();
  await pause(page, 2000);
  await page.goto("/");
  await expect(page.getByText("1 / 12 learned")).toBeVisible();
  await pause(page, 2500);
  await context.close();
});

test("mobile screenshot", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto("/auth/login");
  await page.getByRole("button", { name: "Try the demo, no signup" }).click();
  await page.waitForURL("**/lessons");
  await page.goto("/lessons/jobava");
  await page
    .getByLabel("Line", { exact: true })
    .selectOption({ label: "Punishing 4...Nc6" });
  const next = page.getByRole("button", { name: "Next", exact: true });
  for (let i = 0; i < 9; i++) await next.click();
  await pause(page, 800);
  await page.screenshot({ path: "../docs/media/mobile-lesson.png" });
  await context.close();
});

test("social preview", async ({ browser }) => {
  // 1280x640 is GitHub's social preview size; reduced motion stills the hero board.
  const context = await browser.newContext({
    viewport: { width: 1280, height: 640 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "../docs/media/social-preview.png" });
  await context.close();
});
