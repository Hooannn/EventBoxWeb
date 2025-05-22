import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
//import { SocketProvider } from "./contexts/SocketContext";
import { RouterProvider } from "react-router-dom";
import getRouter from "./router";
import useAppStore from "./stores/app";
import { useEffect } from "react";
const GG_CLIENT_ID = import.meta.env.VITE_GG_CLIENT_ID;
const queryClient = new QueryClient();
export default function App() {
  const { deviceId, setDeviceId } = useAppStore();
  useEffect(() => {
    if (!deviceId) {
      const newDeviceId = `${crypto.randomUUID()}`;
      setDeviceId(newDeviceId);
    } else {
      setDeviceId(deviceId);
    }
  }, [deviceId, setDeviceId]);

  return (
    <GoogleOAuthProvider clientId={GG_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        {/* <SocketProvider socketUrl={import.meta.env.VITE_SOCKET_ENDPOINT}> */}
        <RouterProvider router={getRouter()}></RouterProvider>
        {/* </SocketProvider> */}
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
