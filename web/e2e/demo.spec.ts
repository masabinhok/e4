import { expect, test } from "@playwright/test";

// Needs the seeded openings: `npm --prefix ../api run seed` first.
test("a visitor can try the demo and step through a seeded lesson", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Try the demo, no signup" }).click();
  await page.waitForURL("**/lessons");

  // Both auth cookies must survive the /api proxy as first-party cookies.
  const cookies = await page.context().cookies();
  expect(cookies.map((c) => c.name).sort()).toEqual(
    expect.arrayContaining(["accessToken", "refreshToken"]),
  );
  expect(cookies.every((c) => c.sameSite === "Lax")).toBe(true);

  await page.locator('a[href="/lessons/carokann"]').click();
  await expect(
    page.getByRole("heading", { name: "Caro-Kann Defense" }),
  ).toBeVisible();

  const next = page.getByRole("button", { name: "Next", exact: true });
  for (let i = 0; i < 7; i++) await next.click();
  // 1.e4 c6 2.d4 d5 3.e5 Bf5 4.Nf3: the 7th move is the current one.
  await expect(page.locator('[aria-current="step"]')).toHaveText("Nf3");

  if (process.env.CAPTURE) {
    await page.screenshot({ path: "../docs/screenshot-lesson.png" });
  }
});

test("leaving a page mid-request doesn't log you out", async ({ page }) => {
  await page.goto("/auth/login");
  await page.getByRole("button", { name: "Try the demo, no signup" }).click();
  await page.waitForURL("**/lessons");
  // Navigate away at once, aborting the page's in-flight session check.
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Welcome to the demo" }),
  ).toBeVisible();
});
