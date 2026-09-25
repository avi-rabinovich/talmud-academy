'use strict';
// Original teaching material, checked against Bavli Berachot 26a.
// Entry: term, meaning, three distractors, explanation, optional discussion role.
const WORD_LESSONS = [
  {id:'midday',title:'After midday',intro:'The Gemara asks whether prayer is possible after midday. Its answer distinguishes prayer from prayer at its proper time.',source:()=>NEXT_DAF_WORDS.slice(0,nextQuestionStart).map(w=>w[0]).join(' '),entries:[
    ['וכ״ע','And everyone',['And no one','And sometimes','And yesterday'],'Short for וכולי עלמא. Here the Gemara asks whether everyone agrees about the limit.','question'],
    ['עד חצות','Until midday',['After sunset','Before midnight','Throughout the week'],'חצות here is midday, halfway through the daylight hours.'],
    ['ותו לא','And no more / no later',['And once again','And so he said','And everyone agrees'],'Here it asks: up to midday, and no later?','question'],
    ['והאמר','But didn’t he say…?',['And he will pray','When did he arrive?','For it is written'],'This introduces a statement that challenges the apparent limit.','objection'],
    ['בריה','Son of',['Teacher of','Student of','Brother of'],'בריה דרב הונא identifies someone as the son of Rav Huna.'],
    ['טעה','Made a mistake',['Acted deliberately','Finished early','Taught a rule'],'The discussion concerns someone who mistakenly missed a prayer.'],
    ['ולא התפלל','And did not pray',['And did not eat','And prayed again','And did not teach'],'התפלל means prayed; ולא makes it negative.'],
    ['ערבית','The evening prayer',['The morning prayer','The additional prayer','The afternoon prayer'],'ערבית is also called Maariv.'],
    ['בשחרית','At the morning prayer',['At the evening prayer','At the afternoon prayer','During the night watch'],'שחרית is Shacharit, the morning prayer. ב־ here means at.'],
    ['במנחה','At the afternoon prayer',['At the morning prayer','At midnight','At the additional prayer'],'מנחה is Minchah, the afternoon prayer.'],
    ['שתים','Two',['One','Three','Four'],'Here it means two Amidah prayers. The scan also uses ב׳ for two.'],
    ['כולי יומא','Throughout the day',['Every night','Half the day','The next day'],'כולי means all; יומא means day. This phrase starts the answer here.'],
    ['מצלי ואזיל','Continues to pray',['Continues to eat','Stops teaching','Returns home'],'מצלי means prays. ואזיל adds the sense of continuing; here it is not about walking.'],
    ['יהבי ליה','They give him',['He gives them','They ask him','He tells them'],'יהבי means they give; ליה means to him. Here the subject is reward.'],
    ['שכר תפלה','Reward for prayer',['The time for prayer','The place of prayer','The words of prayer'],'שכר here means reward.'],
    ['בזמנה','At its proper time',['In its place','For its own sake','After it finishes'],'זמן means time. The answer distinguishes timely prayer from later prayer.'],
    ['מכאן ואילך','From this point onward',['Before that point','Only on this day','From another place'],'Here it refers to the time after midday.'],
    ['לא יהבי ליה','They do not give him',['They give him twice','He does not give them','They do not ask him'],'לא negates יהבי ליה. Keep track of which reward is being discussed.']
  ]},
  {id:'minchah',title:'A missed Minchah',intro:'Could someone who mistakenly missed Minchah make it up at Maariv? Follow the question, its two possibilities, and the source brought to answer.',source:()=>NEXT_DAF_WORDS.slice(nextQuestionStart,nextObjectionStart).map(w=>w[0]).join(' '),entries:[
    ['איבעיא להו','A question was raised before them',['An answer was given to him','They all agreed','A verse was written'],'This opens a new question for discussion.','question'],
    ['מהו','What is the ruling?',['Who said it?','Where did he go?','When was it written?'],'Here מהו asks whether the proposed action is allowed.','question'],
    ['שיתפלל','That he should pray',['That he should learn','That he should finish','That he should forget'],'מהו שיתפלל asks about the possibility of his praying.'],
    ['את״ל','If you say / if you establish that…',['Come and hear','But didn’t he say','Learn from this'],'Short for אם תמצא לומר. It introduces an assumption used to explore the question.','assumption'],
    ['משום','Because of',['Instead of','Before','Apart from'],'Introduces a reason: משום דחד יומא הוא.'],
    ['דחד יומא הוא','For it is one day',['For there are two days','For the day has ended','For it is another night'],'חד means one. The argument treats evening and the following morning as one day.'],
    ['דכתיב','For it is written',['For he prayed','For they asked','For he forgot'],'Introduces a verse as written support.','verse'],
    ['ויהי ערב ויהי בקר','And there was evening and there was morning',['And the sun stood still','And he rose early to pray','And there was morning and there was afternoon'],'The verse’s order supports counting evening and morning together.'],
    ['אבל הכא','But here',['And everywhere','Even yesterday','Until now'],'אבל marks a contrast; הכא means here, in this case.','contrast'],
    ['במקום קרבן','In place of an offering',['Beside a teacher','Before a question','At a fixed time'],'קרבן is an offering. One side of the question compares prayer with an offering.'],
    ['וכיון','And since',['And perhaps','And until','And otherwise'],'Introduces a reason based on something already being the case.'],
    ['דעבר יומו','That its day has passed',['That its day has begun','That every day is alike','That he prayed yesterday'],'עבר means passed. The argument concerns the time allotted to an offering.'],
    ['בטל קרבנו','Its offering is lost / can no longer be brought',['Its offering has doubled','Its offering is ready','Its offering has arrived'],'Here the opportunity to bring that offering is gone. This is one proposed line of reasoning.'],
    ['או דילמא','Or perhaps',['Therefore certainly','Come and hear','But it is written'],'Introduces an alternative possibility, not the final answer.','alternative'],
    ['דצלותא','That prayer',['That an offering','That the day','That the question'],'צלותא is the Aramaic word for prayer. ד־ here means that or because.'],
    ['רחמי','Mercy',['Time','Reward','Mistakes'],'The second possibility describes prayer as asking for mercy.'],
    ['כל אימת','Whenever',['Only once','Until midday','At no time'],'כל אימת דבעי means whenever he wishes.'],
    ['דבעי','That he wishes',['That he forgot','That he finished','That he counted'],'Here בעי means wishes. In other settings it can concern asking or needing.'],
    ['ת״ש','Come and hear',['If you say','Or perhaps','Everyone agrees'],'Short for תא שמע. It introduces a source to resolve the question.','answer'],
    ['דאמר','For he said',['For it is written','When he prayed','If he forgot'],'Introduces the statement cited as evidence. The name and ruling follow.','support'],
    ['בר יהודה','Son of Yehudah',['Teacher of Yehudah','Brother of Yehudah','Student of Yehudah'],'בר means son in Aramaic. It is part of the speaker’s identification.'],
    ['א״ר','Rabbi … said',['Rabbi … asked','Rabbi … prayed','Rabbi … returned'],'Short for אמר רבי. The scan uses it when reporting statements.'],
    ['ואין בזה משום','And this does not fall under…',['And this proves that…','And this always requires…','And this was said before…'],'Here the answer says the lost-offering argument does not apply to the makeup prayer.']
  ]},
  {id:'deliberate',title:'Mistake, answer, and proof',intro:'A teaching seems to disagree. The answer explains which case it concerns, and Rav Ashi supports that explanation from the wording.',source:()=>THIRD_DAF_WORDS.slice(0,-1).map(w=>w[0]).join(' '),entries:[
    ['מיתיבי','They raise an objection from a teaching',['They finish the discussion','They introduce a prayer','They all accept the answer'],'A new challenge begins here. It quotes an earlier teaching.','objection'],
    ['מעות','Something crooked / distorted',['Something missing','Something complete','Something counted'],'The verse speaks of something crooked that cannot be put right.'],
    ['לא יוכל לתקון','Cannot be put right',['Must be repeated','Can be counted','Should be forgotten'],'לתקון here means to repair or put right.'],
    ['וחסרון','And a lack / something missing',['And a reward','And a question','And a complete group'],'The second part of the verse concerns a lack.'],
    ['להמנות','To be counted',['To be repaired','To be prayed','To be taught'],'Notice the difference between counting and repairing in the two parts of the verse.'],
    ['זה שבטל','This is someone who omitted',['This is someone who finished','This is someone who counted','This is someone who answered'],'בטל here describes omitting a required recitation or prayer. The answer explains the deliberate case.'],
    ['ק״ש','The recitation of Shema',['The morning Amidah','The afternoon Amidah','A verse from Psalms'],'Short for קריאת שמע.'],
    ['או','Or',['And','Because','Until'],'Separates alternatives in the quoted teaching.'],
    ['שנמנו חביריו','Whose companions were counted / joined together',['Whose teachers forgot','Whose children prayed','Whose companions objected'],'Here the companions joined in a mitzvah and the person did not join them.'],
    ['לדבר מצוה','For a mitzvah activity',['For a word’s meaning','For an evening meal','For a question about time'],'דבר here means a matter or activity, not simply a spoken word.'],
    ['ולא נמנה עמהם','And was not counted among them',['And was counted twice','And did not speak to him','And answered before them'],'עמהם means with them; the person missed joining the group.'],
    ['הכא במאי עסקינן','What case are we dealing with here?',['Where is the verse written?','Who asked the first question?','When should the day begin?'],'Here the phrase introduces a clarification that answers the objection.','answer'],
    ['שבטל במזיד','Who omitted it deliberately',['Who missed it by mistake','Who completed it early','Who repeated it twice'],'במזיד means deliberately. This distinguishes the case from טעה, a mistake.'],
    ['דיקא נמי','The wording also supports this',['The question remains unanswered','Everyone disagrees with this','Another prayer begins now'],'Rav Ashi points to precise wording that supports the answer.','support'],
    ['דקתני','For it teaches / states',['For it is written in a verse','For he wishes','For they give him'],'Introduces the actual wording of the cited teaching. Here it says בטל.','wording'],
    ['ולא קתני','And it does not teach / state',['And he did not pray','And it was never written','And they did not count'],'Contrasts what the teaching says with what it does not say.'],
    ['טעה','Made a mistake',['Omitted deliberately','Counted a group','Brought an offering'],'Rav Ashi notes that the teaching does not use this word.'],
    ['ש״מ','Learn from it / infer this',['Come and hear','If you say','Or perhaps'],'Short for שמע מינה. Here it accepts the inference and closes the discussion.','conclusion']
  ]}
];
// Add separate function questions so signal meanings are not confused with roles.
const ROLE_QUESTIONS = [
  ['והאמר','What does והאמר do here?','Challenges the apparent midday limit',['Answers the question','Introduces a new verse','Concludes the discussion'],'The quoted statement challenges the idea that prayer cannot occur after midday.'],
  ['או דילמא','What does או דילמא do here?','Introduces the second possibility',['Confirms the final ruling','Rejects the entire question','Names the person speaking'],'Both possibilities still belong to the question. ת״ש introduces the response.'],
  ['הכא במאי עסקינן','What does הכא במאי עסקינן do here?','Answers by identifying the case',['Raises a new objection from a verse','Ends the quotation without answering','Introduces a second prayer time'],'The quoted teaching concerns deliberate omission; the earlier discussion concerned a mistake.']
];
WORD_LESSONS.forEach((lesson,l) => {
  lesson.questions=lesson.entries.map((entry,i)=>{
    const [term,meaning,distractors,feedback,role]=entry;
    const options=[...distractors]; const correct=i%4; options.splice(correct,0,meaning);
    return {term,prompt:`What does ${term} mean here?`,options,correct,feedback,role};
  });
  const [term,prompt,meaning,distractors,feedback]=ROLE_QUESTIONS[l];
  const correct=lesson.questions.length%4; const options=[...distractors]; options.splice(correct,0,meaning);
  lesson.questions.push({term,prompt,options,correct,feedback,role:'discussion role'});
});
