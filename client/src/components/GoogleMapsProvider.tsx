"use client";

import { APIProvider } from "@vis.gl/react-google-maps";

const GoogleMapsProvider = ({ children }: { children: React.ReactNode }) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) return <>{children}</>;

  return <APIProvider apiKey={apiKey}>{children}</APIProvider>;
};

export default GoogleMapsProvider;
