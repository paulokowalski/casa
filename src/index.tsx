import React from 'react';
import ReactDOM from 'react-dom/client';

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from './views/Home';
import { Financa } from './views/Financa';
import App from './App';
import { ErrorPage } from './views/ErrorPage';
import { Geracao } from './views/Geracao';

import { ThemeProvider } from "@material-tailwind/react";

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
    <ThemeProvider>
      <RouterProvider  router={router}/>
    </ThemeProvider>
  </React.StrictMode>
);