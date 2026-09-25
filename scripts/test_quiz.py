"""Browser checks. Install Playwright locally: pip install --target .test-tools playwright"""
from pathlib import Path
import sys

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / '.test-tools'))
from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 1100}, device_scale_factor=1)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto((root / 'index.html').as_uri() + '#study')
    page.emulate_media(reduced_motion='reduce')
    assert page.locator('#study-panel').is_visible()
    assert page.locator('#quiz-panel').is_hidden()
    assert page.locator('.word-card').count() == 16
    assert page.evaluate('terms.every(term => STUDY_WORDS.some(entry => entry.word.includes(term)))')
    assert page.locator('.word-meaning:visible').count() == 16
    page.get_by_role('button', name='Cover meanings', exact=True).click()
    assert page.locator('.word-meaning:visible').count() == 0
    page.get_by_role('button', name='Reveal meaning', exact=True).first.focus()
    page.keyboard.press('Enter')
    assert page.locator('.word-meaning:visible').count() == 1
    page.get_by_role('button', name='Cover meaning', exact=True).click()
    assert page.locator('.word-meaning:visible').count() == 0
    # Printing must include definitions, even when covered onscreen.
    page.emulate_media(media='print')
    assert page.locator('.word-meaning:visible').count() == 16
    assert page.locator('#quiz-panel').is_hidden()
    page.emulate_media(media='screen')
    assert page.locator('.word-meaning:visible').count() == 0
    page.get_by_role('button', name='Show all meanings').click()
    page.locator('.study-recall summary').first.click()
    assert page.locator('.study-recall details').first.locator('p').is_visible()
    artifacts = root / 'test-artifacts'
    artifacts.mkdir(exist_ok=True)
    page.locator('#study-title').scroll_into_view_if_needed()
    page.screenshot(path=str(artifacts / 'study-desktop.png'))
    page.set_viewport_size({'width': 390, 'height': 844})
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.locator('#study-title').scroll_into_view_if_needed()
    page.screenshot(path=str(artifacts / 'study-mobile.png'))
    page.set_viewport_size({'width': 1440, 'height': 1100})
    page.locator('#start-quiz').click()
    expect(page.locator('#quiz-panel')).to_be_visible()
    page.locator('#answers .answer').first.wait_for()
    assert page.locator('#answers .answer').count() == 4
    assert page.locator('#next-button').is_disabled()
    assert page.locator('#term').inner_text() == 'ורמינהו'
    artifacts = root / 'test-artifacts'
    artifacts.mkdir(exist_ok=True)
    page.screenshot(path=str(artifacts / 'desktop.png'), full_page=True)

    correct_answers = page.evaluate('QUESTIONS.map(q => q.correct)')
    # Wrong answers yield zero; correct answers yield exactly ten.
    for i, answer in enumerate(correct_answers):
        chosen = (answer + 1) % 4 if i == 0 else answer
        page.locator('#answers .answer').nth(chosen).click()
        page.locator('#next-button').click()
        assert page.locator('#score').inner_text() == str(i * 10)
        assert page.locator('#answers .answer:disabled').count() == 4
        assert page.locator('#answers .answer.correct').count() == 1
        if i == 1:
            # Study visits and browser Back preserve the checked answer and points.
            page.locator('#study-nav').click()
            expect(page.locator('#study-panel')).to_be_visible()
            page.go_back()
            expect(page.locator('#quiz-panel')).to_be_visible()
            assert page.locator('#score').inner_text() == '10'
            assert page.locator('#answers .answer:disabled').count() == 4
            assert page.locator('#feedback').is_visible()
        # Calling the scoring function again must not award duplicate points.
        page.evaluate('checkAnswer()')
        assert page.locator('#score').inner_text() == str(i * 10)
        page.locator('#next-button').click()
    assert '100 / 110 points' in page.locator('.result-score').inner_text()
    assert 'First round: 10 of 11 correct.' in page.locator('.result-summary').inner_text()
    page.locator('#study-nav').click()
    page.locator('#quiz-nav').click()
    expect(page.locator('#result-view')).to_be_visible()
    page.get_by_role('button', name='Practise missed questions').click()
    assert page.locator('#question-number').inner_text() == 'PRACTICE 01 / 1'
    # Repeated mistakes remain eligible for practice without affecting points.
    page.locator('#answers .answer').nth(0).click()
    page.locator('#next-button').click()
    page.locator('#next-button').click()
    assert page.locator('#score').inner_text() == '100'
    page.get_by_role('button', name='Practise missed questions').click()
    page.locator('#answers .answer').nth(correct_answers[0]).click()
    page.locator('#next-button').click()
    assert page.locator('#score').inner_text() == '110'
    page.locator('#next-button').click()
    assert page.get_by_role('button', name='Practise missed questions').count() == 0
    assert 'First round: 10 of 11 correct.' in page.locator('.result-summary').inner_text()
    page.get_by_role('button', name='Start a new quest').click()
    assert page.locator('#score').inner_text() == '0'
    assert page.locator('#next-button').is_disabled()

    page.set_viewport_size({'width': 390, 'height': 844})
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.screenshot(path=str(artifacts / 'mobile.png'), full_page=True)
    # Native buttons support keyboard selection and submission.
    page.locator('#answers .answer').nth(1).focus()
    page.keyboard.press('Enter')
    page.locator('#next-button').focus()
    page.keyboard.press('Enter')
    assert page.locator('#score').inner_text() == '10'
    assert page.locator('#feedback').is_visible()
    # Parsing exercise: real image, both boundaries, feedback and separate locks.
    page.locator('#parse-nav').click()
    expect(page.locator('#parse-panel')).to_be_visible()
    assert page.locator('#quiz-panel').is_hidden()
    assert page.locator('#daf-image').evaluate('(img) => img.complete && img.naturalWidth === 1024')
    assert page.locator('#parse-score').inner_text() == '0'
    page.locator('#parse-lock').click()
    assert 'Too few words' in page.locator('#parse-feedback').inner_text()
    def select_range(start, end):
        page.locator('#parse-start').fill(str(start))
        page.locator('#parse-end').fill(str(end))
    select_range(0, 12)
    page.locator('#parse-lock').click()
    assert 'Too many words' in page.locator('#parse-feedback').inner_text()
    select_range(1, 12)
    page.locator('#parse-lock').click()
    assert 'wrong place' in page.locator('#parse-feedback').inner_text()
    select_range(0, 11)
    page.locator('#parse-lock').click()
    assert page.locator('#parse-score').inner_text() == '10'
    assert page.locator('#daf-overlay .daf-question').count() == 12
    page.evaluate("document.getElementById('parse-lock').click()")
    assert page.locator('#parse-score').inner_text() == '10'
    page.locator('#parse-next').click()
    select_range(12, 15)
    page.locator('#parse-lock').click()
    assert 'Too few words' in page.locator('#parse-feedback').inner_text()
    assert 'supporting statement' in page.locator('#parse-feedback').inner_text()
    select_range(11, 24)
    page.locator('#parse-lock').click()
    assert 'Too many words' in page.locator('#parse-feedback').inner_text()
    select_range(12, 25)
    page.locator('#parse-lock').click()
    assert 'Too many words' in page.locator('#parse-feedback').inner_text()
    select_range(12, 24)
    page.locator('#parse-lock').click()
    assert page.locator('#parse-score').inner_text() == '20'
    assert page.locator('#daf-overlay .daf-answer').count() == 13
    assert page.locator('#parse-review').is_visible()
    page.locator('#study-nav').click()
    page.locator('#parse-nav').click()
    expect(page.locator('#parse-panel')).to_be_visible()
    assert page.locator('#parse-score').inner_text() == '20'
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.locator('#daf-focus').click()
    page.locator('#daf-viewport').scroll_into_view_if_needed()
    page.screenshot(path=str(artifacts / 'parse-mobile.png'))
    page.set_viewport_size({'width': 1440, 'height': 1100})
    page.locator('#daf-focus').click()
    page.locator('#parse-title').scroll_into_view_if_needed()
    page.screenshot(path=str(artifacts / 'parse-desktop.png'))
    page.locator('#daf-full').click()
    assert page.locator('#daf-stage').evaluate('(el) => el.clientWidth < 1300')
    page.locator('#parse-reset').click()
    assert page.locator('#parse-score').inner_text() == '0'
    page.locator('#parse-end').focus()
    page.keyboard.press('ArrowRight')
    assert page.locator('#parse-end').input_value() == '1'
    # Crossing endpoints always yields an ordered, nonempty selection.
    page.locator('#parse-start').fill('20')
    assert page.locator('#parse-end').input_value() == '20'
    page.locator('#parse-end').fill('3')
    assert page.locator('#parse-start').input_value() == '3'
    page.locator('#quiz-nav').click()
    expect(page.locator('#quiz-panel')).to_be_visible()
    assert page.locator('#score').inner_text() == '10'
    page.locator('#parse-nav').click()
    expect(page.locator('#parse-panel')).to_be_visible()
    page.locator('#parse-quiz-choice').select_option('1')
    assert 'Two exchanges' in page.locator('#parse-quiz-description').inner_text()
    assert page.locator('#parse-score').inner_text() == '0'
    new_steps = page.evaluate('PARSE_STEPS.map(s => [s.start, s.end])')
    assert len(new_steps) == 4
    assert page.evaluate('DAF_WORDS.every(w => w[1] < w[2] && w[1] >= 0 && w[2] <= 1024)')
    for i, (start, end) in enumerate(new_steps):
        select_range(start, end - 1)
        page.locator('#parse-lock').click()
        assert 'Too few words' in page.locator('#parse-feedback').inner_text()
        select_range(start, end + 1)
        page.locator('#parse-lock').click()
        assert 'Too many words' in page.locator('#parse-feedback').inner_text()
        select_range(start, end)
        page.locator('#parse-lock').click()
        assert page.locator('#parse-score').inner_text() == str((i + 1) * 10)
        page.evaluate("document.getElementById('parse-lock').click()")
        assert page.locator('#parse-score').inner_text() == str((i + 1) * 10)
        if i == 1:
            page.locator('#parse-quiz-choice').select_option('0')
            assert page.locator('#parse-start').input_value() == '3'
            page.locator('#parse-quiz-choice').select_option('1')
            assert page.locator('#parse-score').inner_text() == '20'
            assert page.locator('#parse-next').is_visible()
        if i < 3:
            page.locator('#parse-next').click()
    assert page.locator('#parse-review').is_visible()
    assert page.locator('#parse-next').is_hidden()
    assert page.locator('#daf-overlay .daf-question').count() == sum(e-s+1 for s,e in [new_steps[0],new_steps[2]])
    page.locator('#daf-focus').click()
    page.locator('#daf-viewport').scroll_into_view_if_needed()
    page.screenshot(path=str(artifacts / 'parse-next-desktop.png'))
    page.set_viewport_size({'width': 390, 'height': 844})
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.locator('#parse-reset').click()
    assert page.locator('#parse-score').inner_text() == '0'
    assert page.locator('#parse-step-count').inner_text() == 'STEP 1 OF 4 · QUESTION'
    page.locator('#parse-quiz-choice').select_option('2')
    assert 'Objection, answer & support' in page.locator('#parse-quiz-description').inner_text()
    assert page.locator('#parse-score').inner_text() == '0'
    assert page.locator('#parse-step-count').inner_text() == 'STEP 1 OF 3 · QUESTION'
    third_steps = page.evaluate('PARSE_STEPS.map(s => [s.start, s.end])')
    assert page.evaluate('DAF_WORDS.every(w => w[1] < w[2] && w[3] + 23 <= 1551)')
    # Check the editorial endpoints, including the attribution crossing a line.
    sections = page.evaluate('PARSE_STEPS.map(s => parseText(s.start, s.end))')
    assert sections[0].startswith('מיתיבי מעות לא יוכל לתקון')
    assert sections[0].endswith('ולא נמנה עמהם')
    assert sections[1] == 'א״ר יצחק א״ר יוחנן הכא במאי עסקינן שבטל במזיד'
    assert sections[2] == 'אמר רב אשי דיקא נמי דקתני בטל ולא קתני טעה ש״מ'
    for i, (start, end) in enumerate(third_steps):
        select_range(start, end - 1)
        page.locator('#parse-lock').click()
        assert 'Too few words' in page.locator('#parse-feedback').inner_text()
        select_range(start, end + 1)
        page.locator('#parse-lock').click()
        assert 'Too many words' in page.locator('#parse-feedback').inner_text()
        select_range(start + 1, end + 1)
        page.locator('#parse-lock').click()
        assert 'wrong place' in page.locator('#parse-feedback').inner_text()
        select_range(start, end)
        page.locator('#parse-lock').click()
        assert page.locator('#parse-score').inner_text() == str((i + 1) * 10)
        page.evaluate("document.getElementById('parse-lock').click()")
        assert page.locator('#parse-score').inner_text() == str((i + 1) * 10)
        if i == 1:
            assert page.locator('#parse-next').inner_text() == 'Now find the support →'
            page.locator('#parse-quiz-choice').select_option('1')
            assert page.locator('#parse-score').inner_text() == '0'
            page.locator('#parse-quiz-choice').select_option('2')
            assert page.locator('#parse-score').inner_text() == '20'
        if i < 2:
            page.locator('#parse-next').click()
    assert page.locator('#parse-next').is_hidden()
    assert page.locator('#parse-review').is_visible()
    assert page.locator('#daf-overlay .daf-support').count() == 11
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.set_viewport_size({'width':1440,'height':1100})
    page.locator('#daf-focus').click()
    page.locator('#daf-viewport').scroll_into_view_if_needed()
    page.screenshot(path=str(artifacts / 'parse-third-desktop.png'))
    page.locator('#parse-reset').click()
    assert page.locator('#parse-score').inner_text() == '0'
    assert page.locator('#parse-step-count').inner_text() == 'STEP 1 OF 3 · QUESTION'
    # Roadmap, durable progress, replay without point farming, and resume.
    page.locator('#roadmap-nav').click()
    expect(page.locator('#roadmap-panel')).to_be_visible()
    expect(page.locator('.path-card')).to_have_count(8)
    expect(page.locator('.path-card.done')).to_have_count(5)
    expect(page.locator('.path-points strong')).to_have_text('200')
    page.reload()
    expect(page.locator('#roadmap-panel')).to_be_visible()
    expect(page.locator('.path-card.done')).to_have_count(5)
    expect(page.locator('.path-points strong')).to_have_text('200')
    page.locator('.path-card[data-path-index="4"]').get_by_role('button').click()
    expect(page.locator('#parse-panel')).to_be_visible()
    assert page.locator('#parse-quiz-choice').input_value() == '2'
    select_range(0, third_steps[0][1])
    page.locator('#parse-lock').click()
    page.reload()
    expect(page.locator('#parse-score')).to_have_text('10')
    assert page.locator('#parse-next').is_visible()
    page.locator('#roadmap-nav').click()
    expect(page.locator('.path-points strong')).to_have_text('200')
    page.screenshot(path=str(artifacts / 'roadmap-desktop.png'), full_page=True)
    page.set_viewport_size({'width':390,'height':844})
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.screenshot(path=str(artifacts / 'roadmap-mobile.png'), full_page=True)
    # Default landing is the learning path, and malformed storage cannot break it.
    page.add_init_script("localStorage.setItem('talmud-academy-progress-v1', '{bad json')")
    page.goto((root / 'index.html').as_uri())
    page.reload()
    expect(page.locator('#roadmap-panel')).to_be_visible()
    expect(page.locator('.path-card.done')).to_have_count(0)
    page.locator('#path-resume').click()
    expect(page.locator('#study-panel')).to_be_visible()
    assert not errors, errors
    browser.close()
    print('Passed: study vocabulary coverage, reveal controls, print definitions, study/quiz navigation and preserved progress, content, scoring, duplicate prevention, feedback, completion, repeated practice, restart, keyboard, mobile overflow, and browser errors.')
