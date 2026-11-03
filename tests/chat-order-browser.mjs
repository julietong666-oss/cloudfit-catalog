// Test only with tests/serve-fixtures.mjs. No real banking or backend calls.
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try {
 for(const width of [390,1440]) {
  const context=await browser.newContext({viewport:{width,height:1000},serviceWorkers:'block'});
  const forbidden=[],errors=[];
  await context.route('**/*',route=>{
   const url=new URL(route.request().url());
   if(url.origin===(process.env.CHAT_TEST_ORIGIN || 'http://127.0.0.1:4174') || (url.protocol==='https:' && ['cdn.tailwindcss.com','fonts.googleapis.com','fonts.gstatic.com'].includes(url.hostname)))return route.continue();
   if(route.request().method()==='POST')forbidden.push(url.pathname);
   return route.abort();
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${process.env.CHAT_TEST_ORIGIN || 'http://127.0.0.1:4174'}/#catalog`);
  await page.getByRole('button',{name:'Tư vấn trực tiếp',exact:true}).click();
  assert.equal(await page.locator('#consult-admin-tools').isVisible(),false);
  const answerSurvey=async()=>{
   for(let i=0;i<5;i++)await page.locator('#consult-suggestions button').first().click();
  };
  await answerSurvey();
  const offer=async()=>{
   await page.getByRole('button',{name:'Soạn phiếu xác nhận mua',exact:true}).click();
   await page.getByRole('button',{name:'Điền dữ liệu mẫu',exact:true}).click();
   await page.getByRole('button',{name:'Gửi phiếu vào chat',exact:true}).click();
  };
  const lastCard=()=>page.locator('.cf-order-card').last();
  await offer();
  assert.match(await lastCard().textContent(),/Công ty TNHH Doanh nghiệp Mẫu/);
  assert.match(await lastCard().textContent(),/12.000.000/);
  assert.equal(await page.locator('#payment-success').isVisible(),false);
  assert.equal(await page.locator('#consult-restart').isDisabled(),true);
  await lastCard().getByRole('button',{name:'Huỷ',exact:true}).click();
  assert.match(await lastCard().textContent(),/Đã huỷ/);
  await offer();
  await page.screenshot({path:`/tmp/cloudfit-offer-${width}.png`});
  await lastCard().getByRole('button',{name:'Thanh toán',exact:true}).click();
  assert.match(await lastCard().textContent(),/Chờ hệ thống xác nhận nhận tiền/);
  assert.equal(await page.locator('#payment-success').isVisible(),false,'clicking Pay never registers');
  const defaultQr = lastCard().locator('img.cf-bank-qr');
  await defaultQr.waitFor();
  await defaultQr.evaluate(img=>img.decode());
  assert.match(await defaultQr.getAttribute('src'), /demo-payment-qr\.svg$/);
  assert.equal(await defaultQr.evaluate(img=>img.complete && img.naturalWidth>0),true);
  assert.match(await lastCard().textContent(),/không chứa tài khoản ngân hàng/);
  await defaultQr.screenshot({path:`/tmp/cloudfit-demo-qr-${width}.png`});
  await page.getByRole('button',{name:'Mô phỏng sai số tiền',exact:true}).click();
  assert.match(await page.locator('#offer-feedback').textContent(),/chưa xác nhận/);
  assert.equal(await page.locator('#payment-success').isVisible(),false,'wrong amount cannot register');
  await lastCard().getByRole('button',{name:'Huỷ',exact:true}).click();
  await page.getByRole('button',{name:'Mô phỏng nhận đủ tiền',exact:true}).click();
  assert.match(await page.locator('#offer-feedback').textContent(),/không chờ nhận tiền/);
  assert.equal(await page.locator('#payment-success').isVisible(),false,'late receipt after cancellation cannot register');
  await offer();
  await lastCard().getByRole('button',{name:'Thanh toán',exact:true}).click();
  // A local one-pixel test image exercises file handling; it is NOT a banking QR.
  await page.locator('#bank-qr-image').setInputFiles({name:'qr-fixture.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64')});
  await lastCard().locator('img.cf-bank-qr[src^="blob:"]').waitFor();
  const qr=await lastCard().locator('img.cf-bank-qr').getAttribute('src');assert.ok(qr.startsWith('blob:'));
  await page.getByRole('button',{name:'Mô phỏng nhận đủ tiền',exact:true}).click();
  const popup=page.getByRole('dialog',{name:'Đã đăng ký gói thành công',exact:true});await popup.waitFor();
  assert.match(await popup.textContent(),/Cảm ơn doanh nghiệp/);
  assert.match(await popup.textContent(),/Mô phỏng/);
  assert.notEqual(await page.locator('#payment-success-close').evaluate(b=>getComputedStyle(b).backgroundColor),'rgba(0, 0, 0, 0)');
  await page.screenshot({path:`/tmp/cloudfit-payment-success-${width}.png`});
  await page.getByRole('button',{name:'Quay lại hội thoại',exact:true}).click();
  assert.equal(await lastCard().getByRole('button',{name:'Huỷ',exact:true}).count(),0);
  assert.equal(await page.locator('#simulate-receipt').isDisabled(),true);
  await page.locator('.cf-chat-directory summary').click();
  await page.getByRole('button',{name:'Mekong Studio (mẫu)',exact:true}).click();
  assert.equal(await page.locator('.cf-order-card').count(),0);
  await answerSurvey(); await offer();
  await lastCard().getByRole('button',{name:'Thanh toán',exact:true}).click();
  assert.equal(await lastCard().locator('img.cf-bank-qr').getAttribute('src'),qr,'one fixed company image is shared across invoices');
  await page.getByRole('button',{name:'Dùng lại QR giả lập',exact:true}).click();
  assert.match(await lastCard().locator('img.cf-bank-qr').getAttribute('src'),/demo-payment-qr\.svg$/);
  assert.equal(await page.locator('#payment-success').isVisible(),false);
  assert.equal(await page.locator('#consult-dialog').evaluate(d=>d.scrollWidth<=d.clientWidth),true);
  assert.deepEqual(errors,[]);assert.deepEqual(forbidden,[]);
  console.log(JSON.stringify({passed:true,width,simulation:true,realPayments:0}));
  await context.close();
 }
} finally {await browser.close();}
