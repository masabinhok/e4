import { expect, Page, test } from "@playwright/test";

// Every page must fit the screen at phone, tablet and desktop widths, and the
// redesigned pages must have tap targets of at least 44 px. The board pages
// (lesson, record, custom) only get the overflow check until their redesign.
const widths = [375, 768, 1280];
const publicPages = ["/", "/auth/login", "/auth/signup", "/credit"];
const appPages = ["/lessons", "/profile"];
const boardPages = ["/lessons/carokann", "/record", "/custom"];

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
      .filter((el) => el.offsetParent !== null && !el.closest("p"))
      .filter((el) => el.getBoundingClientRect().height < 44)
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
    for (const path of boardPages) await check(page, path, width, false);
  });
}
