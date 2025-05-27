import React from 'react';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Import createRoot from "react-dom/client"
import { createRoot } from 'react-dom/client';

import { AuthProvider } from './Components/Contexts/AuthContext';
 import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter } from 'react-router-dom';
import {  ThemeProvider } from './Components/utils/ThemeContext';
const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
     <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
        <App />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
