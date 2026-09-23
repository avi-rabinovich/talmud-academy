'use strict';
const PROGRESS_KEY = 'talmud-academy-progress-v1';
const LEARNING_PATH = [
  {title:'Meet the words',kind:'STUDY · 16 WORDS',description:'Get to know the words and the signals that guide a discussion.',activity:'study',max:0},
  {title:'Become a word detective',kind:'VOCABULARY · 11 QUESTIONS',description:'Match words to their meanings, then practise any tricky ones.',activity:'quiz',max:110},
  {title:'Find the first question and answer',kind:'DAF DETECTIVE · QUIZ 1',description:'Explore the sunrise discussion on the real daf.',activity:'parse',quiz:0,max:20},
  {title:'Follow two more exchanges',kind:'DAF DETECTIVE · QUIZ 2',description:'After midday and a missed Minchah: find four stopping places.',activity:'parse',quiz:1,max:40},
  {title:'Spot the supporting clue',kind:'DAF DETECTIVE · QUIZ 3',description:'Separate the objection, answer, and Rav Ashi’s support.',activity:'parse',quiz:2,max:30}
];
let journey = {completed:[false,false,false,false,false],best:[0,0,0,0,0]};
let storageAvailable = true;
let restoringProgress = true;
const validIndices = (values, max) => Array.isArray(values) && values.every(v => Number.isInteger(v) && v >= 0 && v < max) && new Set(values).size === values.length;
function parsingSnapshot() { return {step:parseStep,start:parseStart,end:parseEnd,locked:parseLocked.map(r => ({...r}))}; }
function validParsing(s, index) {
  const quiz = PARSE_QUIZZES[index];
  return s && Number.isInteger(s.step) && s.step >= 0 && s.step < quiz.steps.length && Number.isInteger(s.start) && Number.isInteger(s.end) && s.start >= 0 && s.end >= s.start && s.end < quiz.words.length && Array.isArray(s.locked) && [s.step,s.step+1].includes(s.locked.length) && s.locked.every((r,i) => r.start === quiz.steps[i].start && r.end === quiz.steps[i].end);
}
function savedParsing(s,index) {
  const locked = s.locked[s.step];
  const feedback = document.createElement('div');
  if (locked) {
    const title = document.createElement('strong'); title.textContent = 'Exactly right! Section locked. +10 points ✦';
    const explanation = document.createElement('span'); explanation.textContent = PARSE_QUIZZES[index].steps[s.step].explanation;
    feedback.append(title,explanation);
  }
  return {...s,feedback:feedback.innerHTML,hidden:!locked,mistake:false};
}
function restoreProgress() {
  try {
    const s = JSON.parse(localStorage.getItem(PROGRESS_KEY) || 'null');
    if (!s || s.version !== 1) return;
    if (Array.isArray(s.completed) && s.completed.length === 5 && s.completed.every(x => typeof x === 'boolean')) journey.completed = s.completed;
    if (Array.isArray(s.best) && s.best.length === 5 && s.best.every((x,i) => Number.isInteger(x) && x >= 0 && x <= LEARNING_PATH[i].max)) journey.best = s.best;
    const q = s.quiz;
    if (q && validIndices(q.queue,QUESTIONS.length) && q.queue.length && validIndices(q.earned,QUESTIONS.length) && validIndices(q.missed,QUESTIONS.length) && Number.isInteger(q.position) && q.position >= 0 && q.position <= q.queue.length && (q.selected === null || Number.isInteger(q.selected) && q.selected >= 0 && q.selected <= 3) && typeof q.checked === 'boolean' && typeof q.practice === 'boolean' && (q.firstScore === null || Number.isInteger(q.firstScore) && q.firstScore >= 0 && q.firstScore <= QUESTIONS.length)) {
      queue=q.queue; position=q.position; earned=new Set(q.earned); missed=q.missed; practice=q.practice; firstScore=q.firstScore;
      if (position === queue.length) showResults();
      else {
        renderQuestion();
        if (q.selected !== null) {
          document.getElementById('answers').children[q.selected].click();
          if (q.checked) {
            missed=missed.filter(i => i !== queue[position]);
            checkAnswer();
          }
        }
      }
    }
    if (Array.isArray(s.parsing)) s.parsing.forEach((item,index) => {if (index < PARSE_QUIZZES.length && validParsing(item,index)) parseQuizStates.set(index,savedParsing(item,index));});
    const current = Number.isInteger(s.active) && s.active >= 0 && s.active < 3 ? s.active : 0;
    activeParseQuiz=current; DAF_WORDS=PARSE_QUIZZES[current].words; PARSE_STEPS=PARSE_QUIZZES[current].steps;
    const state=parseQuizStates.get(current);
    parseStep=state?.step ?? 0; parseStart=state?.start ?? 0; parseEnd=state?.end ?? 0; parseLocked=state?.locked ?? [];
    parseEl('parse-quiz-choice').value=current;
    updateParseQuizContent(); renderParseStep();
    if (state) {parseEl('parse-feedback').innerHTML=state.feedback;parseEl('parse-feedback').hidden=state.hidden;}
  } catch { /* Invalid or unavailable storage must never prevent learning. */ }
}
function recordProgress() {
  if (restoringProgress) return;
  journey.best[1]=Math.max(journey.best[1],earned.size*10);
  if (firstScore !== null || position === queue.length) journey.completed[1]=true;
  const parsing=PARSE_QUIZZES.map((_,i) => i === activeParseQuiz ? parsingSnapshot() : parseQuizStates.get(i) || null);
  parsing.forEach((s,i) => {
    if (!s) return;
    journey.best[i+2]=Math.max(journey.best[i+2],s.locked.length*10);
    if (s.locked.length === PARSE_QUIZZES[i].steps.length) journey.completed[i+2]=true;
  });
  const snapshot={version:1,...journey,active:activeParseQuiz,parsing:parsing.map(s=>s ? {step:s.step,start:s.start,end:s.end,locked:s.locked} : null),quiz:{queue,position,selected,checked,earned:[...earned],missed,practice,firstScore}};
  try {localStorage.setItem(PROGRESS_KEY,JSON.stringify(snapshot)); storageAvailable=true;} catch {storageAvailable=false;}
  renderRoadmap();
}
function openPathStep(index) {
  const step=LEARNING_PATH[index];
  if (step.activity === 'parse' && activeParseQuiz !== step.quiz) {
    parseEl('parse-quiz-choice').value=step.quiz;
    parseEl('parse-quiz-choice').dispatchEvent(new Event('change',{bubbles:true}));
  }
  navigateActivity(step.activity);
  if (step.activity === 'parse') setDafView(parseZoom);
}
function renderRoadmap() {
  const panel=document.getElementById('roadmap-panel');
  const count=journey.completed.filter(Boolean).length;
  const next=journey.completed.findIndex(done=>!done);
  panel.innerHTML=`<div class="path-heading"><div><div class="eyebrow">YOUR LEARNING PATH · BERACHOT 26a</div><h2 id="roadmap-title" tabindex="-1">One discovery leads to the next.</h2><p>Build your vocabulary. Find the questions. Follow the answers.</p></div><div class="path-points"><strong>${journey.best.reduce((a,b)=>a+b,0)}</strong><span>/ 200 points</span></div></div><div class="path-progress"><strong>${count} of 5 activities complete</strong><progress value="${count}" max="5" aria-label="Activities completed"></progress></div><div class="path-intro"><div><h3>${next < 0 ? 'You completed this learning path!' : 'Your next discovery'}</h3><p>${next < 0 ? 'Revisit any activity to strengthen your skills and improve your score.' : LEARNING_PATH[next].title}</p></div><button id="path-resume" class="primary-button">${next < 0 ? 'Review the words' : count ? 'Continue learning →' : 'Start learning →'}</button></div><ol class="path-list"></ol><p class="path-save">${storageAvailable ? 'Progress saves on this browser. No account needed. Replaying an activity keeps your best score; clearing browser data removes progress.' : 'This browser cannot save progress. You can still learn, but progress will reset when you close or reload the page.'}</p>`;
  panel.querySelector('#path-resume').onclick=()=>openPathStep(next < 0 ? 0 : next);
  const list=panel.querySelector('ol');
  LEARNING_PATH.forEach((step,i)=>{
    const li=document.createElement('li');
    li.className=`path-card ${journey.completed[i]?'done':i===next?'current':''}`;
    li.innerHTML=`<span class="path-number" aria-label="Step ${i+1}">${journey.completed[i]?'✓':String(i+1).padStart(2,'0')}</span><div class="path-content"><div class="eyebrow">${step.kind}</div><h3>${step.title}</h3><p>${step.description}</p><span class="path-status">${journey.completed[i]?'Completed':i===next?'Up next':'Explore when ready'}${step.max?` · Best: ${journey.best[i]} / ${step.max} points`:''}</span></div><button class="secondary-button">${journey.completed[i]?'Review':'Open'}<span class="visually-hidden"> ${step.title}</span> →</button>`;
    li.querySelector('button').onclick=()=>openPathStep(i); list.append(li);
  });
  const continuation=document.getElementById('roadmap-continue');
  const activity=activityFromHash();
  const index=activity==='study'?0:activity==='quiz'?1:activity==='parse'?activeParseQuiz+2:-1;
  continuation.hidden=index<0 || !journey.completed[index];
  continuation.replaceChildren();
  if (!continuation.hidden) {
    const button=document.createElement('button'); button.className='primary-button';
    button.textContent=index<4?`Next: ${LEARNING_PATH[index+1].title} →`:'See my completed path →';
    button.onclick=()=>index<4?openPathStep(index+1):navigateActivity('roadmap');
    continuation.append(button);
  }
}
restoreProgress();
restoringProgress=false;
// Explicit study completion: reading and self-checking are not timed or graded.
document.getElementById('start-quiz').addEventListener('click',()=>{journey.completed[0]=true;recordProgress();});
document.getElementById('start-quiz').textContent='I’ve studied — start the quiz →';
document.addEventListener('click',()=>setTimeout(recordProgress,0));
document.addEventListener('input',()=>setTimeout(recordProgress,0));
document.addEventListener('change',()=>setTimeout(recordProgress,0));
window.addEventListener('hashchange',recordProgress);
window.addEventListener('pagehide',recordProgress);
recordProgress();
showActivity(activityFromHash(),false);
if (activityFromHash()==='parse') setDafView(parseZoom);
