import { createClient } from "@supabase/supabase-js";
import rateLimit from "express-rate-limit";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_API_KEY = process.env.NEXT_PUBLIC_SUPABASE_API_KEY;

if (!SUPABASE_URL || !SUPABASE_API_KEY) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per windowMs
//   message: "Too many requests from this IP, please try again later.",
// });

export async function GET(req: { url: string | URL }, res: any) {
  try {
    // await limiter(req, res);

    const { searchParams } = new URL(req.url);
    const access_token = searchParams.get("access_token");
    const refresh_token = searchParams.get("refresh_token");
    const discordId = searchParams.get("discordId");

    console.log("Received access_token:", access_token);
    console.log("Received refresh_token:", refresh_token);
    console.log("Received discordId:", discordId);

    if (!access_token || !refresh_token || !discordId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Set the Supabase auth session
    const { error: authError } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (authError) {
      console.error("Supabase Auth Error:", authError.message);
      return new Response(
        JSON.stringify({ error: "Failed to authenticate with Supabase" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Store the user's Discord ID in Supabase
    const { error: insertError } = await supabase
      .from("authenticated_users")
      .insert([{ discord_id: discordId }]);

    if (insertError) {
      console.error("Supabase Insert Error:", insertError.message);
      return new Response(
        JSON.stringify({ error: "Failed to store Discord ID" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        message: "Successfully authenticated and stored Discord ID",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Unexpected Error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
