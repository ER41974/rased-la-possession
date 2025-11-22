from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_rased_app(page: Page):
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

    page.goto("http://localhost:5173")

    # Wait for ANY content to load first
    page.wait_for_load_state("networkidle")

    # Check if the header is present ( Layout component )
    expect(page.get_by_text("RASED")).to_be_visible()

    # Check if the first step is present
    expect(page.get_by_role("heading", name="Établissement & élève")).to_be_visible()

    # Verify Step 1 Content
    expect(page.get_by_text("Type d’école")).to_be_visible()

    # Fill some data
    page.get_by_role("button", name="Élémentaire").click()

    # Playwright's fuzzy matching causes "Nom *" to match "Prénom *" for some reason (maybe substring?).
    # But we can use get_by_role with exact=True for the name
    page.get_by_role("textbox", name="Nom *", exact=True).fill("Doe")
    page.get_by_role("textbox", name="Prénom *", exact=True).fill("John")

    # Wait a bit for auto-save to trigger (debounce is 500ms)
    time.sleep(1)

    # Let's take a screenshot of the filled form
    page.screenshot(path="verification/rased_form.png")

    # Navigate to next step
    # We need to fill required fields first
    page.get_by_label("École *").select_option(index=1) # Select first school
    # Date is required
    page.locator('input[type="date"]').first.fill("2023-10-10")
    # Deja maintenu
    page.get_by_role("button", name="Non").click()

    # Student details
    page.locator('input[type="date"]').nth(1).fill("2015-01-01") # Birthdate
    page.get_by_label("Sexe *").select_option("M")
    page.get_by_label("Niveau *", exact=True).select_option("CM1")
    page.get_by_label("Enseignant(e) *").fill("M. Teacher")

    # Click Next
    page.get_by_role("button", name="Suivant").click()

    # Verify Step 2
    expect(page.get_by_role("heading", name="Responsable légal 1")).to_be_visible()

    # Take another screenshot
    page.screenshot(path="verification/rased_step2.png")

    # Click Reset to verify modal
    # Mobile button might be hidden, use the desktop one or find by text
    # The button text is "Nouvelle demande"
    page.get_by_role("button", name="Nouvelle demande").click()
    expect(page.get_by_text("Êtes-vous sûr de vouloir effacer")).to_be_visible()
    page.screenshot(path="verification/rased_modal.png")

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
