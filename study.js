'use strict';

// Meanings are for this passage. Teaching explanations are original.
const STUDY_WORDS = [
  {word:'ורמינהו', meaning:'Here is a teaching that seems to disagree.', note:'An objection: the Gemara puts two teachings side by side and asks how they fit.', signal:'Objection', quiz:true},
  {word:'מצותה', meaning:'Its mitzvah / its proper performance', note:'Here, “its” refers to Shema. The teaching describes the time for completing it.'},
  {word:'עם', meaning:'With / at the time of', note:'עם הנץ החמה means “at sunrise.”'},
  {word:'הנץ החמה', meaning:'Sunrise', note:'The moment the sun appears. חמה means “sun.”', quiz:true},
  {word:'כדי', meaning:'In order to', note:'Gives a purpose: why someone does something. Here, it leads into connecting redemption to prayer.', quiz:true},
  {word:'שיסמוך', meaning:'That he should place next to', note:'Think of putting two things right beside each other, with no gap.', quiz:true},
  {word:'גאולה', meaning:'Redemption', note:'Being rescued or set free. Here it means the blessing about redemption after Shema.'},
  {word:'לתפלה', meaning:'To prayer', note:'ל־ means “to.” Here, תפלה is the Amidah. The redemption blessing comes directly before it.'},
  {word:'ונמצא', meaning:'And it turns out / and so', note:'Introduces the result: the person is praying during the day.'},
  {word:'מתפלל', meaning:'Prays / is praying', note:'Here, the person is saying the Amidah.'},
  {word:'ביום', meaning:'During the day', note:'ב־ means “in” or “during”; יום means “day.”', quiz:true},
  {word:'כי תניא ההיא', meaning:'When that teaching was taught…', note:'כי = when (here); תניא = was taught; ההיא = that one. The answer explains whom the teaching concerns.', signal:'Answer', quiz:true},
  {word:'ותיקין / לותיקין', meaning:'People especially careful in performing mitzvot / for those people', note:'The ל־ adds “for.” Here, the sunrise teaching describes their careful practice.', quiz:true},
  {word:'דאמר', meaning:'For he said', note:'ד־ connects the statement (“for” here); אמר means “said.” Rabbi Yochanan’s statement supports the answer.', signal:'Support', quiz:true},
  {word:'היו גומרים', meaning:'They used to finish', note:'היו = they were / used to; גומרים = finishing. Here, they would finish Shema at sunrise.', quiz:true},
  {word:'אותה', meaning:'It (feminine)', note:'Here, “it” refers back to Shema. Look back in the passage to find what a small word refers to.'}
];

const studyPanel = document.getElementById('study-panel');
studyPanel.innerHTML = `
  <div class="study-intro"><div><div class="eyebrow">YOUR PRE-QUIZ FIELD GUIDE</div><h2 id="study-title" tabindex="-1">Meet the words. Follow the clues.</h2><p>Read each word aloud, learn its meaning, then try covering the meanings.<br>Words marked <strong>Quiz word</strong> are the ones you’ll be asked about.</p></div><button class="secondary-button" id="print-study">Print study sheet ↗</button></div>
  <section class="study-context"><h3>What are we talking about?</h3><p>The Mishnah allows the morning Amidah until midday; Rabbi Yehudah says until four hours into the day. The Gemara brings a teaching about sunrise. Does that clash with the Mishnah? Let’s follow the discussion.</p><p><strong>Before you read:</strong> Shema and its blessings come before the Amidah. The blessing of <bdi lang="he">גאולה</bdi> (redemption) is the last of those blessings. Here, “prayer” means the Amidah.</p></section>
  <section class="discussion-guide" aria-labelledby="signals-title"><div class="study-section-heading"><span class="eyebrow">THE BIG CLUES</span><h2 id="signals-title">Three signals. One conversation.</h2><p>Notice how the Gemara changes direction.</p></div><div class="signal-grid">
    <article class="signal-card objection"><span class="signal-step">1 · OBJECTION</span><h3 lang="he" dir="rtl">ורמינהו</h3><strong>“But these teachings seem to clash!”</strong><p>The Mishnah gives a later deadline. Another teaching says sunrise. How can both fit?</p></article>
    <article class="signal-card answer-signal"><span class="signal-step">2 · ANSWER</span><h3 lang="he" dir="rtl">כי תניא ההיא — לותיקין</h3><strong>“That teaching is about a particular group.”</strong><p>The sunrise teaching describes the practice of the ותיקין, people especially careful with mitzvot.</p></article>
    <article class="signal-card support"><span class="signal-step">3 · SUPPORT</span><h3 lang="he" dir="rtl">דאמר רבי יוחנן</h3><strong>“Here is a statement that supports this.”</strong><p>Rabbi Yochanan said the ותיקין used to finish Shema at sunrise. This supports the explanation.</p></article>
  </div><p class="study-small">These are their jobs in <em>this</em> discussion. Always use the surrounding words to work out what a phrase is doing.</p></section>
  <section aria-labelledby="vocabulary-title"><div class="study-section-heading vocabulary-heading"><div><span class="eyebrow">YOUR WORD TOOLKIT</span><h2 id="vocabulary-title">The passage, word by word.</h2></div><button class="secondary-button" id="toggle-meanings" aria-pressed="false">Cover meanings</button></div><p class="study-small">Read in passage order. Rabbi Yochanan (<bdi lang="he">רבי יוחנן</bdi>) is the name of the sage whose statement is quoted.</p><div class="word-grid" id="word-grid"></div><p id="study-status" role="status" aria-live="polite"></p></section>
  <section class="study-read"><div class="study-section-heading"><span class="eyebrow">PUT IT TOGETHER</span><h2>Read the whole exchange.</h2></div><div class="study-passage" lang="he" dir="rtl"><p>ורמינהו: מצותה עם הנץ החמה, כדי שיסמוך גאולה לתפלה, ונמצא מתפלל ביום!</p><p>כי תניא ההיא — לותיקין.</p><p>דאמר רבי יוחנן: ותיקין היו גומרים אותה עם הנץ החמה.</p></div><p class="study-small">Source: <a href="https://www.sefaria.org/Berakhot.26a" target="_blank" rel="noopener noreferrer">Bavli Berachot 26a</a>, opening Gemara of chapter 4. Explanations above are learning aids.</p></section>
  <section class="study-recall"><div class="study-section-heading"><span class="eyebrow">TRY IT WITHOUT LOOKING</span><h2>Can you follow the clues?</h2><p>Say your answer first. Then open the explanation to check.</p></div>
    <details><summary>Which phrase introduces a clash between teachings?</summary><p><bdi lang="he">ורמינהו</bdi>. It introduces an objection: another teaching seems to disagree.</p></details>
    <details><summary>How does the Gemara answer the sunrise objection?</summary><p><bdi lang="he">כי תניא ההיא — לותיקין</bdi>: the teaching concerns the practice of the ותיקין.</p></details>
    <details><summary>Why bring Rabbi Yochanan’s statement?</summary><p>It supports the answer. He describes the ותיקין finishing Shema at sunrise. <bdi lang="he">דאמר</bdi> introduces that support here.</p></details>
    <details><summary>What does כדי שיסמוך גאולה לתפלה mean here?</summary><p>“In order to place redemption next to prayer”: the blessing of redemption should lead directly into the Amidah.</p></details>
  </section>
  <div class="study-ready"><div><h2>Ready to put your words to work?</h2><p>11 questions. 10 points for each correct answer. Come back here whenever you need.</p></div><button class="primary-button" id="start-quiz">Let’s take the quiz →</button></div>
`;

let meaningsCovered = false;
STUDY_WORDS.forEach((entry, index) => {
  const card = document.createElement('article');
  card.className = 'word-card';
  card.innerHTML = `<div class="word-card-top"><span>${String(index + 1).padStart(2,'0')}${entry.signal ? ` · ${entry.signal.toUpperCase()}` : ''}</span>${entry.quiz ? '<span class="quiz-word-label">Quiz word</span>' : ''}</div><h3 lang="he" dir="rtl">${entry.word}</h3><div class="word-meaning" id="meaning-${index}"><strong>${entry.meaning}</strong><p>${entry.note}</p></div><button class="reveal-meaning secondary-button" aria-controls="meaning-${index}" aria-expanded="false" hidden>Reveal meaning</button>`;
  card.querySelector('button').onclick = (event) => {
    const meaning = card.querySelector('.word-meaning');
    meaning.hidden = !meaning.hidden;
    event.currentTarget.textContent = meaning.hidden ? 'Reveal meaning' : 'Cover meaning';
    event.currentTarget.setAttribute('aria-expanded', String(!meaning.hidden));
  };
  document.getElementById('word-grid').append(card);
});

document.getElementById('toggle-meanings').onclick = (event) => {
  meaningsCovered = !meaningsCovered;
  event.currentTarget.textContent = meaningsCovered ? 'Show all meanings' : 'Cover meanings';
  event.currentTarget.setAttribute('aria-pressed', String(meaningsCovered));
  document.querySelectorAll('.word-card').forEach(card => {
    card.querySelector('.word-meaning').hidden = meaningsCovered;
    const button = card.querySelector('button');
    button.hidden = !meaningsCovered;
    button.textContent = 'Reveal meaning';
    button.setAttribute('aria-expanded', 'false');
  });
  document.getElementById('study-status').textContent = meaningsCovered ? 'Meanings covered. Try remembering each word, then reveal it to check.' : 'All meanings are showing.';
};

function showActivity(activity, focus = true) {
  document.getElementById('words-panel').hidden = activity !== 'words';
  document.getElementById('words-nav').setAttribute('aria-pressed',String(activity === 'words'));
  document.getElementById('roadmap-panel').hidden = activity !== 'roadmap';
  document.getElementById('roadmap-nav').setAttribute('aria-pressed', String(activity === 'roadmap'));
  const study = activity === 'study';
  studyPanel.hidden = !study;
  document.getElementById('quiz-panel').hidden = activity !== 'quiz';
  document.getElementById('parse-panel').hidden = activity !== 'parse';
  document.getElementById('study-nav').setAttribute('aria-pressed', String(study));
  document.getElementById('quiz-nav').setAttribute('aria-pressed', String(activity === 'quiz'));
  document.getElementById('parse-nav').setAttribute('aria-pressed', String(activity === 'parse'));
  document.getElementById('quiz-nav').lastChild.textContent = checked || position > 0 ? ' Return to quiz' : ' Take the quiz';
  if (focus) {
    const target = activity === 'words' ? 'words-title' : activity === 'roadmap' ? 'roadmap-title' : study ? 'study-title' : activity === 'parse' ? 'parse-title' : document.getElementById('question-view').hidden ? 'result-title' : 'question-title';
    document.getElementById(target)?.focus();
  }
}
function navigateActivity(activity) {
  if (location.hash === `#${activity}`) showActivity(activity);
  else location.hash = activity;
}
document.getElementById('study-nav').onclick = () => navigateActivity('study');
document.getElementById('roadmap-nav').onclick = () => navigateActivity('roadmap');
document.getElementById('quiz-nav').onclick = () => navigateActivity('quiz');
document.getElementById('words-nav').onclick = () => navigateActivity('words');
document.getElementById('parse-nav').onclick = () => navigateActivity('parse');
document.getElementById('start-quiz').onclick = () => navigateActivity('quiz');
document.getElementById('print-study').onclick = () => window.print();
const activityFromHash = () => ['#quiz','#parse','#study','#words'].includes(location.hash) ? location.hash.slice(1) : 'roadmap';
window.addEventListener('hashchange', () => showActivity(activityFromHash()));
showActivity(activityFromHash(), false);
