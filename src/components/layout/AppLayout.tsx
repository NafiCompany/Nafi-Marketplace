import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';
import { MarketplaceAssistant } from '../assistant/MarketplaceAssistant';

export function AppLayout() {
  return (
    <>
      <AppHeader />
      <main><Outlet /></main>
      <AppFooter />
      <MarketplaceAssistant />
    </>
  );
}
