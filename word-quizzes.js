'use strict';
let activeWordLesson=0;
const freshWordState=index=>({queue:WORD_LESSONS[index].questions.map((_,i)=>i),position:0,selected:null,checked:false,earned:[],missed:[],roundDone:false,completed:false,practice:false});
let wordStates=WORD_LESSONS.map((_,i)=>freshWordState(i));
const wordEl=id=>document.getElementById(id);
wordEl('words-panel').innerHTML=`<div class="study-intro"><div><div class="eyebrow">WORD QUESTS · THE REST OF BERACHOT 26a</div><h2 id="words-title" tabindex="-1">More words. Deeper understanding.</h2><p>Study the words first, then test your discoveries. Every correct answer earns 10 points.</p></div><div class="score-pill"><span>✦</span><strong id="words-score">0</strong><span>PTS</span></div></div><div class="parse-quiz-picker"><label for="word-lesson-choice">Choose a word quiz</label><select id="word-lesson-choice"></select><p id="word-lesson-size"></p></div><p id="word-intro" class="study-small"></p><details class="study-context" id="word-study"><summary>Study these words before the quiz</summary><div id="word-study-list" class="word-grid"></div></details><div class="workspace"><section class="quiz-card"><div class="question-meta"><span id="word-number"></span><span class="topic-pill" id="word-kind"></span></div><div id="word-question"><div class="term" id="word-term" lang="he" dir="rtl"></div><h2 id="word-prompt" tabindex="-1"></h2><p class="question-hint">Use the word’s meaning in this passage.</p><div class="answers" id="word-options"></div><div id="word-feedback" class="feedback" role="status" aria-live="polite" hidden></div><div class="quiz-footer"><span id="word-progress"></span><button id="word-check" class="primary-button" disabled>Check answer →</button></div></div><div id="word-results" hidden></div></section><aside class="passage-card"><span class="eyebrow">YOUR SOURCE SHEET</span><h2 id="word-source-title"></h2><div id="word-passage" class="passage" lang="he" dir="rtl"></div><p class="study-small">The passage follows the printed daf. Abbreviations are explained in the study list.</p><a class="source-link" href="https://www.sefaria.org/Berakhot.26a" target="_blank" rel="noopener noreferrer">Berachot 26a on Sefaria ↗</a></aside></div>`;
WORD_LESSONS.forEach((lesson,i)=>{const option=document.createElement('option');option.value=i;option.textContent=`${i+2} · ${lesson.title}`;wordEl('word-lesson-choice').append(option);});
function validWordState(s,index) {
  const max=WORD_LESSONS[index].questions.length;
  const indices=values=>Array.isArray(values)&&new Set(values).size===values.length&&values.every(v=>Number.isInteger(v)&&v>=0&&v<max);
  return s&&indices(s.queue)&&s.queue.length>0&&indices(s.earned)&&indices(s.missed)&&Number.isInteger(s.position)&&s.position>=0&&s.position<s.queue.length&&(s.selected===null||Number.isInteger(s.selected)&&s.selected>=0&&s.selected<4)&&['checked','roundDone','completed','practice'].every(key=>typeof s[key]==='boolean')&&(!s.checked||s.selected!==null);
}
function selectWordLesson(index) {
  if (!Number.isInteger(index)||!WORD_LESSONS[index]) return;
  activeWordLesson=index;wordEl('word-lesson-choice').value=index;
  const lesson=WORD_LESSONS[index];
  wordEl('word-lesson-size').textContent=`${lesson.questions.length} questions · ${lesson.questions.length*10} points`;
  wordEl('word-intro').textContent=lesson.intro;
  wordEl('word-source-title').textContent=lesson.title;
  wordEl('word-passage').textContent=lesson.source();
  wordEl('word-study-list').replaceChildren();
  lesson.entries.forEach(([term,meaning,,note,role])=>{
    const card=document.createElement('article');card.className='vocabulary-card';
    const heading=document.createElement('h3');heading.lang='he';heading.dir='rtl';heading.textContent=term;
    const strong=document.createElement('strong');strong.textContent=meaning;
    const p=document.createElement('p');p.className='study-small';p.textContent=note;
    card.append(heading,strong,p);
    if(role){const label=document.createElement('span');label.className='topic-pill';label.textContent=role;card.append(label);}
    wordEl('word-study-list').append(card);
  });
  wordEl('word-study').open=false;
  renderWordQuestion();
}
function renderWordQuestion(focus=false) {
  const state=wordStates[activeWordLesson], lesson=WORD_LESSONS[activeWordLesson];
  wordEl('words-score').textContent=state.earned.length*10;
  wordEl('word-question').hidden=state.roundDone;wordEl('word-results').hidden=!state.roundDone;
  if(state.roundDone){renderWordResults();return;}
  const question=lesson.questions[state.queue[state.position]];
  wordEl('word-number').textContent=`${state.practice?'PRACTICE':'QUESTION'} ${state.position+1} / ${state.queue.length}`;
  wordEl('word-kind').textContent=question.role?'DISCUSSION SIGNAL':'WORD DISCOVERY';
  wordEl('word-term').textContent=question.term;wordEl('word-prompt').textContent=question.prompt;
  wordEl('word-progress').textContent=`${state.position+(state.checked?1:0)} of ${state.queue.length} completed`;
  wordEl('word-options').replaceChildren();
  question.options.forEach((option,i)=>{
    const button=document.createElement('button');button.className='answer';button.type='button';button.disabled=state.checked;
    button.setAttribute('aria-pressed',String(state.selected===i));
    const letter=document.createElement('span');letter.className='letter';letter.textContent='ABCD'[i];letter.setAttribute('aria-hidden','true');
    const label=document.createElement('span');label.textContent=option;button.append(letter,label);
    if(state.selected===i)button.classList.add('selected');
    if(state.checked&&(i===question.correct||i===state.selected)){
      button.classList.add(i===question.correct?'correct':'incorrect');
      const mark=document.createElement('span');mark.className='answer-state';mark.textContent=i===question.correct?'✓ Correct':'Your pick';button.append(mark);
    }
    button.onclick=()=>{if(state.checked)return;state.selected=i;renderWordQuestion();wordEl('word-options').children[i].focus();};
    wordEl('word-options').append(button);
  });
  wordEl('word-feedback').hidden=!state.checked;
  if(state.checked){
    const correct=state.selected===question.correct;
    wordEl('word-feedback').classList.toggle('mistake',!correct);
    const heading=document.createElement('strong');heading.textContent=correct?'Nice discovery! +10 points ✦':'Keep exploring — no points lost.';
    const explanation=document.createElement('span');explanation.textContent=question.feedback;
    wordEl('word-feedback').replaceChildren(heading,explanation);
  }
  wordEl('word-check').disabled=state.selected===null;
  wordEl('word-check').textContent=!state.checked?'Check answer →':state.position===state.queue.length-1?'See my results →':'Next question →';
  if(focus)wordEl('word-prompt').focus();
}
wordEl('word-check').onclick=()=>{
  const s=wordStates[activeWordLesson], index=s.queue[s.position],q=WORD_LESSONS[activeWordLesson].questions[index];
  if(s.roundDone||s.selected===null)return;
  if(!s.checked){s.checked=true;if(s.selected===q.correct){if(!s.earned.includes(index))s.earned.push(index);}else if(!s.missed.includes(index))s.missed.push(index);}
  else if(s.position===s.queue.length-1){s.roundDone=true;s.completed=true;}
  else{s.position++;s.selected=null;s.checked=false;}
  renderWordQuestion(s.selected===null||s.roundDone);
};
function renderWordResults(){
  const s=wordStates[activeWordLesson],lesson=WORD_LESSONS[activeWordLesson];
  wordEl('word-number').textContent='QUEST COMPLETE';wordEl('word-kind').textContent='KEEP DISCOVERING';
  wordEl('word-results').innerHTML=`<div class="results"><div class="result-icon" aria-hidden="true">✦</div><h2 tabindex="-1" id="word-result-title">${lesson.title}: explored!</h2><div class="result-score">${s.earned.length*10} <small>/ ${lesson.questions.length*10} points</small></div><p>${s.missed.length?`${s.missed.length} questions to revisit. Practise to earn the remaining points.`:'You unlocked every word and discussion signal in this quiz.'}</p><div class="result-actions"></div></div>`;
  const actions=wordEl('word-results').querySelector('.result-actions');
  if(s.missed.length){const retry=document.createElement('button');retry.className='primary-button';retry.textContent='Practise missed words →';retry.onclick=()=>{s.queue=[...s.missed];s.missed=[];s.position=0;s.selected=null;s.checked=false;s.roundDone=false;s.practice=true;renderWordQuestion(true);};actions.append(retry);}
  const reset=document.createElement('button');reset.className='secondary-button';reset.textContent='Start this word quiz again';reset.onclick=()=>{wordStates[activeWordLesson]=freshWordState(activeWordLesson);renderWordQuestion(true);};actions.append(reset);
}
wordEl('word-lesson-choice').onchange=e=>selectWordLesson(+e.target.value);
selectWordLesson(0);
