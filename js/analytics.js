// ==============================================================================
// ANALYTICS & CAMPAIGN TRACKING ENGINE
// Tracks: Page Visits, Download Clicks, Download Requests Served, Email Signups,
// and UTM Campaigns (Instagram Reels, Carousels, Manychat DMs)
// Dual Storage: Instant LocalStorage + Optional Supabase REST Sync
// ==============================================================================

(function () {
  'use strict';

  const STORAGE_KEY = 'creator_hub_analytics_events';
  const EMAILS_KEY = 'creator_hub_email_signups';

  // Extract UTM & Campaign parameters from current URL
  function getCampaignParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || 'instagram',
      utm_medium: params.get('utm_medium') || 'comment_dm',
      utm_campaign: params.get('utm_campaign') || params.get('campaign') || 'direct',
      utm_content: params.get('utm_content') || '',
      referrer: document.referrer || 'direct'
    };
  }

  // Get local stored events
  function getStoredEvents() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Could not read analytics events from localStorage', e);
      return [];
    }
  }

  // Save event locally
  function recordLocalEvent(event) {
    try {
      const events = getStoredEvents();
      events.push(event);
      // Keep last 1,500 events locally to prevent localStorage bloat
      if (events.length > 1500) {
        events.splice(0, events.length - 1500);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.warn('Could not save analytics event to localStorage', e);
    }
  }

  // Asynchronously sync event to Supabase (if credentials configured)
  async function syncToSupabase(event) {
    const config = window.CREATOR_CONFIG || {};
    const supabase = config.supabase;
    if (!supabase || !supabase.url || !supabase.anonKey) {
      return; // Supabase not configured, local storage active
    }

    try {
      const endpoint = `${supabase.url.replace(/\/$/, '')}/rest/v1/analytics_events`;
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabase.anonKey,
          'Authorization': `Bearer ${supabase.anonKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          event_type: event.type,
          resource_slug: event.resourceSlug,
          campaign_name: event.campaign,
          utm_source: event.utm_source,
          utm_medium: event.utm_medium,
          referrer: event.referrer,
          metadata: event.metadata || {},
          created_at: event.timestamp
        })
      });
    } catch (err) {
      console.warn('Supabase analytics sync error (offline or misconfigured):', err);
    }
  }

  // Main Event Logger
  function logEvent(type, resourceSlug, metadata = {}) {
    const meta = getCampaignParams();
    const event = {
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      type: type, // 'PAGE_VISIT', 'DOWNLOAD_CLICK', 'DOWNLOAD_SUCCESS', 'EMAIL_SIGNUP'
      resourceSlug: resourceSlug || 'unknown',
      campaign: meta.utm_campaign,
      utm_source: meta.utm_source,
      utm_medium: meta.utm_medium,
      referrer: meta.referrer,
      metadata: metadata,
      timestamp: new Date().toISOString()
    };

    recordLocalEvent(event);
    syncToSupabase(event);
    return event;
  }

  // 1. Log page visit for a specific resource
  function logVisit(resourceSlug) {
    return logEvent('PAGE_VISIT', resourceSlug);
  }

  // 2. Log download button click (user intent)
  function logDownload(resourceSlug) {
    const evt = logEvent('DOWNLOAD_CLICK', resourceSlug);
    // Also simulate file response served after a short 250ms delay
    setTimeout(() => {
      logDownloadServed(resourceSlug);
    }, 250);
    return evt;
  }

  // 3. Log successful server response (file served / redirected)
  function logDownloadServed(resourceSlug) {
    return logEvent('DOWNLOAD_SUCCESS', resourceSlug);
  }

  // 4. Log email newsletter / resource updates capture
  function logEmailSignup(resourceSlug, email) {
    try {
      const raw = localStorage.getItem(EMAILS_KEY);
      const emails = raw ? JSON.parse(raw) : [];
      emails.push({ email, resourceSlug, timestamp: new Date().toISOString() });
      localStorage.setItem(EMAILS_KEY, JSON.stringify(emails));
    } catch (e) {
      console.warn('Could not store email locally', e);
    }
    return logEvent('EMAIL_SIGNUP', resourceSlug, { email });
  }

  // Calculate Aggregated Metrics for Dashboard
  function getMetrics() {
    const events = getStoredEvents();

    let totalVisits = 0;
    let totalDownloads = 0;
    let totalServed = 0;
    let totalSignups = 0;

    const resourceMap = {};
    const campaignMap = {};

    // Seed benchmark campaigns from config if present
    const baseCampaigns = (window.CREATOR_CONFIG && window.CREATOR_CONFIG.campaigns) || [];
    baseCampaigns.forEach(c => {
      campaignMap[c.campaign_id] = {
        campaign_id: c.campaign_id,
        campaign: c.campaign_id,
        resource_id: c.resource_id,
        resourceSlug: c.resource_slug,
        instagram_post: c.instagram_post,
        keyword: c.keyword,
        dm_sent: c.dm_sent || 0,
        dm_clicks: c.dm_clicks || 0,
        page_visits: c.page_visits || 0,
        download_clicks: c.download_clicks || 0,
        successful_downloads: c.successful_downloads || 0,
        email_signups: c.email_signups || 0,
        isBenchmark: true
      };
    });

    events.forEach(evt => {
      if (evt.type === 'PAGE_VISIT') totalVisits++;
      if (evt.type === 'DOWNLOAD_CLICK') totalDownloads++;
      if (evt.type === 'DOWNLOAD_SUCCESS') totalServed++;
      if (evt.type === 'EMAIL_SIGNUP') totalSignups++;

      // Resource breakdown
      const slug = evt.resourceSlug || 'unknown';
      if (!resourceMap[slug]) {
        resourceMap[slug] = { slug, visits: 0, downloads: 0, served: 0, signups: 0 };
      }
      if (evt.type === 'PAGE_VISIT') resourceMap[slug].visits++;
      if (evt.type === 'DOWNLOAD_CLICK') resourceMap[slug].downloads++;
      if (evt.type === 'DOWNLOAD_SUCCESS') resourceMap[slug].served++;
      if (evt.type === 'EMAIL_SIGNUP') resourceMap[slug].signups++;

      // Campaign breakdown
      const camp = evt.campaign || 'direct';
      // Find matching benchmark or create dynamic
      let targetCamp = Object.values(campaignMap).find(c => c.campaign === camp || c.campaign_id === camp);
      if (!targetCamp) {
        targetCamp = {
          campaign_id: camp,
          campaign: camp,
          resource_id: 'RES-LIVE',
          resourceSlug: slug,
          instagram_post: `Live Campaign (${camp})`,
          keyword: 'LINK',
          dm_sent: 0,
          dm_clicks: 0,
          page_visits: 0,
          download_clicks: 0,
          successful_downloads: 0,
          email_signups: 0,
          isBenchmark: false
        };
        campaignMap[camp] = targetCamp;
      }

      if (evt.type === 'PAGE_VISIT') targetCamp.page_visits++;
      if (evt.type === 'DOWNLOAD_CLICK') targetCamp.download_clicks++;
      if (evt.type === 'DOWNLOAD_SUCCESS') targetCamp.successful_downloads++;
      if (evt.type === 'EMAIL_SIGNUP') targetCamp.email_signups++;
    });

    const ctr = totalVisits > 0 ? Math.round((totalDownloads / totalVisits) * 100) : 0;
    const deliveryRate = totalDownloads > 0 ? Math.round((totalServed / totalDownloads) * 100) : 100;

    // Calculate aggregated benchmark totals for overview
    let aggregateDMsSent = 0;
    let aggregateDMClicks = 0;
    let aggregateVisits = totalVisits;
    let aggregateDownloads = totalDownloads;
    let aggregateServed = totalServed;
    let aggregateSignups = totalSignups;

    Object.values(campaignMap).forEach(c => {
      aggregateDMsSent += c.dm_sent || 0;
      aggregateDMClicks += c.dm_clicks || 0;
      if (c.isBenchmark) {
        aggregateVisits += c.page_visits || 0;
        aggregateDownloads += c.download_clicks || 0;
        aggregateServed += c.successful_downloads || 0;
        aggregateSignups += c.email_signups || 0;
      }
    });

    return {
      // Live Browser Totals
      totalVisits,
      totalDownloads,
      totalServed,
      totalSignups,
      overallConversionRate: ctr,
      deliveryRate,
      // Aggregated (Benchmark + Live) for High-Level Overview
      aggregate: {
        dmsSent: aggregateDMsSent,
        dmClicks: aggregateDMClicks,
        visits: aggregateVisits,
        downloadClicks: aggregateDownloads,
        successfulDownloads: aggregateServed,
        emailSignups: aggregateSignups
      },
      resources: Object.values(resourceMap),
      campaigns: Object.values(campaignMap),
      recentEvents: events.slice(-30).reverse()
    };
  }

  // Clear analytics data
  function clearAnalytics() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(EMAILS_KEY);
  }

  // Export Events as JSON
  function exportEventsJson() {
    const events = getStoredEvents();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `creator_analytics_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  }

  // Export Events as CSV
  function exportEventsCsv() {
    const events = getStoredEvents();
    if (events.length === 0) return alert('No analytics events recorded yet to export.');

    const headers = ['id', 'type', 'resourceSlug', 'campaign', 'utm_source', 'utm_medium', 'timestamp'];
    const rows = events.map(e => [
      e.id,
      e.type,
      e.resourceSlug,
      e.campaign,
      e.utm_source,
      e.utm_medium,
      e.timestamp
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csvContent);
    a.download = `creator_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }

  // Expose global Analytics API
  window.CreatorAnalytics = {
    logVisit,
    logDownload,
    logDownloadServed,
    logEmailSignup,
    getMetrics,
    getStoredEvents,
    clearAnalytics,
    getCampaignParams,
    exportEventsJson,
    exportEventsCsv
  };

})();
