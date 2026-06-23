/**
 * Footer - 底部信息条
 */

import { Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
      <span>Tower Defense · v0.1.0</span>
      <span>·</span>
      <a
        href="https://github.com/carlshen/web-game-01"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Github className="h-3 w-3" />
        Source
      </a>
    </footer>
  );
}
