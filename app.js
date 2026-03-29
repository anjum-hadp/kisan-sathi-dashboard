// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // CONFIGURATION - EDIT THESE VALUES
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

        // Google Apps Script Web App URL.
        // Deploy the script from V2/google-apps-script/Code.gs and paste the web app URL here.
        const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwWIKQBAFMeYWFfkgdNQk9plm5SZLlYYmwsn5auM2VH8xsA0T4WT3kzsEU43lhdLmDsyg/exec';

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // ðŸ”’ API KEY SECURITY - CRITICAL - DO NOT SKIP
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // Since this is a static GitHub Pages site, the API key CANNOT be completely hidden.
        // However, you MUST restrict it to prevent abuse:
        //
        // 1. Go to https://console.cloud.google.com/apis/credentials
        // 2. Click your API key
        // 3. Under "Application restrictions" â†’ select "HTTP referrers (websites)"
        // 4. Add these entries EXACTLY:
        //    - *.github.io/*
        //    - https://anjum-hadp.github.io/*
        //    - https://anjum-hadp.github.io/kisan-sathi-dashboard/*
        //
        // 5. Under "API restrictions" â†’ select "Restrict key"
        // 6. Select ONLY "Google Sheets API"
        //
        // âš ï¸  WITHOUT THESE RESTRICTIONS, ANYONE CAN USE YOUR API KEY!
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

        const KASHMIR_DISTRICTS = ['ANANTNAG', 'BANDIPORA', 'BARAMULLA', 'BUDGAM', 'GANDERBAL', 'KULGAM', 'KUPWARA', 'PULWAMA', 'SHOPIAN', 'SRINAGAR'];
        const JAMMU_DISTRICTS = ['DODA', 'JAMMU', 'KATHUA', 'KISHTWAR', 'POONCH', 'RAJOURI', 'RAMBAN', 'REASI', 'SAMBA', 'UDHAMPUR'];

        let rawSheetData = [];
        let targetsData = [];
        let estabData = [];
        let estabRawData = []; // Store raw estab data for district view
        let trackingData = [];
        let trackingRawData = [];
        let neRawData = [];
        let processedData = [];
        let charts = {};
        const VIEW_STATE_KEY = 'kisanSathiDashboardViewStateV2';
        let currentInsightsSection = 'scale';
        let insightsSortState = {
            scale: { key: 'scaleRate', direction: 'desc' },
            approvals: { key: 'approvalRate', direction: 'desc' },
            establishments: { key: 'estabVsTargetRate', direction: 'desc' },
            tracking: { key: 'trackingRate', direction: 'desc' }
        };

        function formatDataTimestamp(value) {
            if (!value) return 'Data last updated: unavailable';

            const date = new Date(value);
            if (Number.isNaN(date.getTime())) {
                return `Data last updated: ${value}`;
            }

            return `Data last updated: ${date.toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short'
            })}`;
        }

        // Auto-load on page load
        document.addEventListener('DOMContentLoaded', loadData);

        function getViewState() {
            const activeTab = document.querySelector('.tab-content.active')?.id || 'overview';
            const districtSharedProject =
                document.getElementById('distAppProject')?.value ||
                document.getElementById('distEstabProject')?.value ||
                document.getElementById('distTrackingProject')?.value ||
                '';

            return {
                activeTab,
                currentInsightsSection,
                insightsProjectFilter: document.getElementById('insightsProjectFilter')?.value || '',
                insightsDivisionFilter: document.getElementById('insightsDivisionFilter')?.value || '',
                insightsDistrictFilter: document.getElementById('insightsDistrictFilter')?.value || '',
                insightsSortState,
                searchInput: document.getElementById('searchInput')?.value || '',
                projectFilter: document.getElementById('projectFilter')?.value || '',
                estabSearchInput: document.getElementById('estabSearchInput')?.value || '',
                estabProjectFilter: document.getElementById('estabProjectFilter')?.value || '',
                trackingSearchInput: document.getElementById('trackingSearchInput')?.value || '',
                trackingProjectFilter: document.getElementById('trackingProjectFilter')?.value || '',
                districtSelector: document.getElementById('districtSelector')?.value || '',
                currentDistrictSection,
                districtSharedProject,
                distAppSearch: document.getElementById('distAppSearch')?.value || '',
                distAppProject: document.getElementById('distAppProject')?.value || '',
                distEstabSearch: document.getElementById('distEstabSearch')?.value || '',
                distEstabProject: document.getElementById('distEstabProject')?.value || '',
                distTrackingSearch: document.getElementById('distTrackingSearch')?.value || '',
                distTrackingProject: document.getElementById('distTrackingProject')?.value || ''
            };
        }

        function saveViewState() {
            try {
                sessionStorage.setItem(VIEW_STATE_KEY, JSON.stringify(getViewState()));
            } catch (error) {
                console.warn('Unable to save dashboard view state', error);
            }
        }

        function loadViewState() {
            try {
                return JSON.parse(sessionStorage.getItem(VIEW_STATE_KEY) || '{}');
            } catch (error) {
                console.warn('Unable to read dashboard view state', error);
                return {};
            }
        }

        function setActiveTopTab(tabName) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('#dashboardContent > .tabs .tab').forEach(el => el.classList.remove('active'));
            document.getElementById(tabName)?.classList.add('active');
            document.querySelector(`#dashboardContent > .tabs .tab[onclick="showTab('${tabName}')"]`)?.classList.add('active');
        }

        function restoreViewState() {
            const state = loadViewState();

            if (state.insightsSortState) {
                insightsSortState = state.insightsSortState;
            }
            currentInsightsSection = state.currentInsightsSection || 'scale';

            if (state.insightsDivisionFilter !== undefined) {
                const select = document.getElementById('insightsDivisionFilter');
                if (select) select.value = state.insightsDivisionFilter;
            }
            updateInsightsDistrictOptions(state.insightsDistrictFilter || '');
            if (state.insightsProjectFilter !== undefined) {
                const select = document.getElementById('insightsProjectFilter');
                if (select) select.value = state.insightsProjectFilter;
            }
            if (state.insightsDistrictFilter !== undefined) {
                const select = document.getElementById('insightsDistrictFilter');
                if (select) select.value = state.insightsDistrictFilter;
            }
            renderInsights();
            showInsightsSection(currentInsightsSection, false);

            if (state.searchInput !== undefined) {
                const input = document.getElementById('searchInput');
                if (input) input.value = state.searchInput;
            }
            if (state.projectFilter !== undefined) {
                const select = document.getElementById('projectFilter');
                if (select) select.value = state.projectFilter;
            }
            renderActivityTable();

            if (state.estabSearchInput !== undefined) {
                const input = document.getElementById('estabSearchInput');
                if (input) input.value = state.estabSearchInput;
            }
            if (state.estabProjectFilter !== undefined) {
                const select = document.getElementById('estabProjectFilter');
                if (select) select.value = state.estabProjectFilter;
            }
            renderEstablishmentTable();

            if (state.trackingSearchInput !== undefined) {
                const input = document.getElementById('trackingSearchInput');
                if (input) input.value = state.trackingSearchInput;
            }
            if (state.trackingProjectFilter !== undefined) {
                const select = document.getElementById('trackingProjectFilter');
                if (select) select.value = state.trackingProjectFilter;
            }
            renderTrackingTable();

            currentDistrictSection = state.currentDistrictSection || 'applications';
            if (state.districtSelector) {
                const districtSelect = document.getElementById('districtSelector');
                if (districtSelect) districtSelect.value = state.districtSelector;
                renderDistrictData();

                const distAppSearch = document.getElementById('distAppSearch');
                if (distAppSearch) distAppSearch.value = state.distAppSearch || '';
                const distAppProject = document.getElementById('distAppProject');
                if (distAppProject) distAppProject.value = state.distAppProject || '';
                const distEstabSearch = document.getElementById('distEstabSearch');
                if (distEstabSearch) distEstabSearch.value = state.distEstabSearch || '';
                const distEstabProject = document.getElementById('distEstabProject');
                if (distEstabProject) distEstabProject.value = state.distEstabProject || '';
                const distTrackingSearch = document.getElementById('distTrackingSearch');
                if (distTrackingSearch) distTrackingSearch.value = state.distTrackingSearch || '';
                const distTrackingProject = document.getElementById('distTrackingProject');
                if (distTrackingProject) distTrackingProject.value = state.distTrackingProject || '';

                if (currentDistrictSection === 'applications') {
                    renderDistrictAppTable();
                } else if (currentDistrictSection === 'establishment') {
                    renderDistrictEstabTable();
                } else {
                    renderDistrictTrackingTable();
                }
            }

            setActiveTopTab(state.activeTab || 'overview');
        }

        async function loadData() {
            saveViewState();
            document.getElementById('loadingState').style.display = 'block';
            document.getElementById('errorState').style.display = 'none';
            document.getElementById('dashboardContent').style.display = 'none';

            // Check if the backend endpoint is configured
            if (APPS_SCRIPT_URL === 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
                document.getElementById('loadingState').style.display = 'none';
                document.getElementById('errorState').style.display = 'block';
                document.getElementById('errorState').innerHTML = `
                    <strong>Warning: Dashboard Not Configured</strong><br><br>
                    Please edit the configuration section at the top of this file:<br>
                    1. Open index.html in a text editor<br>
                    2. Find "const APPS_SCRIPT_URL = 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE'"<br>
                    3. Replace it with your deployed Google Apps Script web app URL<br>
                    4. Save and refresh the page<br><br>
                    <a href="#" onclick="showConfigHelp()">Click here for detailed setup instructions</a>
                `;
                return;
            }

            try {
                const response = await fetch(APPS_SCRIPT_URL, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });

                if (!response.ok) {
                    throw new Error(`Backend request failed with status ${response.status}`);
                }

                const payload = await response.json();

                if (!payload || payload.ok !== true) {
                    throw new Error(payload?.error || 'Apps Script backend returned an invalid response');
                }

                const sheetLastUpdated = payload.sheetLastUpdated || '';
                rawSheetData = payload.rawData || [];
                estabRawData = payload.estabData || [];
                trackingRawData = payload.trackingData || [];
                neRawData = payload.neData || [];
                targetsData = parseSimpleData(payload.targetsData || []);

                if (!rawSheetData || rawSheetData.length < 5) {
                    throw new Error('Raw Data tab is empty or has wrong format');
                }

                processedData = processRawData(rawSheetData);

                if (processedData.length === 0) {
                    throw new Error('No data found after processing. Check sheet structure.');
                }

                estabData = processEstabData(estabRawData);
                trackingData = processTrackingData(trackingRawData, neRawData);
                projectOrder = extractProjectOrder();
                console.log('Estab data loaded:', estabData.length, 'rows');
                console.log('Tracking data loaded:', trackingData.length, 'rows');
                console.log('Targets loaded:', targetsData.length, 'rows');
                console.log('Project order:', projectOrder);

                document.getElementById('loadingState').style.display = 'none';
                document.getElementById('dashboardContent').style.display = 'block';
                document.getElementById('lastUpdated').textContent = formatDataTimestamp(sheetLastUpdated);

                initDashboard();

            } catch (error) {
                document.getElementById('loadingState').style.display = 'none';
                document.getElementById('errorState').style.display = 'block';
                document.getElementById('errorState').innerHTML = `
                    <strong>Error loading data:</strong><br>
                    ${error.message}<br><br>
                    <strong>Troubleshooting:</strong><br>
                    1. Verify the Apps Script web app URL is correct<br>
                    2. Re-deploy the Apps Script as a web app after code changes<br>
                    3. Make sure the spreadsheet tabs exist with correct names<br>
                    4. Confirm the Apps Script can access the target spreadsheet
                `;
                console.error('Full error:', error);
            }
        }

        function processRawData(values) {
            const districtRow = values[2];  // Row 3 - district names
            const dataRows = values.slice(4); // Row 5+ - actual data

            const districtCols = {};
            districtRow.forEach((val, idx) => {
                if (val && val.trim) districtCols[val.trim()] = idx;
            });

            const processed = [];

            dataRows.forEach(row => {
                if (!row[0]) return;

                const project = normalizeProjectName(row[0]);
                const activity = normalizeActivityName(row[1] || '');

                let kAppl = 0, kAppr = 0;
                KASHMIR_DISTRICTS.forEach(d => {
                    if (districtCols[d] !== undefined) {
                        const col = districtCols[d];
                        kAppl += parseInt(row[col]) || 0;
                        kAppr += parseInt(row[col + 1]) || 0;
                    }
                });

                let jAppl = 0, jAppr = 0;
                JAMMU_DISTRICTS.forEach(d => {
                    if (districtCols[d] !== undefined) {
                        const col = districtCols[d];
                        jAppl += parseInt(row[col]) || 0;
                        jAppr += parseInt(row[col + 1]) || 0;
                    }
                });

                processed.push({
                    Project: project,
                    Activity: activity,
                    'K-Appl': kAppl,
                    'J-Appl': jAppl,
                    'K-Appr': kAppr,
                    'J-Appr': jAppr,
                    'Total-Appl': kAppl + jAppl,
                    'Total-Appr': kAppr + jAppr
                });
            });

            return mergeRowsByProjectActivity(processed, ['K-Appl', 'J-Appl', 'K-Appr', 'J-Appr', 'Total-Appl', 'Total-Appr']);
        }

        function processEstabData(values) {
            if (!values || values.length < 2) return [];
            
            // Row 1: Headers (Project, Activity, Districts..., TOTAL)
            const headers = values[0];
            const dataRows = values.slice(1);
            
            // Find district column indices
            const districtCols = {};
            headers.forEach((h, idx) => {
                if (h && h.trim) districtCols[h.trim().toUpperCase()] = idx;
            });
            
            const processed = [];
            
            dataRows.forEach(row => {
                if (!row[0] || !row[1]) return;
                
                const project = normalizeProjectName(row[0]);
                const activity = normalizeActivityName(row[1]);
                
                // Calculate Kashmir total
                let kTotal = 0;
                KASHMIR_DISTRICTS.forEach(d => {
                    const col = districtCols[d.toUpperCase()];
                    if (col !== undefined) {
                        kTotal += parseInt(row[col]) || 0;
                    }
                });
                
                // Calculate Jammu total
                let jTotal = 0;
                JAMMU_DISTRICTS.forEach(d => {
                    const col = districtCols[d.toUpperCase()];
                    if (col !== undefined) {
                        jTotal += parseInt(row[col]) || 0;
                    }
                });
                
                processed.push({
                    Project: project,
                    Activity: activity,
                    'K-Estab': kTotal,
                    'J-Estab': jTotal,
                    'Total-Estab': kTotal + jTotal
                });
            });
            
            return mergeRowsByProjectActivity(processed, ['K-Estab', 'J-Estab', 'Total-Estab']);
        }

        function normalizeProjectName(project) {
            const normalized = String(project || '')
                .trim()
                .replace(/^P\d+\s*:\s*/i, '')
                .replace(/\s+/g, ' ')
                .trim();

            if (!normalized) return '';

            const projectAliases = new Map([
                ['Promotion of Nutri cereals (Millets', 'Promotion of Nutri cereals (Millets)']
            ]);

            return projectAliases.get(normalized) || normalized;
        }

        function normalizeActivityName(activity) {
            return String(activity || '')
                .trim()
                .replace(/\s+/g, ' ')
                .trim();
        }

        function buildProjectActivityKey(project, activity) {
            return `${normalizeProjectName(project)}|||${normalizeActivityName(activity)}`;
        }

        function mergeRowsByProjectActivity(rows, numericColumns) {
            const merged = new Map();

            rows.forEach(row => {
                const project = normalizeProjectName(row.Project);
                const activity = normalizeActivityName(row.Activity);
                const key = buildProjectActivityKey(project, activity);

                if (!merged.has(key)) {
                    const normalizedRow = {
                        ...row,
                        Project: project,
                        Activity: activity
                    };
                    numericColumns.forEach(col => {
                        normalizedRow[col] = Number(normalizedRow[col]) || 0;
                    });
                    merged.set(key, normalizedRow);
                    return;
                }

                const existing = merged.get(key);
                numericColumns.forEach(col => {
                    existing[col] = (Number(existing[col]) || 0) + (Number(row[col]) || 0);
                });
            });

            return [...merged.values()];
        }

        function buildDivisionTotalsMap(values) {
            const map = new Map();
            if (!values || values.length < 2) return map;

            const headers = values[0];
            const dataRows = values.slice(1);
            const districtCols = {};

            headers.forEach((h, idx) => {
                if (h && h.trim) districtCols[h.trim().toUpperCase()] = idx;
            });

            dataRows.forEach(row => {
                if (!row[0] || !row[1]) return;

                const project = normalizeProjectName(row[0]);
                const activity = normalizeActivityName(row[1]);
                const key = buildProjectActivityKey(project, activity);

                let kTotal = 0;
                KASHMIR_DISTRICTS.forEach(d => {
                    const col = districtCols[d.toUpperCase()];
                    if (col !== undefined) {
                        kTotal += parseInt(row[col]) || 0;
                    }
                });

                let jTotal = 0;
                JAMMU_DISTRICTS.forEach(d => {
                    const col = districtCols[d.toUpperCase()];
                    if (col !== undefined) {
                        jTotal += parseInt(row[col]) || 0;
                    }
                });

                if (!map.has(key)) {
                    map.set(key, {
                        Project: project,
                        Activity: activity,
                        kTotal: 0,
                        jTotal: 0,
                        total: 0
                    });
                }

                const existing = map.get(key);
                existing.kTotal += kTotal;
                existing.jTotal += jTotal;
                existing.total += kTotal + jTotal;
            });

            return map;
        }

        function processTrackingData(values, neValues) {
            const trackingMap = buildDivisionTotalsMap(values);
            const neMap = buildDivisionTotalsMap(neValues);
            const combinedKeys = [...trackingMap.keys()];

            neMap.forEach((_, key) => {
                if (!trackingMap.has(key)) combinedKeys.push(key);
            });

            return combinedKeys.map(key => {
                const tracked = trackingMap.get(key) || { Project: '', Activity: '', kTotal: 0, jTotal: 0, total: 0 };
                const ne = neMap.get(key) || { kTotal: 0, jTotal: 0, total: 0 };

                return {
                    Project: tracked.Project || ne.Project,
                    Activity: tracked.Activity || ne.Activity,
                    'K-Tracked': tracked.kTotal,
                    'J-Tracked': tracked.jTotal,
                    'Total-Tracked': tracked.total,
                    'K-NE': ne.kTotal,
                    'J-NE': ne.jTotal,
                    'Total-NE': ne.total
                };
            });
        }

        function parseSimpleData(values) {
            if (!values || values.length < 2) return [];
            const headers = values[0].map(h => String(h || '').trim());
            const data = [];
            for (let i = 1; i < values.length; i++) {
                if (!values[i] || !values[i][0]) continue;
                const row = {};
                headers.forEach((h, idx) => {
                    row[h] = values[i][idx] !== undefined ? String(values[i][idx]) : '';
                });
                if (row.Project !== undefined) row.Project = normalizeProjectName(row.Project);
                if (row.project !== undefined) row.project = normalizeProjectName(row.project);
                if (row.PROJECT !== undefined) row.PROJECT = normalizeProjectName(row.PROJECT);
                if (row.Activity !== undefined) row.Activity = normalizeActivityName(row.Activity);
                if (row.activity !== undefined) row.activity = normalizeActivityName(row.activity);
                if (row.ACTIVITY !== undefined) row.ACTIVITY = normalizeActivityName(row.ACTIVITY);
                data.push(row);
            }
            return data;
        }

        function getTarget(project, activity) {
            if (!project || !activity || !targetsData || targetsData.length === 0) return '-';

            const proj = normalizeProjectName(project).toLowerCase();
            const act = normalizeActivityName(activity).toLowerCase();

            // Try exact match first
            let match = targetsData.find(t => {
                const tProj = normalizeProjectName(t.Project || '').toLowerCase();
                const tAct = normalizeActivityName(t.Activity || '').toLowerCase();
                return proj === tProj && act === tAct;
            });

            // Try partial match
            if (!match) {
                match = targetsData.find(t => {
                    const tProj = normalizeProjectName(t.Project || '').toLowerCase();
                    const tAct = normalizeActivityName(t.Activity || '').toLowerCase();
                    return (proj.includes(tProj) || tProj.includes(proj)) &&
                        (act.includes(tAct) || tAct.includes(act));
                });
            }

            if (match) {
                const target = match['5-Year Targets'] || match['5-Year Target'] || match.Target || match.target || '';
                const unit = match.Units || match.Unit || match.units || match.unit || '';
                if (target && unit) return target + ' ' + unit;
                if (target) return target;
                if (unit) return unit;
            }
            return '-';
        }

        function parseTargetNumber(value) {
            const cleaned = String(value || '').replace(/,/g, '').trim();
            const match = cleaned.match(/-?\d+(\.\d+)?/);
            return match ? parseFloat(match[0]) : 0;
        }

        function getInsightsDistrictOptions(division) {
            if (division === 'Kashmir') return [...KASHMIR_DISTRICTS];
            if (division === 'Jammu') return [...JAMMU_DISTRICTS];
            return [...KASHMIR_DISTRICTS, ...JAMMU_DISTRICTS].sort((a, b) => a.localeCompare(b));
        }

        function updateInsightsDistrictOptions(preferredValue = '') {
            const division = document.getElementById('insightsDivisionFilter')?.value || '';
            const select = document.getElementById('insightsDistrictFilter');
            if (!select) return;

            const options = getInsightsDistrictOptions(division);
            const currentValue = preferredValue || select.value || '';
            select.innerHTML = '<option value="">&#127968; All Districts</option>';
            options.forEach(district => {
                const opt = document.createElement('option');
                opt.value = district;
                opt.textContent = district;
                select.appendChild(opt);
            });

            if (options.includes(currentValue)) {
                select.value = currentValue;
            } else {
                select.value = '';
            }
        }

        function populateInsightsFilters() {
            if (projectOrder.length === 0) {
                projectOrder = extractProjectOrder();
            }

            const select = document.getElementById('insightsProjectFilter');
            if (select) {
                const allProjects = getSortedProjects([
                    ...processedData,
                    ...estabData,
                    ...trackingData
                ]);
                select.innerHTML = '<option value="">&#128193; All Projects</option>';
                allProjects.forEach(project => {
                    const opt = document.createElement('option');
                    opt.value = project;
                    opt.textContent = project;
                    select.appendChild(opt);
                });
            }

            updateInsightsDistrictOptions();

            const projectFilter = document.getElementById('insightsProjectFilter');
            const divisionFilter = document.getElementById('insightsDivisionFilter');
            const districtFilter = document.getElementById('insightsDistrictFilter');

            if (projectFilter) {
                projectFilter.onchange = () => {
                    saveViewState();
                    renderInsights();
                };
            }

            if (divisionFilter) {
                divisionFilter.onchange = () => {
                    updateInsightsDistrictOptions();
                    saveViewState();
                    renderInsights();
                };
            }

            if (districtFilter) {
                districtFilter.onchange = () => {
                    saveViewState();
                    renderInsights();
                };
            }
        }

        function getInsightsGeoSelection() {
            return {
                project: document.getElementById('insightsProjectFilter')?.value || '',
                division: document.getElementById('insightsDivisionFilter')?.value || '',
                district: document.getElementById('insightsDistrictFilter')?.value || ''
            };
        }

        function buildRegionalMapFromRawSheet(values, valueOffset, selection) {
            const map = new Map();
            if (!values || values.length < 5) return map;

            const districtRow = values[2];
            const dataRows = values.slice(4);
            const districtCols = {};
            districtRow.forEach((val, idx) => {
                if (val && val.trim) districtCols[val.trim().toUpperCase()] = idx;
            });

            const districts = selection.district
                ? [selection.district]
                : selection.division === 'Kashmir'
                    ? KASHMIR_DISTRICTS
                    : selection.division === 'Jammu'
                        ? JAMMU_DISTRICTS
                        : [...KASHMIR_DISTRICTS, ...JAMMU_DISTRICTS];

            dataRows.forEach(row => {
                if (!row[0] || !row[1]) return;
                const key = buildProjectActivityKey(row[0], row[1]);
                let total = 0;
                districts.forEach(district => {
                    const col = districtCols[district.toUpperCase()];
                    if (col !== undefined) {
                        total += parseInt(row[col + valueOffset]) || 0;
                    }
                });
                map.set(key, (map.get(key) || 0) + total);
            });

            return map;
        }

        function buildRegionalMapFromDistrictSheet(values, selection) {
            const map = new Map();
            if (!values || values.length < 2) return map;

            const headers = values[0];
            const dataRows = values.slice(1);
            const districtCols = {};
            headers.forEach((val, idx) => {
                if (val && val.trim) districtCols[val.trim().toUpperCase()] = idx;
            });

            const districts = selection.district
                ? [selection.district]
                : selection.division === 'Kashmir'
                    ? KASHMIR_DISTRICTS
                    : selection.division === 'Jammu'
                        ? JAMMU_DISTRICTS
                        : [...KASHMIR_DISTRICTS, ...JAMMU_DISTRICTS];

            dataRows.forEach(row => {
                if (!row[0] || !row[1]) return;
                const key = buildProjectActivityKey(row[0], row[1]);
                let total = 0;
                districts.forEach(district => {
                    const col = districtCols[district.toUpperCase()];
                    if (col !== undefined) {
                        total += parseInt(row[col]) || 0;
                    }
                });
                map.set(key, (map.get(key) || 0) + total);
            });

            return map;
        }

        function buildInsightsRows() {
            const selection = getInsightsGeoSelection();
            const appsMap = buildRegionalMapFromRawSheet(rawSheetData, 0, selection);
            const approvalsMap = buildRegionalMapFromRawSheet(rawSheetData, 1, selection);
            const establishmentsMap = buildRegionalMapFromDistrictSheet(estabRawData, selection);
            const trackedMap = buildRegionalMapFromDistrictSheet(trackingRawData, selection);

            const targetMap = new Map();
            targetsData.forEach(row => {
                const key = buildProjectActivityKey(row.Project || row.project, row.Activity || row.activity);
                const targetRaw = row['5-Year Targets'] || row['5-Year Target'] || row.Target || row.target || '';
                if (!key || !targetRaw) return;
                targetMap.set(key, {
                    raw: String(targetRaw),
                    numeric: parseTargetNumber(targetRaw)
                });
            });

            const allKeys = new Set([
                ...appsMap.keys(),
                ...approvalsMap.keys(),
                ...establishmentsMap.keys(),
                ...trackedMap.keys(),
                ...targetMap.keys()
            ]);

            let rows = [...allKeys].map(key => {
                const [project, activity] = key.split('|||');
                const applications = appsMap.get(key) || 0;
                const approvals = approvalsMap.get(key) || 0;
                const establishments = establishmentsMap.get(key) || 0;
                const tracked = trackedMap.get(key) || 0;
                const target = targetMap.get(key)?.numeric || 0;
                const targetLabel = targetMap.get(key)?.raw || '-';

                return {
                    key,
                    Project: project,
                    Activity: activity,
                    applications,
                    approvals,
                    establishments,
                    tracked,
                    target,
                    targetLabel,
                    scaleRate: target > 0 ? (applications / target) * 100 : null,
                    approvalRate: applications > 0 ? (approvals / applications) * 100 : null,
                    estabVsTargetRate: target > 0 ? (establishments / target) * 100 : null,
                    estabVsApprovalRate: approvals > 0 ? (establishments / approvals) * 100 : null,
                    trackingRate: establishments > 0 ? (tracked / establishments) * 100 : null
                };
            });

            if (selection.project) {
                rows = rows.filter(row => row.Project === selection.project);
            }

            return rows.filter(row =>
                row.target > 0 ||
                row.applications > 0 ||
                row.approvals > 0 ||
                row.establishments > 0 ||
                row.tracked > 0
            );
        }

        function formatInsightsPercent(value) {
            return value === null || value === undefined ? '-' : `${value.toFixed(1)}%`;
        }

        function sortInsightsRows(rows, sectionKey) {
            const { key, direction } = insightsSortState[sectionKey];
            return [...rows].sort((a, b) => {
                const aVal = a[key];
                const bVal = b[key];
                const aMissing = aVal === null || aVal === undefined;
                const bMissing = bVal === null || bVal === undefined;

                if (aMissing && bMissing) return a.Activity.localeCompare(b.Activity);
                if (aMissing) return 1;
                if (bMissing) return -1;

                if (aVal === bVal) {
                    if (a.Project !== b.Project) return a.Project.localeCompare(b.Project);
                    return a.Activity.localeCompare(b.Activity);
                }

                return direction === 'desc' ? bVal - aVal : aVal - bVal;
            });
        }

        function getSortIndicator(sectionKey, columnKey) {
            const state = insightsSortState[sectionKey];
            if (state.key !== columnKey) return '&#8597;';
            return state.direction === 'desc' ? '&#8595;' : '&#8593;';
        }

        function setInsightsSort(sectionKey, columnKey) {
            const state = insightsSortState[sectionKey];
            if (state.key === columnKey) {
                state.direction = state.direction === 'desc' ? 'asc' : 'desc';
            } else {
                state.key = columnKey;
                state.direction = 'desc';
            }
            saveViewState();
            renderInsights();
        }

        function showInsightsSection(section, persist = true) {
            currentInsightsSection = section;

            ['scale', 'approvals', 'establishments', 'tracking'].forEach(key => {
                const tab = document.getElementById(`insights-tab-${key}`);
                const panel = document.getElementById(`insights-section-${key}`);
                if (tab) tab.classList.toggle('active', key === section);
                if (panel) {
                    panel.classList.toggle('active', key === section);
                    panel.style.display = key === section ? 'block' : 'none';
                }
            });

            if (persist) saveViewState();
        }

        function renderInsightsTable(containerId, sectionKey, rows, columns) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const sortedRows = sortInsightsRows(rows, sectionKey);

            if (sortedRows.length === 0) {
                container.innerHTML = '<p style="text-align:center;padding:20px;color:#666;">No matching activities found for the selected filters.</p>';
                return;
            }

            let html = '<table><thead><tr>';
            columns.forEach(column => {
                if (column.sortKey) {
                    html += `<th class="${column.className || ''} sortable" onclick="setInsightsSort('${sectionKey}', '${column.sortKey}')">${column.label}<span class="sort-indicator">${getSortIndicator(sectionKey, column.sortKey)}</span></th>`;
                } else {
                    html += `<th class="${column.className || ''}">${column.label}</th>`;
                }
            });
            html += '</tr></thead><tbody>';

            sortedRows.forEach(row => {
                html += '<tr>';
                columns.forEach(column => {
                    const rawValue = typeof column.value === 'function' ? column.value(row) : row[column.value];
                    html += `<td class="${column.cellClass || ''}">${rawValue}</td>`;
                });
                html += '</tr>';
            });

            html += '</tbody></table>';
            container.innerHTML = html;
        }

        function renderInsights() {
            const rows = buildInsightsRows();

            renderInsightsTable('insightsScaleTable', 'scale', rows, [
                { label: 'Project', value: 'Project', cellClass: 'project-cell' },
                { label: 'Activity', value: 'Activity', cellClass: 'activity-cell' },
                { label: 'Applications', value: row => row.applications.toLocaleString(), cellClass: 'number', sortKey: 'applications' },
                { label: 'Target', value: row => row.targetLabel, cellClass: 'number', sortKey: 'target' },
                { label: 'Applications vs Target', value: row => formatInsightsPercent(row.scaleRate), cellClass: 'number', sortKey: 'scaleRate' }
            ]);

            renderInsightsTable('insightsApprovalsTable', 'approvals', rows, [
                { label: 'Project', value: 'Project', cellClass: 'project-cell' },
                { label: 'Activity', value: 'Activity', cellClass: 'activity-cell' },
                { label: 'Applications', value: row => row.applications.toLocaleString(), cellClass: 'number', sortKey: 'applications' },
                { label: 'Approvals', value: row => row.approvals.toLocaleString(), cellClass: 'number', sortKey: 'approvals' },
                { label: 'Approval Rate', value: row => formatInsightsPercent(row.approvalRate), cellClass: 'number', sortKey: 'approvalRate' }
            ]);

            renderInsightsTable('insightsEstablishmentsTable', 'establishments', rows, [
                { label: 'Project', value: 'Project', cellClass: 'project-cell' },
                { label: 'Activity', value: 'Activity', cellClass: 'activity-cell' },
                { label: 'Target', value: row => row.targetLabel, cellClass: 'number', sortKey: 'target' },
                { label: 'Approvals', value: row => row.approvals.toLocaleString(), cellClass: 'number', sortKey: 'approvals' },
                { label: 'Established', value: row => row.establishments.toLocaleString(), cellClass: 'number', sortKey: 'establishments' },
                { label: 'Established vs Target', value: row => formatInsightsPercent(row.estabVsTargetRate), cellClass: 'number', sortKey: 'estabVsTargetRate' },
                { label: 'Established vs Approvals', value: row => formatInsightsPercent(row.estabVsApprovalRate), cellClass: 'number', sortKey: 'estabVsApprovalRate' }
            ]);

            renderInsightsTable('insightsTrackingTable', 'tracking', rows, [
                { label: 'Project', value: 'Project', cellClass: 'project-cell' },
                { label: 'Activity', value: 'Activity', cellClass: 'activity-cell' },
                { label: 'Established', value: row => row.establishments.toLocaleString(), cellClass: 'number', sortKey: 'establishments' },
                { label: 'Tracked', value: row => row.tracked.toLocaleString(), cellClass: 'number', sortKey: 'tracked' },
                { label: 'Tracked vs Established', value: row => formatInsightsPercent(row.trackingRate), cellClass: 'number', sortKey: 'trackingRate' }
            ]);

            showInsightsSection(currentInsightsSection, false);
        }

        function initDashboard() {
            calculateTotals();
            initCharts();
            populateInsightsFilters();
            populateFilters();
            populateEstabFilters();
            populateTrackingFilters();
            populateDistrictSelector();
            renderInsights();
            renderActivityTable();
            renderEstablishmentTable();
            renderTrackingTable();
            restoreViewState();
        }

        function calculateTotals() {
            let kApps = 0, kAppr = 0, jApps = 0, jAppr = 0;
            processedData.forEach(row => {
                kApps += row['K-Appl'];
                kAppr += row['K-Appr'];
                jApps += row['J-Appl'];
                jAppr += row['J-Appr'];
            });

            document.getElementById('kashmir-apps').textContent = kApps.toLocaleString();
            document.getElementById('kashmir-appr').textContent = kAppr.toLocaleString();
            document.getElementById('kashmir-rate').textContent = kApps > 0 ? ((kAppr / kApps) * 100).toFixed(1) + '%' : '0%';

            document.getElementById('jammu-apps').textContent = jApps.toLocaleString();
            document.getElementById('jammu-appr').textContent = jAppr.toLocaleString();
            document.getElementById('jammu-rate').textContent = jApps > 0 ? ((jAppr / jApps) * 100).toFixed(1) + '%' : '0%';

            document.getElementById('total-apps').textContent = (kApps + jApps).toLocaleString();
            document.getElementById('total-appr').textContent = (kAppr + jAppr).toLocaleString();
            document.getElementById('total-rate').textContent = (kApps + jApps) > 0 ? (((kAppr + jAppr) / (kApps + jApps)) * 100).toFixed(1) + '%' : '0%';

            // Calculate Establishment totals
            let kEstab = 0, jEstab = 0;
            if (estabData && estabData.length > 0) {
                estabData.forEach(row => {
                    kEstab += row['K-Estab'] || 0;
                    jEstab += row['J-Estab'] || 0;
                });
            }

            document.getElementById('total-estab').textContent = (kEstab + jEstab).toLocaleString();
            document.getElementById('estab-kashmir').textContent = kEstab.toLocaleString();
            document.getElementById('estab-jammu').textContent = jEstab.toLocaleString();
            document.getElementById('estab-rate-kmr').textContent = kAppr > 0 ? ((kEstab / kAppr) * 100).toFixed(1) + '%' : '0%';
            document.getElementById('estab-rate-jmu').textContent = jAppr > 0 ? ((jEstab / jAppr) * 100).toFixed(1) + '%' : '0%';

            // Calculate Tracking totals
            let kTracked = 0, jTracked = 0;
            if (trackingData && trackingData.length > 0) {
                trackingData.forEach(row => {
                    kTracked += row['K-Tracked'] || 0;
                    jTracked += row['J-Tracked'] || 0;
                });
            }

            document.getElementById('total-tracked').textContent = (kTracked + jTracked).toLocaleString();
            document.getElementById('tracked-kashmir').textContent = kTracked.toLocaleString();
            document.getElementById('tracked-jammu').textContent = jTracked.toLocaleString();
            document.getElementById('tracked-rate-kmr').textContent = kEstab > 0 ? ((kTracked / kEstab) * 100).toFixed(1) + '%' : '0%';
            document.getElementById('tracked-rate-jmu').textContent = jEstab > 0 ? ((jTracked / jEstab) * 100).toFixed(1) + '%' : '0%';
        }

        function initCharts() {
            // Destroy existing charts
            Object.values(charts).forEach(chart => { if (chart) chart.destroy(); });
            charts = {};

            // 1. Division-wise Distribution (Applications)
            let kTotal = 0, jTotal = 0;
            processedData.forEach(row => {
                kTotal += row['K-Appl'];
                jTotal += row['J-Appl'];
            });

            charts.division = new Chart(document.getElementById('divisionChart'), {
                type: 'doughnut',
                data: { labels: ['Kashmir Division', 'Jammu Division'], datasets: [{ data: [kTotal, jTotal], backgroundColor: ['#3498db', '#e74c3c'] }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
            });

            // Calculate all metrics
            const projectMetrics = calculateProjectMetrics();
            const districtMetrics = calculateDistrictMetrics();

            // 2. Top 10 Projects by Applications
            const topProjectsApp = [...projectMetrics].sort((a, b) => b.applications - a.applications).slice(0, 10);
            charts.topProjectsApp = new Chart(document.getElementById('topProjectsAppChart'), {
                type: 'bar',
                data: { labels: topProjectsApp.map(p => p.name.substring(0, 25) + '...'), datasets: [{ label: 'Applications', data: topProjectsApp.map(p => p.applications), backgroundColor: '#667eea' }] },
                options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }
            });

            // 3. Top 10 Projects by Approvals
            const topProjectsAppr = [...projectMetrics].sort((a, b) => b.approvals - a.approvals).slice(0, 10);
            charts.topProjectsAppr = new Chart(document.getElementById('topProjectsApprChart'), {
                type: 'bar',
                data: { labels: topProjectsAppr.map(p => p.name.substring(0, 25) + '...'), datasets: [{ label: 'Approvals', data: topProjectsAppr.map(p => p.approvals), backgroundColor: '#27ae60' }] },
                options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }
            });

            // 4. Top 10 Projects by Establishments
            const topProjectsEstab = [...projectMetrics].filter(p => p.establishments > 0).sort((a, b) => b.establishments - a.establishments).slice(0, 10);
            charts.topProjectsEstab = new Chart(document.getElementById('topProjectsEstabChart'), {
                type: 'bar',
                data: { labels: topProjectsEstab.map(p => p.name.substring(0, 25) + '...'), datasets: [{ label: 'Establishments', data: topProjectsEstab.map(p => p.establishments), backgroundColor: '#00695c' }] },
                options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }
            });

            // 5. Top 10 Districts by Applications
            const topDistrictsApp = [...districtMetrics].sort((a, b) => b.applications - a.applications).slice(0, 10);
            charts.topDistrictsApp = new Chart(document.getElementById('topDistrictsAppChart'), {
                type: 'bar',
                data: { labels: topDistrictsApp.map(d => d.name), datasets: [{ label: 'Applications', data: topDistrictsApp.map(d => d.applications), backgroundColor: '#3498db' }] },
                options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }
            });

            // 6. Top 10 Districts by Approvals
            const topDistrictsAppr = [...districtMetrics].sort((a, b) => b.approvals - a.approvals).slice(0, 10);
            charts.topDistrictsAppr = new Chart(document.getElementById('topDistrictsApprChart'), {
                type: 'bar',
                data: { labels: topDistrictsAppr.map(d => d.name), datasets: [{ label: 'Approvals', data: topDistrictsAppr.map(d => d.approvals), backgroundColor: '#e74c3c' }] },
                options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }
            });

            // 7. Top 10 Districts by Establishments
            const topDistrictsEstab = [...districtMetrics].filter(d => d.establishments > 0).sort((a, b) => b.establishments - a.establishments).slice(0, 10);
            charts.topDistrictsEstab = new Chart(document.getElementById('topDistrictsEstabChart'), {
                type: 'bar',
                data: { labels: topDistrictsEstab.map(d => d.name), datasets: [{ label: 'Establishments', data: topDistrictsEstab.map(d => d.establishments), backgroundColor: '#00695c' }] },
                options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }
            });

            // 12. Top 10 Districts Overall (Weighted Score)
            // Score = (apps/totalApps)*0.2 + (appr/apps)*0.3 + (estab/appr)*0.5
            const totalApps = districtMetrics.reduce((sum, d) => sum + d.applications, 0);
            const districtsWithScore = districtMetrics.map(d => {
                const appScore = totalApps > 0 ? (d.applications / totalApps) * 0.2 : 0;
                const apprScore = d.applications > 0 ? (d.approvals / d.applications) * 0.3 : 0;
                const estabScore = d.approvals > 0 ? (d.establishments / d.approvals) * 0.5 : 0;
                return { ...d, score: appScore + apprScore + estabScore };
            });
            const topDistrictsOverall = districtsWithScore.sort((a, b) => b.score - a.score).slice(0, 10);
            charts.topDistrictsOverall = new Chart(document.getElementById('topDistrictsOverallChart'), {
                type: 'bar',
                data: { labels: topDistrictsOverall.map(d => d.name), datasets: [{ label: 'Score', data: topDistrictsOverall.map(d => d.score.toFixed(3)), backgroundColor: '#9b59b6' }] },
                options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }
            });

            // Render tables for low performance metrics
            renderLowPerformanceTables(projectMetrics, districtMetrics);
        }

        function calculateProjectMetrics() {
            const metrics = {};
            
            // Process application data
            processedData.forEach(row => {
                if (!metrics[row.Project]) {
                    metrics[row.Project] = { name: row.Project, applications: 0, approvals: 0, establishments: 0 };
                }
                metrics[row.Project].applications += row['Total-Appl'];
                metrics[row.Project].approvals += row['Total-Appr'];
            });
            
            // Process establishment data
            estabData.forEach(row => {
                if (!metrics[row.Project]) {
                    metrics[row.Project] = { name: row.Project, applications: 0, approvals: 0, establishments: 0 };
                }
                metrics[row.Project].establishments += row['Total-Estab'];
            });
            
            return Object.values(metrics).filter(p => p.applications > 0 || p.establishments > 0);
        }

        function calculateDistrictMetrics() {
            const metrics = {};
            const allDistricts = [...KASHMIR_DISTRICTS, ...JAMMU_DISTRICTS];
            allDistricts.forEach(d => metrics[d] = { name: d, applications: 0, approvals: 0, establishments: 0 });
            
            // Process application data
            if (rawSheetData && rawSheetData.length >= 5) {
                const districtRow = rawSheetData[2];
                const dataRows = rawSheetData.slice(4);
                
                allDistricts.forEach(district => {
                    let colIdx = -1;
                    districtRow.forEach((val, idx) => {
                        if (val && val.trim().toUpperCase() === district.toUpperCase()) {
                            colIdx = idx;
                        }
                    });
                    
                    if (colIdx !== -1) {
                        dataRows.forEach(row => {
                            metrics[district].applications += parseInt(row[colIdx]) || 0;
                            metrics[district].approvals += parseInt(row[colIdx + 1]) || 0;
                        });
                    }
                });
            }
            
            // Process establishment data
            if (estabRawData && estabRawData.length >= 2) {
                const headers = estabRawData[0];
                const dataRows = estabRawData.slice(1);
                
                allDistricts.forEach(district => {
                    let colIdx = -1;
                    headers.forEach((val, idx) => {
                        if (val && val.trim().toUpperCase() === district.toUpperCase()) {
                            colIdx = idx;
                        }
                    });
                    
                    if (colIdx !== -1) {
                        dataRows.forEach(row => {
                            metrics[district].establishments += parseInt(row[colIdx]) || 0;
                        });
                    }
                });
            }
            
            return Object.values(metrics).filter(d => d.applications > 0 || d.establishments > 0);
        }

        function renderLowPerformanceTables(projectMetrics, districtMetrics) {
            // 8. Projects with least approvals vs applications (lowest approval rates)
            const lowApprovalProjects = projectMetrics
                .filter(p => p.applications >= 100) // Only consider projects with significant applications
                .map(p => ({ ...p, rate: p.applications > 0 ? (p.approvals / p.applications) * 100 : 0 }))
                .sort((a, b) => a.rate - b.rate)
                .slice(0, 10);
            
            document.getElementById('lowApprovalProjectsTable').innerHTML = renderMetricsTable(lowApprovalProjects, 
                ['Project', 'Applications', 'Approvals', 'Approval Rate'], 
                ['name', 'applications', 'approvals', 'rate'],
                (row, col) => col === 'rate' ? row.rate.toFixed(1) + '%' : row[col].toLocaleString()
            );

            // 9. Projects with least establishments vs approvals (lowest establishment rates)
            const lowEstabProjects = projectMetrics
                .filter(p => p.approvals >= 50) // Only consider projects with significant approvals
                .map(p => ({ ...p, rate: p.approvals > 0 ? (p.establishments / p.approvals) * 100 : 0 }))
                .sort((a, b) => a.rate - b.rate)
                .slice(0, 10);
            
            document.getElementById('lowEstabProjectsTable').innerHTML = renderMetricsTable(lowEstabProjects, 
                ['Project', 'Approvals', 'Establishments', 'Establishment Rate'], 
                ['name', 'approvals', 'establishments', 'rate'],
                (row, col) => col === 'rate' ? row.rate.toFixed(1) + '%' : row[col].toLocaleString()
            );

            // 10. Districts with least approvals vs applications
            const lowApprovalDistricts = districtMetrics
                .filter(d => d.applications >= 100)
                .map(d => ({ ...d, rate: d.applications > 0 ? (d.approvals / d.applications) * 100 : 0 }))
                .sort((a, b) => a.rate - b.rate)
                .slice(0, 10);
            
            document.getElementById('lowApprovalDistrictsTable').innerHTML = renderMetricsTable(lowApprovalDistricts, 
                ['District', 'Applications', 'Approvals', 'Approval Rate'], 
                ['name', 'applications', 'approvals', 'rate'],
                (row, col) => col === 'rate' ? row.rate.toFixed(1) + '%' : row[col].toLocaleString()
            );

            // 11. Districts with least establishments vs approvals
            const lowEstabDistricts = districtMetrics
                .filter(d => d.approvals >= 50)
                .map(d => ({ ...d, rate: d.approvals > 0 ? (d.establishments / d.approvals) * 100 : 0 }))
                .sort((a, b) => a.rate - b.rate)
                .slice(0, 10);
            
            document.getElementById('lowEstabDistrictsTable').innerHTML = renderMetricsTable(lowEstabDistricts, 
                ['District', 'Approvals', 'Establishments', 'Establishment Rate'], 
                ['name', 'approvals', 'establishments', 'rate'],
                (row, col) => col === 'rate' ? row.rate.toFixed(1) + '%' : row[col].toLocaleString()
            );
        }

        function renderMetricsTable(data, headers, columns, formatFn) {
            if (data.length === 0) return '<p style="text-align:center;padding:20px;">No data available</p>';
            
            let html = '<table><thead><tr>';
            headers.forEach(h => html += `<th>${h}</th>`);
            html += '</tr></thead><tbody>';
            
            data.forEach(row => {
                html += '<tr>';
                columns.forEach(col => {
                    html += `<td class="number">${formatFn(row, col)}</td>`;
                });
                html += '</tr>';
            });
            
            html += '</tbody></table>';
            return html;
        }

        function populateFilters() {
            // Extract project order from targets if not already done
            if (projectOrder.length === 0) {
                projectOrder = extractProjectOrder();
            }
            
            const projects = getSortedProjects(processedData);
            const select = document.getElementById('projectFilter');
            select.innerHTML = '<option value="">All Projects</option>';
            projects.forEach(p => { const opt = document.createElement('option'); opt.value = p; opt.textContent = p; select.appendChild(opt); });

            document.getElementById('searchInput').addEventListener('input', () => {
                saveViewState();
                renderActivityTable();
            });
            document.getElementById('projectFilter').addEventListener('change', () => {
                saveViewState();
                renderActivityTable();
            });
        }

        function renderActivityTable() {
            const container = document.getElementById('activityTableContainer');
            const search = document.getElementById('searchInput')?.value?.toLowerCase() || '';
            const project = document.getElementById('projectFilter')?.value || '';

            let filtered = sortByProjectOrder(processedData);
            if (search) filtered = filtered.filter(r => r.Project.toLowerCase().includes(search) || r.Activity.toLowerCase().includes(search));
            if (project) filtered = filtered.filter(r => r.Project === project);

            let html = '<table><thead><tr>';
            html += '<th style="width:20%;white-space:normal;line-height:1.3;">Project</th>';
            html += '<th style="width:20%;white-space:normal;line-height:1.3;">Activity</th>';
            html += '<th class="number" style="background:#1565c0;color:white;width:8%;font-size:11px;line-height:1.3;padding:10px 4px;">Kashmir<br>Applications</th>';
            html += '<th class="number" style="background:#c62828;color:white;width:8%;font-size:11px;line-height:1.3;padding:10px 4px;">Jammu<br>Applications</th>';
            html += '<th class="number" style="background:#1a237e;color:white;width:8%;font-size:11px;line-height:1.3;padding:10px 4px;">Total<br>Applications</th>';
            html += '<th class="number" style="background:#0d47a1;color:white;width:8%;font-size:11px;line-height:1.3;padding:10px 4px;">Kashmir<br>Approvals</th>';
            html += '<th class="number" style="background:#b71c1c;color:white;width:8%;font-size:11px;line-height:1.3;padding:10px 4px;">Jammu<br>Approvals</th>';
            html += '<th class="number" style="background:#1b5e20;color:white;width:8%;font-size:11px;line-height:1.3;padding:10px 4px;">Total<br>Approvals</th>';
            html += '<th class="number" style="background:#4a148c;color:white;width:8%;font-size:11px;line-height:1.3;padding:10px 4px;">5-Year<br>Targets</th>';
            html += '</tr></thead><tbody>';

            // Calculate totals for grand total row
            let kApplTotal = 0, jApplTotal = 0, totalApplTotal = 0;
            let kApprTotal = 0, jApprTotal = 0, totalApprTotal = 0;

            filtered.forEach(row => {
                const tgt = getTarget(row.Project, row.Activity);
                html += `<tr>
                    <td class="project-cell">${row.Project}</td>
                    <td class="activity-cell">${row.Activity}</td>
                    <td class="number" style="color:#1565c0;background:#e3f2fd;font-weight:600">${row['K-Appl'].toLocaleString()}</td>
                    <td class="number" style="color:#c62828;background:#ffebee;font-weight:600">${row['J-Appl'].toLocaleString()}</td>
                    <td class="number" style="color:#1a237e;background:#e8eaf6;font-weight:700">${row['Total-Appl'].toLocaleString()}</td>
                    <td class="number" style="color:#0d47a1;background:#e3f2fd;font-weight:600">${row['K-Appr'].toLocaleString()}</td>
                    <td class="number" style="color:#b71c1c;background:#ffebee;font-weight:600">${row['J-Appr'].toLocaleString()}</td>
                    <td class="number" style="color:#1b5e20;background:#e8f5e9;font-weight:700">${row['Total-Appr'].toLocaleString()}</td>
                    <td class="number" style="color:#4a148c;background:#f3e5f5;font-weight:700">${tgt}</td>
                </tr>`;
                
                kApplTotal += row['K-Appl'];
                jApplTotal += row['J-Appl'];
                totalApplTotal += row['Total-Appl'];
                kApprTotal += row['K-Appr'];
                jApprTotal += row['J-Appr'];
                totalApprTotal += row['Total-Appr'];
            });

            // Add grand total row
            html += `<tr style="background:#f5f5f5;font-weight:bold;border-top:2px solid #333;">
                <td colspan="2" style="text-align:right;padding:12px;"><strong>Grand Total:</strong></td>
                <td class="number" style="color:#1565c0;background:#bbdefb;font-weight:700">${kApplTotal.toLocaleString()}</td>
                <td class="number" style="color:#c62828;background:#ffcdd2;font-weight:700">${jApplTotal.toLocaleString()}</td>
                <td class="number" style="color:#1a237e;background:#c5cae9;font-weight:700">${totalApplTotal.toLocaleString()}</td>
                <td class="number" style="color:#0d47a1;background:#bbdefb;font-weight:700">${kApprTotal.toLocaleString()}</td>
                <td class="number" style="color:#b71c1c;background:#ffcdd2;font-weight:700">${jApprTotal.toLocaleString()}</td>
                <td class="number" style="color:#1b5e20;background:#c8e6c9;font-weight:700">${totalApprTotal.toLocaleString()}</td>
                <td class="number" style="background:#e0e0e0;">-</td>
            </tr>`;

            html += '</tbody></table>';
            container.innerHTML = html;
        }

        // Store project order from Targets sheet
        let projectOrder = [];

        function extractProjectOrder() {
            if (!targetsData || targetsData.length === 0) return [];
            
            // Extract unique projects in the order they appear in Targets sheet
            const order = [];
            const seen = new Set();
            
            targetsData.forEach(row => {
                const proj = normalizeProjectName(row.Project || row.project || row.PROJECT);
                if (proj && !seen.has(proj)) {
                    order.push(proj);
                    seen.add(proj);
                }
            });
            
            return order;
        }

        function sortByProjectOrder(items, projectKey = 'Project') {
            if (projectOrder.length === 0) return items;
            
            const orderMap = new Map();
            projectOrder.forEach((proj, idx) => orderMap.set(proj, idx));
            
            return [...items].sort((a, b) => {
                const projA = a[projectKey];
                const projB = b[projectKey];
                const orderA = orderMap.has(projA) ? orderMap.get(projA) : 9999;
                const orderB = orderMap.has(projB) ? orderMap.get(projB) : 9999;
                
                if (orderA !== orderB) return orderA - orderB;
                // If same project or not in targets, sort by activity
                const actA = a.Activity || '';
                const actB = b.Activity || '';
                return actA.localeCompare(actB);
            });
        }

        function getSortedProjects(data, projectKey = 'Project') {
            if (projectOrder.length === 0) {
                // Fallback to alphabetical if no targets data
                return [...new Set(data.map(r => r[projectKey]))].filter(p => p).sort();
            }
            
            // Return only projects that exist in data, in Targets order
            const dataProjects = new Set(data.map(r => r[projectKey]).filter(p => p));
            return projectOrder.filter(p => dataProjects.has(p));
        }

        function populateEstabFilters() {
            if (!estabData || estabData.length === 0) return;
            
            // Extract project order from targets if not already done
            if (projectOrder.length === 0) {
                projectOrder = extractProjectOrder();
            }
            
            const projects = getSortedProjects(estabData);
            const select = document.getElementById('estabProjectFilter');
            select.innerHTML = '<option value="">&#128193; All Projects</option>';
            projects.forEach(p => { const opt = document.createElement('option'); opt.value = p; opt.textContent = p; select.appendChild(opt); });

            document.getElementById('estabSearchInput').addEventListener('input', () => {
                saveViewState();
                renderEstablishmentTable();
            });
            document.getElementById('estabProjectFilter').addEventListener('change', () => {
                saveViewState();
                renderEstablishmentTable();
            });
        }

        function populateTrackingFilters() {
            if (!trackingData || trackingData.length === 0) return;

            if (projectOrder.length === 0) {
                projectOrder = extractProjectOrder();
            }

            const projects = getSortedProjects(trackingData);
            const select = document.getElementById('trackingProjectFilter');
            select.innerHTML = '<option value="">&#128193; All Projects</option>';
            projects.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p;
                opt.textContent = p;
                select.appendChild(opt);
            });

            document.getElementById('trackingSearchInput').addEventListener('input', () => {
                saveViewState();
                renderTrackingTable();
            });
            document.getElementById('trackingProjectFilter').addEventListener('change', () => {
                saveViewState();
                renderTrackingTable();
            });
        }

        function renderEstablishmentTable() {
            const container = document.getElementById('establishmentTableContainer');
            if (!estabData || estabData.length === 0) {
                container.innerHTML = '<p style="text-align:center;padding:20px;">No establishment data available.</p>';
                return;
            }
            
            const search = document.getElementById('estabSearchInput')?.value?.toLowerCase() || '';
            const project = document.getElementById('estabProjectFilter')?.value || '';

            let filtered = sortByProjectOrder(estabData);
            if (search) filtered = filtered.filter(r => r.Project.toLowerCase().includes(search) || r.Activity.toLowerCase().includes(search));
            if (project) filtered = filtered.filter(r => r.Project === project);

            // Calculate totals for grand total row
            let kTotal = 0, jTotal = 0, grandTotal = 0;
            filtered.forEach(row => {
                kTotal += row['K-Estab'];
                jTotal += row['J-Estab'];
                grandTotal += row['Total-Estab'];
            });

            let html = '<table><thead><tr>';
            html += '<th style="width:30%;white-space:normal;line-height:1.3;">Project</th>';
            html += '<th style="width:40%;white-space:normal;line-height:1.3;">Activity</th>';
            html += '<th class="number" style="background:#1565c0;color:white;width:10%;font-size:12px;line-height:1.3;padding:10px 4px;">Established Units<br>Kashmir</th>';
            html += '<th class="number" style="background:#c62828;color:white;width:10%;font-size:12px;line-height:1.3;padding:10px 4px;">Established Units<br>Jammu</th>';
            html += '<th class="number" style="background:#00695c;color:white;width:10%;font-size:12px;line-height:1.3;padding:10px 4px;">Established Units<br>Total</th>';
            html += '</tr></thead><tbody>';

            filtered.forEach(row => {
                html += `<tr>
                    <td class="project-cell">${row.Project}</td>
                    <td class="activity-cell">${row.Activity}</td>
                    <td class="number" style="color:#1565c0;background:#e3f2fd;font-weight:600">${row['K-Estab'].toLocaleString()}</td>
                    <td class="number" style="color:#c62828;background:#ffebee;font-weight:600">${row['J-Estab'].toLocaleString()}</td>
                    <td class="number" style="color:#00695c;background:#e0f2f1;font-weight:700">${row['Total-Estab'].toLocaleString()}</td>
                </tr>`;
            });

            // Add grand total row
            html += `<tr style="background:#f5f5f5;font-weight:bold;border-top:2px solid #333;">
                <td colspan="2" style="text-align:right;padding:12px;"><strong>Grand Total:</strong></td>
                <td class="number" style="color:#1565c0;background:#bbdefb;font-weight:700">${kTotal.toLocaleString()}</td>
                <td class="number" style="color:#c62828;background:#ffcdd2;font-weight:700">${jTotal.toLocaleString()}</td>
                <td class="number" style="color:#00695c;background:#b2dfdb;font-weight:700">${grandTotal.toLocaleString()}</td>
            </tr>`;

            html += '</tbody></table>';
            container.innerHTML = html;
        }

        function renderTrackingTable() {
            const container = document.getElementById('trackingTableContainer');
            if (!container) return;

            if (!trackingData || trackingData.length === 0) {
                container.innerHTML = '<p style="text-align:center;padding:20px;">No tracking data available.</p>';
                return;
            }

            const search = document.getElementById('trackingSearchInput')?.value?.toLowerCase() || '';
            const project = document.getElementById('trackingProjectFilter')?.value || '';

            let filtered = sortByProjectOrder(trackingData);
            if (search) filtered = filtered.filter(r => r.Project.toLowerCase().includes(search) || r.Activity.toLowerCase().includes(search));
            if (project) filtered = filtered.filter(r => r.Project === project);

            let kTotal = 0, jTotal = 0, grandTotal = 0;
            let kNeTotal = 0, jNeTotal = 0, grandNeTotal = 0;
            filtered.forEach(row => {
                kTotal += row['K-Tracked'];
                jTotal += row['J-Tracked'];
                grandTotal += row['Total-Tracked'];
                kNeTotal += row['K-NE'] || 0;
                jNeTotal += row['J-NE'] || 0;
                grandNeTotal += row['Total-NE'] || 0;
            });

            let html = '<table><thead><tr>';
            html += '<th style="width:30%;white-space:normal;line-height:1.3;">Project</th>';
            html += '<th style="width:28%;white-space:normal;line-height:1.3;">Activity</th>';
            html += '<th class="number" style="background:#1565c0;color:white;width:7%;font-size:12px;line-height:1.3;padding:10px 4px;">Tracked Units<br>Kashmir</th>';
            html += '<th class="number" style="background:#c62828;color:white;width:7%;font-size:12px;line-height:1.3;padding:10px 4px;">Tracked Units<br>Jammu</th>';
            html += '<th class="number" style="background:#6a1b9a;color:white;width:7%;font-size:12px;line-height:1.3;padding:10px 4px;">Tracked Units<br>Total</th>';
            html += '<th class="number" style="background:#455a64;color:white;width:7%;font-size:12px;line-height:1.3;padding:10px 4px;">Non-Existent Units<br>Kashmir</th>';
            html += '<th class="number" style="background:#6d4c41;color:white;width:7%;font-size:12px;line-height:1.3;padding:10px 4px;">Non-Existent Units<br>Jammu</th>';
            html += '<th class="number" style="background:#37474f;color:white;width:7%;font-size:12px;line-height:1.3;padding:10px 4px;">Non-Existent Units<br>Total</th>';
            html += '</tr></thead><tbody>';

            filtered.forEach(row => {
                html += `<tr>
                    <td class="project-cell">${row.Project}</td>
                    <td class="activity-cell">${row.Activity}</td>
                    <td class="number" style="color:#1565c0;background:#e3f2fd;font-weight:600">${row['K-Tracked'].toLocaleString()}</td>
                    <td class="number" style="color:#c62828;background:#ffebee;font-weight:600">${row['J-Tracked'].toLocaleString()}</td>
                    <td class="number" style="color:#6a1b9a;background:#f3e5f5;font-weight:700">${row['Total-Tracked'].toLocaleString()}</td>
                    <td class="number" style="color:#455a64;background:#eceff1;font-weight:600">${(row['K-NE'] || 0).toLocaleString()}</td>
                    <td class="number" style="color:#6d4c41;background:#efebe9;font-weight:600">${(row['J-NE'] || 0).toLocaleString()}</td>
                    <td class="number" style="color:#37474f;background:#d7ccc8;font-weight:700">${(row['Total-NE'] || 0).toLocaleString()}</td>
                </tr>`;
            });

            html += `<tr style="background:#f5f5f5;font-weight:bold;border-top:2px solid #333;">
                <td colspan="2" style="text-align:right;padding:12px;"><strong>Grand Total:</strong></td>
                <td class="number" style="color:#1565c0;background:#bbdefb;font-weight:700">${kTotal.toLocaleString()}</td>
                <td class="number" style="color:#c62828;background:#ffcdd2;font-weight:700">${jTotal.toLocaleString()}</td>
                <td class="number" style="color:#6a1b9a;background:#e1bee7;font-weight:700">${grandTotal.toLocaleString()}</td>
                <td class="number" style="color:#455a64;background:#cfd8dc;font-weight:700">${kNeTotal.toLocaleString()}</td>
                <td class="number" style="color:#6d4c41;background:#d7ccc8;font-weight:700">${jNeTotal.toLocaleString()}</td>
                <td class="number" style="color:#37474f;background:#bcaaa4;font-weight:700">${grandNeTotal.toLocaleString()}</td>
            </tr>`;

            html += '</tbody></table>';
            container.innerHTML = html;
        }

        function populateDistrictSelector() {
            const select = document.getElementById('districtSelector');
            select.innerHTML = '<option value="">&#127968; Select District</option>';
            
            // Add Kashmir districts
            const kashmirOptGroup = document.createElement('optgroup');
            kashmirOptGroup.label = 'Kashmir Division';
            KASHMIR_DISTRICTS.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d;
                opt.textContent = d;
                kashmirOptGroup.appendChild(opt);
            });
            select.appendChild(kashmirOptGroup);
            
            // Add Jammu districts
            const jammuOptGroup = document.createElement('optgroup');
            jammuOptGroup.label = 'Jammu Division';
            JAMMU_DISTRICTS.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d;
                opt.textContent = d;
                jammuOptGroup.appendChild(opt);
            });
            select.appendChild(jammuOptGroup);
            
            select.addEventListener('change', () => {
                saveViewState();
                renderDistrictData();
            });
        }

        let currentDistrict = '';
        let currentDistrictSection = 'applications'; // 'applications' or 'establishment' or 'tracking'
        let districtAppData = [];
        let districtEstabData = [];
        let districtTrackingData = [];

        function getDistrictSharedProject() {
            const state = loadViewState();
            return state.districtSharedProject || '';
        }

        function getDistrictSharedProjects() {
            const allData = [
                ...districtAppData,
                ...districtEstabData,
                ...districtTrackingData
            ];
            return getSortedProjects(allData);
        }

        function filterDistrictSectionByProject(data, project) {
            if (!project) return data;
            return data.filter(row => row.Project === project);
        }

        function renderDistrictData() {
            const container = document.getElementById('districtDataContainer');
            const district = document.getElementById('districtSelector')?.value || '';
            currentDistrict = district;
            
            if (!district) {
                container.innerHTML = '<p style="text-align:center;padding:40px;color:#666;">Please select a district to view data</p>';
                return;
            }
            
            const isKashmir = KASHMIR_DISTRICTS.includes(district);
            const division = isKashmir ? 'Kashmir' : 'Jammu';
            
            // Load district data
            loadDistrictData(district);
            
            // Build the view with stat boxes and section toggles
            let html = `<h3 style="margin-bottom:20px;color:#333;">${district} (${division} Division)</h3>`;
            
            // Top 4 stat boxes
            html += renderDistrictStatsBoxes(district);
            
            // Section toggle buttons
            html += '<div class="tabs" style="margin:20px 0;">';
            html += `<div class="tab ${currentDistrictSection === 'applications' ? 'active' : ''}" onclick="showDistrictSection('applications')">&#128203; ${district} - Application Processing</div>`;
            html += `<div class="tab ${currentDistrictSection === 'establishment' ? 'active' : ''}" onclick="showDistrictSection('establishment')">&#9989; ${district} - Establishments</div>`;
            html += `<div class="tab ${currentDistrictSection === 'tracking' ? 'active' : ''}" onclick="showDistrictSection('tracking')">&#128269; ${district} - Tracking</div>`;
            html += '</div>';
            
            // Active section content
            if (currentDistrictSection === 'applications') {
                html += renderDistrictApplicationsSection(district);
            } else if (currentDistrictSection === 'establishment') {
                html += renderDistrictEstablishmentSection(district);
            } else {
                html += renderDistrictTrackingSection(district);
            }
            
            container.innerHTML = html;
            
            // Setup event listeners for the new controls
            setupDistrictEventListeners();
        }

        function loadDistrictData(district) {
            districtAppData = [];
            districtEstabData = [];
            districtTrackingData = [];
            
            // Load Application Processing data
            if (rawSheetData && rawSheetData.length >= 5) {
                const districtRow = rawSheetData[2];
                const dataRows = rawSheetData.slice(4);
                
                let districtCol = -1;
                districtRow.forEach((val, idx) => {
                    if (val && val.trim().toUpperCase() === district.toUpperCase()) {
                        districtCol = idx;
                    }
                });
                
                if (districtCol !== -1) {
                    dataRows.forEach(row => {
                        if (!row[0]) return;
                        const apps = parseInt(row[districtCol]) || 0;
                        const appr = parseInt(row[districtCol + 1]) || 0;
                        if (apps > 0 || appr > 0) {
                            districtAppData.push({
                                Project: normalizeProjectName(row[0]),
                                Activity: normalizeActivityName(row[1] || ''),
                                Applications: apps,
                                Approvals: appr
                            });
                        }
                    });
                }
            }
            
            // Load Establishment data
            if (estabRawData && estabRawData.length >= 2) {
                const headers = estabRawData[0];
                const dataRows = estabRawData.slice(1);
                
                let districtCol = -1;
                headers.forEach((val, idx) => {
                    if (val && val.trim().toUpperCase() === district.toUpperCase()) {
                        districtCol = idx;
                    }
                });
                
                if (districtCol !== -1) {
                    dataRows.forEach(row => {
                        if (!row[0] || !row[1]) return;
                        const estab = parseInt(row[districtCol]) || 0;
                        if (estab > 0) {
                            districtEstabData.push({
                                Project: normalizeProjectName(row[0]),
                                Activity: normalizeActivityName(row[1]),
                                Estab: estab
                            });
                        }
                    });
                }
            }

            // Load Tracking data
            if (trackingRawData && trackingRawData.length >= 2) {
                const headers = trackingRawData[0];
                const dataRows = trackingRawData.slice(1);
                const neHeaders = neRawData && neRawData.length >= 2 ? neRawData[0] : [];
                const neRows = neRawData && neRawData.length >= 2 ? neRawData.slice(1) : [];
                const trackedByKey = new Map();
                const neByKey = new Map();

                let districtCol = -1;
                headers.forEach((val, idx) => {
                    if (val && val.trim().toUpperCase() === district.toUpperCase()) {
                        districtCol = idx;
                    }
                });

                let neDistrictCol = -1;
                neHeaders.forEach((val, idx) => {
                    if (val && val.trim().toUpperCase() === district.toUpperCase()) {
                        neDistrictCol = idx;
                    }
                });

                if (districtCol !== -1) {
                    dataRows.forEach(row => {
                        if (!row[0] || !row[1]) return;
                        const key = buildProjectActivityKey(row[0], row[1]);
                        trackedByKey.set(key, (trackedByKey.get(key) || 0) + (parseInt(row[districtCol]) || 0));
                    });
                }

                if (neDistrictCol !== -1) {
                    neRows.forEach(row => {
                        if (!row[0] || !row[1]) return;
                        const key = buildProjectActivityKey(row[0], row[1]);
                        neByKey.set(key, (neByKey.get(key) || 0) + (parseInt(row[neDistrictCol]) || 0));
                    });
                }

                const combinedKeys = new Set([...trackedByKey.keys(), ...neByKey.keys()]);
                combinedKeys.forEach(key => {
                    const [project, activity] = key.split('|||');
                    const tracked = trackedByKey.get(key) || 0;
                    const nonExistent = neByKey.get(key) || 0;
                    if (tracked > 0 || nonExistent > 0) {
                        districtTrackingData.push({
                            Project: project,
                            Activity: activity,
                            Tracked: tracked,
                            'Non-Existent': nonExistent
                        });
                    }
                });
            }

            districtAppData = mergeRowsByProjectActivity(districtAppData, ['Applications', 'Approvals']);
            districtEstabData = mergeRowsByProjectActivity(districtEstabData, ['Estab']);
            districtTrackingData = mergeRowsByProjectActivity(districtTrackingData, ['Tracked', 'Non-Existent']);
        }

        function renderDistrictStatsBoxes(district) {
            const totalApps = districtAppData.reduce((sum, r) => sum + r.Applications, 0);
            const totalAppr = districtAppData.reduce((sum, r) => sum + r.Approvals, 0);
            const totalEstab = districtEstabData.reduce((sum, r) => sum + r.Estab, 0);
            const totalTracked = districtTrackingData.reduce((sum, r) => sum + r.Tracked, 0);
            const approvalRate = totalApps > 0 ? ((totalAppr / totalApps) * 100).toFixed(1) + '%' : '0%';
            const estabRate = totalAppr > 0 ? ((totalEstab / totalAppr) * 100).toFixed(1) + '%' : '0%';
            const trackedRate = totalEstab > 0 ? ((totalTracked / totalEstab) * 100).toFixed(1) + '%' : '0%';
            
            return `
                <div class="stats-grid" style="margin-bottom:20px;">
                    <div class="stat-card kashmir">
                        <h3>&#128203; Applications</h3>
                        <div class="value">${totalApps.toLocaleString()}</div>
                        <p>Total Applications</p>
                    </div>
                    <div class="stat-card jammu">
                        <h3>&#10003; Approvals</h3>
                        <div class="value">${totalAppr.toLocaleString()}</div>
                        <p>Total Approvals</p>
                        <div style="margin-top:8px;font-size:0.9em">(${approvalRate})</div>
                    </div>
                    <div class="stat-card total">
                        <h3>&#9989; Established</h3>
                        <div class="value">${totalEstab.toLocaleString()}</div>
                        <p>Units Established</p>
                        <div style="margin-top:8px;font-size:0.9em">(${estabRate} of Appr)</div>
                    </div>
                    <div class="stat-card total" style="border-left:5px solid #8e44ad">
                        <h3>&#128269; Tracked</h3>
                        <div class="value">${totalTracked.toLocaleString()}</div>
                        <p>Tracked Units</p>
                        <div style="margin-top:8px;font-size:0.9em">(${trackedRate} of Estab)</div>
                    </div>
                </div>
            `;
        }

        function showDistrictSection(section) {
            currentDistrictSection = section;
            saveViewState();
            renderDistrictData();
        }

        function renderDistrictApplicationsSection(district) {
            const projects = getDistrictSharedProjects();
            const selectedProject = getDistrictSharedProject();
            const summaryData = filterDistrictSectionByProject(districtAppData, selectedProject);
            
            let html = '<div class="table-section">';
            
            // Section stat boxes
            const totalApps = summaryData.reduce((sum, r) => sum + r.Applications, 0);
            const totalAppr = summaryData.reduce((sum, r) => sum + r.Approvals, 0);
            const approvalRate = totalApps > 0 ? ((totalAppr / totalApps) * 100).toFixed(1) + '%' : '0%';
            const summaryLabel = selectedProject ? 'Selected Project' : 'Total';
            
            html += '<div class="stats-grid" style="margin-bottom:20px;">';
            html += `<div class="stat-card kashmir"><h3>&#128203; Applications</h3><div class="value">${totalApps.toLocaleString()}</div><p>${summaryLabel}</p></div>`;
            html += `<div class="stat-card jammu"><h3>&#10003; Approvals</h3><div class="value">${totalAppr.toLocaleString()}</div><p>${summaryLabel}</p></div>`;
            html += `<div class="stat-card total"><h3>&#128202; Approval Rate</h3><div class="value">${approvalRate}</div><p>${selectedProject ? 'for Selected Project' : 'of Applications'}</p></div>`;
            html += '</div>';
            
            // Controls
            html += '<div class="controls">';
            html += '<input type="text" id="distAppSearch" placeholder="&#128269; Search project or activity...">';
            html += '<select id="distAppProject"><option value="">&#128193; All Projects</option>';
            projects.forEach(p => html += `<option value="${p}"${p === selectedProject ? ' selected' : ''}>${p}</option>`);
            html += '</select></div>';
            
            // Table
            html += '<div id="distAppTableContainer"></div>';
            html += '</div>';
            
            return html;
        }

        function renderDistrictEstablishmentSection(district) {
            const projects = getDistrictSharedProjects();
            const selectedProject = getDistrictSharedProject();
            const summaryData = filterDistrictSectionByProject(districtEstabData, selectedProject);
            const summaryAppData = filterDistrictSectionByProject(districtAppData, selectedProject);
            
            let html = '<div class="table-section">';
            
            // Section stat boxes
            const totalEstab = summaryData.reduce((sum, r) => sum + r.Estab, 0);
            const totalAppr = summaryAppData.reduce((sum, r) => sum + r.Approvals, 0);
            const estabRate = totalAppr > 0 ? ((totalEstab / totalAppr) * 100).toFixed(1) + '%' : '0%';
            const summaryLabel = selectedProject ? 'Selected Project' : 'Total Units';
            
            html += '<div class="stats-grid" style="margin-bottom:20px;">';
            html += `<div class="stat-card total" style="border-left:5px solid #00695c"><h3>&#9989; Established</h3><div class="value">${totalEstab.toLocaleString()}</div><p>${summaryLabel}</p></div>`;
            html += `<div class="stat-card kashmir"><h3>&#10003; Approvals</h3><div class="value">${totalAppr.toLocaleString()}</div><p>${selectedProject ? 'Project Reference' : 'Reference'}</p></div>`;
            html += `<div class="stat-card jammu"><h3>&#128202; Estab Rate</h3><div class="value">${estabRate}</div><p>${selectedProject ? 'for Selected Project' : 'of Approvals'}</p></div>`;
            html += '</div>';
            
            // Controls
            html += '<div class="controls">';
            html += '<input type="text" id="distEstabSearch" placeholder="&#128269; Search project or activity...">';
            html += '<select id="distEstabProject"><option value="">&#128193; All Projects</option>';
            projects.forEach(p => html += `<option value="${p}"${p === selectedProject ? ' selected' : ''}>${p}</option>`);
            html += '</select></div>';
            
            // Table
            html += '<div id="distEstabTableContainer"></div>';
            html += '</div>';
            
            return html;
        }

        function renderDistrictTrackingSection(district) {
            const projects = getDistrictSharedProjects();
            const selectedProject = getDistrictSharedProject();
            const summaryData = filterDistrictSectionByProject(districtTrackingData, selectedProject);
            const summaryEstabData = filterDistrictSectionByProject(districtEstabData, selectedProject);

            let html = '<div class="table-section">';

            const totalTracked = summaryData.reduce((sum, r) => sum + r.Tracked, 0);
            const totalEstab = summaryEstabData.reduce((sum, r) => sum + r.Estab, 0);
            const trackedRate = totalEstab > 0 ? ((totalTracked / totalEstab) * 100).toFixed(1) + '%' : '0%';
            const summaryLabel = selectedProject ? 'Selected Project' : 'Total Units';

            html += '<div class="stats-grid" style="margin-bottom:20px;">';
            html += `<div class="stat-card total" style="border-left:5px solid #8e44ad"><h3>&#128269; Tracked</h3><div class="value">${totalTracked.toLocaleString()}</div><p>${summaryLabel}</p></div>`;
            html += `<div class="stat-card total" style="border-left:5px solid #00695c"><h3>&#9989; Established</h3><div class="value">${totalEstab.toLocaleString()}</div><p>${selectedProject ? 'Project Reference' : 'Reference'}</p></div>`;
            html += `<div class="stat-card jammu"><h3>&#128202; Tracking Rate</h3><div class="value">${trackedRate}</div><p>${selectedProject ? 'for Selected Project' : 'of Established'}</p></div>`;
            html += '</div>';

            html += '<div class="controls">';
            html += '<input type="text" id="distTrackingSearch" placeholder="&#128269; Search project or activity...">';
            html += '<select id="distTrackingProject"><option value="">&#128193; All Projects</option>';
            projects.forEach(p => html += `<option value="${p}"${p === selectedProject ? ' selected' : ''}>${p}</option>`);
            html += '</select></div>';

            html += '<div id="distTrackingTableContainer"></div>';
            html += '</div>';

            return html;
        }

        function setupDistrictEventListeners() {
            const appSearch = document.getElementById('distAppSearch');
            const appProject = document.getElementById('distAppProject');
            const estabSearch = document.getElementById('distEstabSearch');
            const estabProject = document.getElementById('distEstabProject');
            
            if (appSearch) appSearch.addEventListener('input', () => {
                saveViewState();
                renderDistrictAppTable();
            });
            if (appProject) appProject.addEventListener('change', () => {
                saveViewState();
                renderDistrictData();
            });
            if (estabSearch) estabSearch.addEventListener('input', () => {
                saveViewState();
                renderDistrictEstabTable();
            });
            if (estabProject) estabProject.addEventListener('change', () => {
                saveViewState();
                renderDistrictData();
            });
            const trackingSearch = document.getElementById('distTrackingSearch');
            const trackingProject = document.getElementById('distTrackingProject');
            if (trackingSearch) trackingSearch.addEventListener('input', () => {
                saveViewState();
                renderDistrictTrackingTable();
            });
            if (trackingProject) trackingProject.addEventListener('change', () => {
                saveViewState();
                renderDistrictData();
            });
            
            // Initial render
            if (currentDistrictSection === 'applications') {
                renderDistrictAppTable();
            } else if (currentDistrictSection === 'establishment') {
                renderDistrictEstabTable();
            } else {
                renderDistrictTrackingTable();
            }
        }

        function renderDistrictAppTable() {
            const container = document.getElementById('distAppTableContainer');
            if (!container) return;
            
            const search = document.getElementById('distAppSearch')?.value?.toLowerCase() || '';
            const project = document.getElementById('distAppProject')?.value || '';
            
            let filtered = sortByProjectOrder(districtAppData);
            if (search) filtered = filtered.filter(r => r.Project.toLowerCase().includes(search) || r.Activity.toLowerCase().includes(search));
            if (project) filtered = filtered.filter(r => r.Project === project);
            
            // Calculate totals
            let totalApps = 0, totalAppr = 0;
            filtered.forEach(r => {
                totalApps += r.Applications;
                totalAppr += r.Approvals;
            });
            
            let html = '<table><thead><tr>';
            html += '<th style="width:30%;">Project</th>';
            html += '<th style="width:50%;">Activity</th>';
            html += '<th class="number" style="background:#1565c0;color:white;">Applications</th>';
            html += '<th class="number" style="background:#0d47a1;color:white;">Approvals</th>';
            html += '</tr></thead><tbody>';
            
            filtered.forEach(row => {
                html += `<tr>
                    <td class="project-cell">${row.Project}</td>
                    <td class="activity-cell">${row.Activity}</td>
                    <td class="number" style="color:#1565c0;background:#e3f2fd;font-weight:600">${row.Applications.toLocaleString()}</td>
                    <td class="number" style="color:#0d47a1;background:#e3f2fd;font-weight:600">${row.Approvals.toLocaleString()}</td>
                </tr>`;
            });
            
            // Grand total
            html += `<tr style="background:#f5f5f5;font-weight:bold;border-top:2px solid #333;">
                <td colspan="2" style="text-align:right;padding:12px;"><strong>Grand Total:</strong></td>
                <td class="number" style="color:#1565c0;background:#bbdefb;font-weight:700">${totalApps.toLocaleString()}</td>
                <td class="number" style="color:#0d47a1;background:#bbdefb;font-weight:700">${totalAppr.toLocaleString()}</td>
            </tr>`;
            
            html += '</tbody></table>';
            container.innerHTML = html;
        }

        function renderDistrictEstabTable() {
            const container = document.getElementById('distEstabTableContainer');
            if (!container) return;
            
            const search = document.getElementById('distEstabSearch')?.value?.toLowerCase() || '';
            const project = document.getElementById('distEstabProject')?.value || '';
            
            let filtered = sortByProjectOrder(districtEstabData);
            if (search) filtered = filtered.filter(r => r.Project.toLowerCase().includes(search) || r.Activity.toLowerCase().includes(search));
            if (project) filtered = filtered.filter(r => r.Project === project);
            
            // Calculate totals
            let totalEstab = 0;
            filtered.forEach(r => totalEstab += r.Estab);
            
            let html = '<table><thead><tr>';
            html += '<th style="width:30%;">Project</th>';
            html += '<th style="width:60%;">Activity</th>';
            html += '<th class="number" style="background:#00695c;color:white;">Units Established</th>';
            html += '</tr></thead><tbody>';
            
            filtered.forEach(row => {
                html += `<tr>
                    <td class="project-cell">${row.Project}</td>
                    <td class="activity-cell">${row.Activity}</td>
                    <td class="number" style="color:#00695c;background:#e0f2f1;font-weight:700">${row.Estab.toLocaleString()}</td>
                </tr>`;
            });
            
            // Grand total
            html += `<tr style="background:#f5f5f5;font-weight:bold;border-top:2px solid #333;">
                <td colspan="2" style="text-align:right;padding:12px;"><strong>Grand Total:</strong></td>
                <td class="number" style="color:#00695c;background:#b2dfdb;font-weight:700">${totalEstab.toLocaleString()}</td>
            </tr>`;
            
            html += '</tbody></table>';
            container.innerHTML = html;
        }

        function renderDistrictTrackingTable() {
            const container = document.getElementById('distTrackingTableContainer');
            if (!container) return;

            const search = document.getElementById('distTrackingSearch')?.value?.toLowerCase() || '';
            const project = document.getElementById('distTrackingProject')?.value || '';

            let filtered = sortByProjectOrder(districtTrackingData);
            if (search) filtered = filtered.filter(r => r.Project.toLowerCase().includes(search) || r.Activity.toLowerCase().includes(search));
            if (project) filtered = filtered.filter(r => r.Project === project);

            let totalTracked = 0;
            let totalNonExistent = 0;
            filtered.forEach(r => {
                totalTracked += r.Tracked;
                totalNonExistent += r['Non-Existent'] || 0;
            });

            let html = '<table><thead><tr>';
            html += '<th style="width:30%;">Project</th>';
            html += '<th style="width:45%;">Activity</th>';
            html += '<th class="number" style="background:#6a1b9a;color:white;">Units Tracked</th>';
            html += '<th class="number" style="background:#37474f;color:white;">Non-Existent Units</th>';
            html += '</tr></thead><tbody>';

            filtered.forEach(row => {
                html += `<tr>
                    <td class="project-cell">${row.Project}</td>
                    <td class="activity-cell">${row.Activity}</td>
                    <td class="number" style="color:#6a1b9a;background:#f3e5f5;font-weight:700">${row.Tracked.toLocaleString()}</td>
                    <td class="number" style="color:#37474f;background:#eceff1;font-weight:700">${(row['Non-Existent'] || 0).toLocaleString()}</td>
                </tr>`;
            });

            html += `<tr style="background:#f5f5f5;font-weight:bold;border-top:2px solid #333;">
                <td colspan="2" style="text-align:right;padding:12px;"><strong>Grand Total:</strong></td>
                <td class="number" style="color:#6a1b9a;background:#e1bee7;font-weight:700">${totalTracked.toLocaleString()}</td>
                <td class="number" style="color:#37474f;background:#cfd8dc;font-weight:700">${totalNonExistent.toLocaleString()}</td>
            </tr>`;

            html += '</tbody></table>';
            container.innerHTML = html;
        }

        function showTab(tabName) {
            setActiveTopTab(tabName);
            saveViewState();
        }

        function showConfigHelp() {
            alert(`Setup Instructions:

1. Get Sheet ID:
   - Open your Google Sheet
   - Copy the ID from URL (between /d/ and /edit)
   - Example: 1ABC123xyz...

2. Create Apps Script backend:
   - Open script.new
   - Paste the Code.gs file from V2/google-apps-script
   - Add SHEET_ID in Script Properties

3. Deploy as web app:
   - Deploy -> New deployment -> Web app
   - Execute as: Me
   - Access: Anyone

4. Edit app.js:
   - Find APPS_SCRIPT_URL
   - Replace it with your deployed web app URL

5. Re-deploy Apps Script after backend changes:
   - Update the web app deployment so sheetLastUpdated is returned`);
        }

        // Auto-refresh every 30 minutes
        setInterval(() => {
            if (APPS_SCRIPT_URL !== 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
                loadData();
            }
        }, 1800000);

