"use client";

import { APIProvider } from "@vis.gl/react-google-maps";

const GoogleMapsProvider = ({ children }: { children: React.ReactNode }) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) return <>{children}</>;

  // `language`/`region` pin the map + Places labels; without them Google infers
  // language from the browser locale (which is why it can show up in Russian).
  return (
    <APIProvider apiKey={apiKey} language="en" region="PH">
      {children}
    </APIProvider>
  );
};

export default GoogleMapsProvider;
