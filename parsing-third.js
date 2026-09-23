'use strict';
// Continuation of quiz 2. Coordinates are on the same unmodified 26a scan.
const THIRD_DAF_WORDS = NEXT_DAF_WORDS.slice(nextObjectionStart).map(word => [...word]);
function addThirdDafRow(y, right, text, leftEdges) {
  const words = text.split(' ');
  if (words.length !== leftEdges.length) throw new Error(`Daf row ${y}: word/box mismatch`);
  words.forEach((word, i) => THIRD_DAF_WORDS.push([word, leftEdges[i], i ? leftEdges[i-1]-3 : right, y]));
}
addThirdDafRow(1460,940,'וחסרון לא יוכל להמנות מעות לא יוכל לתקון זה שבטל ק״ש של ערבית וק״ש של שחרית או תפלה של',[889,865,827,764,712,680,642,590,565,513,474,444,389,345,316,251,228,172,141]);
addThirdDafRow(1484,940,'ערבית או תפלה של שחרית וחסרון לא יוכל להמנות זה שנמנו חביריו לדבר מצוה ולא נמנה עמהם א״ר',[889,865,813,783,724,660,638,600,535,511,460,399,348,302,267,223,175,140]);
addThirdDafRow(1508,940,'יצחק א״ר יוחנן הכא במאי עסקינן שבטל במזיד אמר רב אשי דיקא נמי דקתני בטל ולא קתני טעה ש״מ',[901,868,824,788,743,687,627,577,537,513,475,429,398,347,307,274,235,195,153]);
// The catchword at the foot of the daf previews the next page; it is not part of the conclusion.
THIRD_DAF_WORDS.push(['תנו',217,244,1528]);
function thirdPhraseIndex(phrase) {
  const tokens = phrase.split(' ');
  const index = THIRD_DAF_WORDS.findIndex((_,i) => tokens.every((word,j) => THIRD_DAF_WORDS[i+j]?.[0] === word));
  if (index < 0) throw new Error(`Missing boundary: ${phrase}`);
  return index;
}
const thirdAnswerStart = thirdPhraseIndex('א״ר יצחק');
const thirdSupportStart = thirdPhraseIndex('אמר רב אשי');
const THIRD_PARSE_STEPS = [
  {label:'question',start:0,end:thirdAnswerStart-1,title:'A teaching that seems to disagree?',instruction:'Select the entire objection, including the verse and both parts of the teaching explaining it. Stop before the response begins.',explanation:'מיתיבי introduces a challenge from an earlier teaching. It describes missing Shema or prayer as something that cannot be repaired, and also explains missing a chance to join a mitzvah. Keep the complete quoted teaching together, through ולא נמנה עמהם. The next א״ר begins the answer, not another part of the objection.'},
  {label:'answer',start:thirdAnswerStart,end:thirdSupportStart-1,title:'Which kind of missed prayer?',instruction:'Include who gives the answer and the full explanation of the case. Stop before Rav Ashi adds support.',explanation:'Rabbi Yitzchak reports Rabbi Yochanan’s answer: הכא במאי עסקינן means “What case are we dealing with here?” The quoted teaching concerns someone who deliberately omitted the prayer — שבטל במזיד. The earlier discussion concerned a mistake. Stop after במזיד; Rav Ashi’s supporting inference is a separate step.'},
  {label:'support',start:thirdSupportStart,end:THIRD_DAF_WORDS.length-2,title:'What clue does Rav Ashi find?',instruction:'Select Rav Ashi’s statement, his comparison of the words, and the concluding phrase. Leave out the catchword at the foot of the page.',explanation:'דיקא נמי means “This is also precise”: the wording supports the answer. The teaching says בטל (omitted), not טעה (made a mistake). ש״מ, short for שמע מינה, accepts the inference. That completes this discussion. תנו at the foot of the page previews the next page; it is not part of this conclusion.'}
];
