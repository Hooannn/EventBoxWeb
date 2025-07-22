import { Suspense } from "react";
import PrivateRoute from "../components/PrivateRoute";
import DashboardPage from "../pages/DashboardPage";
import ErrorPage from "../pages/ErrorPage";
import MainLayout from "../layouts/MainLayout";
import OrganizationPage from "../pages/OrganizationPage";
import OrganizationLayout from "../layouts/OrganizationLayout";
import CreateEventPage from "../pages/CreateEventPage";
import CreateFirstOrganization from "../pages/DashboardPage/CreateFirstOrganization";
import OrganizationSettingsPage from "../pages/OrganizationSettingsPage";
import UpdateEventPage from "../pages/UpdateEventPage";
import AdminLayout from "../layouts/AdminLayout";
import UserAdminPage from "../pages/UserAdminPage";
import RoleAdminPage from "../pages/RoleAdminPage";
import EventAdminPage from "../pages/EventAdminPage";
import PermissionAdminPage from "../pages/PermissionAdminPage";
import EventLayout from "../layouts/EventLayout";
import OverallPage from "../pages/EventReportsPage/OverallPage";
import CheckInPage from "../pages/EventReportsPage/CheckInPage";
import OrdersPage from "../pages/EventReportsPage/OrdersPage";
import CategoryAdminPage from "../pages/CategoryAdminPage";
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
            title={"create new organization"}
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
        path: ":id/update-event/:eventId",
        element: <UpdateEventPage />,
      },
      {
        path: ":id/settings",
        element: <OrganizationSettingsPage />,
      },
    ],
    errorElement: <ErrorPage />,
  },
  {
    path: "/organization/:id/event/:eventId",
    element: (
      <Suspense>
        <PrivateRoute>
          <EventLayout />
        </PrivateRoute>
      </Suspense>
    ),
    children: [
      {
        path: "overall",
        element: <OverallPage />,
      },
      {
        path: "check-in",
        element: <CheckInPage />,
      },
      {
        path: "orders",
        element: <OrdersPage />,
      },
    ],
    errorElement: <ErrorPage />,
  },
  {
    path: "/admin",
    element: (
      <Suspense>
        <PrivateRoute>
          <AdminLayout />
        </PrivateRoute>
      </Suspense>
    ),
    children: [
      {
        path: "",
        element: <UserAdminPage />,
      },
      {
        path: "roles",
        element: <RoleAdminPage />,
      },
      {
        path: "permissions",
        element: <PermissionAdminPage />,
      },
      {
        path: "events",
        element: <EventAdminPage />,
      },
      {
        path: "categories",
        element: <CategoryAdminPage />,
      },
    ],
    errorElement: <ErrorPage />,
  },
];

export default rootRouter;
