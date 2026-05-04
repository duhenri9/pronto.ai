#!/usr/bin/env python3
"""
fix_deploy.py — Fix all TypeScript errors blocking Vercel deployment.
Run from the pronto.ia repo root (the directory with packages/, apps/, etc.)
"""

import os
import sys

def ensure_root():
    """Verify we're in the repo root."""
    if not os.path.isdir('packages/types/src') or not os.path.isdir('apps/web/src/lib'):
        print("ERROR: Run this script from the pronto.ia repo root!")
        sys.exit(1)

def step1_add_abacate_types():
    """Add AbacateWebhookEvent and AbacateWebhookJob to @pronto-ia/types."""
    path = 'packages/types/src/index.ts'
    print(f"\n[Step 1] Adding AbacateWebhookJob type to {path}...")

    with open(path, 'r') as f:
        content = f.read()

    # Don't add if already present
    if 'AbacateWebhookJob' in content:
        print("  -> AbacateWebhookJob already exists, skipping.")
        return

    # Append the new types before the LGPD section
    lgpd_marker = "// ---- LGPD ----"
    new_types = """// ---- Payments / AbacatePay ----

export interface AbacateWebhookEvent {
  id: string;
  type: string;
  checkout_id: string;
  subscription_id?: string;
  amount?: number;
}

export interface AbacateWebhookJob {
  type: 'abacate_webhook';
  rawBody: string;
  signature: string;
  payload: AbacateWebhookEvent;
}

"""

    if lgpd_marker in content:
        content = content.replace(lgpd_marker, new_types + lgpd_marker)
    else:
        # Fallback: just append at end
        content = content.rstrip() + '\n\n' + new_types

    with open(path, 'w') as f:
        f.write(content)

    print("  -> Added AbacateWebhookEvent and AbacateWebhookJob interfaces.")

def step2_fix_memory_extractor():
    """Remove @ts-nocheck and declare module workaround from memory-extractor.ts."""
    path = 'apps/worker/src/processors/memory-extractor.ts'
    print(f"\n[Step 2] Fixing {path}...")

    with open(path, 'r') as f:
        content = f.read()

    changes = 0

    # Remove @ts-nocheck line
    if '// @ts-nocheck' in content:
        content = content.replace('// @ts-nocheck\n', '', 1)
        changes += 1
        print("  -> Removed @ts-nocheck")

    # Remove declare module workaround
    declare_line = "declare module '@anthropic-ai/sdk'{const A:any;export default A}"
    if declare_line in content:
        content = content.replace(declare_line + '\n', '', 1)
        changes += 1
        print("  -> Removed declare module workaround")

    # Ensure proper import exists (the 'import Anthropic from...' should already be there)
    if "import Anthropic from '@anthropic-ai/sdk'" in content:
        print("  -> Proper ES import already in place")
    else:
        # Add it after the comment block if not present
        if "const Anthropic: any = require" in content:
            content = content.replace(
                "const Anthropic: any = require(\"@anthropic-ai/sdk\");",
                "import Anthropic from '@anthropic-ai/sdk';"
            )
            changes += 1
            print("  -> Replaced require() with ES import")

    with open(path, 'w') as f:
        f.write(content)

    print(f"  -> Total changes: {changes}")

def step3_fix_abacate_route():
    """Fix queue name mismatch in abacate webhook route."""
    path = 'apps/web/src/app/api/v1/webhooks/abacate/route.ts'
    print(f"\n[Step 3] Fixing queue name in {path}...")

    with open(path, 'r') as f:
        content = f.read()

    # Fix: queue name 'whatsapp.outbound' -> 'payments.webhooks'
    if "'whatsapp.outbound'" in content:
        content = content.replace("'whatsapp.outbound'", "'payments.webhooks'")
        print("  -> Fixed queue name: 'whatsapp.outbound' -> 'payments.webhooks'")
    else:
        print("  -> Queue name already correct, skipping.")

    # Also update the import to use the proper type
    if "let abacateQueue: Queue | null = null" in content:
        content = content.replace(
            "let abacateQueue: Queue | null = null;",
            "import type { AbacateWebhookJob } from '@pronto-ia/types';\n\nlet abacateQueue: Queue<AbacateWebhookJob> | null = null;"
        )
        print("  -> Added AbacateWebhookJob import and typed the queue")

    if "function getAbacateQueue(): Queue {" in content:
        content = content.replace(
            "function getAbacateQueue(): Queue {",
            "function getAbacateQueue(): Queue<AbacateWebhookJob> {"
        )
        print("  -> Typed getAbacateQueue() return type")

    # Also import getPaymentsWebhookQueue usage or keep local - let's keep it local but typed
    # Remove unused Queue import if it's already imported by the type
    # Actually keep the Queue import since we're still using new Queue directly

    with open(path, 'w') as f:
        f.write(content)

def step4_fix_payments_webhook():
    """Remove 'as never' cast from payments-webhook.ts now that type exists."""
    path = 'apps/worker/src/processors/payments-webhook.ts'
    print(f"\n[Step 4] Cleaning up {path}...")

    with open(path, 'r') as f:
        content = f.read()

    if 'payload as never' in content:
        content = content.replace('payload as never', 'payload')
        print("  -> Removed 'as never' cast from payload (type is now properly defined)")
    else:
        print("  -> No cleanup needed")

    with open(path, 'w') as f:
        f.write(content)

def main():
    print("=" * 60)
    print("  PRONTO.IA — Deploy Fix Script")
    print("=" * 60)

    ensure_root()

    step1_add_abacate_types()
    step2_fix_memory_extractor()
    step3_fix_abacate_route()
    step4_fix_payments_webhook()

    print("\n" + "=" * 60)
    print("  All fixes applied!")
    print("=" * 60)
    print("\nNext steps:")
    print("  cd apps/worker && npx tsc --noEmit    # typecheck worker")
    print("  cd apps/web && npx tsc --noEmit       # typecheck web")
    print("  git add -A && git commit -m 'fix: add AbacateWebhookJob type, remove ts-nocheck, fix queue name' && git push")
    print()

if __name__ == '__main__':
    main()
