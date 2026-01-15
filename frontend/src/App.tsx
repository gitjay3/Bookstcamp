import { createBrowserRouter, RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import Layout from './Layout';
import Main from './pages/main/Main';
import EventDetail from './pages/event-detail/EventDetail';
import ManageTemplate from './pages/manage-template/ManageTemplate';
import CamperMyPage from './pages/camper-mypage/CamperMyPage';
import LoginPage from './pages/auth/LoginPage';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Main /> },
      { path: '/hi', element: <Main /> },
      { path: '/events/:id', element: <EventDetail /> },
      { path: '/templates', element: <ManageTemplate /> },
      { path: '/me', element: <CamperMyPage /> },
    ],
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;
