import { Link, useNavigate } from '@tanstack/react-router';
import { Menu, Shield, AlertTriangle, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import AuthBar from '../features/auth/AuthBar';
import { useState } from 'react';

export default function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    setOpen(false);
    navigate({ to: path });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-destructive" />
                  Rider SOS
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-2">
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => handleNavigation('/')}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Home
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => handleNavigation('/hazards')}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Hazards
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => handleNavigation('/contacts')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Contacts
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => handleNavigation('/settings')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-destructive" />
            <span className="text-lg font-bold tracking-tight">Rider SOS</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          <Button variant="ghost" asChild>
            <Link to="/">Home</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/hazards">Hazards</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/contacts">Contacts</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/settings">Settings</Link>
          </Button>
        </nav>

        <AuthBar />
      </div>
    </header>
  );
}
