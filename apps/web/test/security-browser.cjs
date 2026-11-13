const {chromium}=require('@playwright/test');
const fs=require('node:fs');const assert=require('node:assert/strict');
(async()=>{
 const fixture=JSON.parse(fs.readFileSync('../api/.temp/browser-fixture.json','utf8'));
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext();const page=await context.newPage();const results=[];const consoleErrors=[];page.on('console',msg=>{if(msg.type()==='error')consoleErrors.push(msg.text());});
 try{
  await page.goto('http://localhost:3001/dashboard');await page.waitForURL('**/login');results.push('Anonymous admin panel redirects to login');
  await page.goto('http://localhost:3001/teacher/dashboard');await page.waitForURL('**/login');results.push('Anonymous teacher dashboard redirects to login');
  await page.evaluate(()=>localStorage.setItem('auth',JSON.stringify({user:{role:'SUPER_ADMIN'},accessToken:'forged'})));
  await page.goto('http://localhost:3001/dashboard');await page.waitForURL('**/login');results.push('Forged localStorage role grants no access');
  await page.locator('input[type=email]').fill(fixture.teacher);await page.locator('input[type=password]').fill(fixture.password);
  const loginResponse=page.waitForResponse(r=>r.url().endsWith('/api/backend/auth/login')&&r.request().method()==='POST');
  await page.locator('button[type=submit]').click();assert.equal((await loginResponse).status(),201);
  await page.waitForURL('**/teacher/dashboard');results.push('Teacher logs in through the actual form and BFF');
  const cookie=(await context.cookies()).find(c=>c.name==='atlas_session');assert(cookie?.httpOnly);assert.equal(cookie.sameSite,'Strict');
  assert(!(await page.evaluate(()=>document.cookie)).includes('atlas_session='));assert.equal(await page.evaluate(()=>localStorage.getItem('auth')),null);results.push('Session is HttpOnly and absent from localStorage');
  await page.goto('http://localhost:3001/dashboard');await page.waitForURL('**/teacher/dashboard');results.push('Teacher cannot open admin panel');
  const denied=await page.evaluate(async()=>{const r=await fetch('/api/backend/universities',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'forbidden',abbreviation:'NO'})});return r.status;});assert.equal(denied,403);results.push('Teacher mutation denied through same-origin BFF');
  const pdfRes=await context.request.get(`http://localhost:3001/api/backend/materials/file/${fixture.materialId}`);assert.equal(pdfRes.status(),200);assert.match(pdfRes.headers()['content-type'],/application\/pdf/);fs.writeFileSync('.temp/security-pdf-headers.json',JSON.stringify(pdfRes.headers(),null,2));results.push('Private PDF streams through the authenticated BFF');
  assert.equal(pdfRes.headers()['x-frame-options'],'SAMEORIGIN');assert.match(pdfRes.headers()['content-security-policy'],/frame-ancestors 'self'/);
  await page.evaluate(id=>{const frame=document.createElement('iframe');frame.src=`/api/backend/materials/file/${id}`;frame.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:9999;background:white';frame.id='security-pdf-frame';document.body.append(frame);},fixture.materialId);
  await page.waitForTimeout(1500);fs.mkdirSync('.temp',{recursive:true});await page.screenshot({path:'.temp/security-pdf.png'});await page.locator('#security-pdf-frame').evaluate(frame=>frame.remove());
  await page.goto(`http://localhost:3001/teacher/subjects/${fixture.subjectId}?tab=informacion`);
  await page.locator('#subject-name').fill('My personal browser subject');await page.locator('#subject-description').fill('My personal description');await page.locator('input[type=color]').fill('#718da8');await page.locator('input[type=file]').setInputFiles('../api/.temp/browser-logo.png');
  page.once('dialog',dialog=>dialog.dismiss());const saved=page.waitForResponse(r=>r.url().endsWith(`/api/backend/subjects/${fixture.subjectId}`)&&r.request().method()==='PATCH');await page.locator('button[type=submit]').click();const savedResponse=await saved;assert.equal(savedResponse.status(),200);const savedSubject=await savedResponse.json();assert.equal(savedSubject.color,'#718da8');
  await page.waitForFunction(()=>document.querySelector('#subject-name')?.value==='My personal browser subject');const ownImage=page.locator('header img').first();await ownImage.waitFor();await page.waitForFunction(()=>{const image=document.querySelector('header img');return image?.complete&&image.naturalWidth>0;});results.push('Teacher personal form saves name, description, color and image');
  const otherContext=await browser.newContext();try{
   const otherLogin=await otherContext.request.post('http://localhost:3001/api/backend/auth/login',{headers:{Origin:'http://localhost:3001'},data:{email:fixture.other,password:fixture.password}});assert.equal(otherLogin.status(),201);const reset=await otherContext.request.patch(`http://localhost:3001/api/backend/subjects/${fixture.subjectId}`,{headers:{Origin:'http://localhost:3001'},data:{color:null}});assert.equal(reset.status(),200);const otherPage=await otherContext.newPage();await otherPage.goto(`http://localhost:3001/teacher/subjects/${fixture.subjectId}?tab=informacion`);await otherPage.locator('#subject-name').waitFor();assert.equal(await otherPage.locator('#subject-name').inputValue(),'Browser fixture subject');assert.equal(await otherPage.locator('#subject-description').inputValue(),'');assert.equal(await otherPage.locator('input[type=color]').inputValue(),'#4a1115');results.push('A second teacher sees the unchanged common subject');
   const otherEdit=await otherContext.request.patch(`http://localhost:3001/api/backend/subjects/${fixture.subjectId}`,{headers:{Origin:'http://localhost:3001'},data:{color:'#c9829b'}});assert.equal(otherEdit.status(),200);await page.reload();await page.locator('#subject-name').waitFor();assert.equal(await page.locator('#subject-name').inputValue(),'My personal browser subject');assert.equal(await page.locator('input[type=color]').inputValue(),'#718da8');results.push('Second teacher personal color cannot overwrite the first teacher');
  }finally{await otherContext.close();}
  await page.screenshot({path:'.temp/personal-subject.png',fullPage:true});await page.goto('http://localhost:3001/teacher/dashboard');
  const teacherCookie=cookie.value;
  await page.getByRole('button',{name:/cerrar sesi[oó]n/i}).click();await page.waitForURL('http://localhost:3001/');
  assert(!(await context.cookies()).some(c=>c.name==='atlas_session'));results.push('Logout clears the cookie');
  const revoked=await context.request.get('http://localhost:3001/api/backend/auth/me',{headers:{cookie:`atlas_session=${teacherCookie}`}});assert.equal(revoked.status(),401);results.push('Logged-out cookie cannot be replayed');
  await page.goto('http://localhost:3001/login');await page.locator('input[type=email]').fill(fixture.admin);await page.locator('input[type=password]').fill(fixture.password);await page.locator('button[type=submit]').click();await page.waitForURL('**/dashboard');results.push('Admin login reaches the administrative panel');
  await page.getByText('Panel Administrativo').waitFor({state:'visible'});
  const baseSubject=await context.request.get(`http://localhost:3001/api/backend/subjects/${fixture.subjectId}`);const baseData=await baseSubject.json();assert.equal(baseData.name,'Browser fixture subject');assert.equal(baseData.color,null);assert.equal(baseData.logoUrl,null);results.push('Admin catalog remains unchanged after both teachers personalize');
  fs.mkdirSync('.temp',{recursive:true});await page.screenshot({path:'.temp/security-admin.png',fullPage:true});
  const headers=(await context.request.get('http://localhost:3001/login')).headers();assert.equal(headers['x-frame-options'],'DENY');assert.equal(headers['x-content-type-options'],'nosniff');results.push('Web security headers present');
  assert(!consoleErrors.some(text=>/Framing.*violates|frame-ancestors.*blocked/.test(text)),'PDF framing must be allowed for the same-origin viewer');
  fs.writeFileSync('.temp/security-browser-results.json',JSON.stringify(results,null,2));fs.writeFileSync('.temp/security-browser-console.json',JSON.stringify(consoleErrors,null,2));console.log(`PASS ${results.length} browser scenarios`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
