// Content Management JavaScript
// Handles topics, content library, file uploads, URLs, AI training data, and analytics

// Mock Data
const mockTopics = [
    { id: 1, nameEn: 'Safety Procedures', nameJa: '安全手順', category: 'Safety', description: 'Basic safety protocols for construction sites', priority: 'high', status: 'active', materials: 12, trained: 45 },
    { id: 2, nameEn: 'Greetings & Introductions', nameJa: '挨拶と自己紹介', category: 'Basic Phrases', description: 'Essential Japanese greetings and self-introduction phrases', priority: 'high', status: 'active', materials: 8, trained: 52 },
    { id: 3, nameEn: 'Japanese Etiquette', nameJa: '日本のエチケット', category: 'Business Norms', description: 'Cultural norms and workplace etiquette in Japan', priority: 'medium', status: 'active', materials: 15, trained: 38 },
    { id: 4, nameEn: 'Emergency Phrases', nameJa: '緊急時のフレーズ', category: 'Emergency', description: 'Critical phrases for emergency situations', priority: 'high', status: 'active', materials: 6, trained: 50 }
];

const mockContent = [
    { id: 1, title: 'Construction Safety Guide', type: 'Document', topics: ['Safety'], language: 'Both', dateAdded: '2024-03-20', views: 120, icon: 'fa-file-pdf' },
    { id: 2, title: 'National Safety Regulations', type: 'URL', topics: ['Safety'], language: 'Japanese', dateAdded: '2024-03-18', views: 89, icon: 'fa-link' },
    { id: 3, title: 'Common Greetings Audio', type: 'Audio', topics: ['Greetings'], language: 'Japanese', dateAdded: '2024-03-15', views: 145, icon: 'fa-file-audio' },
    { id: 4, title: 'Business Etiquette Manual', type: 'Document', topics: ['Etiquette'], language: 'Both', dateAdded: '2024-03-12', views: 98, icon: 'fa-file-word' }
];

const mockUrls = [
    { id: 1, url: 'https://jisha.or.jp/english/', title: 'JISHA Safety Standards', status: 'Active', topics: ['Safety'], lastScraped: '2024-03-20', health: 'good' },
    { id: 2, url: 'https://www.mlit.go.jp/', title: 'MLIT Construction Guidelines', status: 'Active', topics: ['Safety'], lastScraped: '2024-03-19', health: 'good' }
];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeModals();
    initializeQuickActions();
});

// Tab Management
function initializeTabs() {
    const tabs = document.querySelectorAll('#contentTabs li');
    const container = document.getElementById('tabContentContainer');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            tabs.forEach(t => t.classList.remove('is-active'));
            tab.classList.add('is-active');
            loadTabContent(tabName, container);
        });
    });

    loadTabContent('topics', container);
}

function loadTabContent(tabName, container) {
    switch(tabName) {
        case 'topics': container.innerHTML = getTopicsContent(); break;
        case 'library': container.innerHTML = getLibraryContent(); break;
        case 'upload': container.innerHTML = getUploadContent(); break;
        case 'urls': container.innerHTML = getUrlsContent(); break;
        case 'ai-data': container.innerHTML = getAiDataContent(); break;
        case 'analytics': container.innerHTML = getAnalyticsContent(); break;
    }
}

// Generate Topics Content
function getTopicsContent() {
    const topicsGrid = mockTopics.map(topic => {
        const isActive = topic.status === 'active';
        const statusTag = isActive 
            ? '<span class="tag is-success"><i class="fas fa-check-circle mr-1"></i>Active</span>'
            : '<span class="tag"><i class="fas fa-pause-circle mr-1"></i>Inactive</span>';
        const statusBtn = isActive
            ? '<button class="button is-light is-small" onclick="deactivateTopic(' + topic.id + ')"><span class="icon"><i class="fas fa-pause"></i></span><span>Deactivate</span></button>'
            : '<button class="button is-success is-small" onclick="activateTopic(' + topic.id + ')"><span class="icon"><i class="fas fa-play"></i></span><span>Activate</span></button>';
        
        return `
        <div class="column is-4">
            <div class="box ${!isActive ? 'has-background-light' : ''}" style="${!isActive ? 'opacity: 0.7;' : ''}">
                <div class="level mb-3">
                    <div class="level-left">${statusTag}</div>
                    <div class="level-right"><span class="tag is-light"><i class="fas fa-tag mr-1"></i>${topic.category}</span></div>
                </div>
                <h3 class="title is-5">${topic.nameEn}</h3>
                <h4 class="subtitle is-6 has-text-grey">${topic.nameJa}</h4>
                <p class="mb-3" style="font-size: 0.9rem;">${topic.description}</p>
                <div class="level is-mobile mb-3">
                    <div class="level-left">
                        <span class="icon-text">
                            <span class="icon has-text-grey"><i class="fas fa-file-alt"></i></span>
                            <span class="has-text-weight-semibold">${topic.materials}</span>
                            <span class="has-text-grey ml-1">materials</span>
                        </span>
                    </div>
                    <div class="level-right">
                        <span class="icon-text">
                            <span class="icon has-text-grey"><i class="fas fa-users"></i></span>
                            <span class="has-text-weight-semibold">${topic.trained}</span>
                            <span class="has-text-grey ml-1">trained</span>
                        </span>
                    </div>
                </div>
                <hr>
                <div class="buttons are-small">
                    <button class="button is-info is-small" onclick="editTopic(${topic.id})">
                        <span class="icon"><i class="fas fa-edit"></i></span>
                        <span>Edit</span>
                    </button>
                    ${statusBtn}
                    <button class="button is-danger is-small is-light" onclick="deleteTopic(${topic.id})">
                        <span class="icon"><i class="fas fa-trash"></i></span>
                    </button>
                </div>
            </div>
        </div>
    `;
    }).join('');

    return `
        <div class="notification is-info is-light mb-4">
            <p><strong><i class="fas fa-info-circle mr-2"></i>Topic Management:</strong> Topics control which training content is available. Active topics are visible to employees. Use the toggle buttons to activate/deactivate topics.</p>
        </div>
        <div class="level mb-4">
            <div class="level-left">
                <div class="field has-addons">
                    <p class="control">
                        <input class="input" type="text" placeholder="Search by topic name..." id="topicSearch">
                    </p>
                    <p class="control">
                        <button class="button is-primary" onclick="searchTopics()">
                            <span class="icon"><i class="fas fa-search"></i></span>
                        </button>
                    </p>
                </div>
            </div>
            <div class="level-right">
                <div class="level-item">
                    <div class="field">
                        <label class="label is-small">Filter by Category</label>
                        <div class="select">
                            <select id="categoryFilter" onchange="filterTopics()">
                                <option value="all">All Categories</option>
                                <option value="safety">Safety</option>
                                <option value="basic">Basic Phrases</option>
                                <option value="business">Business Norms</option>
                                <option value="emergency">Emergency</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="level-item">
                    <div class="field">
                        <label class="label is-small">Filter by Status</label>
                        <div class="select">
                            <select id="statusFilter" onchange="filterTopics()">
                                <option value="all">All Status</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="level mb-3">
            <div class="level-left">
                <p class="has-text-grey"><strong>${mockTopics.length}</strong> topics total | <strong>${mockTopics.filter(t => t.status === 'active').length}</strong> active</p>
            </div>
            <div class="level-right">
                <button class="button is-primary" id="addNewTopicBtn" onclick="openAddTopicModal()">
                    <span class="icon"><i class="fas fa-plus"></i></span>
                    <span>Add New Topic</span>
                </button>
            </div>
        </div>
        <div class="columns is-multiline" id="topicsGridContainer">${topicsGrid}</div>
    `;
}

// Topic Action Functions
function editTopic(id) {
    alert('Edit Topic ' + id + ': This would open an edit modal with the topic details.');
}

function activateTopic(id) {
    alert('Activating Topic ' + id + ': This topic will now be visible to employees for training.');
    // In production: Update database and refresh
}

function deactivateTopic(id) {
    if(confirm('Deactivate this topic? It will be hidden from employees but content will be preserved.')) {
        alert('Topic ' + id + ' deactivated. Employees can no longer access this training content.');
        // In production: Update database and refresh
    }
}

function deleteTopic(id) {
    if(confirm('Delete this topic permanently? This will also remove all associated content and cannot be undone!')) {
        alert('Topic ' + id + ' deleted permanently.');
        // In production: Update database and refresh
    }
}

function searchTopics() {
    const query = document.getElementById('topicSearch').value;
    alert('Searching for: "' + query + '"');
}

function filterTopics() {
    const category = document.getElementById('categoryFilter').value;
    const status = document.getElementById('statusFilter').value;
    alert('Filtering by Category: ' + category + ', Status: ' + status);
}

function openAddTopicModal() {
    const modal = document.getElementById('addTopicModal');
    modal.classList.add('is-active');
}

function submitNewTopic() {
    alert('New topic created successfully! In production, this would save to database and refresh the topics list.');
    closeModal(document.getElementById('addTopicModal'));
}

// Generate Library Content
function getLibraryContent() {
    const contentRows = mockContent.map(item => `
        <tr>
            <td><input type="checkbox"></td>
            <td><span class="icon-text"><span class="icon"><i class="fas ${item.icon}"></i></span><span>${item.title}</span></span></td>
            <td><span class="tag">${item.type}</span></td>
            <td><span class="tag is-light is-small">${item.topics[0]}</span></td>
            <td>${item.language}</td>
            <td>${item.dateAdded}</td>
            <td>${item.views}</td>
            <td>
                <div class="buttons are-small">
                    <button class="button is-info is-small"><span class="icon"><i class="fas fa-eye"></i></span></button>
                    <button class="button is-light is-small"><span class="icon"><i class="fas fa-edit"></i></span></button>
                    <button class="button is-danger is-small"><span class="icon"><i class="fas fa-trash"></i></span></button>
                </div>
            </td>
        </tr>
    `).join('');

    return `
        <div class="level mb-4">
            <div class="level-left">
                <div class="field has-addons">
                    <p class="control"><input class="input" type="text" placeholder="Search content..."></p>
                    <p class="control"><button class="button is-primary"><span class="icon"><i class="fas fa-search"></i></span></button></p>
                </div>
            </div>
            <div class="level-right">
                <div class="select mr-2">
                    <select><option>All Types</option><option>Document</option><option>URL</option><option>Audio</option></select>
                </div>
                <div class="select">
                    <select><option>All Topics</option><option>Safety</option><option>Greetings</option></select>
                </div>
            </div>
        </div>
        <div class="table-container">
            <table class="table is-fullwidth is-striped is-hoverable">
                <thead><tr><th><input type="checkbox"></th><th>Title</th><th>Type</th><th>Topics</th><th>Language</th><th>Date Added</th><th>Views</th><th>Actions</th></tr></thead>
                <tbody>${contentRows}</tbody>
            </table>
        </div>
        <div class="buttons mt-4">
            <button class="button is-light"><span class="icon"><i class="fas fa-tag"></i></span><span>Bulk Tag Assignment</span></button>
            <button class="button is-light"><span class="icon"><i class="fas fa-archive"></i></span><span>Archive Selected</span></button>
            <button class="button is-danger is-light"><span class="icon"><i class="fas fa-trash"></i></span><span>Delete Selected</span></button>
        </div>
    `;
}

// Generate Upload Content
function getUploadContent() {
    return `
        <div class="notification is-info is-light mb-5">
            <p><strong>Supported Formats:</strong> PDF, DOCX, TXT, XLSX, CSV, MP3, WAV, JPG, PNG</p>
            <p><strong>Maximum File Size:</strong> 50 MB per file</p>
        </div>
        <div class="box has-text-centered" id="dropZone" style="border: 3px dashed #000; padding: 4rem; cursor: pointer;">
            <span class="icon is-large mb-3" style="font-size: 4rem;"><i class="fas fa-cloud-upload-alt"></i></span>
            <p class="title is-5">Drag & Drop Files Here</p>
            <p class="subtitle is-6">or click to browse</p>
            <input type="file" id="fileInput" multiple style="display: none;">
            <button class="button is-primary mt-3" id="browseFilesBtn">
                <span class="icon"><i class="fas fa-folder-open"></i></span><span>Browse Files</span>
            </button>
        </div>
        <div id="fileList" class="mt-5"></div>
    `;
}

// Generate URLs Content
function getUrlsContent() {
    const urlRows = mockUrls.map(url => `
        <tr>
            <td><span class="icon-text"><span class="icon"><i class="fas fa-link"></i></span><span>${url.title}</span></span></td>
            <td><a href="${url.url}" target="_blank">${url.url}</a></td>
            <td><span class="tag is-success">${url.status}</span></td>
            <td><span class="tag is-light is-small">${url.topics.join(', ')}</span></td>
            <td>${url.lastScraped}</td>
            <td>
                <div class="buttons are-small">
                    <button class="button is-info is-small"><span class="icon"><i class="fas fa-external-link-alt"></i></span></button>
                    <button class="button is-light is-small"><span class="icon"><i class="fas fa-edit"></i></span></button>
                    <button class="button is-danger is-small"><span class="icon"><i class="fas fa-trash"></i></span></button>
                </div>
            </td>
        </tr>
    `).join('');

    return `
        <div class="level mb-4">
            <div class="level-left"><h3 class="title is-5">URL Resources</h3></div>
            <div class="level-right"><button class="button is-primary" id="addUrlModalBtn"><span class="icon"><i class="fas fa-plus"></i></span><span>Add URL</span></button></div>
        </div>
        <div class="table-container">
            <table class="table is-fullwidth is-striped is-hoverable">
                <thead><tr><th>Title</th><th>URL</th><th>Status</th><th>Topics</th><th>Last Scraped</th><th>Actions</th></tr></thead>
                <tbody>${urlRows}</tbody>
            </table>
        </div>
    `;
}

// Generate AI Data Content
function getAiDataContent() {
    return `
        <div class="notification is-info is-light mb-4">
            <p><strong><i class="fas fa-robot mr-2"></i>AI Training Data:</strong> Shows how your content is processed for AI-powered training. Better quality content = better employee learning outcomes.</p>
        </div>
        
        <div class="columns mb-4">
            <div class="column is-4">
                <div class="box has-text-centered">
                    <span class="icon is-large has-text-primary mb-2" style="font-size: 3rem;">
                        <i class="fas fa-brain"></i>
                    </span>
                    <h3 class="title is-5">Content Quality Score</h3>
                    <p class="title is-2">85</p>
                    <progress class="progress is-primary" value="85" max="100">85%</progress>
                    <p class="has-text-grey mt-2">out of 100</p>
                </div>
            </div>
            <div class="column is-4">
                <div class="box has-text-centered">
                    <span class="icon is-large has-text-info mb-2" style="font-size: 3rem;">
                        <i class="fas fa-language"></i>
                    </span>
                    <h3 class="title is-5">Language Pairs</h3>
                    <p class="title is-2">1,243</p>
                    <p class="has-text-grey">Japanese-English translations extracted</p>
                </div>
            </div>
            <div class="column is-4">
                <div class="box has-text-centered">
                    <span class="icon is-large has-text-success mb-2" style="font-size: 3rem;">
                        <i class="fas fa-check-double"></i>
                    </span>
                    <h3 class="title is-5">Training Ready</h3>
                    <p class="title is-2">42</p>
                    <p class="has-text-grey">materials processed and ready</p>
                </div>
            </div>
        </div>

        <div class="box">
            <h3 class="title is-5 mb-4">
                <i class="fas fa-chart-line mr-2"></i>AI Processing by Topic
            </h3>
            <p class="has-text-grey mb-3">Shows how AI training data is distributed across your active topics:</p>
            
            <div class="content">
                <div class="mb-4">
                    <div class="level is-mobile mb-2">
                        <div class="level-left">
                            <strong><i class="fas fa-hard-hat mr-2"></i>Safety Procedures</strong>
                        </div>
                        <div class="level-right">
                            <span class="tag is-primary">325 phrases</span>
                            <span class="tag is-success ml-2"><i class="fas fa-check mr-1"></i>Active</span>
                        </div>
                    </div>
                    <progress class="progress is-primary" value="75" max="100">75%</progress>
                    <p class="has-text-grey is-size-7">Quality: 75% | 12 materials contributing to AI training</p>
                </div>

                <div class="mb-4">
                    <div class="level is-mobile mb-2">
                        <div class="level-left">
                            <strong><i class="fas fa-comments mr-2"></i>Greetings & Introductions</strong>
                        </div>
                        <div class="level-right">
                            <span class="tag is-info">280 phrases</span>
                            <span class="tag is-success ml-2"><i class="fas fa-check mr-1"></i>Active</span>
                        </div>
                    </div>
                    <progress class="progress is-info" value="88" max="100">88%</progress>
                    <p class="has-text-grey is-size-7">Quality: 88% | 8 materials contributing to AI training</p>
                </div>

                <div class="mb-4">
                    <div class="level is-mobile mb-2">
                        <div class="level-left">
                            <strong><i class="fas fa-briefcase mr-2"></i>Japanese Etiquette</strong>
                        </div>
                        <div class="level-right">
                            <span class="tag is-warning">420 phrases</span>
                            <span class="tag is-success ml-2"><i class="fas fa-check mr-1"></i>Active</span>
                        </div>
                    </div>
                    <progress class="progress is-warning" value="92" max="100">92%</progress>
                    <p class="has-text-grey is-size-7">Quality: 92% | 15 materials contributing to AI training</p>
                </div>

                <div class="mb-4">
                    <div class="level is-mobile mb-2">
                        <div class="level-left">
                            <strong><i class="fas fa-exclamation-triangle mr-2"></i>Emergency Phrases</strong>
                        </div>
                        <div class="level-right">
                            <span class="tag is-danger">218 phrases</span>
                            <span class="tag is-success ml-2"><i class="fas fa-check mr-1"></i>Active</span>
                        </div>
                    </div>
                    <progress class="progress is-danger" value="95" max="100">95%</progress>
                    <p class="has-text-grey is-size-7">Quality: 95% | 6 materials contributing to AI training</p>
                </div>
            </div>
        </div>

        <div class="columns">
            <div class="column is-6">
                <div class="box">
                    <h3 class="title is-6 mb-3"><i class="fas fa-lightbulb mr-2"></i>Content Gap Analysis</h3>
                    <div class="notification is-warning is-light">
                        <p class="has-text-weight-semibold mb-2">Recommendations to improve AI training:</p>
                        <ul style="margin-left: 1.5rem;">
                            <li class="mb-2"><strong>Daily Conversations:</strong> Only 45 phrases extracted. Add more conversational content.</li>
                            <li class="mb-2"><strong>Business Norms:</strong> Consider adding audio materials for better pronunciation training.</li>
                            <li><strong>Safety Procedures:</strong> Update with 2024 regulations for current compliance.</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="column is-6">
                <div class="box">
                    <h3 class="title is-6 mb-3"><i class="fas fa-info-circle mr-2"></i>How It Works</h3>
                    <div class="content" style="font-size: 0.9rem;">
                        <p><strong>1. Content Analysis:</strong> AI scans all active topic materials</p>
                        <p><strong>2. Language Extraction:</strong> Identifies Japanese-English phrase pairs</p>
                        <p><strong>3. Quality Scoring:</strong> Evaluates clarity, accuracy, and completeness</p>
                        <p><strong>4. Training Optimization:</strong> Optimizes for employee learning effectiveness</p>
                        <p class="has-text-success mt-3"><i class="fas fa-check-circle mr-2"></i>Only <strong>active topics</strong> contribute to AI training data</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Generate Analytics Content
function getAnalyticsContent() {
    return `
        <div class="columns is-multiline">
            <div class="column is-6">
                <div class="box">
                    <h3 class="title is-5">Most Used Content</h3>
                    <table class="table is-fullwidth">
                        <tbody>
                            <tr><td>Emergency Phrases</td><td><span class="tag">156 views</span></td></tr>
                            <tr><td>Common Greetings Audio</td><td><span class="tag">145 views</span></td></tr>
                            <tr><td>Safety Guide</td><td><span class="tag">120 views</span></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="column is-6">
                <div class="box">
                    <h3 class="title is-5">Content by Type</h3>
                    <table class="table is-fullwidth">
                        <tbody>
                            <tr><td>Documents</td><td><span class="tag">28</span></td></tr>
                            <tr><td>URLs</td><td><span class="tag">15</span></td></tr>
                            <tr><td>Audio</td><td><span class="tag">5</span></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="box">
            <h3 class="title is-5">Employee Engagement by Topic</h3>
            <div class="content">
                <div class="mb-3">
                    <p><strong>Safety Procedures:</strong></p>
                    <progress class="progress is-primary" value="90" max="100">90%</progress>
                </div>
                <div class="mb-3">
                    <p><strong>Greetings:</strong></p>
                    <progress class="progress is-primary" value="85" max="100">85%</progress>
                </div>
                <div class="mb-3">
                    <p><strong>Business Norms:</strong></p>
                    <progress class="progress is-primary" value="75" max="100">75%</progress>
                </div>
            </div>
        </div>
        <div class="buttons">
            <button class="button is-primary"><span class="icon"><i class="fas fa-download"></i></span><span>Export Full Report</span></button>
            <button class="button is-light"><span class="icon"><i class="fas fa-file-excel"></i></span><span>Export to CSV</span></button>
        </div>
    `;
}

// Modal Management
function initializeModals() {
    const addTopicBtn = document.getElementById('addTopicBtn');
    const addUrlBtn = document.getElementById('addUrlBtn');
    const addTopicModal = document.getElementById('addTopicModal');
    const addUrlModal = document.getElementById('addUrlModal');

    addTopicBtn?.addEventListener('click', () => openModal(addTopicModal));
    addUrlBtn?.addEventListener('click', () => openModal(addUrlModal));

    document.querySelectorAll('.modal-background, .modal .delete').forEach(el => {
        el.addEventListener('click', (e) => {
            closeModal(e.target.closest('.modal'));
        });
    });
}

function openModal(modal) {
    modal?.classList.add('is-active');
}

function closeModal(modal) {
    modal?.classList.remove('is-active');
}

// Quick Actions
function initializeQuickActions() {
    const exportBtn = document.getElementById('exportDataBtn');
    const uploadBtn = document.getElementById('uploadFilesBtn');

    exportBtn?.addEventListener('click', () => {
        alert('Exporting content data...');
    });

    uploadBtn?.addEventListener('click', () => {
        const tabs = document.querySelectorAll('#contentTabs li');
        tabs.forEach(t => t.classList.remove('is-active'));
        document.querySelector('[data-tab="upload"]').classList.add('is-active');
        loadTabContent('upload', document.getElementById('tabContentContainer'));
    });
}

console.log('Content Management initialized');
