import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#059669',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
