import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { useRouter } from './hooks/useRouter';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { InternalLayout } from './components/layout/InternalLayout';

// Features
import { Home } from './features/home/Home';
import { About } from './features/home/About';
import { PublicDocuments } from './features/repository/PublicDocuments';
import { Login } from './features/auth/Login';
import { Dashboard } from './features/dashboard/Dashboard';
import { Repository } from './features/repository/Repository';
import { SearchConsole } from './features/search/SearchConsole';
import { SecurityVault } from './features/security/SecurityVault';
import { AuditLog } from './features/audit/AuditLog';
import { Administration } from './features/admin/Administration';
import { Profile } from './features/profile/Profile';
import { DocumentViewer } from './features/repository/DocumentViewer';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const { route, queryParams } = useRouter();

  const isAnonymous = user.role === 'ANONYMOUS';

  // Determine view to render
  let content: React.ReactNode = null;
  let layoutType: 'public' | 'internal' = 'public';

  switch (route) {
    case 'home':
      content = <Home />;
      layoutType = 'public';
      break;

    case 'about':
      content = <About />;
      layoutType = 'public';
      break;

    case 'public-documents':
      content = <PublicDocuments />;
      layoutType = 'public';
      break;

    case 'login':
      content = <Login />;
      layoutType = 'public';
      break;

    case 'dashboard':
      if (isAnonymous) {
        content = <Login />;
        layoutType = 'public';
      } else {
        content = <Dashboard />;
        layoutType = 'internal';
      }
      break;

    case 'repository':
      if (isAnonymous) {
        content = <Login />;
        layoutType = 'public';
      } else {
        content = <Repository />;
        layoutType = 'internal';
      }
      break;

    case 'search':
      if (isAnonymous) {
        content = <Login />;
        layoutType = 'public';
      } else {
        content = <SearchConsole />;
        layoutType = 'internal';
      }
      break;

    case 'security':
      if (isAnonymous) {
        content = <Login />;
        layoutType = 'public';
      } else {
        content = <SecurityVault initialDocId={queryParams.id || null} />;
        layoutType = 'internal';
      }
      break;

    case 'audit':
      if (isAnonymous || !['DEPT_ADMIN', 'SYSTEM_ADMIN'].includes(user.role)) {
        content = <Login />;
        layoutType = 'public';
      } else {
        content = <AuditLog />;
        layoutType = 'internal';
      }
      break;

    case 'administration':
      if (isAnonymous || !['DEPT_ADMIN', 'SYSTEM_ADMIN'].includes(user.role)) {
        content = <Login />;
        layoutType = 'public';
      } else {
        content = <Administration />;
        layoutType = 'internal';
      }
      break;

    case 'profile':
      if (isAnonymous) {
        content = <Login />;
        layoutType = 'public';
      } else {
        content = <Profile />;
        layoutType = 'internal';
      }
      break;

    case 'document-viewer':
      const docId = queryParams.id || '';
      const version = queryParams.version || '';
      content = <DocumentViewer docId={docId} version={version} />;
      layoutType = isAnonymous ? 'public' : 'internal';
      break;

    default:
      content = <Home />;
      layoutType = 'public';
      break;
  }

  // Wrap inside the correct layout shell
  if (layoutType === 'public') {
    return <PublicLayout currentRoute={route}>{content}</PublicLayout>;
  } else {
    return <InternalLayout currentRoute={route}>{content}</InternalLayout>;
  }
};

export const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;
