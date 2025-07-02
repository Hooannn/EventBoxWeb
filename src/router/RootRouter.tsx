import { Suspense } from "react";
import PrivateRoute from "../components/PrivateRoute";
import DashboardPage from "../pages/DashboardPage";
import ErrorPage from "../pages/ErrorPage";
import MainLayout from "../layouts/MainLayout";
import OrganizationPage from "../pages/OrganizationPage";
import OrganizationLayout from "../layouts/OrganizationLayout";
import CreateEventPage from "../pages/CreateEventPage";
import CreateFirstOrganization from "../pages/DashboardPage/CreateFirstOrganization";
import { t } from "i18next";
import OrganizationSettingsPage from "../pages/OrganizationSettingsPage";
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
      {
        path: "/create-organization",
        element: (
          <CreateFirstOrganization
            title={t("create new organization").toString()}
            showBackButton
            onBack={() => window.history.back()}
            onSuccess={() => window.history.back()}
          />
        ),
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
      {
        path: ":id/settings",
        element: <OrganizationSettingsPage />,
      },
    ],
    errorElement: <ErrorPage />,
  },
];

export default rootRouter;
