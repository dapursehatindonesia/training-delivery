const navTargets=['home','modules','cases','quiz'];
const navButtons=[...document.querySelectorAll('.nav')];
const mobileButtons=[...document.querySelectorAll('.mobile-nav button')];
const sectionEls=navTargets.map(id=>document.getElementById(id));

// Setiap menu adalah satu tampilan sendiri. Setelah menu dipilih,
// hanya isi menu tersebut yang terlihat dan dapat di-scroll ke bawah.
function showSection(id){
  sectionEls.forEach(section=>section.classList.toggle('active-section',section.id===id));
  navButtons.forEach(button=>button.classList.toggle('active',button.dataset.target===id));
  mobileButtons.forEach(button=>button.classList.toggle('active',button.dataset.target===id));
  const main=document.querySelector('main');
  if(main) main.scrollTo({top:0,behavior:'smooth'});
}

document.querySelectorAll('[data-target]').forEach(el=>{
  el.addEventListener('click',()=>showSection(el.dataset.target));
});

// Helpers
function roleName(role){ return roles[role]?.name || role; }
function roleStyle(role){
  const r=roles[role] || {};
  return `--role-color:${r.color || '#075744'};--role-bg:${r.bg || '#eef6f2'};`;
}

// Home role strip — otomatis mengikuti role yang ada di data.js
const roleStrip=document.getElementById('roleStrip');
if(roleStrip){
  roleStrip.innerHTML=Object.entries(roles).map(([key,r])=>`
    <div><b>${r.name}</b><small>${r.desc}</small></div>
  `).join('');
}

// Modules — satu role boleh punya banyak modul.
const moduleCards=document.getElementById('moduleCards');
moduleCards.innerHTML=modules.map(m=>{
  const r=roles[m.role] || {name:m.role,desc:'',color:'#075744',bg:'#eef6f2'};
  return `<article class="card">
    <span class="role-badge" style="${roleStyle(m.role)}">${r.name}</span>
    <h3>${m.title}</h3>
    <p class="module-desc">${m.description || ''}</p>
    <a class="drive" href="${m.url}" target="_blank" rel="noopener">Buka Modul ↗</a>
  </article>`;
}).join('');

// Case study — role otomatis mengikuti object roles.
let currentCaseRole=Object.keys(roles)[0];
function renderCaseTabs(){
  const tabData=Object.keys(roles).filter(k=>Array.isArray(cases[k]));
  if(!tabData.length){
    document.getElementById('caseTabs').innerHTML='';
    document.getElementById('caseList').innerHTML='<div class="empty-state">Belum ada studi kasus.</div>';
    return;
  }
  if(!tabData.includes(currentCaseRole)) currentCaseRole=tabData[0];
  document.getElementById('caseTabs').innerHTML=tabData.map(k=>`<button class="tab ${k===currentCaseRole?'active':''}" onclick="setCaseRole('${k}')">${roleName(k)}</button>`).join('');
}
function renderCases(){
  renderCaseTabs();
  const list=cases[currentCaseRole] || [];
  document.getElementById('caseList').innerHTML=list.length ? list.map((c,i)=>`<article class="case-card">
    <div class="case-top"><span class="case-tag">${c[0] || `CASE ${String(i+1).padStart(2,'0')}`}</span><span class="case-role" style="${roleStyle(currentCaseRole)}">${roleName(currentCaseRole)}</span></div>
    <h3>${c[1]}</h3>
    <p class="case-situation">${c[2]}</p>
    <p class="case-explain"><b>Penjelasan singkat:</b> ${c[3]}</p>
    <button class="solution-toggle" onclick="toggleSolution(this)">Lihat Penyelesaian ▾</button>
    <div class="solution"><b>PENYELESAIAN</b><br>${c[4]}</div>
  </article>`).join('') : '<div class="empty-state">Belum ada studi kasus untuk role ini. Tambahkan di data.js.</div>';
}
function setCaseRole(role){currentCaseRole=role;renderCases();}
function toggleSolution(btn){const solution=btn.nextElementSibling;const open=solution.classList.toggle('show');btn.textContent=open?'Tutup Penyelesaian ▴':'Lihat Penyelesaian ▾';}
renderCases();

// Quiz — jumlah soal tidak lagi hardcoded 10 dan role baru otomatis ikut.
let currentQuizRole=Object.keys(roles)[0];
const quizScores={};
const quizAnswered={};
Object.keys(roles).forEach(role=>{
  const total=(quizzes[role] || []).length;
  quizScores[role]=0;
  quizAnswered[role]=new Array(total).fill(false);
});
function renderQuizTabs(){
  const tabData=Object.keys(roles).filter(k=>Array.isArray(quizzes[k]));
  if(!tabData.length){
    document.getElementById('quizTabs').innerHTML='';
    return;
  }
  if(!tabData.includes(currentQuizRole)) currentQuizRole=tabData[0];
  document.getElementById('quizTabs').innerHTML=tabData.map(k=>`<button class="tab ${k===currentQuizRole?'active':''}" onclick="setQuizRole('${k}')">${roleName(k)}</button>`).join('');
}
function renderQuiz(){
  renderQuizTabs();
  const list=quizzes[currentQuizRole] || [];
  document.getElementById('quizRoleLabel').textContent=roleName(currentQuizRole);
  document.getElementById('quizScore').textContent=`${quizScores[currentQuizRole] || 0} / ${list.length} benar`;
  document.getElementById('quizList').innerHTML=list.length ? list.map((q,qi)=>`<article class="quiz-card" data-quiz-index="${qi}">
    <div class="qtop"><span>Soal ${qi+1} / ${list.length}</span><span>${quizAnswered[currentQuizRole]?.[qi]?'Sudah dijawab':''}</span></div>
    <h3>${q[0]}</h3>
    <div>${q[1].map((a,i)=>`<button class="ans" data-answer="${i}" ${quizAnswered[currentQuizRole]?.[qi]?'disabled':''} onclick="answerQuiz(${qi},${i},this)">${String.fromCharCode(65+i)}. ${a}</button>`).join('')}</div>
    <div class="explain ${quizAnswered[currentQuizRole]?.[qi]?'':'hidden'}">${quizAnswered[currentQuizRole]?.[qi]?`<b>Jawaban benar:</b> ${q[1][q[2]]}<br><br><b>Penjelasan:</b> ${q[3]}`:''}</div>
  </article>`).join('') : '<div class="empty-state">Belum ada kuis untuk role ini. Tambahkan di data.js.</div>';
}
function setQuizRole(role){currentQuizRole=role;renderQuiz();}
function answerQuiz(qi,choice,button){
  if(quizAnswered[currentQuizRole][qi]) return;
  quizAnswered[currentQuizRole][qi]=true;
  const q=quizzes[currentQuizRole][qi];
  const card=button.closest('.quiz-card');
  const buttons=card.querySelectorAll('.ans');
  buttons.forEach(b=>b.disabled=true);
  buttons[q[2]].classList.add('correct');
  if(choice!==q[2]) button.classList.add('wrong'); else quizScores[currentQuizRole]++;
  card.querySelector('.qtop span:last-child').textContent='Sudah dijawab';
  const explanation=card.querySelector('.explain');
  explanation.innerHTML=`<b>Jawaban benar:</b> ${q[1][q[2]]}<br><br><b>Penjelasan:</b> ${q[3]}`;
  explanation.classList.remove('hidden');
  document.getElementById('quizScore').textContent=`${quizScores[currentQuizRole]} / ${quizzes[currentQuizRole].length} benar`;
}
renderQuiz();
