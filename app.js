/* INFO 4300 Section 3. Buildless and self-contained. All examples are fictional. */
(() => {
'use strict';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const lesson = window.LESSON.segments;
const audioData = window.AUDIO_DATA || {};
const audio = $('#narration');
let current = 0, captionsVisible = true, activeCue = -1, activeSignal = -1;
let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let view = 'home';
const phases = window.LESSON.phases;
const shortTitles = lesson.map(s=>s.short);
const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const signal = (phrase,content,cls='') => `<div class="signal ${cls}" data-signal="${escapeHTML(phrase)}">${content}</div>`;
const figNote = '<p class="visual-note">Cedar Crossing is fictional. All proposed actions, conditions, targets, and results are teaching examples.</p>';
const visuals = {
 welcome: () => `<div class="scene-block"><img src="cedar-workshop.svg" width="1120" height="760" alt="A fictional workshop preparation scene: colleagues, a schedule board, a welcome table, materials, and a screen. Two times and unchecked materials signal handoff gaps."><div><span class="small-label">ONE WORKSHOP / CONNECTED WORK</span><h2>Whose step comes next?</h2>${signal('two announcements','<p>Two times announced.<br>One unchecked materials box.</p>')}${signal('connections between jobs','<p><strong>Investigate the connections before assigning blame.</strong></p>')}</div></div>${figNote}`,
 structure: () => `<h2>Follow the reporting relationship</h2><p class="intro-line">Illustrative formal structure. Every solid connector means <strong>supervises</strong>.</p><div class="org-chart" role="group" aria-label="Director supervises programs lead, public services supervisor, and technical support specialist. Public services supervisor supervises Assistant A and Assistant B."><div class="org-director signal" data-signal="director supervises"><strong>Director</strong><span>3 direct reports</span></div><p class="org-link" aria-hidden="true">↓ supervises these three roles ↓</p><div class="org-branches"><div class="org-role"><strong>Programs lead</strong><span>Workshop planning</span></div><div class="org-role"><strong>Public services supervisor</strong><span>Welcome and registration</span><div class="org-sub signal" data-signal="two assistants"><span class="org-link">↓ supervises ↓</span><span>Assistant A</span><span>Assistant B</span></div></div><div class="org-role"><strong>Technical support specialist</strong><span>Equipment preparation</span></div></div></div><div class="informal-band signal" data-signal="informal relationships"><span class="small-label">INFORMAL ADVICE / NOT SUPERVISION</span><p>An experienced assistant advises colleagues about welcoming groups.</p></div>${figNote}`,
 culture: () => `<h2>Evidence is not the same as interpretation</h2><div class="culture-layers">${[
 ['01','Artifact','A meeting recognizes only departmental totals.','Artifacts are visible'],['02','Espoused value','“Collaboration matters.”','Espoused values'],['03','Possible basic assumption','“Helping another unit may not count toward my success.”','Perhaps staff believe']
 ].map(([n,t,p,a],i)=>`<article class="culture-layer signal" data-signal="${a}"><span class="layer-no">${n}</span><div><h3>${t}</h3><p>${p}</p>${i===2?'<span class="evidence-tag">HYPOTHESIS / NEEDS INVESTIGATION</span>':''}</div></article>`).join('')}</div><p class="visual-note">Schein’s three levels of culture, applied to an invented example. One meeting does not establish everyone’s beliefs.</p>`,
 specialization: () => `<h2>Follow one service across the units</h2><ol class="workflow">${[
 ['Agree on the workshop','Programs','Topic, speaker, intended result','Programs staff'],['Invite and register','Public services','Use the confirmed time','public services handles'],['Prepare the room','Technical support + colleagues','Equipment and materials ready','technical support checks'],['Deliver and review','Contributing roles','Participant experience and follow-up','Trace the workshop']
 ].map(([t,r,p,a],i)=>`<li class="signal" data-signal="${a}"><span class="step-no">${i+1}</span><div><h3>${t}</h3><span class="role-tag">${r}</span><p>${p}</p></div></li>`).join('')}</ol><div class="two-notes"><div><strong>Horizontal specialization</strong><p>Group work across units.</p></div><div><strong>Vertical differentiation</strong><p>Arrange reporting levels.</p></div></div>${figNote}`,
 authority: () => `<h2>Four related ideas</h2><div class="definition-grid">${[
 ['Authority','Legitimate discretion attached to a role','Authority is legitimate'],['Power','Ability to influence','Power is the ability'],['Responsibility','Duty to carry out work','Responsibility is a duty'],['Accountability','Answerability for the work','accountability is answerability']
 ].map(([t,p,a])=>`<article class="signal" data-signal="${a}"><h3>${t}</h3><p>${p}</p></article>`).join('')}</div><div class="decision-split signal" data-signal="Cedar Crossing might"><h3>Different decisions, different authority</h3><dl><dt>Director</dt><dd>New spending commitments</dd><dt>Programs lead</dt><dd>Schedule changes within approved limits</dd></dl></div><p class="visual-note">Decentralization concerns who may decide, not just where they work.</p>${figNote}`,
 delegation: () => `<div class="plan-sheet"><span class="small-label">CEDAR CROSSING / DELEGATED ASSIGNMENT</span><h2>A clear result. Usable authority.</h2><dl><dt>Responsible role</dt><dd>Programs lead</dd><dt>Result</dt><dd class="signal" data-signal="one confirmed schedule">One confirmed schedule and a ready room</dd><dt>Authority</dt><dd class="signal" data-signal="adjusting preparation times">Adjust preparation times within agreed staffing</dd><dt>Limit</dt><dd class="signal" data-signal="no new spending">No new spending commitment without approval</dd><dt>Resources</dt><dd>Approved time, information, and staff connections</dd><dt>Support</dt><dd class="signal" data-signal="brief check-in">A check-in and a clear route for problems</dd></dl></div><p class="visual-note">The manager retains appropriate oversight. A coordination title is not unlimited authority.</p>${figNote}`,
 coordination: () => `<h2>One confirmed time, shared by the people who need it</h2><div class="handoff-compare"><article><span class="small-label">BEFORE / GAP</span><h3>Two announcements</h3><p><span class="time-chip">2:00</span> <span class="time-chip">3:00</span></p><p>No one confirms which time is final.</p></article><article class="signal" data-signal="shared checklist"><span class="small-label">PILOT / AGREED HANDOFF</span><h3>One confirmed schedule</h3><p>Programs confirms → Public services publishes</p><p>Exceptions return to the designated coordinator.</p></article></div><div class="mechanisms">${[['Mutual adjustment','Talk and adapt'],['Direct supervision','Direct and monitor'],['Work processes','Specify how'],['Outputs','Specify the result'],['Skills','Specify preparation']].map(([h,p])=>`<div><strong>${h}</strong><span>${p}</span></div>`).join('')}</div><p class="visual-note">Five coordinating mechanisms from the chapter. Organizations combine them.</p>${figNote}`,
 design: () => `<h2>Fit the features to the work</h2><div class="model-compare"><article class="signal" data-signal="Mechanistic features"><span class="small-label">MECHANISTIC FEATURES</span><h3>Define and standardize</h3><ul><li>Formal roles and hierarchy</li><li>Standardized work</li><li>More centralized decisions</li></ul></article><article class="signal" data-signal="Organic features"><span class="small-label">ORGANIC FEATURES</span><h3>Connect and adapt</h3><ul><li>Flexible roles</li><li>Lateral communication</li><li>More distributed decisions</li></ul></article></div><div class="choice-note signal" data-signal="Real organizations can combine"><b>Both can contribute:</b> a predictable confirmation process, with room to adapt to a new event.</div><p class="visual-note">Broad models, not a ranking. Rules alone do not guarantee fairness; removing rules does not automatically create trust.</p>`,
 teams: () => `<h2>Define the group’s assignment</h2><div class="group-types">${[
 ['Committee','Ongoing or temporary; authority must be specified','A standing committee'],['Project group','A defined result and endpoint','A project group'],['Self-managing team','Manages assigned work within a delegated scope','A self-managing team']
 ].map(([h,p,a])=>`<article class="signal" data-signal="${a}"><h3>${h}</h3><p>${p}</p></article>`).join('')}</div><section class="matrix-demo signal" data-signal="A matrix combines"><h3>A matrix adds overlapping reporting</h3><div class="matrix-flow"><div><b>Functional supervisor</b><span>Functional reporting ↓</span></div><div><b>Project manager</b><span>Project reporting ↓</span></div><strong class="matrix-worker">Employee with both reporting relationships</strong></div><p>Specify priorities, time allocation, and who resolves competing directions.</p></section><p class="visual-note">A conceptual matrix example, not Cedar Crossing’s adopted structure. Advice and collaboration alone are not reporting relationships.</p>`,
 adaptation: () => `<h2>Investigate before redrawing the chart</h2><div class="analysis-three">${[
 ['Activities','What work is needed? Where does it belong?','activities analysis'],['Decisions','Which decisions are needed? Who makes them?','Decision analysis'],['Relations','How do units and managers depend on one another?','Relations analysis']
 ].map(([h,p,a])=>`<article class="signal" data-signal="${a}"><h3>${h}</h3><p>${p}</p></article>`).join('')}</div><div class="pilot-strip signal" data-signal="For this fictional pilot"><span class="small-label">OUR FICTIONAL PILOT</span><p>Keep the departments. Clarify handoffs. Give the programs lead bounded coordination responsibility.</p></div><div class="review-loop signal" data-signal="After several workshops"><strong>Check errors · workload · user experience</strong><span>↺ Use the evidence to adjust the arrangement</span></div><p class="visual-note">Drucker’s analyses as described in Chapter 9. Proposed measures are not evidence of results already achieved.</p>${figNote}`,
 case: () => `<h2>Your analysis begins with the evidence</h2><p class="intro-line"><cite>Differential Treatment?</cite> · Sarah Hays · Fairmead Library</p><div class="case-columns"><article class="signal" data-signal="He describes concerns"><span class="small-label">REPORTED EVENTS</span><h3>What does the narrative describe?</h3><p>Read the full case. Identify the account’s perspective and the events it reports.</p></article><article class="signal" data-signal="His worry"><span class="small-label">INTERPRETATIONS & UNKNOWNS</span><h3>What remains to be established?</h3><p>Distinguish a concern or explanation from a confirmed motive or outcome.</p></article></div><div class="case-process"><span>Events & perspective</span><span>Missing evidence</span><span>Relevant concepts</span><span>Alternative interpretations</span><span>Responses & tradeoffs</span><span>Your recommendation & follow-through</span></div><p class="visual-note">An original analysis aid. Read the full case and current instructions in Canvas. This lesson supplies no case verdict or legal test.</p>`
};

function showView(name){
 audio.pause();
 if (view==='game' && name!=='game') pauseGame(true);
 ['home','lesson','game','finish'].forEach(id=>$('#'+id).hidden=id!==name);
 view=name;
 window.scrollTo({top:0,behavior:reduced?'auto':'smooth'});
}
function renderLesson(index,focus=true){
 current=Math.max(0,Math.min(lesson.length-1,index));
 const s=lesson[current];
 showView('lesson');
 audio.pause(); audio.removeAttribute('src'); audio.load();
 const meta=audioData[s.id] || {filename:`narration-${s.id}.mp3`,captions:`narration-${s.id}.vtt`,cues:[]};
 audio.src=meta.filename || meta.audioFilename || `narration-${s.id}.mp3`;
 audio.playbackRate=Number($('#speed').value);audio.muted=$('#mute-all').checked;
 audio.load();
 activeCue=-1;activeSignal=-1;
 $('#media-error').hidden=true;
 $('#media-error').textContent='Audio is unavailable. You can read this chapter below or open the full transcript.';
 $('#chapter-kicker').textContent=s.chapter;
 $('#chapter-title').textContent=s.title;
 $('#progress-text').textContent=`${current+1} of ${lesson.length}`;
 $('#lesson-progress').max=lesson.length;
 $('#lesson-progress').value=current+1;
 $('#page-label').textContent=`Chapter ${current+1} / ${lesson.length}`;
 $('#chapter-select').value=current;
 $$('.chapter-button').forEach((b,i)=>{if(i===current)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
 $('#route').innerHTML=phases.map((p,i)=>`<li class="${i===s.phase?'active':''}" ${i===s.phase?'aria-current="step"':''}>${p}</li>`).join('');
 $('#visual').innerHTML=visuals[s.id]();
 $('#takeaway').textContent=s.takeaway;
 $('#captions').textContent='Press Play to hear this chapter. Captions appear here.';
 $('#captions').hidden=!captionsVisible;
 $('#download-audio').href=audio.getAttribute('src');
 $('#caption-download').href=meta.captions || `narration-${s.id}.vtt`;
 $('#chapter-text').innerHTML=`<p>${escapeHTML(s.narration)}</p><div class="visual-description"><strong>Visual description:</strong> ${escapeHTML(s.description)}</div>`;
 $('#chapter-transcript').open=false;
 $('#explore-content').innerHTML=s.explore.map(([h,p])=>`<h3>${escapeHTML(h)}</h3><p>${escapeHTML(p)}</p>`).join('');
 $('.explore').open=false;
 $('#previous').disabled=current===0;
 $('#next').textContent=current===lesson.length-1?'Optional game →':'Next →';
 renderPractice(s);
 if(focus) $('#chapter-title').focus({preventScroll:true});
}
function renderPractice(s){
 const slot=$('#practice-slot');
 if(!s.question){slot.innerHTML='';return;}
 slot.innerHTML=`<section class="practice" aria-label="Optional practice"><div class="practice-heading"><div><span class="small-label">TRY IT / ABOUT 20 SECONDS</span><h2>Put the idea to work</h2></div><button class="compact" id="open-practice">Try it</button></div><div id="practice-body" hidden><p class="question" id="question-text">${escapeHTML(s.question.prompt)}</p><div class="practice-options" role="group" aria-labelledby="question-text">${s.question.choices.map((c,i)=>`<button data-answer="${i}" aria-pressed="false">${escapeHTML(c)}</button>`).join('')}</div><div id="practice-feedback" role="status"></div><div class="practice-actions"><button class="text-button" id="retry-practice">Try again</button><button class="text-button" id="finish-practice">Continue lesson</button></div></div><button class="text-button" id="skip-practice">Skip this practice</button></section>`;
 $('#open-practice').onclick=()=>{audio.pause();$('#practice-body').hidden=false;$('#open-practice').hidden=true;$('.practice-options button').focus()};
 $$('.practice-options button').forEach(b=>b.onclick=()=>{
 audio.pause(); const i=Number(b.dataset.answer);
 $$('.practice-options button').forEach(c=>c.setAttribute('aria-pressed',String(c===b)));
 $('#practice-feedback').className='practice-feedback';
 $('#practice-feedback').textContent=s.question.feedback[i];
 });
 $('#retry-practice').onclick=()=>{audio.pause();$$('.practice-options button').forEach(b=>b.setAttribute('aria-pressed','false'));$('#practice-feedback').textContent='';$('#practice-feedback').className='';$('.practice-options button').focus()};
 const finish=()=>{audio.pause();$('#practice-body').hidden=true;$('#open-practice').hidden=false;$('#open-practice').textContent='Revisit';$('#media-error').hidden=true;$('#next').focus()};
 $('#finish-practice').onclick=finish;$('#skip-practice').onclick=finish;
}
function updateAudio(){
 const cues=(audioData[lesson[current].id]||{}).cues||[];
 const t=audio.currentTime;
 const i=cues.findIndex(c=>t>=c.start && t<c.end);
 if(i!==activeCue){activeCue=i;$('#captions').textContent=i>=0?cues[i].text:(audio.ended?'Chapter narration finished. Revisit any part, try the practice, or continue.':'');}
 let chosen=null;
 const spoken=cues.filter(c=>c.start<=t).map(c=>c.text.toLowerCase()).join(' ');
 $$('#visual [data-signal]').forEach(el=>{if(spoken.includes(el.dataset.signal.toLowerCase()))chosen=el});
 $$('#visual .signal').forEach(el=>el.classList.toggle('is-speaking',el===chosen));
}
audio.addEventListener('timeupdate',updateAudio);
audio.addEventListener('ended',()=>{$('#captions').textContent='Chapter narration finished. Revisit any part, try the practice, or continue.'});
audio.addEventListener('error',()=>{$('#media-error').hidden=false});
audio.addEventListener('play',()=>{if(view!=='lesson')audio.pause(); const pb=$('#practice-body');if(pb&&!pb.hidden){audio.pause();$('#media-error').hidden=false;$('#media-error').textContent='Narration is paused during practice. Choose Continue lesson, then press Play to resume.';}});
$('#speed').onchange=()=>{audio.defaultPlaybackRate=Number($('#speed').value);audio.playbackRate=audio.defaultPlaybackRate};
audio.addEventListener('loadedmetadata',()=>{audio.playbackRate=Number($('#speed').value)});
$('#replay').onclick=()=>{audio.pause();audio.currentTime=0;audio.play().catch(()=>{$('#media-error').hidden=false})};
$('#toggle-captions').onclick=()=>{captionsVisible=!captionsVisible;$('#captions').hidden=!captionsVisible;$('#toggle-captions').textContent=captionsVisible?'Hide captions':'Show captions';$('#toggle-captions').setAttribute('aria-pressed',String(captionsVisible))};
$('#mute-all').onchange=()=>audio.muted=$('#mute-all').checked;
$('#narration-volume').oninput=()=>audio.volume=Number($('#narration-volume').value);
$('#reduce-motion').checked=reduced;
document.body.classList.toggle('reduce-motion',reduced);
$('#reduce-motion').onchange=()=>{reduced=$('#reduce-motion').checked;document.body.classList.toggle('reduce-motion',reduced);};
$('#chapter-nav').innerHTML=lesson.map((s,i)=>`<button class="chapter-button" data-chapter="${i}"><b>${String(i+1).padStart(2,'0')}</b><span>${shortTitles[i]}</span></button>`).join('');
$('#chapter-select').innerHTML=lesson.map((s,i)=>`<option value="${i}">${i+1}. ${shortTitles[i]}</option>`).join('');
$$('.chapter-button').forEach(b=>b.onclick=()=>renderLesson(Number(b.dataset.chapter)));
$('#chapter-select').onchange=()=>renderLesson(Number($('#chapter-select').value));
$('#start').onclick=()=>renderLesson(0);
$('#previous').onclick=()=>renderLesson(current-1);
$('#next').onclick=()=>current<lesson.length-1?renderLesson(current+1):openGame();
$('#go-home').onclick=()=>{showView('home');$('#start').focus()};
$('#jump-game').onclick=()=>openGame();
$('#review-case').onclick=()=>renderLesson(lesson.length-1);
$('#replay-game').onclick=()=>{openGame();resetGame()};
$('#skip-game').onclick=()=>finishLesson();
function finishLesson(){showView('finish');$('#finish-title').focus({preventScroll:true});}

// Game: timers advance only while a timed question is active and the page is visible.
const questions=window.LESSON.games;
let state={round:-1,score:0,lives:3,streak:0,active:false,paused:false,elapsed:0,limit:14,mode:'timed',finished:false,started:false};
let raf=0,lastFrame=0,gameSounds=false,audioContext=null;
let sessionBest={timed:0,untimed:0},storageAvailable=true;
function mode(){return $('input[name="game-mode"]:checked').value}
if(reduced){$('input[name="game-mode"][value="untimed"]').checked=true;}
function readBest(m){try{return Math.max(sessionBest[m],Number(localStorage.getItem('info4300-s3-loot-v1-'+m))||0)}catch{storageAvailable=false;return sessionBest[m]}}
function saveBest(){if(state.score>readBest(state.mode)){sessionBest[state.mode]=state.score;try{localStorage.setItem('info4300-s3-loot-v1-'+state.mode,String(state.score))}catch{storageAvailable=false}}}
function stats(){
 $('#score').textContent=state.score;$('#lives').textContent=state.lives;$('#streak').textContent=state.streak;$('#best').textContent=readBest(state.started?state.mode:mode());
 $('#best').title=storageAvailable?'Saved only in this browser on this device.':'Browser storage is unavailable; best is kept for this visit only.';
}
function announce(s){$('#game-announcement').textContent=s}
function openGame(){showView('game');stats();$('#game-heading').focus({preventScroll:true});}
function setBaskets(enabled){$$('[data-basket]').forEach(b=>b.disabled=!enabled)}
function sound(correct){if(!gameSounds)return;try{audioContext=audioContext||new(window.AudioContext||window.webkitAudioContext)();audioContext.resume();const o=audioContext.createOscillator(),g=audioContext.createGain();o.type='sine';o.frequency.value=correct?660:220;g.gain.setValueAtTime(.04,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.13);o.connect(g);g.connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+.14)}catch{}}
function resetGame(){
 cancelAnimationFrame(raf);state={round:-1,score:0,lives:3,streak:0,active:false,paused:false,elapsed:0,limit:14,mode:mode(),finished:false,started:false};
 $('#round-label').textContent='Ready to shelve a few ideas?';$('#clock').textContent='';$('#gold-label').textContent='START WITH A PRACTICE TURN';$('#statement').textContent='Choose timed or untimed mode, then start. Questions pause for feedback after every answer.';$('#book-card').className='book-card';$('#book-card').style.transform='';$('#game-feedback').textContent='';$('#game-start').hidden=false;$('#game-continue').hidden=true;$('#game-pause').disabled=true;$('#game-pause').textContent='Pause';$$('input[name="game-mode"]').forEach(r=>r.disabled=false);setBaskets(false);stats();
}
function startRound(){
 if(state.round>=questions.length || state.lives<=0){endGame();return;}
 const q=questions[state.round];state.active=true;state.paused=false;state.elapsed=0;state.limit=q.practice?18:Math.max(10,14-(state.round-1)*.45);
 $('#round-label').textContent=q.practice?'Practice turn · no points or lost lives':`Book ${state.round} of ${questions.length-1}`;
 $('#gold-label').textContent=q.practice?'PRACTICE':q.golden?'GOLDEN BOOK · DOUBLE POINTS + A BONUS LIFE':'CATCH THE IDEA';
 $('#book-card').className='book-card'+(q.golden?' golden':'');$('#book-card').style.transform='translateY(0)';$('#statement').textContent=q.statement;$('#game-feedback').textContent='';$('#game-continue').hidden=true;$('#game-start').hidden=true;$('#game-pause').disabled=false;$('#game-pause').textContent='Pause';setBaskets(true);
 announce(`${q.practice?'Practice':q.golden?'Golden-book bonus round':'Question'}. ${q.statement} Choose True, False, or It depends.`);
 $('#game-board').focus({preventScroll:true});lastFrame=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(tick);
}
function tick(now){
 if(!state.active)return;
 const dt=Math.max(0,now-lastFrame);lastFrame=now;
 if(!state.paused && !document.hidden && state.mode==='timed'){
 state.elapsed+=dt/1000;const pct=Math.min(1,state.elapsed/state.limit);
 const available=Math.max(0,$('#drop-zone').clientHeight-$('#book-card').offsetHeight-20);
 $('#book-card').style.transform=reduced?'translateY(0)':`translateY(${pct*Math.min(available,85)}px)`;
 $('#clock').textContent=Math.max(0,Math.ceil(state.limit-state.elapsed))+' sec';
 if(pct>=1){answer(-1);return;}
 }else{$('#clock').textContent=state.paused?'Paused':state.mode==='untimed'?'Untimed':'';}
 raf=requestAnimationFrame(tick);
}
function answer(choice){
 if(!state.active||state.paused)return;
 const q=questions[state.round],correct=choice===q.answer;state.active=false;cancelAnimationFrame(raf);setBaskets(false);$('#game-pause').disabled=true;$('#clock').textContent='Feedback · clock paused';
 let reward='';
 if(!q.practice){
 if(correct){state.streak++;const bonus=Math.min(100,Math.max(0,state.streak-1)*20);const points=(100+bonus)*(q.golden?2:1);state.score+=points;reward=` +${points} points${bonus?' including a streak bonus':''}.`;if(q.golden){state.lives=Math.min(5,state.lives+1);reward+=' One bonus life, up to five.';}}
 else{state.lives--;state.streak=0;reward=' One life used. The explanation stays available.';}
 }else{reward=' Practice does not affect points or lives.';}
 const prefix=choice===-1?'Time is up. ':correct?'Nice catch. ':'Try this idea. ';
 $('#game-feedback').textContent=prefix+q.explanation+reward;
 $('#game-continue').hidden=false;$('#game-continue').textContent=state.round===questions.length-1||state.lives<=0?'See results':'Continue →';
 stats();sound(correct);$('#game-continue').focus({preventScroll:true});
}
function pauseGame(force=false){
 if(!state.active)return;
 state.paused=force?true:!state.paused;lastFrame=performance.now();$('#game-pause').textContent=state.paused?'Resume':'Pause';setBaskets(!state.paused);$('#clock').textContent=state.paused?'Paused':'';announce(state.paused?'Game paused. Choose Resume when ready.':'Game resumed.');
}
function endGame(){
 state.active=false;state.finished=true;cancelAnimationFrame(raf);setBaskets(false);saveBest();stats();$('#round-label').textContent='Your shelf is complete';$('#clock').textContent='';$('#gold-label').textContent='THANKS FOR PLAYING';$('#statement').textContent=`${state.score} points. Keep the learning; leave the speed pressure.`;$('#book-card').style.transform='';$('#book-card').className='book-card';$('#game-feedback').textContent='You can replay, try the other mode, or return to the case preparation. All statements and explanations are also in the full transcript.';$('#game-continue').hidden=false;$('#game-continue').textContent='Return to course next steps';$('#game-pause').disabled=true;$$('input[name="game-mode"]').forEach(r=>r.disabled=false);announce(`Finished with ${state.score} points. Best on this device in ${state.mode} mode: ${readBest(state.mode)}.`);$('#game-continue').focus({preventScroll:true});
}
$('#game-start').onclick=()=>{state.started=true;state.mode=mode();state.round=0;$$('input[name="game-mode"]').forEach(r=>r.disabled=true);startRound()};
$('#game-continue').onclick=()=>{if(state.finished){finishLesson();return;}state.round++;startRound()};
$('#game-pause').onclick=()=>pauseGame();
$('#game-restart').onclick=()=>{resetGame();$('#game-start').focus({preventScroll:true})};
$$('[data-basket]').forEach(b=>b.onclick=()=>answer(Number(b.dataset.basket)));
$('#game-board').addEventListener('keydown',e=>{if(!$('#game-shortcuts').checked||e.altKey||e.ctrlKey||e.metaKey||e.repeat)return;if(['1','2','3'].includes(e.key)&&state.active&&!state.paused){e.preventDefault();answer(Number(e.key)-1)}});
$$('input[name="game-mode"]').forEach(r=>r.onchange=()=>{if(!state.active){resetGame();stats()}});
$('#game-sound').onclick=()=>{gameSounds=!gameSounds;$('#game-sound').textContent=gameSounds?'Sounds on':'Sounds off';$('#game-sound').setAttribute('aria-pressed',String(gameSounds));if(gameSounds)sound(true)};
document.addEventListener('visibilitychange',()=>{if(document.hidden){audio.pause();pauseGame(true)}});
stats();
})();
