import { SePayPgClient } from 'npm:sepay-pg-node@1.0.0';
import { createSandboxHandler } from './handler.mjs';
Deno.serve(createSandboxHandler({env:Deno.env,makeClient:(config: ConstructorParameters<typeof SePayPgClient>[0])=>new SePayPgClient(config)}));
