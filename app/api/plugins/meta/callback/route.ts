import { NextResponse } from "next/server";
import { pluginRegistry } from "@/lib/plugins/registry";

/**
 * GET /api/plugins/meta/callback
 * Handles OAuth 2.0 redirect from Meta dialog.
 * Exchanges authorization code for tokens and discovers Instagram Business Accounts.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${origin}/plugins?status=error&message=${encodeURIComponent(error || "No code received")}`);
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = `${origin}/api/plugins/meta/callback`;

  try {
    // 1. Exchange authorization code for short-lived user access token
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&client_secret=${appSecret}&code=${code}`;

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return NextResponse.redirect(
        `${origin}/plugins?status=error&message=${encodeURIComponent(tokenData.error.message)}`
      );
    }

    const shortLivedToken = tokenData.access_token;

    // 2. Exchange for 60-day long-lived user access token
    const longLivedUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
    const longLivedRes = await fetch(longLivedUrl);
    const longLivedData = await longLivedRes.json();
    const longLivedToken = longLivedData.access_token || shortLivedToken;

    // 3. Discover connected Facebook Page and Instagram Business Account
    const accountsUrl = `https://graph.facebook.com/v19.0/me/accounts?fields=name,access_token,instagram_business_account&access_token=${longLivedToken}`;
    const accountsRes = await fetch(accountsUrl);
    const accountsData = await accountsRes.json();

    let pageToken = longLivedToken;
    let igAccountId = "";

    if (accountsData.data && accountsData.data.length > 0) {
      const page = accountsData.data[0];
      pageToken = page.access_token || pageToken;
      igAccountId = page.instagram_business_account?.id || "";
    }

    // Update Meta plugin settings in runtime registry
    pluginRegistry.updatePluginSettings("meta-linkage", {
      pageAccessToken: pageToken,
      instagramAccountId: igAccountId,
      tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    });

    return NextResponse.redirect(`${origin}/plugins?status=connected&account_id=${igAccountId}`);
  } catch (err: any) {
    return NextResponse.redirect(
      `${origin}/plugins?status=error&message=${encodeURIComponent(err.message || "Failed to exchange Meta tokens")}`
    );
  }
}
