import { StrictMode, useEffect } from 'react';
import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import HazardsPage from './pages/HazardsPage';
import ContactsPage from './pages/ContactsPage';
import SettingsPage from './pages/SettingsPage';
import SOSStatusPage from './pages/SOSStatusPage';
import { registerServiceWorker } from './pwa/registerServiceWorker';
import { useSyncRunner } from './offline/sync';
import { useSOSStore } from './features/sos/sosState';
import { useActor } from './hooks/useActor';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const hazardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/hazards',
  component: HazardsPage,
});

const contactsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contacts',
  component: ContactsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const sosStatusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sos/$sosId',
  component: SOSStatusPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  hazardsRoute,
  contactsRoute,
  settingsRoute,
  sosStatusRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function SyncManager() {
  useSyncRunner();
  return null;
}

function SOSReconciliation() {
  const { actor } = useActor();
  const activeSOS = useSOSStore((state) => state.activeSOS);

  useEffect(() => {
    if (!actor || !activeSOS || activeSOS.backendId) return;

    // Try to reconcile on app startup if we have a temp SOS without backend ID
    const attemptReconciliation = async () => {
      try {
        // This will be handled by the sync runner
        console.log('SOS reconciliation will occur during next sync cycle');
      } catch (error) {
        console.error('SOS reconciliation error:', error);
      }
    };

    attemptReconciliation();
  }, [actor, activeSOS]);

  return null;
}

export default function App() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <StrictMode>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <SyncManager />
          <SOSReconciliation />
          <RouterProvider router={router} />
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>
  );
}
