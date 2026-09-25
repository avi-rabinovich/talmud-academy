"""Browser coverage for the remaining chapter-4 vocabulary and progress migration."""
from pathlib import Path
import sys
root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'.test-tools'))
from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    browser=p.chromium.launch(channel='msedge',headless=True)
    page=browser.new_page(viewport={'width':1440,'height':1100},reduced_motion='reduce')
    errors=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    # Simulate the previous public release's completed five-activity roadmap.
    page.add_init_script("""if (!localStorage.getItem('migration-seeded')) {
      localStorage.setItem('talmud-academy-progress-v1',JSON.stringify({version:1,completed:[true,true,true,true,true],best:[0,110,20,40,30]}));
      localStorage.setItem('migration-seeded','yes');
    }""")
    page.goto((root/'index.html').as_uri())
    expect(page.locator('.path-card')).to_have_count(8)
    expect(page.locator('.path-card.done')).to_have_count(5)
    expect(page.locator('.path-points strong')).to_have_text('200')
    assert page.locator('.path-card.current').get_attribute('data-path-index')=='5'
    page.locator('#path-resume').click()
    expect(page.locator('#words-panel')).to_be_visible()
    assert page.locator('#word-lesson-choice').input_value()=='0'
    assert page.evaluate('WORD_LESSONS.map(l=>l.questions.length)')==[19,24,19]
    assert page.evaluate('WORD_LESSONS.every(l=>l.questions.every(q=>q.options.length===4 && new Set(q.options).size===4 && q.correct>=0 && q.correct<4))')
    for lesson in range(3):
        page.locator('#word-lesson-choice').select_option(str(lesson))
        page.locator('#word-study summary').click()
        expect(page.locator('.vocabulary-card')).to_have_count([18,23,18][lesson])
        assert page.locator('#word-passage').inner_text()
        page.locator('#word-study summary').click()
        answers=page.evaluate('WORD_LESSONS[activeWordLesson].questions.map(q=>q.correct)')
        for i,correct in enumerate(answers):
            assert page.locator('#word-check').is_disabled()
            chosen=(correct+1)%4 if i==0 else correct
            page.locator('#word-options .answer').nth(chosen).click()
            page.locator('#word-check').click()
            expect(page.locator('#words-score')).to_have_text(str(i*10))
            assert page.locator('#word-options .answer:disabled').count()==4
            assert page.locator('#word-feedback').is_visible()
            if i==2:
                page.reload()
                expect(page.locator('#words-panel')).to_be_visible()
                assert page.locator('#word-lesson-choice').input_value()==str(lesson)
                expect(page.locator('#words-score')).to_have_text('20')
                assert page.locator('#word-options .answer:disabled').count()==4
            page.locator('#word-check').click()
        assert page.locator('#word-results').is_visible()
        expect(page.locator('#roadmap-continue button')).to_be_visible()
        page.get_by_role('button',name='Practise missed words').click()
        # Practice may repeat a mistake without losing points or awarding extras.
        page.locator('#word-options .answer').nth((answers[0]+1)%4).click()
        page.locator('#word-check').click()
        expect(page.locator('#words-score')).to_have_text(str((len(answers)-1)*10))
        page.locator('#word-check').click()
        page.get_by_role('button',name='Practise missed words').click()
        page.locator('#word-options .answer').nth(answers[0]).focus()
        page.keyboard.press('Enter')
        page.locator('#word-check').click()
        expect(page.locator('#words-score')).to_have_text(str(len(answers)*10))
        page.locator('#word-check').click()
        assert page.get_by_role('button',name='Practise missed words').count()==0
    page.locator('#roadmap-nav').click()
    expect(page.locator('.path-card.done')).to_have_count(8)
    expect(page.locator('.path-points strong')).to_have_text('820')
    page.reload()
    expect(page.locator('.path-points strong')).to_have_text('820')
    page.locator('.path-card[data-path-index="6"] button').click()
    assert page.locator('#word-lesson-choice').input_value()=='1'
    page.get_by_role('button',name='Start this word quiz again').click()
    expect(page.locator('#words-score')).to_have_text('0')
    artifacts=root/'test-artifacts'
    page.screenshot(path=str(artifacts/'words-desktop.png'),full_page=True)
    page.set_viewport_size({'width':390,'height':844})
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    page.screenshot(path=str(artifacts/'words-mobile.png'),full_page=True)
    page.locator('#roadmap-nav').click()
    expect(page.locator('.path-points strong')).to_have_text('820')
    # Completing the old quiz after a new quiz must put its actions in its own card.
    page.locator('#quiz-nav').click()
    for answer in page.evaluate('QUESTIONS.map(q=>q.correct)'):
        page.locator('#answers .answer').nth(answer).click()
        page.locator('#next-button').click()
        page.locator('#next-button').click()
    assert page.locator('#result-view').get_by_role('button',name='Start a new quest').is_visible()
    assert page.locator('#word-results').get_by_role('button',name='Start a new quest').count()==0
    assert not errors,errors
    browser.close()
    print('Passed: 62 questions, study lists, feedback, scoring, repeated practice, keyboard, reload, legacy progress migration, roadmap routing, replay best scores, and mobile layout.')
