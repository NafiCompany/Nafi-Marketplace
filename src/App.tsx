import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { AdminRoute, ProtectedRoute } from './components/ProtectedRoute';
import { AboutPage, NotFoundPage, PrivacyPage, TermsPage } from './pages/StaticPages';
import { AccountLayout, AccountOverview, DownloadsPage, OrderDetailPage, OrdersPage } from './pages/AccountPage';
import { AdminPage } from './pages/AdminPage';
import { CartPage } from './pages/CartPage';
import { CatalogPage } from './pages/CatalogPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { ProductPage } from './pages/ProductPage';
import { RegisterPage } from './pages/RegisterPage';

export default function App(){
 return <BrowserRouter><Routes><Route element={<AppLayout/>}><Route index element={<HomePage/>}/><Route path="catalog" element={<CatalogPage/>}/><Route path="product/:slug" element={<ProductPage/>}/><Route path="cart" element={<CartPage/>}/><Route path="about" element={<AboutPage/>}/><Route path="terms" element={<TermsPage/>}/><Route path="privacy" element={<PrivacyPage/>}/><Route path="login" element={<LoginPage/>}/><Route path="register" element={<RegisterPage/>}/><Route path="forgot-password" element={<ForgotPasswordPage/>}/><Route element={<ProtectedRoute/>}><Route path="checkout" element={<CheckoutPage/>}/><Route path="order-success/:id" element={<OrderSuccessPage/>}/><Route path="account" element={<AccountLayout/>}><Route index element={<AccountOverview/>}/><Route path="orders" element={<OrdersPage/>}/><Route path="orders/:id" element={<OrderDetailPage/>}/><Route path="downloads" element={<DownloadsPage/>}/></Route><Route element={<AdminRoute/>}><Route path="admin" element={<AdminPage/>}/></Route></Route><Route path="404" element={<NotFoundPage/>}/><Route path="*" element={<Navigate to="/404" replace/>}/></Route></Routes></BrowserRouter>
}
