const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/#product/startup-foundation',{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'Đăng ký gói này',exact:true}).click();
 await page.locator('.cf-purchase input[name=contact_name]').fill('DỮ LIỆU THỬ — browser');
 await page.locator('.cf-purchase input[name=phone]').fill('0000000002');
 await page.locator('.cf-purchase input[type=checkbox]').check();
 let attempts=0;const ids=[];
 await page.route('**/functions/v1/purchase-request',async route=>{
  if(route.request().method()!=='POST')return route.continue();
  const data=route.request().postDataJSON();ids.push(data.request_id);attempts++;
  if(attempts===1)return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'temporarily_unavailable'})});
  return route.continue({postData:JSON.stringify({...data,test_mode:true})});
 });
 await page.getByRole('button',{name:'Gửi đăng ký',exact:true}).click();
 await page.getByRole('button',{name:'Gửi lại',exact:true}).waitFor();
 assert.equal(await page.locator('.cf-purchase input[name=contact_name]').inputValue(),'DỮ LIỆU THỬ — browser');
 assert.ok(!(await page.locator('.cf-purchase [role=status]').textContent()).includes('Đã tiếp nhận'));
 await page.getByRole('button',{name:'Gửi lại',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.cf-purchase [role=status]')?.textContent.includes('Đã tiếp nhận đăng ký'));
 assert.equal(ids[0],ids[1]);
 assert.equal(await page.locator('.cf-purchase button').isDisabled(),true);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:'/tmp/cloudfit-purchase-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({passed:true,request_id:ids[1],attempts,screenshot:'/tmp/cloudfit-purchase-mobile.png'}));
}finally{await browser.close();}
