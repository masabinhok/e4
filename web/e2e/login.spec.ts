import { expect, test } from "@playwright/test";

test("a wrong password shows an error and stays on the login page", async ({
  page,
}) => {
  await page.goto("/auth/login");
  await page.getByLabel("Email").fill("nobody@example.com");
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByText("Invalid email or password")).toBeVisible();
  await expect(page).toHaveURL(/\/auth\/login$/);
});
