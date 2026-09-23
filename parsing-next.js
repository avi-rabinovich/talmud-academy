'use strict';
// Manually aligned RTL word boundaries on the existing Berachot 26a scan.
// Each row lists printed tokens and their left edges; right edges follow the previous token.
const NEXT_DAF_WORDS = [];
function addDafRow(y, right, text, leftEdges) {
  const words = text.split(' ');
  if (words.length !== leftEdges.length) throw new Error(`Daf row ${y}: word/box mismatch`);
  words.forEach((word, i) => NEXT_DAF_WORDS.push([word, leftEdges[i], (i ? leftEdges[i - 1] - 3 : right), y]));
}
addDafRow(1268,487,'וכ״ע עד חצות ותו לא והאמר רב מרי בריה דרב',[456,430,383,353,329,273,246,218,173,138]);
addDafRow(1292,940,'הונא בריה דר׳ ירמיה בר אבא אמר רבי יוחנן טעה ולא התפלל ערבית מתפלל בשחרית שתים שחרית',[903,851,818,768,742,704,662,624,587,541,502,447,385,327,251,199,138]);
addDafRow(1316,940,'מתפלל במנחה שתים כולי יומא מצלי ואזיל עד חצות יהבי ליה שכר תפלה בזמנה מכאן ואילך שכר',[881,810,770,729,688,642,599,563,516,473,437,395,340,283,239,184,138]);
addDafRow(1340,940,'תפלה יהבי ליה שכר תפלה בזמנה לא יהבי ליה איבעיא להו טעה ולא התפלל מנחה מהו שיתפלל',[894,850,810,765,713,659,631,592,559,495,458,411,375,310,256,211,138]);
addDafRow(1364,940,'ערבית ב׳ את״ל טעה ולא התפלל ערבית מתפלל שחרית ב׳ משום דחד יומא הוא דכתיב ויהי ערב',[888,866,815,767,729,663,607,544,478,455,397,357,321,283,233,184,138]);
addDafRow(1388,940,'ויהי בקר יום אחד אבל הכא תפלה במקום קרבן היא וכיון דעבר יומו בטל קרבנו או דילמא כיון דצלותא',[903,871,843,807,765,723,674,616,573,537,496,447,412,370,323,299,241,202,138]);
addDafRow(1412,940,'רחמי היא כל אימת דבעי מצלי ואזיל ת״ש דאמר רב הונא בר יהודה א״ר יצחק א״ר יוחנן טעה ולא',[892,856,827,779,734,685,640,599,540,512,472,439,384,350,305,270,222,176,138]);
addDafRow(1436,940,'התפלל מנחה מתפלל ערבית ב׳ ואין בזה משום דעבר יומו בטל קרבנו מיתיבי מעות לא יוכל לתקון',[878,822,759,700,679,646,610,557,512,472,433,377,312,261,232,193,138]);

function nextPhraseIndex(phrase) {
  const tokens = phrase.split(' ');
  return NEXT_DAF_WORDS.findIndex((_, i) => tokens.every((t, j) => NEXT_DAF_WORDS[i+j]?.[0] === t));
}
const nextAnswerStart = nextPhraseIndex('כולי יומא');
const nextQuestionStart = nextPhraseIndex('איבעיא להו');
const nextProofStart = nextPhraseIndex('ת״ש דאמר');
const nextObjectionStart = nextPhraseIndex('מיתיבי');
if ([nextAnswerStart,nextQuestionStart,nextProofStart,nextObjectionStart].some(i => i < 0)) throw new Error('Missing parsing boundary');
const NEXT_PARSE_STEPS = [
  {label:'question',start:0,end:nextAnswerStart-1,title:'Is midday the end of all prayer?',instruction:'Select the whole question, including the statement about making up a missed prayer. Stop before the Gemara answers.',explanation:'וכ״ע asks whether everyone agrees that nothing can be prayed after midday. והאמר introduces a challenge: Rabbi Yochanan says a missed Shacharit can be made up at Minchah. Keep that entire cited statement with the question. כולי יומא begins the answer.'},
  {label:'answer',start:nextAnswerStart,end:nextQuestionStart-1,title:'Where does the distinction finish?',instruction:'Select the full answer, including both sides of its distinction about reward. Stop before a new question begins.',explanation:'The Gemara distinguishes prayer from prayer at its proper time. Later prayer still receives reward for prayer, but not for prayer at its proper time. Do not stop halfway through the comparison. איבעיא להו begins a new question.'},
  {label:'question',start:nextQuestionStart,end:nextProofStart-1,title:'What if someone missed Minchah?',instruction:'Select the question AND both possibilities the Gemara considers. Stop when it begins bringing a source to answer.',explanation:'איבעיא להו opens the question about making up a missed Minchah at Maariv. את״ל introduces an assumption, and או דילמא introduces the alternative: perhaps prayer, as a request for mercy, can still be made up. These possibilities belong to the question. ת״ש begins the response.'},
  {label:'answer',start:nextProofStart,end:nextObjectionStart-1,title:'Find the answer brought from a source.',instruction:'Start with the invitation to hear evidence. Include the full ruling and its explanation. Stop before the next objection.',explanation:'ת״ש means “come and hear.” The cited teaching says someone who mistakenly missed Minchah prays twice at Maariv. It rejects applying “its day has passed, its offering is lost” here. מיתיבי opens the next objection, which belongs to the next exercise.'}
];
