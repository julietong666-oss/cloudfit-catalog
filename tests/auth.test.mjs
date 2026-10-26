import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { randomBytes } from 'node:crypto';
import { authMessage, authOptions, createIdentityClient } from '../catalog/auth.mjs';

test('identity client enables SDK persistence, refresh and email callback handling', () => {
  createIdentityClient((_url, _key, options) => assert.deepEqual(options.auth, authOptions));
  assert.deepEqual(authOptions, {persistSession:true, autoRefreshToken:true, detectSessionInUrl:true});
  assert.match(authMessage({code:'email_not_confirmed'}), /xác nhận/);
  assert.match(authMessage({code:'invalid_credentials'}), /không đúng/);
  assert.match(authMessage({code:'user_banned'}), /bị khóa/);
  assert.match(authMessage({name:'AuthRetryableFetchError'}), /Kiểm tra mạng/);
  assert.doesNotMatch(authMessage({message:'private-response'}), /private-response/);
});

test('pinned SDK: signup requires confirmation; A/B login, stored session, refresh, logout and invalidated user', async () => {
  const sdk = runInNewContext(await readFile(new URL('../catalog/vendor/supabase-2.118.0.js',import.meta.url),'utf8')+';supabase', {
    URL, Headers, Request, Response, AbortController, fetch, WebSocket,
    setTimeout, clearTimeout, setInterval, clearInterval, crypto:globalThis.crypto,
    console:{log(){},warn(){},error(){}},
  });
  const values = new Map();
  const storage = {getItem:key=>values.get(key)??null, setItem:(key,value)=>values.set(key,value), removeItem:key=>values.delete(key)};
  let email = 'a@example.com';
  let refreshed = 0;
  let invalidated = false;
  const user = () => ({id:'fixture', email, email_confirmed_at:'2026-10-26T00:00:00Z', app_metadata:{},user_metadata:{}});
  const session = () => ({access_token: `e30.${Buffer.from(JSON.stringify({exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')}.fixture`,refresh_token:'fixture-refresh',token_type:'bearer',expires_in:3600,user:user()});
  const transport = async (input, init) => {
    const url = new URL(input);
    if(url.pathname.endsWith('/signup')) {
      const body = JSON.parse(init.body);
      assert.equal(body.email_confirm, undefined);
      assert.deepEqual(body.data, {});
      return Response.json({...user(), email_confirmed_at:null, identities:[]});
    }
    if(url.pathname.endsWith('/token')) {
      if(url.searchParams.get('grant_type')==='refresh_token') refreshed++;
      return Response.json(session());
    }
    if(url.pathname.endsWith('/user')) return invalidated
      ? Response.json({code:'session_not_found'}, {status:401,headers:{'X-Supabase-Api-Version':'2024-01-01'}})
      : Response.json(user());
    if(url.pathname.endsWith('/logout')) return Response.json({});
    throw new Error('Unexpected SDK request');
  };
  const make = () => sdk.createClient('https://fixture.supabase.co','fixture-public', {auth:{...authOptions,storage,storageKey:'fixture-session',autoRefreshToken:false},global:{fetch:transport}});
  let client = make();
  try {
    const signup = await client.auth.signUp({email,password:randomBytes(24).toString('base64url')});
    assert.equal(signup.error,null);
    assert.equal(signup.data.session,null);
    assert.equal((await client.auth.getSession()).data.session,null);
    for (email of ['a@example.com','b@example.com']) {
      assert.equal((await client.auth.signInWithPassword({email,password:randomBytes(24).toString('base64url')})).error,null);
      assert.equal((await client.auth.getUser()).data.user.email,email);
      await client.auth.stopAutoRefresh();
      client = make(); // A new SDK instance simulates reloading the page.
      assert.equal((await client.auth.getSession()).data.session.user.email,email);
      assert.equal((await client.auth.refreshSession()).error,null);
      assert.equal((await client.auth.signOut({scope:'local'})).error,null);
      assert.equal((await client.auth.getSession()).data.session,null);
      assert.equal(values.has('fixture-session'),false);
    }
    assert.equal(refreshed,2);
    await client.auth.signInWithPassword({email,password:randomBytes(24).toString('base64url')});
    invalidated = true;
    assert.ok((await client.auth.getUser()).error);
    assert.equal((await client.auth.getSession()).data.session,null);
  } finally { await client.auth.stopAutoRefresh(); }
});
