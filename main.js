/* English LexTALE + Mandarin LexCH two-language administration. */
'use strict';
let session = null;
const show = id => document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
const nowISO = () => new Date().toISOString();
const escapeCSV = v => '"' + String(v ?? '').replaceAll('"','""') + '"';
function lang() { return session.order[session.blockIndex]; }
function begin() {
  const pid = document.getElementById('participant_id').value.trim();
  const examiner = document.getElementById('experimenter').value.trim();
  if (!/^[0-9]+$/.test(pid) || !examiner) return;
  const even = Number(BigInt(pid) % 2n) === 0;
  session = {pid, examiner, order: even ? ['en','zh'] : ['zh','en'], blockIndex:0,
    data:[], start:nowISO(), summaries:{}, english:[], englishIndex:0, englishStart:0};
  showIntro();
}
function showIntro() {
  const ch = lang() === 'zh';
  document.getElementById('intro_title').textContent = ch ? 'LexCH — 中文词汇测试' : 'LexTALE — English';
  document.getElementById('intro_content').innerHTML = ch ?
    '<p>在接下来的测试中，您将看到144个中文词语，其中有一些并不是真正存在的词语。请勾选您<strong>知道意思</strong>或<strong>能够说出同义词</strong>的词语。如果不确定词义，请不要勾选。</p><p>您不需要快速作答，但请独立完成测试，不要使用词典或其他帮助。</p>' :
    '<p>You will see approximately 60 letter strings one at a time. Decide whether each string is a real English word. Select Yes for a real word and No for a nonword.</p><p>If you are sure the word exists even though you cannot give its exact meaning, choose Yes. If uncertain, choose No. British English spelling is used. There is no time limit.</p>';
  show('intro');
}
function startTest(){
  if (lang() === 'en') {
    session.english = lex_dict.en.map(x => ({...x}));
    session.englishIndex=0;
    show('english'); nextEnglish();
  } else {
    const list = document.getElementById('lexch_list'); list.replaceChildren();
    for (const item of LEXCH_ITEMS) {
      const row=document.createElement('label'); row.className='lexch-row';
      const cb=document.createElement('input'); cb.type='checkbox';cb.dataset.itemId=String(item.item_id);
      const n=document.createElement('span');n.className='lexch-number';n.textContent=item.item_id+'.';
      const word=document.createElement('span');word.textContent=item.word;
      row.append(cb,n,word);list.appendChild(row);
    }
    show('mandarin'); window.scrollTo(0,0);
  }
}
function nextEnglish() {
  const i=session.englishIndex;
  document.getElementById('english_word').textContent=session.english[i].word;
  document.getElementById('english_progress').textContent='Item '+(i+1)+' of '+session.english.length;
  session.englishStart=performance.now();
}
function answerEnglish(answer) {
  if (!session || lang()!=='en' || !document.getElementById('english').classList.contains('active'))return;
  const i=session.englishIndex, item=session.english[i];
  const rt=Math.round(performance.now()-session.englishStart), valid=item.wstatus===1;
  const correct=(answer==='yes')===valid;
  session.data.push({block:session.blockIndex+1,language:'English_LexTALE',item_id:i+1,
    stimulus:item.word,valid,scored:item.dummy===0,answer,correct,rt_ms:rt});
  session.englishIndex++;
  if(session.englishIndex < session.english.length)nextEnglish();else {
    const rows=session.data.filter(r=>r.block===session.blockIndex+1 && r.scored);
    const hits=rows.filter(r=>r.valid && r.answer==='yes').length;
    const trueReject=rows.filter(r=>!r.valid && r.answer==='no').length;
    session.summaries.en={score:((hits/40)+(trueReject/20))*50, hits, trueReject};
    doneLanguage();
  }
}
function submitLexch(){
  if (!session || lang()!=='zh')return;
  if (!confirm('确认已检查全部144项并提交答案？提交后将无法修改。'))return;
  let hits=0, falseAlarms=0;
  document.querySelectorAll('#lexch_list input[type=checkbox]').forEach((cb,i)=>{
    const item=LEXCH_ITEMS[i], known=cb.checked;
    if(item.valid && known) hits++;
    if(!item.valid && known)falseAlarms++;
    session.data.push({block:session.blockIndex+1,language:'Mandarin_LexCH',item_id:item.item_id,
      stimulus:item.word,valid:item.valid,scored:true,answer:known?'yes':'no',correct:known===item.valid,rt_ms:''});
  });
  session.summaries.zh={score:hits-2*falseAlarms,hits,falseAlarms};
  doneLanguage();
}
function doneLanguage(){
  if(session.blockIndex===0){
    session.blockIndex=1;
    document.getElementById('next_language').textContent='Next: '+(lang()==='en'?'English LexTALE':'Mandarin LexCH');
    show('between');
  }else{
    document.getElementById('file_name').textContent='lextale_'+session.pid+'.csv';
    show('complete');
    downloadCSV();
  }
}
function makeCSV(){
  const head=['participant_id','experimenter','language_order','block','test','item_id','stimulus','valid','scored','response','correct','response_time_ms','test_score','score_method'];
  const rows=session.data.map(r=>{
    const ch=r.language==='Mandarin_LexCH';
    const s=ch?session.summaries.zh:session.summaries.en;
    return [session.pid,session.examiner,session.order.join('_then_'),r.block,r.language,r.item_id,r.stimulus,
      r.valid?1:0,r.scored?1:0,r.answer,r.correct?1:0,r.rt_ms,s.score,
      ch?'hits_minus_2_false_alarms':'mean_word_nonword_accuracy_percent'].map(escapeCSV).join(',');
  });
  return '\ufeff'+[head.join(','),...rows].join('\r\n')+'\r\n';
}
function downloadCSV(){
  if (!session || !session.summaries.en || !session.summaries.zh)return;
  const blob=new Blob([makeCSV()],{type:'text/csv;charset=utf-8'});
  const u=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=u;a.download='lextale_'+session.pid+'.csv';document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(u),15000);
}
document.addEventListener('DOMContentLoaded',()=>{
 document.getElementById('setup_form').addEventListener('submit',e=>{e.preventDefault();begin();});
 document.getElementById('start_test').addEventListener('click',startTest);
 document.querySelectorAll('#english_actions button').forEach(b=>b.addEventListener('click',()=>answerEnglish(b.dataset.answer)));
 document.getElementById('finish_lexch').addEventListener('click',submitLexch);
 document.getElementById('continue_btn').addEventListener('click',showIntro);
 document.getElementById('download_again').addEventListener('click',downloadCSV);
});
