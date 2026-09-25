/* One scored attempt per question. Practice can earn points on missed words. */
'use strict';
const $ = (id) => document.getElementById(id);
const terms = ['ורמינהו','הנץ החמה','כדי','שיסמוך','ביום','כי תניא ההיא','כי תניא ההיא','ותיקין','דאמר','דאמר','היו גומרים'];
const signalQuestions = new Set([0,5,6,8,9]);
let queue = QUESTIONS.map((_, i) => i);
let position = 0;
let selected = null;
let checked = false;
let earned = new Set();
let missed = [];
let practice = false;
let firstScore = null;

function renderQuestion(focus = false) {
  const index = queue[position];
  const question = QUESTIONS[index];
  selected = null;
  checked = false;
  $('question-view').hidden = false;
  $('result-view').hidden = true;
  $('question-number').textContent = `${practice ? 'PRACTICE' : 'QUESTION'} ${String(position + 1).padStart(2,'0')} / ${queue.length}`;
  $('question-type').textContent = signalQuestions.has(index) ? 'DISCUSSION SIGNAL' : 'WORD DISCOVERY';
  $('term').textContent = terms[index];
  $('question-title').textContent = question.prompt;
  $('question-view').querySelector('.question-hint').textContent = [6,9].includes(index) ? 'What is happening in the discussion here?' : 'Pick the meaning that fits our passage.';
  $('answers').replaceChildren();
  question.options.forEach((option, optionIndex) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer';
    button.setAttribute('aria-pressed','false');
    const letter = document.createElement('span');
    letter.className = 'letter';
    letter.textContent = 'ABCD'[optionIndex];
    letter.setAttribute('aria-hidden','true');
    const text = document.createElement('span');
    text.textContent = option;
    button.append(letter, text);
    button.addEventListener('click', () => {
      if (checked) return;
      selected = optionIndex;
      [...$('answers').children].forEach((answer, i) => {
        answer.classList.toggle('selected', i === selected);
        answer.setAttribute('aria-pressed', String(i === selected));
      });
      $('next-button').disabled = false;
    });
    $('answers').append(button);
  });
  $('feedback').hidden = true;
  $('next-button').textContent = 'Check answer →';
  $('next-button').disabled = true;
  $('footer-hint').textContent = practice ? 'Another chance to make it click.' : 'A little thinking goes a long way.';
  document.querySelectorAll('[data-term]').forEach(el => el.classList.toggle('highlight', el.dataset.term === terms[index]));
  updateProgress(position);
  if (focus) $('question-title').focus();
}

function updateProgress(completed) {
  $('progress-fill').style.width = `${completed / queue.length * 100}%`;
  $('progress-track').setAttribute('aria-valuemax', queue.length);
  $('progress-track').setAttribute('aria-valuenow', completed);
  $('progress-label').textContent = practice ? 'Make those tricky words yours' : 'Your first word quest';
  $('progress-detail').textContent = `${completed} of ${queue.length} ${practice ? 'practice ' : ''}questions completed`;
  $('score').textContent = earned.size * 10;
}

function checkAnswer() {
  if (selected === null || checked) return;
  checked = true;
  const index = queue[position];
  const question = QUESTIONS[index];
  const correct = selected === question.correct;
  if (correct) earned.add(index); else missed.push(index);
  [...$('answers').children].forEach((button, i) => {
    button.disabled = true;
    if (i === question.correct || (i === selected && !correct)) {
      button.classList.add(i === question.correct ? 'correct' : 'incorrect');
      const state = document.createElement('span');
      state.className = 'answer-state';
      state.textContent = i === question.correct ? '✓ Correct' : 'Your pick';
      button.append(state);
    }
  });
  const heading = document.createElement('strong');
  heading.textContent = correct ? 'Nice discovery! +10 points ✦' : 'Keep exploring — you’re learning!';
  const explanation = document.createElement('span');
  explanation.textContent = question.feedback;
  $('feedback').replaceChildren(heading, explanation);
  $('feedback').classList.toggle('mistake', !correct);
  $('feedback').hidden = false;
  $('next-button').textContent = position === queue.length - 1 ? 'See my results →' : 'Next question →';
  $('footer-hint').textContent = correct ? 'One more word unlocked.' : 'No points lost. Take a look at the explanation.';
  updateProgress(position + 1);
  if (correct) {
    $('score').classList.remove('score-pop');
    void $('score').offsetWidth;
    $('score').classList.add('score-pop');
  }
}

function showResults() {
  if (!practice) firstScore = earned.size;
  $('question-view').hidden = true;
  $('result-view').hidden = false;
  $('question-number').textContent = 'QUEST COMPLETE';
  $('question-type').textContent = missed.length ? 'KEEP DISCOVERING' : 'WORDS UNLOCKED';
  $('result-view').innerHTML = `<div class="results"><div class="result-icon" aria-hidden="true">✦</div><h2 id="result-title" tabindex="-1">${missed.length ? 'A little wiser. A little further.' : 'Word quest complete!'}</h2><p>You followed the clues and explored the Gemara.</p><div class="result-score">${earned.size * 10} <small>/ 110 points</small></div><p class="result-summary">First round: ${firstScore} of ${QUESTIONS.length} correct.<br>${practice ? `With practice: ${earned.size} of ${QUESTIONS.length} words unlocked.` : 'Every correct answer earned you 10 points.'}</p><p>${missed.length ? `${missed.length} ${missed.length === 1 ? 'question is' : 'questions are'} ready for another look.<br>Practise them to earn the remaining points!` : 'You spotted the words that help a discussion move.<br>That’s a great beginning.'}</p><div class="result-actions"></div></div>`;
  const actions = $('result-view').querySelector('.result-actions');
  if (missed.length) {
    const retry = document.createElement('button');
    retry.className = 'primary-button';
    retry.textContent = 'Practise missed questions →';
    retry.onclick = () => {
      queue = [...missed]; missed = []; position = 0; practice = true;
      renderQuestion(true);
    };
    actions.append(retry);
  }
  const restart = document.createElement('button');
  restart.className = 'secondary-button';
  restart.textContent = 'Start a new quest';
  restart.onclick = () => {
    queue = QUESTIONS.map((_, i) => i); position = 0; earned = new Set(); missed = []; practice = false; firstScore = null;
    renderQuestion(true);
  };
  actions.append(restart);
  $('result-title').focus();
}

$('next-button').addEventListener('click', () => {
  if (!checked) { checkAnswer(); return; }
  position++;
  if (position === queue.length) showResults(); else renderQuestion(true);
});
renderQuestion();
