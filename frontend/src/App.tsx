import { createBrowserRouter, RouterProvider } from 'react-router';
import Layout from './Layout';
import Main from './pages/main/Main';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [{ path: '/', element: <Main /> }],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
