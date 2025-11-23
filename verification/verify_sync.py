from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_rased_sync(page: Page):
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")

    # 1. Check Sidebar is Read-Only (Summary)
    expect(page.locator("aside input")).to_have_count(0)

    # 2. Fill Section A & B in Main Content
    # Section A: Établissement
    page.get_by_role("button", name="Élémentaire").click()

    # Manual School
    page.get_by_label("École").select_option("__AUTRE__")
    page.get_by_placeholder("Saisir le nom de l’école...").fill("École Test Sync")
    page.get_by_role("button", name="Valider").click()

    # Section B: Enseignant
    page.get_by_label("Nom / Prénom").fill("Prof Sync")
    page.get_by_placeholder("Ex. CE1, GS/CP...").fill("CM2")

    # 3. Verify Sidebar Update
    expect(page.locator("aside")).to_contain_text("Prof Sync")
    expect(page.locator("aside")).to_contain_text("École Test Sync")
    expect(page.locator("aside")).to_contain_text("CM2")

    # 4. Create New Student
    page.get_by_title("Ajouter un élève").click()

    # Verify Section A & B are pre-filled
    expect(page.get_by_label("Nom / Prénom")).to_have_value("Prof Sync")
    expect(page.get_by_placeholder("Ex. CE1, GS/CP...")).to_have_value("CM2")

    # 5. Verify Section C (Student) is unique
    # "Nom" is ambiguous (matches "Nom / Prénom"). Use "Nom *" or get by placeholder or exact.
    # The student name input has label "Nom *"
    page.get_by_label("Nom *", exact=True).fill("StudentTwo")

    # Switch back to Student 1
    page.locator("aside div").filter(has_text="Nouvel élève").first.click()

    # Verify Name is empty
    expect(page.get_by_label("Nom *", exact=True)).to_have_value("")

    # Verify Teacher info is still there
    expect(page.get_by_label("Nom / Prénom")).to_have_value("Prof Sync")

    page.screenshot(path="verification/sync_test.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_rased_sync(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
