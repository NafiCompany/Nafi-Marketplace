import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './store/CartContext';

export function ConfiguredApp() {
  return (
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  );
}
