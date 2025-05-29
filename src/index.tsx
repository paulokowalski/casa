import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { Home } from './views/Home';
import { Financa } from './views/Financa';

const router = createBrowserRouter([
  { 
    path: "/", 
    element: <App />,
    errorElement: <div>Página não encontrada</div>,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/financa",
        element: <Financa />
      }
    ]
  }
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);