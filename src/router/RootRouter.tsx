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
import OverallPage from "../pages/EventDetailsPage/OverallPage";
import CheckInPage from "../pages/EventDetailsPage/CheckInPage";
import OrdersPage from "../pages/EventDetailsPage/OrdersPage";
import CategoryAdminPage from "../pages/CategoryAdminPage";
import SettingsPage from "../pages/SettingsPage";
import DemoPage from "../pages/DemoPage";
import VouchersPage from "../pages/EventDetailsPage/VouchersPage";
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
        path: "/demo",
        element: <DemoPage />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
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
      {
        path: "vouchers",
        element: <VouchersPage />,
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
