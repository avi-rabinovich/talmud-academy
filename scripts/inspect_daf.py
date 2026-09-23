from pathlib import Path
import sys
root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / '.test-tools'))
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    page = browser.new_page(viewport={'width': 1050, 'height': 300})
    page.goto((root / 'assets/berachot-26a.jpg').as_uri())
    print(page.locator('img').evaluate('(img) => [img.naturalWidth,img.naturalHeight]'))
    page.locator('img').evaluate('(img) => {img.style="position:absolute;max-width:none;width:1024px;height:1549px;max-height:none;left:0;top:-1400px"}')
    page.screenshot(path=str(root / 'test-artifacts/daf-detail.png'))
    browser.close()

