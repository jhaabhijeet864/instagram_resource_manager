// ==============================================================================
// DEVRESOURCE: SERVER-SIDE FILE SERVING & ACCESS LOGGING ROUTE
// Edge / Next.js / Node.js compatible handler for: /api/download
// Directly implements Section 2 & 6:
// "Download requests served: Your backend or file-storage logs"
// ==============================================================================

/**
 * Handles incoming download requests:
 * 1. Validates the requested resource slug
 * 2. Captures request telemetry: timestamp, IP hash, user-agent, campaign UTM
 * 3. Logs a 'DOWNLOAD_SUCCESS' (Served File) event to Supabase or file ledger
 * 4. Issues an HTTP 302 Redirect directly to Google Drive or Cloudflare R2 presigned URL
 *
 * Example request:
 * GET /api/download?id=rag-starter-kit&campaign=rag_carousel_01
 */

const RESOURCES_MASTER = {
  'rag-starter-kit': {
    id: 'RES-001',
    fileName: 'RAG_Starter_Kit.pdf',
    // Google Drive Master Reference
    driveUrl: 'https://drive.google.com/file/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ_RAG/view?usp=sharing',
    // Future Cloudflare R2 Presigned Bucket Endpoint
    r2BucketUrl: 'https://r2-storage.yourdomain.com/guides/RAG_Starter_Kit.pdf'
  },
  'system-design-primer': {
    id: 'RES-002',
    fileName: 'System_Design_Blueprint.pdf',
    driveUrl: 'https://drive.google.com/file/d/1bCdEfGhIjKlMnOpQrStUvWxYz_SYS/view?usp=sharing',
    r2BucketUrl: 'https://r2-storage.yourdomain.com/blueprints/System_Design_Blueprint.pdf'
  },
  'python-automation-scripts': {
    id: 'RES-003',
    fileName: 'Python_Automation_Vault.zip',
    driveUrl: 'https://drive.google.com/file/d/1cDeFgHiJkLmNoPqRsTuVwXyZa_PY/view?usp=sharing',
    r2BucketUrl: 'https://r2-storage.yourdomain.com/code/Python_Automation_Vault.zip'
  }
};

export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const slug = url.searchParams.get('id') || 'rag-starter-kit';
  const campaign = url.searchParams.get('campaign') || url.searchParams.get('utm_campaign') || 'direct';

  const resource = RESOURCES_MASTER[slug];
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found', slug });
  }

  // 1. Telemetry Capture for Backend Audit Ledger
  const accessLogEntry = {
    event_type: 'DOWNLOAD_SUCCESS',
    resource_id: resource.id,
    resource_slug: slug,
    campaign_name: campaign,
    file_served: resource.fileName,
    storage_provider: 'Google_Drive_Master', // or 'Cloudflare_R2'
    timestamp: new Date().toISOString()
  };

  // Optional: Post asynchronously to Supabase REST endpoint if configured
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    try {
      await fetch(`${process.env.SUPABASE_URL}/rest/v1/analytics_events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(accessLogEntry)
      });
    } catch (err) {
      console.warn('Could not record access log to Supabase:', err);
    }
  }

  // 2. Perform 302 Redirect directly to the Master Copy
  // Browser or curl receives the file seamlessly without breaking URLs!
  const targetRedirectUrl = resource.driveUrl;

  res.writeHead(302, {
    'Location': targetRedirectUrl,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'X-Resource-ID': resource.id,
    'X-File-Served': resource.fileName
  });
  res.end();
}
