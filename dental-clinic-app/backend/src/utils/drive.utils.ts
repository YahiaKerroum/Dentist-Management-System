import { google } from "googleapis";
import { Readable } from "stream";
import { ENV } from "../config/env";

interface DriveUploadResult {
  id: string;
  webViewLink: string;
  webContentLink?: string;
}

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

function getServiceAccountDriveClient() {
  const clientEmail = ENV.GOOGLE_DRIVE_CLIENT_EMAIL;
  const privateKey = ENV.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    return undefined;
  }

  const auth = new google.auth.JWT({ email: clientEmail, key: privateKey, scopes: SCOPES });
  return google.drive({ version: "v3", auth });
}

function getOAuthDriveClient() {
  const clientId = ENV.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = ENV.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = ENV.GOOGLE_OAUTH_REDIRECT_URI;
  const refreshToken = ENV.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return undefined;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return google.drive({ version: "v3", auth: oauth2Client });
}

export async function uploadToDrive(options: {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  folderId?: string;
}): Promise<DriveUploadResult> {
  // Prefer OAuth (uploads under a real user's quota). Fallback to service account if OAuth not configured.
  const drive = getOAuthDriveClient() || getServiceAccountDriveClient();
  if (!drive) {
    throw new Error(
      "Google Drive is not configured. Set OAuth env vars (GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN) or service account vars."
    );
  }
  const folderId = options.folderId || ENV.GOOGLE_DRIVE_FOLDER_ID;

  const media = {
    mimeType: options.mimeType,
    body: Readable.from(options.buffer),
  };

  const requestBody: any = {
    name: options.filename,
    parents: folderId ? [folderId] : undefined,
  };

  let response;
  try {
    response = await drive.files.create({
      requestBody,
      media,
      fields: "id, webViewLink, webContentLink",
      supportsAllDrives: true,
    });
  } catch (err: any) {
    // Surface service-account quota errors with a helpful message
    if (String(err?.message || "").includes("Service Accounts do not have storage quota")) {
      throw new Error(
        "Upload failed: Service accounts have no storage quota. Configure OAuth (upload under a user's Drive) or use a Shared Drive."
      );
    }
    throw err;
  }

  if (!response.data.id || !response.data.webViewLink) {
    throw new Error("Failed to upload file to Google Drive");
  }

  // Make the file accessible via link (optional: adjust permission)
  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
    supportsAllDrives: true,
  });

  // Retrieve updated links after permission change
  const fileInfo = await drive.files.get({
    fileId: response.data.id,
    fields: "id, webViewLink, webContentLink",
    supportsAllDrives: true,
  });

  return {
    id: fileInfo.data.id!,
    webViewLink: fileInfo.data.webViewLink!,
    webContentLink: fileInfo.data.webContentLink || undefined,
  };
}

export async function deleteFromDrive(fileId: string): Promise<void> {
  const drive = getOAuthDriveClient() || getServiceAccountDriveClient();
  if (!drive) {
    throw new Error(
      "Google Drive is not configured. Cannot delete file — missing OAuth or service account configuration."
    );
  }

  await drive.files.delete({
    fileId,
    supportsAllDrives: true,
  });
}
