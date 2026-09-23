# Talmud Academy

Educational Talmud content for children around age 11 beginning Gemara, with some prior Mishnah learning.

## Initial scope

- Babylonian Talmud, Berachot chapter 4 (תפילת השחר).
- Start with a short passage and standard multiple-choice vocabulary questions.
- Emphasize words and phrases that signal questions, objections, answers, and supporting statements.
- Use English explanations with Hebrew/Aramaic source terms; this is an initial working assumption.

## First draft

[Berachot 26a: opening exchange](content/berachot-26a-opening-quiz.md)

## Editorial approach

- Distinguish a phrase's meaning from its function in the particular discussion.
- Use one correct answer and three plausible, clearly incorrect alternatives.
- Keep feedback brief and suitable for an 11-year-old.
- Keep linked sources and teacher notes with each quiz.
- Ancient source text and our original teaching explanations are separate from modern copyrighted translations and commentary. Check licensing before importing those materials.
- Drafts require knowledgeable educator review before publication.

## Run the quiz

Open `index.html` in a browser. No build step or app dependencies are needed. Alternatively, run `python -m http.server 8000` from this directory and visit http://localhost:8000.

The interface includes 11 questions, 10 points per correct answer, explanations, a highlighted source passage, progress, and practice for missed answers. Each question can earn points once per quest, including practice; the maximum is 110. Starting a new quest resets that attempt, while the roadmap retains the best score. Progress saves in this browser across reloads.

The site opens on **My learning path**, a five-activity roadmap: study, vocabulary, and three daf-parsing quizzes. It recommends the first incomplete activity and permits revisiting any activity. Study completion is self-reported using “I’ve studied — start the quiz”; finishing a vocabulary round completes its activity even if further practice is needed; parsing activities require every boundary to be correct. Best scores total 200 points and cannot be inflated by replaying. The roadmap and resumable activity state use versioned localStorage, with validation and graceful fallback when storage is unavailable. Progress does not sync between browsers or domains, and clearing site data removes it.

**Study the words** is a printable sheet with 16 vocabulary entries, an objection → answer → support guide, and self-check prompts. Students can cover all meanings and reveal individual definitions. Link directly to `index.html#study`, `index.html#quiz`, or `index.html#roadmap`. Study content lives in `study.js`; it remains an editorial draft for educator review.

`index.html`, `styles.css`, and `app.js` form the frontend. Fonts use Google Fonts with local fallbacks. No accounts, analytics, or student data are collected by the application.

After editing the Markdown question bank, run `python scripts/build_questions.py` to regenerate `questions.js`. The current term highlights in `app.js` correspond to this passage and question order.

For browser checks, install Playwright with `python -m pip install --target .test-tools playwright`, then run `python scripts/test_quiz.py`. The checks use an installed Microsoft Edge browser and save screenshots under `test-artifacts/`.

The future Mishnah Academy app remains outside the current pilot.

## Parse the daf

**3 · A mistake or a deliberate omission?** continues from מיתיבי to the end of 26a. Its three locks distinguish objection, answer, and supporting inference, for 30 points. Support has its own purple highlight. Content and coordinates are in `parsing-third.js`; the boundary guide is in `content/berachot-26a-parsing-third.md`.

The quiz picker also offers **1 · Sunrise: the opening exchange** (20 points) and **2 · After midday & a missed Minchah** (40 points). Quiz 2 covers the next two exchanges in four selections. Each quiz keeps its own saved progress. New passage data is in `parsing-next.js`; the editorial boundary guide is in `content/berachot-26a-parsing-next.md`.

Open `index.html#parse` or choose **Parse the daf**. The full Berachot 26a scan preserves tzurat hadaf; **Zoom to passage** centers the exercise and **Whole daf** shows the surrounding page. This pilot annotates the first chapter-4 exchange, plus five words from the next question to allow overshooting.

Two native sliders set the first and last highlighted word. Students lock each section in order. Feedback distinguishes exact boundaries, extra words, missing words, and shifted selections. A correct lock earns 10 points, once per section. Switching activities and reloading preserve state in this browser.

Boundaries in `parsing.js`: objection `ורמינהו` through `ביום`; answer with support `כי תניא ההיא` through the second `הנץ החמה`. The short answer itself ends at `לותיקין`; the task explicitly includes the following supporting statement. Translation/explanation appears after a correct lock. The app checks boundaries, not the student's spoken translation. These teacher-authored boundaries and explanations remain subject to educator review.

Word boxes use coordinates on the original 1024 × 1549 image, and scale with it. See `assets/README.md` for scan provenance. The rest of the daf is visible but is not yet mapped for selection.

## Static hosting package

Run `python scripts/package_static.py` to create `release/talmud-academy.zip`. It contains only the 13 public assets, with `index.html` at the archive root. No server or runtime dependencies are needed. Serve over HTTPS with a static web host. The package excludes testing tools, screenshots, scripts, and source notes. Public deployment has not yet been completed.
