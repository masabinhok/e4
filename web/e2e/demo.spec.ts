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

  // Wait for the line to load; clicks before that are lost to a state reset.
  await expect(page.getByText("0/19")).toBeVisible();
  const next = page.getByRole("button", { name: "→ Next" });
  for (let i = 1; i <= 7; i++) {
    await next.click();
    await expect(page.getByText(`${i}/19`)).toBeVisible();
  }

  if (process.env.CAPTURE) {
    await page.screenshot({ path: "../docs/screenshot-lesson.png" });
  }
});
