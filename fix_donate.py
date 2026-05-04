#!/usr/bin/env python3
"""
fix_donate.py — Fix AbacatePay v2 API request format.
Run from the pronto.ia repo root.
"""

import os
import sys

def main():
    path = 'apps/web/src/app/api/v1/donate/route.ts'
    
    if not os.path.isfile(path):
        print("ERROR: Run from repo root. File not found:", path)
        sys.exit(1)

    with open(path, 'r') as f:
        content = f.read()

    # Replace the old request body format with the correct flat format
    old_body = """        body: JSON.stringify({
          method: 'PIX',
          data: {
            amount,
            expiresIn: 3600,
            description: 'Doação para o projeto Pronto.IA',
            externalId,
            metadata: {
              source: 'pronto-ia-web',
              kind: 'donation',
            },
          },
        }),"""

    new_body = """        body: JSON.stringify({
          amount,
          expiresIn: 3600,
          description: 'Doação para o projeto Pronto.IA',
          metadata: {
            source: 'pronto-ia-web',
            kind: 'donation',
          },
        }),"""

    if old_body in content:
        content = content.replace(old_body, new_body)
        print("[OK] Updated request body to flat format (matching AbacatePay SDK)")
    else:
        print("[WARN] Could not find exact old body block. Trying alternative fix...")
        # Try to find and fix by looking for the JSON.stringify call
        import re
        # Remove externalId variable declaration too since it's no longer used
        if "const externalId = `don_" in content:
            content = re.sub(r"const externalId = `don_.*?`;\n", "", content)
            print("[OK] Removed unused externalId variable")

    # Remove the unused externalId line if still present
    lines = content.split('\n')
    new_lines = []
    for line in lines:
        if "const externalId" in line and "don_" in line:
            print(f"[OK] Removed unused line: {line.strip()}")
            continue
        new_lines.append(line)
    content = '\n'.join(new_lines)

    with open(path, 'w') as f:
        f.write(content)

    print(f"\n[Done] Fixed {path}")
    print("Now run: git add -A && git commit -m 'fix: update AbacatePay v2 API request format' && git push")

if __name__ == '__main__':
    main()
