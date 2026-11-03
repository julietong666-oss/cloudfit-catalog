import { createPaymentNotifier } from './handler.mjs';
Deno.serve(createPaymentNotifier({env:Deno.env}));
