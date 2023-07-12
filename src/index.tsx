import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Home } from './home';

const router = createBrowserRouter([
  {
    path: '/web-gym/',
    children: [
      {
        path: '',
        element: <Home />,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render((
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
));
