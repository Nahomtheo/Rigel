"use client";

import { useEffect, useState } from "react";
import { Network } from "@capacitor/network";

export default function ConnectionGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      const status = await Network.getStatus();
      setOffline(!status.connected);
    };

    checkConnection();

    const listener = Network.addListener(
      "networkStatusChange",
      (status) => {
        setOffline(!status.connected);
      }
    );

    return () => {
      listener.then((handle) => handle.remove());
    };
  }, []);

  if (offline) {
    return (
      <div className="min-h-screen bg-[#120B07] text-[#F5EFE6] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <h1 className="text-3xl font-serif font-bold text-[#C9A227]">
            Rigel
          </h1>

          <h2 className="mt-6 text-xl font-semibold">
            No Internet Connection
          </h2>

          <p className="mt-3 text-[#F5EFE6]/70">
            Please check your internet connection and try again.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 rounded-full bg-[#C9A227] text-black font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}