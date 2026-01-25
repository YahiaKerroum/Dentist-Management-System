import readline from "readline";
import { google } from "googleapis";
import { ENV } from "../../src/config/env";

async function main() {
  const clientId = ENV.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = ENV.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = ENV.GOOGLE_OAUTH_REDIRECT_URI || "http://localhost:4000/api/auth/google/callback";

  if (!clientId || !clientSecret) {
    console.error("Missing GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET in .env");
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const scopes = ["https://www.googleapis.com/auth/drive.file"]; // upload files to user's Drive

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });

  console.log("\nAuthorize this app by visiting this URL:\n", authUrl);
  console.log("\nAfter consenting, paste the 'code' parameter from the callback URL here.\n");

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question("Enter authorization code: ", async (code) => {
    rl.close();
    try {
      const { tokens } = await oauth2Client.getToken(code.trim());
      console.log("\nTokens obtained. Save this refresh token to your .env:\n");
      console.log("GOOGLE_OAUTH_REFRESH_TOKEN=\"" + tokens.refresh_token + "\"\n");
    } catch (err) {
      console.error("Failed to exchange code for tokens:", err);
      process.exit(1);
    }
  });
}

main();
