/* The Fluent Me: practice result submit. Writes the result into the student's saved state so the teacher sees it under "제출 확인". */
(function(){
var FB='https://www.gstatic.com/firebasejs/10.12.0/';
var STUDENT='brian',LK='fm2_state_'+STUDENT,SK='fm2_prsub';
var CFG={apiKey:"AIzaSyCsbL_16s7DLUXRS22Z9bN-WCWsLS1eJq8",authDomain:"hldys-59f64.firebaseapp.com",projectId:"hldys-59f64",storageBucket:"hldys-59f64.firebasestorage.app",messagingSenderId:"222352015503",appId:"1:222352015503:web:9bdb45bf7f11efb9a430fa"};
function pid(){return location.pathname.split('/').filter(Boolean).slice(-2).join('/')}
function lget(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}}
function lset(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function stamp(){var n=new Date();return (n.getMonth()+1)+'/'+n.getDate()+' '+('0'+n.getHours()).slice(-2)+':'+('0'+n.getMinutes()).slice(-2)}
function isTeacher(){try{return localStorage.getItem('fm2_last')==='hailey'}catch(e){return false}}
function last(){return (lget(SK,{})||{})[pid()]||null}
async function submit(score,text){
 if(isTeacher())return {ok:false,why:'teacher'};
 var at=stamp();
 try{
  var a=await import(FB+'firebase-app.js'),fs=await import(FB+'firebase-firestore.js');
  var app;try{app=a.initializeApp(CFG,'fm2')}catch(e){app=a.getApp('fm2')}
  var db=fs.getFirestore(app),ref=fs.doc(db,'hwSubmissions',LK);
  var snap=await fs.getDoc(ref),st;
  if(snap.exists()&&snap.data().json)st=JSON.parse(snap.data().json);else st=lget(LK,null)||{todo:{},hw:{},pr:{},srs:{},days:{}};
  st.prp=st.prp||{};st.prp[pid()]={s:String(score).slice(0,80),x:String(text).slice(0,3000),at:at};st.t=Date.now();
  await fs.setDoc(ref,{json:JSON.stringify(st),student:STUDENT,updatedAt:Date.now()});
  var back=await fs.getDoc(ref),ok=false;try{ok=JSON.parse(back.data().json).prp[pid()].at===at}catch(e){}
  if(!ok)return {ok:false,why:'verify'};
  lset(LK,st);var m=lget(SK,{});m[pid()]={s:String(score).slice(0,80),at:at};lset(SK,m);
  return {ok:true,at:at};
 }catch(e){return {ok:false,why:'offline'}}
}
/* shared button wiring: btn = submit button, msg = status line, box = "submitted" line, get() returns [score,text] */
function bind(btn,msg,box,get){
 function show(){var l=last();if(box){box.textContent=l?'제출됨 ✓ '+l.at+' · '+l.s+' · 선생님이 "제출 확인"에서 볼 수 있어요':'';box.style.display=l?'block':'none'}if(l)btn.textContent='다시 제출'}
 show();
 btn.onclick=function(){var g=get();btn.disabled=true;msg.textContent='제출하는 중…';
  submit(g[0],g[1]).then(function(r){btn.disabled=false;
   if(r.ok){msg.textContent='';show()}
   else msg.textContent=r.why==='teacher'?'Hailey 계정으로 로그인한 기기에서는 제출되지 않습니다.':'온라인 저장에 실패했어요. 인터넷을 확인하고 다시 누르거나, 결과 복사로 카톡에 보내주세요.'})}}
window.FM={submit:submit,last:last,isTeacher:isTeacher,bind:bind};
})();
