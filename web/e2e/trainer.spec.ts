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

test("drill: the opponent replies, a wrong move shows the right one, which then advances", async ({
  page,
}) => {
  await demo(page);
  await page.goto("/lessons/carokann");
  await page.getByLabel("Line").selectOption({ index: 0 });
  await page.getByRole("radio", { name: "Drill" }).click();

  await expect(page.getByText("Your move.")).toBeVisible(); // after the opponent's 1.e4
  await tap(page, "e7", "e5");
  await expect(page.getByText("Not e5. This line plays c6.")).toBeVisible();
  await tap(page, "c7", "c6");
  await expect(page.locator('[aria-current="step"]')).toHaveText(/d4/); // opponent replied 2.d4
});

test("drill: a clean run schedules the line and it shows up in progress", async ({
  page,
}) => {
  await demo(page);
  await page.goto("/lessons/jobava");
  await page.getByLabel("Line").selectOption({ label: "Punishing 4...Nc6" });
  await page.getByRole("radio", { name: "Drill" }).click();

  // 1.d4 d5 2.Nc3 Nf6 3.Bf4 c5 4.e3 Nc6 5.Nb5 e5 6.Bxe5 Nxe5 7.dxe5
  for (const [from, to] of [
    ["d2", "d4"],
    ["b1", "c3"],
    ["c1", "f4"],
    ["e2", "e3"],
    ["c3", "b5"],
    ["f4", "e5"],
    ["d4", "e5"],
  ]) {
    await expect(page.getByText("Your move.")).toBeVisible();
    await tap(page, from, to);
  }
  await expect(
    page.getByText("Clean run. You'll see this line again tomorrow."),
  ).toBeVisible();

  await page.goto("/review");
  await expect(page.getByText("All caught up.")).toBeVisible();
  await page.goto("/");
  await expect(page.getByText("1 / 9 learned")).toBeVisible();
});

test("learn: each move comes with its note", async ({ page }) => {
  await demo(page);
  await page.goto("/lessons/carokann");
  await page.getByLabel("Line").selectOption({ index: 0 });
  await expect(page.getByText("White grabs space with 3.e5")).toBeVisible(); // the line's introduction
  const next = page.getByRole("button", { name: "Next", exact: true });
  await next.click();
  await next.click();
  await expect(
    page.getByText("Prepares ...d5, so Black can challenge"),
  ).toBeVisible();
  await expect(
    page.getByText("Caro-Kann Defense: Advance Variation, Short Variation"),
  ).toBeVisible();
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
