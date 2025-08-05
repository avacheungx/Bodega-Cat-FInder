import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { SearchPage } from './pages/SearchPage';
import { CatDetailPage } from './pages/CatDetailPage';
import { BodegaDetailPage } from './pages/BodegaDetailPage';
import { SavedPage } from './pages/SavedPage';
import { RecentlyViewedPage } from './pages/RecentlyViewedPage';
import { UploadPage } from './pages/UploadPage';
import { EditCatPage } from './pages/EditCatPage';
import { EditBodegaPage } from './pages/EditBodegaPage';

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/cat/:id" element={<CatDetailPage />} />
          <Route path="/cat/:id/edit" element={<EditCatPage />} />
          <Route path="/bodega/:id" element={<BodegaDetailPage />} />
          <Route path="/bodega/:id/edit" element={<EditBodegaPage />} />
          <Route 
            path="/saved" 
            element={
              <ProtectedRoute>
                <SavedPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recently-viewed" 
            element={
              <ProtectedRoute>
                <RecentlyViewedPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/upload" 
            element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App; 