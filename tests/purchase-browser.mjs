// Start tests/serve-fixtures.mjs first. Only visual CDN assets may load; all external APIs are intercepted;
// this suite must never submit to real Supabase or Telegram.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
const origin = 'http://127.0.0.1:4174';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try {
 for (const width of [390,1440]) {
  const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
  let attempts=0, release;
  const ids=[], errors=[];
  await context.route('**/*', async route=>{
   const req=route.request(), url=new URL(req.url());
   if (url.pathname === '/functions/v1/purchase-request') {
    assert.equal(req.method(),'POST');
    const data=req.postDataJSON();ids.push(data.request_id);attempts++;
    assert.equal(data.product_id,'a');
    assert.equal(data.contact_name,'Khách giả lập');
    assert.equal(data.consent,true);
    if(attempts===1) {
     await new Promise(resolve=>{release=resolve;});
     return route.fulfill({status:503,json:{error:'temporarily_unavailable'}});
    }
    return route.fulfill({status:201,json:{saved:true,request_id:data.request_id}});
   }
   if (url.origin === origin || (url.protocol==='https:' && ['cdn.tailwindcss.com','fonts.googleapis.com','fonts.gstatic.com'].includes(url.hostname))) return route.continue();
   return route.abort();
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${origin}/#catalog`,{waitUntil:'domcontentloaded'});
  await page.getByRole('link',{name:'Xem chi tiết Fixture A',exact:true}).click();
  await page.getByRole('button',{name:'Đăng ký tư vấn gói này',exact:true}).click();
  const form=page.locator('.cf-purchase');
  await form.getByRole('heading',{name:'Đăng ký tư vấn gói dịch vụ',exact:true}).waitFor();
  assert.match(await form.textContent(),/Gói quan tâm: Fixture A/);
  assert.match(await form.textContent(),/số lượng người dùng và ngân sách/);
  assert.match(await form.textContent(),/Nếu chưa biết chọn gói nào/);
  assert.match(await form.textContent(),/Telegram/);
  assert.match(await form.textContent(),/Gửi yêu cầu chưa phát sinh thanh toán/);
  assert.equal(attempts,0,'viewing and opening the form never submits');
  await form.getByRole('button',{name:'Gửi yêu cầu tư vấn',exact:true}).click();
  assert.equal(attempts,0,'empty form never submits');
  await form.locator('[name=contact_name]').fill('Khách giả lập');
  await form.locator('[name=phone]').fill('0000000000');
  await form.getByRole('button',{name:'Gửi yêu cầu tư vấn',exact:true}).click();
  assert.equal(attempts,0,'consent is required');
  await form.locator('input[type=checkbox]').check();
  await form.getByRole('button',{name:'Gửi yêu cầu tư vấn',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.cf-purchase')?.getAttribute('aria-busy')==='true');
  assert.equal(await form.locator('button[type=submit]').isDisabled(),true);
  await form.evaluate(f=>f.dispatchEvent(new Event('submit',{cancelable:true})));
  await page.waitForFunction(()=>document.querySelector('.cf-purchase button')?.textContent==='Đang gửi yêu cầu tư vấn…');
  assert.equal(attempts,1,'busy state prevents double submission');
  assert.equal(await page.locator('#consult-dialog').isVisible(),false);
  release();
  await form.getByRole('button',{name:'Gửi lại yêu cầu tư vấn',exact:true}).waitFor();
  assert.equal(await form.locator('[name=contact_name]').inputValue(),'Khách giả lập');
  assert.equal(await page.locator('#consult-dialog').isVisible(),false,'API failure must not open chat');
  assert.ok(!(await form.locator('[role=status]').textContent()).includes('Đã nhận yêu cầu tư vấn.'));
  await form.getByRole('button',{name:'Gửi lại yêu cầu tư vấn',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.cf-purchase [role=status]')?.textContent.startsWith('Đã nhận yêu cầu tư vấn.'));
  assert.equal(await form.locator('[role=status]').textContent(),'Đã nhận yêu cầu tư vấn. Nhân viên sẽ liên hệ để tìm hiểu nhu cầu và đề xuất gói dịch vụ phù hợp.');
  assert.equal(ids[0],ids[1]);
  await page.locator('#consult-dialog').waitFor({state:'visible'});
  assert.equal(await page.locator('#consult-owner').textContent(),'Chờ phân công');
  for(const value of ['Khách giả lập','0000000000','Fixture A',ids[1]]) assert.ok((await page.locator('#consult-summary').textContent()).includes(value));
  assert.equal(await page.locator('#consult-admin-tools').isVisible(),false);
  assert.equal(await page.locator('.cf-chat-directory').isVisible(),false);
  for(let i=0;i<5;i++)await page.locator('#consult-suggestions button').first().click();
  assert.equal(await page.locator('#consult-admin-tools').isVisible(),false,'real lead cannot enter demo checkout');
  await page.getByRole('button',{name:'Đóng khung tư vấn',exact:true}).click();
  await form.getByRole('button',{name:'Tiếp tục tư vấn trực tiếp',exact:true}).click();
  assert.equal(await page.locator('#consult-progress').textContent(),'5/5 thông tin đã chia sẻ');
  assert.equal(await form.locator('button[type=submit]').isDisabled(),true);
  await form.evaluate(f=>f.dispatchEvent(new Event('submit',{cancelable:true})));
  assert.equal(attempts,2,'saved form prevents repeat submission');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({passed:true,width,attempts,mocked:true}));
  await context.close();
 }
} finally {await browser.close();}
