import "primereact/resources/themes/lara-light-cyan/theme.css";

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from './views/Home';
import { Financa } from './views/Financa';
import { ErrorPage } from './views/ErrorPage';
import { Geracao } from './views/Geracao';

import { PrimeReactProvider } from 'primereact/api';

const router = createBrowserRouter([
  { 
    path: "/",        
    element: <App />,
    errorElement: <ErrorPage/>,
    children: [
      { path: "/", element: <Home /> },
      { path: "/financa", element: <Financa /> },
      { path: "/geracao", element: <Geracao /> }
    ]
  }  
])

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <PrimeReactProvider>
      <RouterProvider  router={router}/>
    </PrimeReactProvider>
  </React.StrictMode>
);