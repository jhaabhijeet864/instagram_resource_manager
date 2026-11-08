import { NextResponse } from "next/server";

/**
 * GET /api/plugins/meta/oauth
 * Redirects the creator to Meta OAuth 2.0 authorization dialog.
 */
export async function GET(request: Request) {
  const appId = process.env.META_APP_ID;
  const { origin } = new URL(request.url);
  const redirectUri = `${origin}/api/plugins/meta/callback`;

  if (!appId) {
    // If running in development without App ID, show guidance
    return NextResponse.redirect(`${origin}/plugins?error=missing_app_id`);
  }

  const scopes = [
    "instagram_basic",
    "instagram_manage_comments",
    "instagram_manage_messages",
    "pages_show_list",
    "pages_read_engagement",
  ].join(",");

  const metaOAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${encodeURIComponent(
    appId
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(
    scopes
  )}&response_type=code`;

  return NextResponse.redirect(metaOAuthUrl);
}
