// Fixture-only. Every payment/API request is fulfilled locally, never forwarded.
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try {
 for(const width of [390,1440]) {
  const context=await browser.newContext({viewport:{width,height:1000},serviceWorkers:'block'});
  const origin=process.env.SEPAY_TEST_ORIGIN||'http://127.0.0.1:4174',errors=[];
  let id,code,accessToken,amount,paid=false,missing=true,statusFailure=true,malformedPaid=false,paymentVerified=false,providerPosts=0,statusReads=0;
  await context.route('**/*',async route=>{
   const req=route.request(),url=new URL(req.url());
   if(url.pathname==='/functions/v1/sepay-sandbox') {
    assert.equal(req.method(),'POST');const data=req.postDataJSON();
    if(data.action==='checkout') {
     if(missing)return route.fulfill({status:503,json:{error:'sandbox_not_configured'}});
     id=data.invoice_id;accessToken=data.access_token;amount=data.invoice.amount;code='CFSBX'+id.replaceAll('-','').toUpperCase();
     return route.fulfill({status:200,json:{action:'https://pay-sandbox.sepay.vn/v1/checkout/init',environment:'sandbox',invoice_id:id,invoice_number:code,amount,fields:{operation:'PURCHASE',payment_method:'BANK_TRANSFER',order_invoice_number:code,order_amount:amount,currency:'VND',merchant:'SP-TEST-CLOUDFIT',success_url:`${origin}/#sepay-sandbox/${id}?result=success`,error_url:`${origin}/#sepay-sandbox/${id}?result=error`,cancel_url:`${origin}/#sepay-sandbox/${id}?result=cancel`,signature:'fixture-signature'}}});
    }
    assert.equal(data.action,'status');statusReads++;assert.equal(data.access_token,accessToken);
    if(statusFailure)return route.fulfill({status:503,json:{error:'database_error'}});
    return route.fulfill({status:200,json:{invoice_id:id,invoice_number:code,amount:malformedPaid?'invalid':amount,status:paid?'paid':'pending',payment_verified:paymentVerified,environment:'sandbox'}});
   }
   if(url.hostname==='pay-sandbox.sepay.vn') {
    providerPosts++;assert.equal(req.method(),'POST');const form=new URLSearchParams(req.postData());assert.equal(form.get('order_invoice_number'),code);assert.equal(Number(form.get('order_amount')),amount);assert.equal(form.has('secret_key'),false);
    return route.fulfill({status:200,contentType:'text/html',body:`<script>location.replace(${JSON.stringify(origin+'/#sepay-sandbox/'+id+'?result=success&order_id=fixture&signature=untrusted')})</script>`});
   }
   if(url.origin===origin)return route.continue();
   if(['cdn.tailwindcss.com','fonts.googleapis.com','fonts.gstatic.com'].includes(url.hostname))return route.continue();
   return route.abort();
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/#sepay-sandbox/50000000-0000-4000-8000-000000000099?result=success');
  await page.waitForFunction(()=>!document.querySelector('#sepay-return button')?.disabled&&document.querySelector('#sepay-return [role=status]')?.textContent.includes('Không có phiên'));
  assert.equal(await page.locator('#payment-success').isVisible(),false);
  await page.goto(origin+'/#catalog');
  await page.getByRole('button',{name:'Tư vấn trực tiếp',exact:true}).click();
  for(let i=0;i<5;i++)await page.locator('#consult-suggestions button').first().click();
  await page.getByRole('button',{name:'Soạn phiếu xác nhận mua',exact:true}).click();
  await page.getByRole('button',{name:'Điền dữ liệu mẫu',exact:true}).click();
  await page.getByRole('button',{name:'Gửi phiếu vào chat',exact:true}).click();
  await page.getByRole('button',{name:'Thanh toán qua SePay Sandbox',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('#offer-feedback')?.textContent.includes('Chưa cấu hình'));
  assert.equal(providerPosts,0);assert.equal(await page.locator('#payment-success').isVisible(),false);
  missing=false;
  await page.getByRole('button',{name:'Thanh toán qua SePay Sandbox',exact:true}).click();
  await page.waitForURL('**/#sepay-sandbox/**');
  await page.waitForFunction(()=>!document.querySelector('#sepay-return button')?.disabled&&document.querySelector('#sepay-return [role=status]')?.textContent.includes('Chưa xác nhận'));
  assert.equal(await page.locator('#payment-success').isVisible(),false,'backend error cannot show success');
  statusFailure=false;
  await page.getByRole('button',{name:'Kiểm tra lại trạng thái',exact:true}).click();
  await page.waitForFunction(()=>!document.querySelector('#sepay-return button')?.disabled&&document.querySelector('#sepay-return [role=status]')?.textContent.includes('Đang chờ SePay Sandbox'));
  assert.equal(providerPosts,1);assert.equal(await page.locator('#payment-success').isVisible(),false,'success URL alone does not pay');
  paid=true;malformedPaid=true;
  await page.getByRole('button',{name:'Kiểm tra lại trạng thái',exact:true}).click();
  await page.waitForFunction(()=>!document.querySelector('#sepay-return button')?.disabled&&document.querySelector('#sepay-return [role=status]')?.textContent.includes('không hợp lệ'));
  assert.equal(await page.locator('#payment-success').isVisible(),false,'invalid backend payload cannot show success');
  malformedPaid=false;
  await page.getByRole('button',{name:'Kiểm tra lại trạng thái',exact:true}).click();
  await page.waitForFunction(()=>!document.querySelector('#sepay-return button')?.disabled&&document.querySelector('#sepay-return [role=status]')?.textContent.includes('không hợp lệ'));
  assert.equal(await page.locator('#payment-success').isVisible(),false,'legacy paid without API verification cannot show success');
  paymentVerified=true;
  await page.getByRole('button',{name:'Kiểm tra lại trạng thái',exact:true}).click();
  await page.getByRole('dialog',{name:'Thanh toán thành công — Cảm ơn quý khách đã tin tưởng và sử dụng CloudFit',exact:true}).waitFor();
  assert.match(await page.locator('#payment-success-copy').textContent(),/không phát sinh tiền thật/i);
  assert.equal(await page.locator('#payment-success-copy').evaluate(p=>p.scrollWidth<=p.clientWidth),true,'invoice code fits the mobile popup');
  await page.screenshot({path:`/tmp/cloudfit-sepay-sandbox-${width}.png`});
  await page.getByRole('button',{name:'Quay lại hội thoại',exact:true}).click();
  await page.reload();
  await page.waitForFunction(()=>!document.querySelector('#sepay-return button')?.disabled&&document.querySelector('#sepay-return [role=status]')?.textContent.includes('đã thanh toán thử nghiệm'));
  assert.equal(await page.locator('#payment-success').isVisible(),false,'reload does not repeat thank-you popup');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.ok(statusReads>=2);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({sandboxBrowser:true,width,providerPosts,realNetworkPayments:0}));
  await context.close();
 }
}finally{await browser.close();}
