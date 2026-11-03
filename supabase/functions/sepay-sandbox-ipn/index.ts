import { createIpnHandler } from './handler.mjs';
Deno.serve(createIpnHandler({env:Deno.env}));
