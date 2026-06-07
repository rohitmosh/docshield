import { useState, useEffect } from 'react';

export interface RouteState {
  route: string;
  queryParams: Record<string, string>;
}

export function useRouter(): RouteState {
  const [routeState, setRouteState] = useState<RouteState>({
    route: 'home',
    queryParams: {}
  });

  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash.substring(1) || 'home';
      const parts = hash.split('?');
      const route = parts[0];
      const queryParams: Record<string, string> = {};

      if (parts[1]) {
        parts[1].split('&').forEach(pair => {
          const p = pair.split('=');
          queryParams[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || '');
        });
      }

      setRouteState({ route, queryParams });
    };

    window.addEventListener('hashchange', parseHash);
    // Parse initial hash on load
    parseHash();

    return () => {
      window.removeEventListener('hashchange', parseHash);
    };
  }, []);

  return routeState;
}
