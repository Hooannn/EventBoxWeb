import { Suspense } from "react";
import PrivateRoute from "../components/PrivateRoute";
import DashboardPage from "../pages/DashboardPage";
import ErrorPage from "../pages/ErrorPage";
import MainLayout from "../layouts/MainLayout";
import OrganizationPage from "../pages/OrganizationPage";
import OrganizationLayout from "../layouts/OrganizationLayout";
import CreateEventPage from "../pages/CreateEventPage";
const rootRouter = [
  {
    path: "/",
    element: (
      <Suspense>
        <PrivateRoute>
          <MainLayout />
        </PrivateRoute>
      </Suspense>
    ),
    children: [
      {
        path: "/",
        element: <DashboardPage />,
      },
    ],
    errorElement: <ErrorPage />,
  },
  {
    path: "/organization",
    element: (
      <Suspense>
        <PrivateRoute>
          <OrganizationLayout />
        </PrivateRoute>
      </Suspense>
    ),
    children: [
      {
        path: ":id",
        element: <OrganizationPage />,
      },
      {
        path: ":id/create-event",
        element: <CreateEventPage />,
      },
    ],
    errorElement: <ErrorPage />,
  },
];

export default rootRouter;
