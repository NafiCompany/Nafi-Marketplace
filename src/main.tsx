import React from 'react';
import ReactDOM from 'react-dom/client';
import { isPublicConfigReady } from './config/publicConfig';
import { SetupPage } from './pages/SetupPage';
import './styles/global.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);

if (!isPublicConfigReady()) {
  root.render(<React.StrictMode><SetupPage /></React.StrictMode>);
} else {
  void import('./ConfiguredApp').then(({ ConfiguredApp }) => {
    root.render(<React.StrictMode><ConfiguredApp /></React.StrictMode>);
  });
}
