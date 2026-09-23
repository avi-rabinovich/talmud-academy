'use strict';

// Word boxes refer to the 1024 × 1549 source scan, in RTL reading order.
// The five words after the exchange allow students to overshoot its endpoint.
let DAF_WORDS = [
  ['ורמינהו',508,568,1220],['מצותה',438,493,1220],['עם',397,430,1220],['הנץ',355,390,1220],
  ['החמה',301,350,1220],['כדי',267,295,1220],['שיסמוך',197,261,1220],['גאולה',137,187,1220],
  ['לתפלה',644,704,1244],['ונמצא',590,640,1244],['מתפלל',525,585,1244],['ביום',483,519,1244],
  ['כי',456,478,1244],['תניא',417,453,1244],['ההיא',367,412,1244],['לותיקין',306,363,1244],
  ['דא״ר',250,297,1244],['יוחנן',209,246,1244],['ותיקין',163,208,1244],['היו',137,160,1244],
  ['גומרים',649,704,1268],['אותה',603,644,1268],['עם',577,599,1268],['הנץ',541,575,1268],
  ['החמה',491,539,1268],['וכ״ע',456,487,1268],['עד',430,451,1268],['חצות',383,424,1268],['ותו',353,379,1268],['לא',329,349,1268]
];
let PARSE_STEPS = [
  {label:'question', start:0, end:11, title:'Where does the question stop?', instruction:'Select the entire objection, including the teaching it quotes. Stop before the Gemara begins answering.', explanation:'The objection contrasts the Mishnah’s later deadline with a teaching about finishing Shema at sunrise, so the redemption blessing leads directly into the Amidah during the day. Stop after ביום: כי תניא begins the answer.'},
  {label:'answer', start:12, end:24, title:'Where does the answer stop?', instruction:'Select the answer AND Rabbi Yochanan’s supporting statement. Stop before the next question begins.', explanation:'The sunrise teaching describes the ותיקין. Rabbi Yochanan supports this: they used to finish Shema at sunrise. The short answer ends at לותיקין; דא״ר יוחנן introduces its support. For this task, keep both together. וכ״ע starts the next question.'}
];
const parsingPanel = document.getElementById('parse-panel');
const PARSE_QUIZZES = [
  {title:'1 · Sunrise: the opening exchange',words:DAF_WORDS,steps:PARSE_STEPS,note:'The final five words begin the next question. דא״ר means “for Rabbi … said.”',review:'The sunrise teaching describes the ותיקין. Rabbi Yochanan’s statement supports that explanation.'},
  {title:'2 · After midday & a missed Minchah',words:NEXT_DAF_WORDS,steps:NEXT_PARSE_STEPS,note:'This quiz covers two exchanges. The final five words begin the next objection. וכ״ע = וכולי עלמא; את״ל = אם תמצא לומר; ת״ש = תא שמע; א״ר = אמר רבי. בר and בריה mean “son” and “son of.”',review:'First distinguish prayer from prayer at its proper time. Then follow the question about Minchah through both possibilities to the source introduced by ת״ש.'}
];
PARSE_QUIZZES.push({title:'3 · A mistake or a deliberate omission?',words:THIRD_DAF_WORDS,steps:THIRD_PARSE_STEPS,description:'Objection, answer & support',note:'This quiz continues from מיתיבי to ש״מ at the end of 26a. ק״ש = קריאת שמע; א״ר = אמר רבי; ש״מ = שמע מינה. The final תנו is the catchword that previews the next page, not part of this discussion.',review:'The objection concerns a deliberate omission; the earlier permission concerned a mistake. Rav Ashi then supports that distinction from the teaching’s choice of words.'});
let activeParseQuiz = 0;
const parseQuizStates = new Map();
parsingPanel.innerHTML = `
  <div class="study-intro"><div><div class="eyebrow">DAF DETECTIVE · BERACHOT 26a</div><h2 id="parse-title" tabindex="-1">Find the pause. Follow the thought.</h2><p>Read from right to left. Choose where each thought starts and stops.<br>Move the sliders, read your highlight aloud, then lock it in.</p></div><div class="score-pill"><span>✦</span><strong id="parse-score">0</strong><span>/ 20 PTS</span></div></div>
  <div class="parse-quiz-picker"><label for="parse-quiz-choice">Choose a parsing quiz</label><select id="parse-quiz-choice"><option value="0">1 · Sunrise: the opening exchange</option><option value="1">2 · After midday &amp; a missed Minchah</option></select><p id="parse-quiz-description">One exchange · 2 sections to lock</p></div>
  <div class="parse-layout">
    <section class="daf-card" aria-label="Printed daf with word highlights"><div class="daf-toolbar"><div><strong>The real daf</strong><small>Chapter 4 begins near the bottom of the page.</small></div><div><button class="secondary-button" id="daf-full">Whole daf</button><button class="secondary-button" id="daf-focus">Zoom to passage</button></div></div>
      <div class="daf-viewport" id="daf-viewport" tabindex="0" aria-label="Daf image. Scroll to explore the page."><div class="daf-stage" id="daf-stage"><img id="daf-image" src="assets/berachot-26a.jpg" width="1024" height="1549" alt="Full printed page of Berachot 26a, with Gemara in the center and commentaries around it. The exercise highlights the opening exchange of chapter 4 near the bottom."><svg id="daf-overlay" viewBox="0 0 1024 1549" aria-hidden="true"></svg></div></div>
      <div class="daf-legend"><span><i class="preview-key"></i> Your selection</span><span><i class="question-key"></i> Locked question</span><span><i class="answer-key"></i> Locked answer</span></div><p class="daf-credit">Page image: <a href="https://www.dafyomi.org/index.php?daf=26a&masechta=brachos" target="_blank" rel="noopener noreferrer">DafYomi.org / E-daf.com ↗</a>. This exercise covers the opening question and answer, not the whole page.</p>
    </section>
    <section class="parse-controls" aria-labelledby="parse-step-title"><div class="eyebrow" id="parse-step-count">STEP 1 OF 2 · QUESTION</div><h2 id="parse-step-title"></h2><p id="parse-instruction"></p>
      <div id="parse-selection-controls"><label for="parse-start">Start reading at <output id="parse-start-word" lang="he" dir="rtl"></output></label><input id="parse-start" type="range" min="0" max="29" value="0" step="1"><label for="parse-end">Stop reading after <output id="parse-end-word" lang="he" dir="rtl"></output></label><input id="parse-end" type="range" min="0" max="29" value="0" step="1"><p class="slider-help">Slide right to move later in the passage. Arrow keys move one word at a time.</p></div>
      <div class="selection-preview"><span class="eyebrow">YOUR HIGHLIGHT · <span id="parse-word-count"></span></span><p id="parse-selected-text" lang="he" dir="rtl"></p></div>
      <button id="parse-lock" class="primary-button">Lock in question →</button><div id="parse-feedback" class="feedback" role="status" aria-live="polite" hidden></div><button id="parse-next" class="primary-button" hidden>Now find the answer →</button><button id="parse-reset" class="secondary-button" hidden>Try the passage again</button>
    </section>
  </div>
  <details class="parse-transcript"><summary>Readable text of the exercise</summary><p lang="he" dir="rtl">${DAF_WORDS.map(w => w[0]).join(' ')}</p><p>The last five words begin the next question. The printed abbreviation דא״ר means “for Rabbi … said.” This is the same supporting statement introduced by דאמר רבי in our study sheet.</p></details>
  <section id="parse-review" class="study-context" hidden><h3>You found both stopping places.</h3><p>The question and answer remain marked on the daf. Read each aloud, pause at its endpoint, and explain the thought in your own words.</p><p><strong>Question:</strong> Why does this teaching point to sunrise when the Mishnah gives a later deadline?</p><p><strong>Answer:</strong> It describes the ותיקין, whose sunrise practice is confirmed by Rabbi Yochanan.</p></section>
`;

let parseStep = 0;
let parseLocked = [];
let parseStart = 0;
let parseEnd = 0;
let parseZoom = true;
const parseEl = id => document.getElementById(id);
const parseText = (start, end) => DAF_WORDS.slice(start, end + 1).map(w => w[0]).join(' ');

function classifyRange(start, end, targetStart, targetEnd) {
  if (start === targetStart && end === targetEnd) return 'correct';
  if (start <= targetStart && end >= targetEnd) return 'too-many';
  if (start >= targetStart && end <= targetEnd) return 'too-few';
  return 'shifted';
}

function drawParseSelection() {
  const svg = parseEl('daf-overlay');
  svg.replaceChildren();
  DAF_WORDS.forEach((word, i) => {
    const lockedIndex = parseLocked.findIndex(range => i >= range.start && i <= range.end);
    const selected = !parseLocked[parseStep] && i >= parseStart && i <= parseEnd;
    if (!selected && lockedIndex < 0) return;
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', word[1]); rect.setAttribute('y', word[3]);
    rect.setAttribute('width', word[2] - word[1]); rect.setAttribute('height', 23);
    rect.setAttribute('class', selected ? 'daf-preview' : `daf-${PARSE_STEPS[lockedIndex].label}`);
    svg.append(rect);
  });
  parseEl('parse-start-word').textContent = DAF_WORDS[parseStart][0];
  parseEl('parse-end-word').textContent = DAF_WORDS[parseEnd][0];
  parseEl('parse-start').value = parseStart;
  parseEl('parse-end').value = parseEnd;
  ['start','end'].forEach(name => {
    const value = name === 'start' ? parseStart : parseEnd;
    parseEl(`parse-${name}`).setAttribute('aria-valuetext', `Word ${value + 1}: ${DAF_WORDS[value][0]}`);
  });
  parseEl('parse-word-count').textContent = `${parseEnd - parseStart + 1} WORD${parseStart === parseEnd ? '' : 'S'}`;
  parseEl('parse-selected-text').textContent = parseText(parseStart, parseEnd);
}

function renderParseStep() {
  const step = PARSE_STEPS[parseStep];
  parseEl('parse-step-count').textContent = `STEP ${parseStep + 1} OF ${PARSE_STEPS.length} · ${step.label.toUpperCase()}`;
  parseEl('parse-step-title').textContent = step.title;
  parseEl('parse-instruction').textContent = step.instruction;
  parseEl('parse-lock').textContent = `Lock in ${step.label} →`;
  const locked = Boolean(parseLocked[parseStep]);
  parseEl('parse-lock').hidden = locked;
  parseEl('parse-next').hidden = !locked || parseStep === PARSE_STEPS.length - 1;
  const nextLabel = PARSE_STEPS[parseStep + 1]?.label;
  parseEl('parse-next').textContent = nextLabel === 'question' ? 'Next exchange →' : nextLabel === 'support' ? 'Now find the support →' : 'Now find the answer →';
  parseEl('parse-feedback').hidden = true;
  parseEl('parse-selection-controls').hidden = locked;
  parseEl('parse-reset').hidden = parseLocked.length === 0;
  parseEl('parse-review').hidden = parseLocked.length !== PARSE_STEPS.length;
  drawParseSelection();
}

['start','end'].forEach(name => parseEl(`parse-${name}`).addEventListener('input', event => {
  if (parseLocked[parseStep]) return;
  if (name === 'start') { parseStart = +event.target.value; parseEnd = Math.max(parseStart, parseEnd); }
  else { parseEnd = +event.target.value; parseStart = Math.min(parseStart, parseEnd); }
  parseEl('parse-feedback').hidden = true;
  drawParseSelection();
}));

parseEl('parse-lock').onclick = () => {
  if (parseLocked[parseStep]) return;
  const step = PARSE_STEPS[parseStep];
  const result = classifyRange(parseStart, parseEnd, step.start, step.end);
  const feedback = parseEl('parse-feedback');
  const heading = document.createElement('strong');
  const explanation = document.createElement('span');
  feedback.classList.toggle('mistake', result !== 'correct');
  feedback.hidden = false;
  if (result === 'correct') {
    parseLocked.push({start:parseStart, end:parseEnd});
    heading.textContent = 'Exactly right! Section locked. +10 points ✦';
    explanation.textContent = step.explanation;
    parseEl('parse-score').textContent = parseLocked.length * 10;
    parseEl('parse-lock').hidden = true;
    parseEl('parse-selection-controls').hidden = true;
    parseEl('parse-next').hidden = parseStep === PARSE_STEPS.length - 1;
    parseEl('parse-reset').hidden = false;
    parseEl('parse-review').hidden = parseStep !== PARSE_STEPS.length - 1;
    drawParseSelection();
  } else {
    const extra = Math.max(0, step.start - parseStart) + Math.max(0, parseEnd - step.end);
    const missing = Math.max(0, parseStart - step.start) + Math.max(0, step.end - parseEnd);
    if (result === 'too-many') {
      heading.textContent = `Too many words — ${extra} extra.`;
      explanation.textContent = `${parseStart < step.start ? 'Your selection starts too early. Move the start later. ' : ''}${parseEnd > step.end ? 'You continued past this thought. Move the stop earlier.' : ''} Read it again before locking it in.`;
    } else if (result === 'too-few') {
      heading.textContent = `Too few words — ${missing} missing.`;
      explanation.textContent = `${parseStart > step.start ? 'You missed the opening words. Move the start earlier. ' : ''}${parseEnd < step.end ? 'This thought is not finished yet. Move the stop later.' : ''}${activeParseQuiz === 0 && parseStep === 1 && parseEnd === 15 ? ' You found the short answer; this task also asks for its supporting statement.' : ''}`;
    } else {
      heading.textContent = 'The selection is in the wrong place.';
      explanation.textContent = 'Some words belong to another section, and some of this section are missing. Adjust both the start and the stop. The number of words alone is not enough.';
    }
  }
  feedback.replaceChildren(heading, explanation);
};
parseEl('parse-next').onclick = () => {
  if (!parseLocked[parseStep] || parseStep === PARSE_STEPS.length - 1) return;
  parseStart = parseEnd = parseLocked[parseStep].end + 1; parseStep++;
  renderParseStep(); setDafView(parseZoom); parseEl('parse-start').focus();
};
parseEl('parse-reset').onclick = () => {
  parseStep = 0; parseStart = parseEnd = 0; parseLocked = [];
  parseEl('parse-score').textContent = '0';
  parseEl('parse-reset').hidden = true; parseEl('parse-review').hidden = true;
  renderParseStep(); parseEl('parse-start').focus();
};
function setDafView(zoom) {
  parseZoom = zoom;
  const stage = parseEl('daf-stage');
  stage.classList.toggle('zoomed', zoom);
  parseEl('daf-full').setAttribute('aria-pressed', String(!zoom));
  parseEl('daf-focus').setAttribute('aria-pressed', String(zoom));
  requestAnimationFrame(() => {
    const viewport = parseEl('daf-viewport');
    const scale = stage.clientWidth / 1024;
    viewport.scrollTop = zoom ? (DAF_WORDS[PARSE_STEPS[parseStep].start][3] - 55) * scale : 0;
    viewport.scrollLeft = zoom ? Math.max(0, (activeParseQuiz === 0 ? 420 : 540) * scale - viewport.clientWidth / 2) : 0;
  });
}
parseEl('daf-full').onclick = () => setDafView(false);
parseEl('daf-focus').onclick = () => setDafView(true);
parseEl('daf-image').onerror = () => {
  parseEl('daf-viewport').setAttribute('aria-label', 'Page image could not load. Use the readable transcript and selection preview below.');
};
function updateParseQuizContent() {
  const quiz = PARSE_QUIZZES[activeParseQuiz];
  parseEl('parse-quiz-description').textContent = `${quiz.description || (activeParseQuiz === 0 ? 'One exchange' : 'Two exchanges')} · ${PARSE_STEPS.length} sections to lock · 10 points each`;
  parsingPanel.querySelector('.score-pill > span:last-child').textContent = `/ ${PARSE_STEPS.length * 10} PTS`;
  parseEl('parse-score').textContent = parseLocked.length * 10;
  ['start','end'].forEach(name => parseEl(`parse-${name}`).max = DAF_WORDS.length - 1);
  parsingPanel.querySelector('.parse-transcript p[lang=he]').textContent = parseText(0, DAF_WORDS.length - 1);
  parsingPanel.querySelector('.parse-transcript p:last-child').textContent = quiz.note;
  parseEl('parse-review').replaceChildren();
  const heading = document.createElement('h3');
  heading.textContent = `You found all ${PARSE_STEPS.length} stopping places.`;
  const recap = document.createElement('p');
  recap.textContent = quiz.review;
  parseEl('parse-review').append(heading,recap);
  PARSE_STEPS.forEach(step => {
    const paragraph = document.createElement('p');
    const label = document.createElement('strong');
    label.textContent = `${step.label[0].toUpperCase() + step.label.slice(1)}: `;
    paragraph.append(label,step.explanation);
    parseEl('parse-review').append(paragraph);
  });
  parsingPanel.querySelector('.daf-credit').lastChild.textContent = ' The full page is visible; highlights cover the selected exercise.';
}
parseEl('parse-quiz-choice').onchange = event => {
  parseQuizStates.set(activeParseQuiz, {step:parseStep, start:parseStart, end:parseEnd, locked:[...parseLocked], feedback:parseEl('parse-feedback').innerHTML, hidden:parseEl('parse-feedback').hidden, mistake:parseEl('parse-feedback').classList.contains('mistake')});
  activeParseQuiz = +event.target.value;
  DAF_WORDS = PARSE_QUIZZES[activeParseQuiz].words;
  PARSE_STEPS = PARSE_QUIZZES[activeParseQuiz].steps;
  const saved = parseQuizStates.get(activeParseQuiz);
  parseStep = saved?.step ?? 0; parseStart = saved?.start ?? 0; parseEnd = saved?.end ?? 0; parseLocked = saved?.locked ?? [];
  updateParseQuizContent(); renderParseStep(); setDafView(parseZoom);
  if (saved) {
    parseEl('parse-feedback').innerHTML = saved.feedback;
    parseEl('parse-feedback').hidden = saved.hidden;
    parseEl('parse-feedback').classList.toggle('mistake',saved.mistake);
  }
};
parseEl('parse-quiz-choice').replaceChildren(...PARSE_QUIZZES.map((quiz,index) => {
  const option = document.createElement('option');
  option.value = index; option.textContent = quiz.title;
  return option;
}));
const supportLegend = document.createElement('span');
supportLegend.innerHTML = '<i class="support-key"></i> Locked support';
parsingPanel.querySelector('.daf-legend').append(supportLegend);
updateParseQuizContent();
renderParseStep();
window.addEventListener('hashchange', () => {
  if (location.hash === '#parse') setDafView(parseZoom);
});
if (location.hash === '#parse') setDafView(true);
