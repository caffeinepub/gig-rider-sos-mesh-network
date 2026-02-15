import { Outlet } from '@tanstack/react-router';
import Header from './Header';
import Footer from './Footer';
import ConnectivityIndicator from './ConnectivityIndicator';
import SOSController from '../features/sos/SOSController';
import CrashPromptDialog from '../features/sensors/CrashPromptDialog';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <ConnectivityIndicator />
      <main className="flex-1">
        <Outlet />
      </main>
      <SOSController />
      <CrashPromptDialog />
      <Footer />
    </div>
  );
}
