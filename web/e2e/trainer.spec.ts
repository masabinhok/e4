import { expect, Page, test } from "@playwright/test";

// Needs the seeded openings (npm --prefix ../api run seed).
async function demo(page: Page) {
  await page.goto("/auth/login");
  await page.getByRole("button", { name: "Try the demo, no signup" }).click();
  await page.waitForURL("**/lessons");
}
const tap = async (page: Page, from: string, to: string) => {
  await page.locator(`[data-square="${from}"]`).click();
  await page.locator(`[data-square="${to}"]`).click();
};

test("practice: the opponent replies, a wrong move is flagged, the right one advances", async ({
  page,
}) => {
  await demo(page);
  await page.goto("/lessons/carokann");
  await page.getByLabel("Line").selectOption({ index: 0 });
  await page.getByRole("radio", { name: "Practice" }).click();

  await expect(page.getByText("Your move.")).toBeVisible(); // after the opponent's 1.e4
  await tap(page, "e7", "e5");
  await expect(page.getByText("Not the move in this line")).toBeVisible();
  await tap(page, "c7", "c6");
  await expect(page.locator('[aria-current="step"]')).toHaveText(/d4/); // opponent replied 2.d4
});

test("quiz: a white line played from memory completes with no mistakes", async ({
  page,
}) => {
  await demo(page);
  await page.goto("/lessons/jobava");
  await page.getByLabel("Line").selectOption({ label: "Jobava Gambit" });
  await page.getByRole("radio", { name: "Quiz" }).click();

  for (const [from, to] of [
    ["d2", "d4"],
    ["b1", "c3"],
    ["c1", "f4"],
    ["e2", "e4"],
    ["d4", "d5"],
  ]) {
    await expect(page.getByText("Your move.")).toBeVisible();
    await tap(page, from, to);
  }
  await expect(page.getByText("Line complete with no mistakes.")).toBeVisible();
});

test("PGNs: a full PGN loads and saves", async ({ page }) => {
  await demo(page);
  await page.goto("/custom");
  await page
    .getByLabel("PGN or moves")
    .fill('[Event "Test"]\n\n1. e4 {main} c6 2. d4 d5 1/2-1/2');
  await page.getByRole("button", { name: "Load" }).click();
  await expect(page.getByRole("list", { name: "Moves" })).toContainText("d5");
  await page.getByLabel("Name").fill("Caro-Kann start");
  await page.getByRole("button", { name: "Save PGN" }).click();
  await expect(page.getByText("Saved to your PGNs.")).toBeVisible();
});
