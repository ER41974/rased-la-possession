from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_rased_session(page: Page):
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")

    # 1. Verify Sidebar and Teacher Info
    expect(page.get_by_role("heading", name="Enseignant")).to_be_visible()

    page.get_by_placeholder("Nom / Prénom").fill("Professeur Test")

    # 2. Rename Student 1
    expect(page.get_by_text("Établissement & élève").first).to_be_visible()

    # Use exact match for role to avoid "Nom *" matching "Prénom *" (Playwright fuzzy match issue)
    page.get_by_role("textbox", name="Nom *", exact=True).fill("Dupont")
    page.get_by_role("textbox", name="Prénom *", exact=True).fill("Jean")

    time.sleep(1)
    expect(page.get_by_text("Jean Dupont")).to_be_visible()

    # 3. Add New Student
    page.get_by_title("Ajouter un élève").click()
    expect(page.get_by_text("Nouvel élève")).to_be_visible()

    # Switch back to Jean Dupont
    page.get_by_text("Jean Dupont").click()
    expect(page.get_by_role("textbox", name="Nom *", exact=True)).to_have_value("Dupont")

    # Switch back to New Student
    page.get_by_text("Nouvel élève").click()
    expect(page.get_by_role("textbox", name="Nom *", exact=True)).to_have_value("")

    # 4. Export Session
    expect(page.get_by_role("button", name="Exporter la session")).to_be_visible()

    page.screenshot(path="verification/session_test.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_rased_session(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
