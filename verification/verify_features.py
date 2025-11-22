from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_rased_app(page: Page):
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")

    # 1. Check Header
    expect(page.get_by_text("RASED")).to_be_visible()

    # 2. Navigate freely to "Comportement" (Step 5 - index 4)
    # The stepper buttons have the title text
    page.get_by_role("button", name="Comportement").click()

    # Verify we are on Comportement page
    expect(page.get_by_role("heading", name="Comportement dans la classe")).to_be_visible()

    # 3. Verify New Items and Scales
    # Check for "Autonomie" with standard scale (Très satisfaisant, etc.)
    expect(page.get_by_text("Autonomie")).to_be_visible()
    expect(page.get_by_text("Très satisfaisant").first).to_be_visible()

    # Check for Relations (Frequency + Quality)
    expect(page.get_by_text("Relation aux pairs")).to_be_visible()
    expect(page.get_by_text("Fréquence").first).to_be_visible()
    expect(page.get_by_text("Qualité").first).to_be_visible()
    expect(page.get_by_text("Excellente").first).to_be_visible()

    # 4. Navigate to Apprentissages
    page.get_by_role("button", name="Apprentissages").click()
    expect(page.get_by_role("heading", name="Apprentissages scolaires")).to_be_visible()

    # Check for "Connaissance du code" and Mastery Stages
    expect(page.get_by_text("Connaissance du code")).to_be_visible()
    expect(page.get_by_text("Stade de maîtrise du code")).to_be_visible()
    expect(page.get_by_text("Identification des lettres uniquement")).to_be_visible()

    # Check for Fluence
    expect(page.get_by_text("Fluence de lecture")).to_be_visible()

    # 5. Navigate to Remarques
    page.get_by_role("button", name="Remarques & besoins").click()
    expect(page.get_by_role("heading", name="Besoins prioritaires")).to_be_visible()
    expect(page.get_by_label("Besoin 1")).to_be_visible()

    # Screenshot
    page.screenshot(path="verification/rased_new_features.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_rased_app(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
