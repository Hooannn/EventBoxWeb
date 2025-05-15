import { Spinner } from "@heroui/react";
export default function LoadingOverlay() {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-white fixed top-0 left-0 z-50 opacity-80">
      <Spinner size="lg" variant="wave" />
    </div>
  );
}
