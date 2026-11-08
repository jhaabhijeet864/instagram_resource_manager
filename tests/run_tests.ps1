# Automated Test Runner for Insta_Res_Webiste (Roadmap Edition)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Running Complete Test Suite for Creator Resource Hub" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$workspace = "D:\Coding\Insta_Res_Webiste"
$passCount = 0
$failCount = 0

function Assert-Test($name, $condition, $failureMsg) {
    if ($condition) {
        Write-Host " [PASS] $name" -ForegroundColor Green
        $global:passCount++
    } else {
        Write-Host " [FAIL] $name - $failureMsg" -ForegroundColor Red
        $global:failCount++
    }
}

# 1. Check all required project files exist
Assert-Test "index.html exists" (Test-Path "$workspace\index.html") "index.html is missing"
Assert-Test "r/index.html exists (Dedicated Resource Page)" (Test-Path "$workspace\r\index.html") "r/index.html is missing"
Assert-Test "dashboard.html exists (Analytics & Campaign Hub)" (Test-Path "$workspace\dashboard.html") "dashboard.html is missing"
Assert-Test "js/config.js exists" (Test-Path "$workspace\js\config.js") "js/config.js is missing"
Assert-Test "js/app.js exists" (Test-Path "$workspace\js\app.js") "js/app.js is missing"
Assert-Test "js/analytics.js exists" (Test-Path "$workspace\js\analytics.js") "js/analytics.js is missing"
Assert-Test "css/styles.css exists" (Test-Path "$workspace\css\styles.css") "css/styles.css is missing"
Assert-Test "supabase_schema.sql exists" (Test-Path "$workspace\supabase_schema.sql") "supabase_schema.sql is missing"
Assert-Test "tests/index.html exists" (Test-Path "$workspace\tests\index.html") "tests/index.html is missing"

# 2. Check HTML structure for Analytics & Branded Resource Page
$rHtml = Get-Content "$workspace\r\index.html" -Raw
Assert-Test "r/index.html has res-download-btn" ($rHtml -match 'id="res-download-btn"') "Missing res-download-btn in r/index.html"
Assert-Test "r/index.html has res-title" ($rHtml -match 'id="res-title"') "Missing res-title in r/index.html"
Assert-Test "r/index.html loads analytics.js" ($rHtml -match 'analytics\.js') "Missing analytics.js in r/index.html"

# 3. Check Dashboard components
$dashHtml = Get-Content "$workspace\dashboard.html" -Raw
Assert-Test "dashboard.html has kpi-visits element" ($dashHtml -match 'id="kpi-visits"') "Missing kpi-visits in dashboard.html"
Assert-Test "dashboard.html has kpi-downloads element" ($dashHtml -match 'id="kpi-downloads"') "Missing kpi-downloads in dashboard.html"
Assert-Test "dashboard.html has builder-output element" ($dashHtml -match 'id="builder-output"') "Missing builder-output in dashboard.html"
Assert-Test "dashboard.html has campaigns-table-body" ($dashHtml -match 'id="campaigns-table-body"') "Missing campaigns-table-body in dashboard.html"

# 4. Check Analytics logic
$analytics = Get-Content "$workspace\js\analytics.js" -Raw
Assert-Test "analytics.js exports logVisit" ($analytics -match 'logVisit') "Missing logVisit"
Assert-Test "analytics.js exports logDownload" ($analytics -match 'logDownload') "Missing logDownload"
Assert-Test "analytics.js exports getMetrics" ($analytics -match 'getMetrics') "Missing getMetrics"
Assert-Test "analytics.js parses utm_campaign" ($analytics -match 'utm_campaign') "Missing utm_campaign extraction"

# 5. Check Supabase SQL Schema
$sql = Get-Content "$workspace\supabase_schema.sql" -Raw
Assert-Test "SQL schema creates resources table" ($sql -match 'CREATE TABLE IF NOT EXISTS public\.resources') "Missing resources table definition"
Assert-Test "SQL schema creates campaigns table" ($sql -match 'CREATE TABLE IF NOT EXISTS public\.campaigns') "Missing campaigns table definition"
Assert-Test "SQL schema creates analytics_events table" ($sql -match 'CREATE TABLE IF NOT EXISTS public\.analytics_events') "Missing analytics_events table definition"

# 6. Check Config Roadmap categories
$config = Get-Content "$workspace\js\config.js" -Raw
Assert-Test "config.js includes AI and System Design" ($config -match 'AI' -and $config -match 'System Design') "Missing roadmap categories"
Assert-Test "config.js includes RAG starter kit" ($config -match 'rag-starter-kit') "Missing RAG starter kit resource"

Write-Host "----------------------------------------------------------" -ForegroundColor Cyan
Write-Host "Results: $passCount Passed, $failCount Failed" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Red" })
Write-Host "==========================================================" -ForegroundColor Cyan

if ($failCount -gt 0) {
    exit 1
} else {
    exit 0
}
