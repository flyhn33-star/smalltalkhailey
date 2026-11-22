/* The Fluent Me: practice result submit. Writes the result into the student's saved state so the teacher sees it under "제출 확인". */
(function(){
var FB='https://www.gstatic.com/firebasejs/10.12.0/';
var STUDENT='brian',LK='fm2_state_'+STUDENT,SK='fm2_prsub';
var CFG={apiKey:"AIzaSyCsbL_16s7DLUXRS22Z9bN-WCWsLS1eJq8",authDomain:"hldys-59f64.firebaseapp.com",projectId:"hldys-59f64",storageBucket:"hldys-59f64.firebasestorage.app",messagingSenderId:"222352015503",appId:"1:222352015503:web:9bdb45bf7f11efb9a430fa"};
function pid(){return location.pathname.split('/').filter(Boolean).slice(-2).join('/')}
function lget(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}}
function lset(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function stamp(){var n=new Date();return (n.getMonth()+1)+'/'+n.getDate()+' '+('0'+n.getHours()).slice(-2)+':'+('0'+n.getMinutes()).slice(-2)}
function isTeacher(){try{return localStorage.getItem('fm2_last')==='hailey'||localStorage.getItem('fm2_tdev')==='1'}catch(e){return false}}
function last(){return (lget(SK,{})||{})[pid()]||null}
/* time on this page: only while it is on screen, saved so it survives a reload, reset after each submit */
var TK='fm2_prtime',cur=+((lget(TK,{})||{})[pid()]||0),mark=Date.now(),vis=!document.hidden;
function tick(){var n=Date.now();if(vis){cur+=Math.min(30,(n-mark)/1000);var m=lget(TK,{});m[pid()]=Math.round(cur);lset(TK,m)}mark=n}
document.addEventListener('visibilitychange',function(){if(document.hidden){tick();vis=false}else{vis=true;mark=Date.now()}});window.addEventListener('pagehide',tick);setInterval(tick,5000);
function mins(s){s=Math.round(+s||0);return s<60?s+'초':Math.round(s/60)+'분'}
async function submit(score,text){
 if(isTeacher())return {ok:false,why:'teacher'};
 var at=stamp();
 try{
  var a=await import(FB+'firebase-app.js'),fs=await import(FB+'firebase-firestore.js');
  var app;try{app=a.initializeApp(CFG,'fm2')}catch(e){app=a.getApp('fm2')}
  var db=fs.getFirestore(app),ref=fs.doc(db,'hwSubmissions',LK);
  var snap=await fs.getDoc(ref),st;
  if(snap.exists()&&snap.data().json)st=JSON.parse(snap.data().json);else st=lget(LK,null)||{todo:{},hw:{},pr:{},srs:{},days:{}};
  tick();var sec=Math.round(cur);st.prp=st.prp||{};var pv=st.prp[pid()]||{},cnt=(pv.n||(pv.at?1:0))+1,tot=(pv.tot||0)+sec,log=(pv.log||[]).concat([{at:at,s:String(score).slice(0,80),sec:sec}]).slice(-10);st.prp[pid()]={s:String(score).slice(0,80),x:String(text).slice(0,3000),at:at,n:cnt,sec:sec,tot:tot,log:log};st.t=Date.now();
  var body={json:JSON.stringify(st),student:STUDENT,updatedAt:Date.now()},cd=snap.exists()?snap.data():{},bak={};if(cd.bak&&typeof cd.bak==='object')Object.keys(cd.bak).forEach(function(k){bak[k]=cd.bak[k]});var n=new Date(),day=n.getFullYear()+'-'+('0'+(n.getMonth()+1)).slice(-2)+'-'+('0'+n.getDate()).slice(-2);if(!bak[day]&&cd.json)bak[day]=cd.json;var ks=Object.keys(bak).sort();while(ks.length>7)delete bak[ks.shift()];
  try{await fs.setDoc(ref,Object.assign({bak:bak},body))}catch(e){await fs.setDoc(ref,body)}
  var back=await fs.getDoc(ref),ok=false;try{ok=JSON.parse(back.data().json).prp[pid()].at===at}catch(e){}
  if(!ok)return {ok:false,why:'verify'};
  lset(LK,st);var m=lget(SK,{});m[pid()]={s:String(score).slice(0,80),at:at,n:cnt,sec:sec,tot:tot};lset(SK,m);cur=0;mark=Date.now();var tm=lget(TK,{});tm[pid()]=0;lset(TK,tm);
  return {ok:true,at:at};
 }catch(e){return {ok:false,why:'offline'}}
}
/* shared button wiring: btn = submit button, msg = status line, box = "submitted" line, get() returns [score,text] */
function bind(btn,msg,box,get){
 function show(){var l=last();if(box){box.textContent=l?'제출됨 ✓ '+l.at+' · '+l.s+(l.n?' · '+l.n+'번째 · 이번 '+mins(l.sec)+' · 누적 '+mins(l.tot):'')+' · 선생님이 "제출 확인"에서 볼 수 있어요':'';box.style.display=l?'block':'none'}if(l)btn.textContent='다시 제출'}
 show();
 btn.onclick=function(){var g=get();btn.disabled=true;msg.textContent='제출하는 중…';
  submit(g[0],g[1]).then(function(r){btn.disabled=false;
   if(r.ok){msg.textContent='';show()}
   else msg.textContent=r.why==='teacher'?'선생님 기기에서는 제출되지 않습니다.':'온라인 저장에 실패했어요. 인터넷을 확인하고 다시 눌러 주세요.'})}}
window.FM={submit:submit,last:last,isTeacher:isTeacher,bind:bind};
})();
