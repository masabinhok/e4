import { expect, Page, test } from "@playwright/test";

// Every page must fit the screen at phone, tablet and desktop widths, with tap
// targets of at least 44 px.
const widths = [375, 768, 1280];
const publicPages = ["/", "/auth/login", "/auth/signup", "/credit"];
const appPages = [
  "/",
  "/review",
  "/lessons",
  "/profile",
  "/lessons/carokann",
  "/my-lines",
  "/record",
];

async function check(
  page: Page,
  path: string,
  width: number,
  targets: boolean,
) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
  expect(new URL(page.url()).pathname, `${path} redirected`).toBe(path);
  if (process.env.CAPTURE) {
    await page.screenshot({
      path: `test-results/screens/${width}${path.replace(/\//g, "_") || "_home"}.png`,
      fullPage: true,
    });
  }

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - innerWidth,
  );
  expect(
    overflow,
    `${path} at ${width}px scrolls sideways`,
  ).toBeLessThanOrEqual(0);

  if (!targets) return;
  // Links inside running text are exempt (WCAG 2.5.8 inline exception).
  const small = await page.evaluate(() =>
    [
      ...document.querySelectorAll<HTMLElement>(
        "a, button, input, select, textarea",
      ),
    ]
      // Skip hidden elements, like the skip link (1 px until focused).
      .filter(
        (el) =>
          el.offsetParent !== null &&
          !el.closest("p") &&
          el.getBoundingClientRect().width > 1,
      )
      // A checkbox or slider is tapped through its label, so measure that.
      .filter(
        (el) => (el.closest("label") ?? el).getBoundingClientRect().height < 44,
      )
      .map(
        (el) =>
          `${el.tagName} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30)}"`,
      ),
  );
  expect(small, `${path} at ${width}px has small tap targets`).toEqual([]);
}

for (const width of widths) {
  test(`pages fit and are tappable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of publicPages) await check(page, path, width, true);

    await page.goto("/auth/login");
    await page.getByRole("button", { name: "Try the demo, no signup" }).click();
    await page.waitForURL("**/lessons");
    for (const path of appPages) await check(page, path, width, true);
  });
}
