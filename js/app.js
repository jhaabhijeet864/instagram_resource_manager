// ==============================================================================
// APPLICATION LOGIC - CREATOR RESOURCE HUB & DIRECTORY
// ==============================================================================

(function () {
  'use strict';

  // State Management
  const state = {
    config: null,
    activeCategory: 'All',
    searchQuery: '',
    selectedResourceId: null,
    isAdminMode: false
  };

  // Local Storage Key for Creator overrides
  const STORAGE_KEY = 'insta_res_hub_config';

  // Initialize Application
  function init() {
    loadConfig();
    renderProfile();
    renderCategories();
    renderResources();
    renderAdminResourceList();
    renderLinkGeneratorDropdown();
    setupEventListeners();
    handleDeepLink();
  }

  // Load configuration with fallback to local storage
  function loadConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        state.config = JSON.parse(saved);
      } else if (window.CREATOR_CONFIG) {
        state.config = JSON.parse(JSON.stringify(window.CREATOR_CONFIG));
      }
    } catch (e) {
      console.warn('Could not load custom config from localStorage, using default.', e);
      state.config = JSON.parse(JSON.stringify(window.CREATOR_CONFIG));
    }

    if (!state.config) {
      console.error('Config not found!');
      state.config = { profile: {}, categories: ['All'], resources: [] };
    }
  }

  // Render Creator Profile and Header
  function renderProfile() {
    const p = state.config.profile || {};
    const nameEl = document.getElementById('profile-name');
    const handleEl = document.getElementById('profile-handle');
    const bioEl = document.getElementById('profile-bio');
    const avatarEl = document.getElementById('profile-avatar');
    const igBtn = document.getElementById('profile-ig-btn');
    const footerName = document.getElementById('footer-name');
    const navDriveBtn = document.getElementById('nav-drive-btn');

    if (nameEl) nameEl.textContent = p.name || 'Alex Vance';
    if (handleEl) handleEl.textContent = `@${p.handle || 'creator'}`;
    if (bioEl && p.bio) bioEl.textContent = p.bio;
    if (avatarEl && p.avatar) avatarEl.src = p.avatar;
    if (igBtn && p.instagramUrl) igBtn.href = p.instagramUrl;
    if (footerName) footerName.textContent = p.name || 'Alex Vance';
    if (navDriveBtn && p.googleDriveFolder) navDriveBtn.href = p.googleDriveFolder;
  }

  // Render Category Filter Tabs with dynamic counts
  function renderCategories() {
    const container = document.getElementById('category-filters');
    if (!container) return;

    const categories = state.config.categories || ['All'];
    const allResources = state.config.resources || [];

    container.innerHTML = categories.map(cat => {
      const isActive = cat.toLowerCase() === state.activeCategory.toLowerCase();
      const count = cat === 'All' 
        ? allResources.length 
        : allResources.filter(r => (r.category || '').toLowerCase() === cat.toLowerCase()).length;

      const activeClass = isActive 
        ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-500/25 border-indigo-500' 
        : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border-slate-800';

      return `
        <button type="button" data-category="${escapeHtml(cat)}" class="px-4 py-2 rounded-xl text-xs md:text-sm whitespace-nowrap transition-all border flex items-center space-x-1.5 ${activeClass}">
          <span>${escapeHtml(cat)}</span>
          <span class="text-[11px] opacity-75 font-mono px-1.5 py-0.2 rounded-full ${isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'}">${count}</span>
        </button>
      `;
    }).join('');
  }

  // Filter resources based on category and search query
  function getFilteredResources() {
    let list = state.config.resources || [];

    if (state.activeCategory && state.activeCategory !== 'All') {
      list = list.filter(r => (r.category || '').toLowerCase() === state.activeCategory.toLowerCase());
    }

    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase().trim();
      list = list.filter(r => {
        const titleMatch = (r.title || '').toLowerCase().includes(q);
        const descMatch = (r.description || '').toLowerCase().includes(q);
        const categoryMatch = (r.category || '').toLowerCase().includes(q);
        const keywordMatch = (r.keyword || '').toLowerCase().includes(q);
        const resIdMatch = (r.resource_id || '').toLowerCase().includes(q);
        const tagsMatch = (r.tags || []).some(t => t.toLowerCase().includes(q));
        return titleMatch || descMatch || categoryMatch || keywordMatch || resIdMatch || tagsMatch;
      });
    }

    return list;
  }

  // Render Resource Cards Grid matching the developer library aesthetic
  function renderResources() {
    const grid = document.getElementById('resource-grid');
    const emptyState = document.getElementById('empty-state');
    const countBadge = document.getElementById('resource-count-badge');
    if (!grid) return;

    const resources = getFilteredResources();

    if (countBadge) {
      countBadge.textContent = `Showing ${resources.length} of ${(state.config.resources || []).length} resources`;
    }

    if (resources.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    grid.innerHTML = resources.map(res => {
      const targetSlug = res.slug || res.id;
      const resId = res.resource_id || 'RES';
      const fileName = res.fileName || `${targetSlug}.pdf`;
      const fileMeta = `${res.fileType || 'PDF'} · ${res.fileSize || '2.4 MB'}`;
      const keyword = res.keyword || 'AI';

      // Badge HTML
      const badgeHtml = res.badge 
        ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">${escapeHtml(res.badge)}</span>` 
        : '';

      // Highlights bullets (up to 2)
      const highlightsHtml = (res.highlights || []).slice(0, 2).map(h => `
        <div class="flex items-start space-x-1.5 text-xs text-slate-400">
          <span class="text-emerald-400 text-[11px] mt-0.5">✓</span>
          <span class="line-clamp-1">${escapeHtml(h)}</span>
        </div>
      `).join('');

      return `
        <div class="glass-card rounded-2xl p-5 flex flex-col justify-between group relative overflow-hidden border border-slate-800 hover:border-indigo-500/40">
          
          <div class="space-y-3">
            <!-- Header Badges -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span class="text-[11px] font-bold uppercase tracking-wider text-indigo-400 font-mono">${escapeHtml(res.category || 'Guide')}</span>
                <span class="text-[10px] font-mono text-slate-500 px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">${escapeHtml(resId)}</span>
              </div>
              ${badgeHtml}
            </div>
            
            <!-- Title -->
            <h3 class="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
              <a href="r/?id=${escapeAttr(targetSlug)}">${escapeHtml(res.title)}</a>
            </h3>
            
            <!-- Description -->
            <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              ${escapeHtml(res.description)}
            </p>

            <!-- Highlights -->
            ${highlightsHtml ? `<div class="pt-1 space-y-1">${highlightsHtml}</div>` : ''}

            <!-- File Spec Card -->
            <div class="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-center justify-between">
              <div class="flex items-center space-x-2 overflow-hidden">
                <span class="text-sm">📄</span>
                <div class="overflow-hidden">
                  <p class="text-xs font-mono font-medium text-slate-200 truncate">${escapeHtml(fileName)}</p>
                  <p class="text-[10px] text-slate-500 font-mono">${escapeHtml(fileMeta)}</p>
                </div>
              </div>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 whitespace-nowrap ml-2">
                IG: "${escapeHtml(keyword)}"
              </span>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
            
            <!-- Read Guide Button (takes to /r/?id=slug) -->
            <a href="r/?id=${escapeAttr(targetSlug)}" class="flex-grow inline-flex items-center justify-center px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-colors">
              <span>Read Guide</span>
              <svg class="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </a>

            <!-- Quick Modal Preview Button -->
            <button type="button" onclick="window.App.openResourceModal('${escapeAttr(targetSlug)}')" class="inline-flex items-center justify-center p-2 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors" title="Quick preview code & prompts">
              <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>

            <!-- Direct Download Trigger -->
            <a href="${escapeAttr(res.storageUrl || res.driveUrl || '#')}" target="_blank" rel="noopener noreferrer" onclick="window.CreatorAnalytics && window.CreatorAnalytics.logDownload('${escapeAttr(targetSlug)}')" class="inline-flex items-center justify-center p-2 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors" title="Download master file">
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            </a>

          </div>

        </div>
      `;
    }).join('');
  }

  // Open the Resource Overlay Modal with rich inspection
  function openResourceModal(resourceId) {
    const res = (state.config.resources || []).find(r => (r.slug || r.id) === resourceId || r.id === resourceId);
    if (!res) {
      console.warn(`Resource with ID "${resourceId}" not found.`);
      return;
    }

    const slug = res.slug || res.id;
    state.selectedResourceId = slug;

    // Track Visit Event
    if (window.CreatorAnalytics) {
      window.CreatorAnalytics.logVisit(slug);
    }

    // Update URL hash without reload for easy sharing
    if (window.location.hash !== `#${slug}`) {
      try {
        history.pushState(null, '', `?res=${slug}`);
      } catch (e) {
        window.location.hash = slug;
      }
    }

    // Populate Modal Elements
    const catEl = document.getElementById('modal-category');
    const badgeEl = document.getElementById('modal-badge');
    const titleEl = document.getElementById('modal-title');
    const descEl = document.getElementById('modal-description');

    if (catEl) catEl.textContent = res.category || 'Resource';
    if (badgeEl) {
      badgeEl.textContent = res.badge || '';
      badgeEl.style.display = res.badge ? 'inline-block' : 'none';
    }
    if (titleEl) titleEl.textContent = res.title;
    if (descEl) descEl.textContent = res.description;

    // Dedicated Page Link
    const dedicatedLink = document.getElementById('modal-dedicated-page-link');
    if (dedicatedLink) {
      dedicatedLink.href = `r/?id=${encodeURIComponent(slug)}`;
    }

    // Download/Drive button
    const driveBtn = document.getElementById('modal-download-btn');
    if (driveBtn) {
      driveBtn.href = res.storageUrl || res.driveUrl || '#';
      driveBtn.target = '_blank';
      driveBtn.rel = 'noopener noreferrer';
      driveBtn.onclick = () => {
        if (window.CreatorAnalytics) {
          window.CreatorAnalytics.logDownload(slug);
        }
      };
    }

    // Share link button setup
    const shareLinkBtn = document.getElementById('modal-share-link-btn');
    if (shareLinkBtn) {
      shareLinkBtn.onclick = () => {
        const currentOrigin = window.location.origin === 'null' ? 'https://resources.yourdomain.com' : window.location.origin;
        const cleanPath = window.location.pathname.replace(/\/index\.html$/, '');
        const fullUrl = `${currentOrigin}${cleanPath}/r/?id=${slug}&utm_source=instagram&utm_medium=comment_dm&utm_campaign=reel_dm`;
        copyToClipboard(fullUrl, 'Manychat tracking link copied to clipboard!');
      };
    }

    // Render Sample Prompts & Code inside Modal
    const promptsContainer = document.getElementById('modal-prompts-container');
    const promptsSection = document.getElementById('modal-prompts-section');

    let contentHtml = '';

    // If code snippet present
    if (res.codeSnippet) {
      contentHtml += `
        <div class="code-block rounded-xl p-4 space-y-2">
          <div class="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
            <span class="font-mono text-indigo-400 font-semibold">${escapeHtml(res.codeSnippet.title || 'Implementation')}</span>
            <span class="uppercase text-[10px] text-slate-500 font-mono">${escapeHtml(res.codeSnippet.language || 'Code')}</span>
          </div>
          <pre class="text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed"><code>${escapeHtml(res.codeSnippet.code)}</code></pre>
        </div>
      `;
    }

    // If sample prompts present
    if (res.samplePrompts && res.samplePrompts.length > 0) {
      contentHtml += res.samplePrompts.map((item, index) => `
        <div class="prompt-box rounded-xl p-4 relative group">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-xs font-semibold text-indigo-300 uppercase tracking-wider">${escapeHtml(item.title || `Prompt ${index + 1}`)}</h4>
            <button type="button" 
              onclick="window.App.copyPromptText(this)" 
              data-prompt="${escapeAttr(item.prompt)}" 
              class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors">
              <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              Copy
            </button>
          </div>
          <p class="text-xs md:text-sm text-slate-300 font-mono whitespace-pre-wrap leading-relaxed select-all">${escapeHtml(item.prompt)}</p>
        </div>
      `).join('');
    }

    if (contentHtml) {
      if (promptsSection) promptsSection.classList.remove('hidden');
      if (promptsContainer) promptsContainer.innerHTML = contentHtml;
    } else {
      if (promptsSection) promptsSection.classList.add('hidden');
      if (promptsContainer) promptsContainer.innerHTML = '';
    }

    // Show Modal
    const modal = document.getElementById('resource-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  // Close the Resource Modal
  function closeResourceModal() {
    const modal = document.getElementById('resource-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    state.selectedResourceId = null;

    // Reset clean URL without reload
    try {
      history.pushState(null, '', window.location.pathname);
    } catch (e) {
      window.location.hash = '';
    }
  }

  // Handle URL deep-linking on load (?res=xyz or #xyz)
  function handleDeepLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const resParam = urlParams.get('res') || urlParams.get('id');
    const hash = window.location.hash.replace('#', '').trim();

    const targetId = resParam || hash;
    if (targetId) {
      setTimeout(() => {
        openResourceModal(targetId);
      }, 100);
    }

    // Check for admin view (?admin=true)
    if (urlParams.get('admin') === 'true') {
      toggleAdminDashboard(true);
    }
  }

  // Copy text to clipboard with toast notification
  function copyToClipboard(text, message = 'Copied to clipboard!') {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(message);
      }).catch(() => {
        fallbackCopyText(text, message);
      });
    } else {
      fallbackCopyText(text, message);
    }
  }

  function fallbackCopyText(text, message) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(message);
    } catch (err) {
      showToast('Could not auto-copy, please copy manually');
    }
    document.body.removeChild(textArea);
  }

  // Toast notification
  function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
    }, 3000);
  }

  // ==============================================================================
  // CREATOR DASHBOARD & INSTAGRAM LINK GENERATOR
  // ==============================================================================

  function toggleAdminDashboard(forceState) {
    const dashboard = document.getElementById('admin-dashboard');
    const toggleBtn = document.getElementById('admin-toggle-btn');
    if (!dashboard) return;

    state.isAdminMode = typeof forceState === 'boolean' ? forceState : !state.isAdminMode;

    if (state.isAdminMode) {
      dashboard.classList.remove('hidden');
      if (toggleBtn) toggleBtn.textContent = '✕ Close Dashboard';
      dashboard.scrollIntoView({ behavior: 'smooth' });
    } else {
      dashboard.classList.add('hidden');
      if (toggleBtn) toggleBtn.textContent = '⚙️ Dashboard';
    }
  }

  // Populate the Dropdown for the Link Generator
  function renderLinkGeneratorDropdown() {
    const select = document.getElementById('link-gen-select');
    if (!select) return;

    const list = state.config.resources || [];
    select.innerHTML = '<option value="">-- Choose a Resource --</option>' + 
      list.map(r => `<option value="${escapeAttr(r.slug || r.id)}">${escapeHtml(r.title)} (${escapeHtml(r.category)})</option>`).join('');

    select.onchange = updateGeneratedLink;
  }

  // Update the Generated Instagram DM Link
  function updateGeneratedLink() {
    const select = document.getElementById('link-gen-select');
    const outputInput = document.getElementById('generated-link-input');
    const copyBtn = document.getElementById('copy-generated-link-btn');
    if (!select || !outputInput) return;

    const resourceId = select.value;
    if (!resourceId) {
      outputInput.value = '';
      if (copyBtn) copyBtn.disabled = true;
      return;
    }

    const currentOrigin = window.location.origin === 'null' ? 'https://resources.yourdomain.com' : window.location.origin;
    const cleanPath = window.location.pathname.replace(/\/index\.html$/, '');
    const fullLink = `${currentOrigin}${cleanPath}/r/?id=${resourceId}&utm_source=instagram&utm_medium=comment_dm&utm_campaign=reel_01`;
    
    outputInput.value = fullLink;
    if (copyBtn) copyBtn.disabled = false;
  }

  // Render resource list in the Dashboard table
  function renderAdminResourceList() {
    const tableBody = document.getElementById('admin-resource-table');
    if (!tableBody) return;

    const list = state.config.resources || [];
    if (list.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-500">No resources found. Add one above!</td></tr>';
      return;
    }

    tableBody.innerHTML = list.map((r, i) => {
      const slug = r.slug || r.id;
      return `
        <tr class="border-b border-slate-800 text-xs md:text-sm">
          <td class="p-3 font-medium text-white">${escapeHtml(r.title)}</td>
          <td class="p-3 text-indigo-400 font-mono">${escapeHtml(slug)}</td>
          <td class="p-3 text-slate-400">${escapeHtml(r.category)}</td>
          <td class="p-3 text-right whitespace-nowrap">
            <a href="r/?id=${escapeAttr(slug)}" target="_blank" class="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded mr-2">Page ↗</a>
            <button type="button" onclick="window.App.deleteResource(${i})" class="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2.5 py-1 rounded">Delete</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Handle adding a new resource from Dashboard form
  function handleAddResource(e) {
    e.preventDefault();
    const title = document.getElementById('form-title').value.trim();
    const rawId = document.getElementById('form-id').value.trim();
    const category = document.getElementById('form-category').value.trim() || 'Generative AI';
    const driveUrl = document.getElementById('form-drive').value.trim();
    const description = document.getElementById('form-desc').value.trim();
    const promptText = document.getElementById('form-prompt').value.trim();

    if (!title || !driveUrl) {
      alert('Please provide at least a Title and Google Drive URL.');
      return;
    }

    const slugId = rawId ? slugify(rawId) : slugify(title);
    const newResIndex = (state.config.resources || []).length + 1;
    const resId = `RES-${String(newResIndex).padStart(3, '0')}`;

    const newRes = {
      resource_id: resId,
      slug: slugId,
      id: slugId,
      public_slug: slugId,
      title: title,
      category: category,
      status: 'Published',
      badge: '✨ New',
      keyword: slugId.toUpperCase().slice(0, 6),
      description: description || 'Free AI resource and prompt guide.',
      fileName: `${slugId}.pdf`,
      fileSize: '1.5 MB',
      fileType: 'PDF Guide',
      file_path: driveUrl,
      storageUrl: driveUrl,
      created_at: new Date().toISOString().split('T')[0],
      tags: [category, 'Free'],
      samplePrompts: promptText ? [{ title: 'Featured Prompt', prompt: promptText }] : [],
      updatedDate: 'Just added'
    };

    // Add to state and save
    state.config.resources.unshift(newRes);
    saveConfigToStorage();

    // Re-render
    renderResources();
    renderAdminResourceList();
    renderLinkGeneratorDropdown();
    
    // Select the newly added resource in the link generator
    const select = document.getElementById('link-gen-select');
    if (select) {
      select.value = slugId;
      updateGeneratedLink();
    }

    // Reset Form
    e.target.reset();
    showToast(`Added "${title}"! Instagram link generated.`);
  }

  // Delete resource
  function deleteResource(index) {
    if (!confirm('Are you sure you want to remove this resource?')) return;
    state.config.resources.splice(index, 1);
    saveConfigToStorage();
    renderResources();
    renderAdminResourceList();
    renderLinkGeneratorDropdown();
    showToast('Resource deleted.');
  }

  // Save config to LocalStorage
  function saveConfigToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.config));
    } catch (e) {
      console.error('Could not save to localStorage', e);
    }
  }

  // Reset config back to js/config.js defaults
  function resetConfig() {
    if (!confirm('Reset all resources to original default config.js? Custom items will be cleared.')) return;
    localStorage.removeItem(STORAGE_KEY);
    loadConfig();
    renderCategories();
    renderResources();
    renderAdminResourceList();
    renderLinkGeneratorDropdown();
    showToast('Reset to original configuration.');
  }

  // Export clean config.js code for the user to commit to GitHub
  function exportConfigCode() {
    const code = `// ==============================================================================\n// CREATOR CONFIGURATION & RESOURCE DATABASE\n// Updated from Creator Dashboard\n// ==============================================================================\n\nwindow.CREATOR_CONFIG = ${JSON.stringify(state.config, null, 2)};\n`;
    
    copyToClipboard(code, 'Full config.js code copied! Paste it into js/config.js to make it permanent.');
    
    const exportBox = document.getElementById('export-code-box');
    const exportArea = document.getElementById('export-textarea');
    if (exportBox && exportArea) {
      exportArea.value = code;
      exportBox.classList.remove('hidden');
      exportBox.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Newsletter Signup Handler
  function handleNewsletter(e) {
    e.preventDefault();
    const emailInput = document.getElementById('newsletter-email');
    if (!emailInput) return;
    const email = emailInput.value.trim();
    if (!email) return;

    if (window.CreatorAnalytics) {
      window.CreatorAnalytics.logEmailSignup('homepage_newsletter', email);
    }

    showToast('Subscribed! You will receive weekly engineering blueprints.');
    emailInput.value = '';
  }

  // Reset all filters
  function resetFilters() {
    state.activeCategory = 'All';
    state.searchQuery = '';
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    renderCategories();
    renderResources();
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Category click delegation
    const catContainer = document.getElementById('category-filters');
    if (catContainer) {
      catContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-category]');
        if (!btn) return;
        state.activeCategory = btn.getAttribute('data-category');
        renderCategories();
        renderResources();
      });
    }

    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderResources();
      });
    }

    // Keyboard shortcut '/' to search
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    });

    // Modal close buttons
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) closeBtn.onclick = closeResourceModal;

    const modalBackdrop = document.getElementById('resource-modal');
    if (modalBackdrop) {
      modalBackdrop.onclick = (e) => {
        if (e.target === modalBackdrop) closeResourceModal();
      };
    }

    // Escape key closes modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeResourceModal();
    });

    // Admin dashboard toggle
    const adminToggleBtn = document.getElementById('admin-toggle-btn');
    if (adminToggleBtn) {
      adminToggleBtn.onclick = () => toggleAdminDashboard();
    }

    // Add resource form
    const addForm = document.getElementById('add-resource-form');
    if (addForm) {
      addForm.onsubmit = handleAddResource;
    }

    // Copy generated link button
    const copyGenBtn = document.getElementById('copy-generated-link-btn');
    if (copyGenBtn) {
      copyGenBtn.onclick = () => {
        const val = document.getElementById('generated-link-input').value;
        if (val) copyToClipboard(val, 'Instagram DM link copied to clipboard!');
      };
    }

    // Export config button
    const exportBtn = document.getElementById('export-config-btn');
    if (exportBtn) exportBtn.onclick = exportConfigCode;

    // Reset config button
    const resetBtn = document.getElementById('reset-config-btn');
    if (resetBtn) resetBtn.onclick = resetConfig;
  }

  // Helpers
  function slugify(text) {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(str) {
    if (!str) return '';
    return String(str)
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Global App Namespace for Inline Handlers
  window.App = {
    openResourceModal,
    closeResourceModal,
    previewResource: openResourceModal,
    deleteResource,
    handleNewsletter,
    resetFilters,
    copyPromptText: function (btn) {
      const promptText = btn.getAttribute('data-prompt');
      if (promptText) {
        copyToClipboard(promptText, 'Prompt copied to clipboard! Ready to paste into ChatGPT/Claude.');
        const originalText = btn.innerHTML;
        btn.innerHTML = `<svg class="w-3.5 h-3.5 mr-1 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Copied!`;
        setTimeout(() => {
          btn.innerHTML = originalText;
        }, 2000);
      }
    },
    getState: () => state
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
