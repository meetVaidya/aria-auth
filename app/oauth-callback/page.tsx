"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const OAuthCallbackPage = () => {
  const router = useRouter();
  const [message, setMessage] = useState("Authenticating...");

  useEffect(() => {
    const authenticateUser = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const discordId = urlParams.get("discordId");

      // Parse the URL fragment
      const fragmentParams = new URLSearchParams(
        window.location.hash.substring(1),
      );
      const access_token = fragmentParams.get("access_token");
      const refresh_token = fragmentParams.get("refresh_token");

      console.log("Access Token:", access_token);
      console.log("Refresh Token:", refresh_token);
      console.log("Discord ID:", discordId);

      if (!access_token || !refresh_token || !discordId) {
        setMessage("Missing required parameters.");
        return;
      }

      try {
        const response = await fetch(
          `/api/oauth-callback?access_token=${access_token}&refresh_token=${refresh_token}&discordId=${discordId}`,
        );

        if (response.ok) {
          const data = await response.json();
          setMessage(data.message);
        } else {
          const errorData = await response.json();
          setMessage(errorData.error);
        }
      } catch (error) {
        setMessage("An error occurred during authentication.");
      }
    };

    if (router) {
      authenticateUser();
    }
  }, [router]);

  return (
    <div>
      <h1>{message}</h1>
    </div>
  );
};

export default OAuthCallbackPage;
