import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ToastContainer } from './components/ui/ToastContainer';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CustomersList } from './pages/customers/CustomersList';
import { CustomerDetail } from './pages/customers/CustomerDetail';
import { CustomerForm } from './pages/customers/CustomerForm';
import { ProductsList } from './pages/products/ProductsList';
import { ProductForm } from './pages/products/ProductForm';
import { ProductDetail } from './pages/products/ProductDetail';
import { Inventory } from './pages/inventory/Inventory';
import { ChallansList } from './pages/challans/ChallansList';
import { ChallanDetail } from './pages/challans/ChallanDetail';
import { CreateChallan } from './pages/challans/CreateChallan';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            
            <Route path="/customers" element={<CustomersList />} />
            <Route path="/customers/new" element={<CustomerForm />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/customers/:id/edit" element={<CustomerForm />} />
            
            <Route path="/products" element={<ProductsList />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/products/:id/edit" element={<ProductForm />} />
            
            <Route path="/inventory" element={<Inventory />} />
            
            <Route path="/challans" element={<ChallansList />} />
            <Route path="/challans/new" element={<CreateChallan />} />
            <Route path="/challans/:id" element={<ChallanDetail />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </QueryClientProvider>
  );
}
