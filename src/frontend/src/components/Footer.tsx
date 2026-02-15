import { SiCaffeine } from 'react-icons/si';
import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'rider-sos'
  );

  return (
    <footer className="border-t border-border/40 bg-muted/30 py-6">
      <div className="container px-4 text-center text-sm text-muted-foreground">
        <p className="flex items-center justify-center gap-1.5">
          © {currentYear} Rider SOS. Built with{' '}
          <Heart className="h-3.5 w-3.5 fill-destructive text-destructive" /> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline-offset-4 hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
