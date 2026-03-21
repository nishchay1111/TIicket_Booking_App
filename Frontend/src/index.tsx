import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from "react-redux";
import { store } from './redux/store';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 1. Get the root element and assert its type
const rootElement = document.getElementById('root');

// 2. Add a check to ensure the element exists before creating the root
if (!rootElement) {
  throw new Error("Failed to find the root element. Check your index.html.");
}

const root = ReactDOM.createRoot(rootElement as HTMLElement);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// Performance monitoring
reportWebVitals();