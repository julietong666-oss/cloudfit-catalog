import { createIntakeHandler } from './handler.mjs';
Deno.serve(createIntakeHandler({env:Deno.env}));
