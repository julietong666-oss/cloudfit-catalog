// Start tests/serve-fixtures.mjs. Only existing visual CDN assets may load; external APIs are blocked.
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
try {
 for(const width of [390,1440]) {
  const context = await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
  const external=[];
  await context.route('**/*',route=>{
   const url=new URL(route.request().url());
   if(url.origin==='http://127.0.0.1:4174') return route.continue();
   if(url.protocol==='https:' && ['cdn.tailwindcss.com','fonts.googleapis.com','fonts.gstatic.com'].includes(url.hostname)) return route.continue();
   external.push(route.request().url()); return route.abort();
  });
  const page=await context.newPage();const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4174/#catalog');
  const opener=page.getByRole('button',{name:'Tư vấn trực tiếp',exact:true});
  await opener.click();
  const dialog=page.getByRole('dialog',{name:'Tư vấn trực tiếp',exact:true});
  await dialog.waitFor();
  await page.screenshot({path:`/tmp/cloudfit-chat-${width}.png`,fullPage:false});
  assert.equal(await page.locator('#consult-admin').textContent(),'Ngọc Anh');
  assert.match(await page.locator('#consult-notice').textContent(),/giả lập/);
  await page.getByRole('button',{name:'20–100 nhân viên',exact:true}).click();
  await page.locator('#consult-answer').fill('<img src=x onerror=alert(1)> Công ty phần mềm');
  await page.getByRole('button',{name:'Gửi câu trả lời',exact:true}).click();
  assert.equal(await page.locator('#consult-messages img').count(),0);
  await page.getByRole('button',{name:'Tích hợp & mở rộng ứng dụng',exact:true}).click();
  await page.getByRole('button',{name:'Cần tư vấn ngân sách',exact:true}).click();
  await page.getByRole('button',{name:'Trong 1–3 tháng',exact:true}).click();
  await page.getByText('Đã hoàn tất khảo sát mẫu',{exact:true}).waitFor();
  assert.match(await page.locator('#consult-summary').textContent(),/20–100 nhân viên/);
  assert.equal(await page.locator('#consult-progress').textContent(),'5/5 thông tin đã chia sẻ');
  await page.locator('.cf-chat-directory summary').click();
  if(width===1440) await page.screenshot({path:'/tmp/cloudfit-chat-assignment-1440.png'});
  await page.getByRole('button',{name:'Mekong Studio (mẫu)',exact:true}).click();
  assert.equal(await page.locator('#consult-admin').textContent(),'Minh Quân');
  assert.equal(await page.locator('#consult-owner').textContent(),'Minh Quân');
  assert.equal(await page.locator('#consult-progress').textContent(),'0/5 thông tin đã chia sẻ');
  assert.ok(!(await page.locator('#consult-summary').textContent()).includes('20–100 nhân viên'));
  await page.getByRole('button',{name:'Doanh nghiệp của bạn',exact:true}).click();
  assert.equal(await page.locator('#consult-progress').textContent(),'5/5 thông tin đã chia sẻ');
  await page.getByRole('button',{name:'Làm lại khảo sát',exact:true}).click();
  assert.equal(await page.locator('#consult-progress').textContent(),'0/5 thông tin đã chia sẻ');
  assert.equal(await dialog.evaluate(d=>d.scrollWidth<=d.clientWidth),true);
  await page.keyboard.press('Escape');
  assert.equal(await dialog.isVisible(),false);
  assert.equal(await opener.evaluate(b=>b===document.activeElement),true);
  await opener.click();
  await page.getByRole('button',{name:'Đóng khung tư vấn',exact:true}).click();
  await page.locator('#identity-link').click();
  await page.getByRole('heading',{name:'Tài khoản quản trị',exact:true}).waitFor();
  assert.equal(await opener.textContent(),'Tư vấn trực tiếp');
  assert.equal(external.some(url=>url.includes('purchase-request')||url.includes('telegram')),false);
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({passed:true,width,mocked:true}));
  await context.close();
 }
} finally { await browser.close(); }
