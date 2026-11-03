import {createCallbackHandler} from './handler.mjs';
Deno.serve(createCallbackHandler({env:Deno.env}));
