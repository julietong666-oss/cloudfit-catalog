export const CALLBACK_GROUP_NAME='Recall';
export class CallbackConfigurationError extends Error{
 constructor(code){super(code);this.code=code;}
}
const fail=code=>{throw new CallbackConfigurationError(code);};
export function callbackConfiguration(env){
 const token=env.get('TELEGRAM_CALLBACK_BOT_TOKEN'),chatId=env.get('TELEGRAM_CALLBACK_CHAT_ID');
 if(!token||!chatId)fail('callback_configuration_missing');
 if(typeof token!=='string'||token.length>512||!/^[1-9]\d*:[A-Za-z0-9_-]+$/.test(token))fail('callback_token_format_invalid');
 if(typeof chatId!=='string'||!/^-[1-9]\d{1,19}$/.test(chatId))fail('callback_chat_id_format_invalid');
 const paymentBot=env.get('TELEGRAM_BOT_TOKEN')?.trim(),paymentChat=env.get('TELEGRAM_CHAT_ID')?.trim();
 if(paymentBot&&token===paymentBot)fail('callback_bot_must_differ');
 if(paymentChat&&(chatId===paymentChat||/^-?\d+$/.test(paymentChat)&&BigInt(chatId)===BigInt(paymentChat)))fail('callback_chat_must_differ');
 return {token,chatId};
}
const title=value=>typeof value==='string'?value.trim().replace(/\s+/g,' ').toLowerCase():'';
// Read-only, cached checks. Never getUpdates/deleteWebhook/sendMessage here.
// Public health responses contain fixed codes/booleans, never credentials or group IDs.
export function createCallbackDestinationVerifier({env,fetchImpl=fetch,now=Date.now}){
 let entry;
 return async()=>{
  const config=callbackConfiguration(env);
  if(!entry||entry.until<=now()||entry.token!==config.token||entry.chatId!==config.chatId){
   const record={token:config.token,chatId:config.chatId,until:now()+300000};
   record.pending=(async()=>{
    async function api(method,payload,errorCode){
     try{
      const response=await fetchImpl(`https://api.telegram.org/bot${config.token}/${method}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),redirect:'error',signal:AbortSignal.timeout(5000)});
      const body=await response.json();
      if(!response.ok||body?.ok!==true)fail(errorCode);
      return body.result;
     }catch(error){if(error instanceof CallbackConfigurationError)throw error;fail(errorCode+(error?.name==='TimeoutError'?'_timeout':error instanceof SyntaxError?'_response_invalid':'_network'));}
    }
    const bot=await api('getMe',{},'callback_bot_rejected');
    if(bot?.is_bot!==true||String(bot.id)!==config.token.split(':')[0])fail('callback_bot_rejected');
    const chat=await api('getChat',{chat_id:config.chatId},'callback_group_unavailable');
    if(!['group','supergroup'].includes(chat?.type)||String(chat.id)!==config.chatId)fail('callback_group_unavailable');
    if(title(chat.title)!==title(CALLBACK_GROUP_NAME))fail('callback_group_name_mismatch');
    const membership=await api('getChatMember',{chat_id:config.chatId,user_id:bot.id},'callback_membership_unavailable');
    if(!['creator','administrator','member','restricted'].includes(membership?.status))fail('callback_bot_not_in_group');
    if(membership.status==='restricted'&&(membership.is_member!==true||membership.can_send_messages!==true))fail('callback_send_permission_missing');
    if(membership.status==='member'&&chat.permissions?.can_send_messages===false)fail('callback_send_permission_missing');
    return config;
   })();
   record.pending.catch(()=>{record.until=now()+30000;});entry=record;
  }
  return entry.pending;
 };
}
