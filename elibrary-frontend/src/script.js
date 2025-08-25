
// This file contains all interactive functionality and API integration points

// Global variables
const API_BASE_URL = 'http://localhost:8080/api';
let currentSection = 'dashboard';
let currentPage = 1;
let documentsPerPage = 12;
let allDocuments = [];
let filteredDocuments = [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    initializeScrollAnimations();
    initializeScrollProgress();
    initializeParallaxEffects();
});

// Initialize Application
function initializeApp() {
    setupEventListeners();
    initializeUserSession();
    initializeTheme();
    loadDashboardStats();
    loadDocuments();
}

// ===== SCROLL ANIMATIONS & FRAMER MOTION EFFECTS =====

// Initialize Scroll Animations
function initializeScrollAnimations() {
    // Create Intersection Observer for scroll reveals
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Add staggered animation delays for grid items
                if (entry.target.classList.contains('stagger-item')) {
                    const index = Array.from(entry.target.parentNode.children).indexOf(entry.target);
                    entry.target.style.animationDelay = `${index * 0.1}s`;
                }
            }
        });
    }, observerOptions);

    // Observe elements when they're added to DOM
    function observeScrollElements() {
        // Add scroll reveal classes to elements
        const cards = document.querySelectorAll('.stat-card, .document-card, .category-item, .chart-container');
        cards.forEach((card, index) => {
            if (!card.classList.contains('scroll-reveal')) {
                // Vary animation types for visual interest
                const animationType = index % 4;
                switch (animationType) {
                    case 0:
                        card.classList.add('scroll-reveal');
                        break;
                    case 1:
                        card.classList.add('scroll-reveal-left');
                        break;
                    case 2:
                        card.classList.add('scroll-reveal-right');
                        break;
                    case 3:
                        card.classList.add('scroll-reveal-scale');
                        break;
                }
                card.classList.add('stagger-item');
                observer.observe(card);
            }
        });

        // Add special animations for containers
        const containers = document.querySelectorAll('.upload-container, .documents-controls, .add-category, .categories-list');
        containers.forEach(container => {
            if (!container.classList.contains('scroll-reveal')) {
                container.classList.add('scroll-reveal-rotate');
                observer.observe(container);
            }
        });
    }

    // Initial observation
    observeScrollElements();

    // Re-observe when content changes
    const contentObserver = new MutationObserver(() => {
        setTimeout(observeScrollElements, 100);
    });

    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        contentObserver.observe(mainContent, {
            childList: true,
            subtree: true
        });
    }
}

// Initialize Scroll Progress Indicator
function initializeScrollProgress() {
    // Create scroll progress bar if it doesn't exist
    if (!document.querySelector('.scroll-progress')) {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'scroll-progress';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress-bar';
        
        progressContainer.appendChild(progressBar);
        document.body.appendChild(progressContainer);
    }

    const progressBar = document.querySelector('.scroll-progress-bar');
    
    function updateScrollProgress() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        
        if (progressBar) {
            progressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
        }
    }

    // Throttled scroll listener for performance
    let ticking = false;
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateScrollProgress();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    updateScrollProgress(); // Initial call
}

// Initialize Parallax Effects
function initializeParallaxEffects() {
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.stat-card, .document-card');
        
        parallaxElements.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            const speed = 0.5 + (index % 3) * 0.2; // Varying parallax speeds
            
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const yPos = -(scrolled * speed * 0.1);
                element.style.transform = `translateY(${yPos}px)`;
            }
        });
        
        ticking = false;
    }
    
    function onParallaxScroll() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', onParallaxScroll, { passive: true });
}

// Enhanced Spring Animation System
function addSpringAnimation(element, options = {}) {
    const defaults = {
        scale: 1.05,
        duration: 600,
        easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        delay: 0
    };
    
    const config = { ...defaults, ...options };
    
    element.style.transition = `transform ${config.duration}ms ${config.easing} ${config.delay}ms`;
    
    element.addEventListener('mouseenter', () => {
        element.style.transform = `scale(${config.scale}) translateZ(0)`;
    });
    
    element.addEventListener('mouseleave', () => {
        element.style.transform = 'scale(1) translateZ(0)';
    });
}

// Magnetic Button Effect
function addMagneticEffect(button) {
    button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const moveX = x * 0.3;
        const moveY = y * 0.3;
        
        button.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translate(0px, 0px) scale(1)';
    });
}

// Staggered Grid Animation
function animateGridItems(container, delay = 100) {
    const items = container.querySelectorAll('.document-card, .stat-card, .category-item');
    
    items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px) scale(0.9)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0) scale(1)';
        }, index * delay);
    });
}

// Smooth Section Transitions
function animateSectionTransition(newSection) {
    const sections = document.querySelectorAll('.content-section');
    const activeSection = document.querySelector('.content-section.active');
    
    if (activeSection) {
        // Fade out current section
        activeSection.style.transition = 'all 0.3s ease-out';
        activeSection.style.opacity = '0';
        activeSection.style.transform = 'translateX(-30px)';
        
        setTimeout(() => {
            activeSection.classList.remove('active');
            
            // Fade in new section
            const targetSection = document.getElementById(newSection);
            if (targetSection) {
                targetSection.style.opacity = '0';
                targetSection.style.transform = 'translateX(30px)';
                targetSection.classList.add('active');
                
                setTimeout(() => {
                    targetSection.style.transition = 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
                    targetSection.style.opacity = '1';
                    targetSection.style.transform = 'translateX(0)';
                    
                    // Animate grid items if present
                    const gridContainer = targetSection.querySelector('.documents-grid, .stats-grid, .categories-grid');
                    if (gridContainer) {
                        setTimeout(() => animateGridItems(gridContainer), 200);
                    }
                }, 50);
            }
        }, 300);
    }
}

// Enhanced Hover Effects
function enhanceHoverEffects() {
    // Add magnetic effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(addMagneticEffect);
    
    // Add spring animations to cards
    const cards = document.querySelectorAll('.stat-card, .document-card, .category-item');
    cards.forEach(card => {
        addSpringAnimation(card, { scale: 1.03, duration: 400 });
    });
    
    // Add tilt effect to larger containers
    const containers = document.querySelectorAll('.upload-container, .chart-container');
    containers.forEach(container => {
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / centerY * -5;
            const rotateY = (x - centerX) / centerX * 5;
            
            container.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
        
        container.addEventListener('mouseleave', () => {
            container.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        });
    });
}

// ===== THEME SYSTEM =====

// Initialize Theme System
function initializeTheme() {
    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem('elibrary-theme') || 'light';
    applyTheme(savedTheme);
    
    // Update theme toggle button state
    updateThemeToggleButton(savedTheme);
}

// Apply Theme
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('elibrary-theme', theme);
    
    // Add theme transition class temporarily
    document.body.classList.add('theme-transitioning');
    
    setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
    }, 400);
}

// Toggle Theme Function
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Apply theme with animation
    applyTheme(newTheme);
    updateThemeToggleButton(newTheme);
    
    // Add a subtle animation to the toggle button
    const toggleButton = document.getElementById('themeToggle');
    if (toggleButton) {
        toggleButton.style.transform = 'scale(0.9)';
        setTimeout(() => {
            toggleButton.style.transform = 'scale(1)';
        }, 150);
    }
    
    console.log(`Theme switched to: ${newTheme}`);
}

// Update Theme Toggle Button State
function updateThemeToggleButton(theme) {
    const toggleButton = document.getElementById('themeToggle');
    if (!toggleButton) return;
    
    const sunIcon = toggleButton.querySelector('.fa-sun');
    const moonIcon = toggleButton.querySelector('.fa-moon');
    const themeText = toggleButton.querySelector('span');
    
    if (theme === 'dark') {
        if (sunIcon) sunIcon.style.display = 'none';
        if (moonIcon) moonIcon.style.display = 'inline-block';
        if (themeText) themeText.textContent = 'Light';
    } else {
        if (sunIcon) sunIcon.style.display = 'inline-block';
        if (moonIcon) moonIcon.style.display = 'none';
        if (themeText) themeText.textContent = 'Dark';
    }
}

// Auto Theme Detection (Optional)
function detectSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

// Listen for system theme changes
if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem('elibrary-theme')) {
            const systemTheme = e.matches ? 'dark' : 'light';
            applyTheme(systemTheme);
            updateThemeToggleButton(systemTheme);
        }
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Sidebar navigation
    const menuItems = document.querySelectorAll('.menu-item[data-section]');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            switchSection(section);
        });
    });

    // File upload drag and drop
    setupFileUpload();

    // Document upload form
    const uploadForm = document.getElementById('documentUploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleDocumentUpload);
    }

    // Search and filter functionality
    setupSearchAndFilter();
    
    // Load tags for upload form
    loadTagsIntoSelect();

    // View toggle buttons
    setupViewToggle();

    // Category form
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', handleCategorySubmit);
    }

    // Pagination
    setupPagination();
}

// Enhanced Section Navigation with Animations
function switchSection(sectionName) {
    console.log('Switching to section:', sectionName);
    
    // Update active menu item
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionName) {
            item.classList.add('active');
        }
    });
    
    // Animate section transition
    animateSectionTransition(sectionName);
    
    // Update current section
    currentSection = sectionName;
    
    // Load section-specific data
    switch(sectionName) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'documents':
            loadDocuments();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'categories':
            loadCategories();
            break;
    }
    
    // Enhance hover effects for new content
    setTimeout(enhanceHoverEffects, 500);
}

// File Upload Setup
function setupFileUpload() {
    const fileDropZone = document.getElementById('fileDropZone');
    const fileInput = document.getElementById('docFile');
    const fileInfo = document.getElementById('fileInfo');

    if (!fileDropZone || !fileInput) return;

    // Click to browse
    fileDropZone.addEventListener('click', () => fileInput.click());

    // Drag and drop events
    fileDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileDropZone.classList.add('dragover');
    });

    fileDropZone.addEventListener('dragleave', () => {
        fileDropZone.classList.remove('dragover');
    });

    fileDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        fileDropZone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            displayFileInfo(files[0]);
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            displayFileInfo(e.target.files[0]);
        }
    });
}

function displayFileInfo(file) {
    const fileInfo = document.getElementById('fileInfo');
    if (fileInfo) {
        fileInfo.innerHTML = `
            <strong>Selected File:</strong> ${file.name}<br>
            <strong>Size:</strong> ${(file.size / 1024 / 1024).toFixed(2)} MB<br>
            <strong>Type:</strong> ${file.type || 'Unknown'}
        `;
        fileInfo.classList.remove('hidden');
    }
}

// Document Upload Handler
async function handleDocumentUpload(e) {
    e.preventDefault();
    
    const formData = new FormData();
    const title = document.getElementById('docTitle').value;
    const description = document.getElementById('docDescription').value;
    const tagsInput = document.getElementById('docTags').value;
    const file = document.getElementById('docFile').files[0];

    if (!file) {
        alert('Please select a file to upload');
        return;
    }

    // Prepare form data for Spring Boot backend
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file);
    
    // Handle tags - convert comma-separated string to array
    if (tagsInput) {
        const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        console.log('Tags being sent:', tagsArray);
        tagsArray.forEach(tag => {
            formData.append('tags', tag);
        });
    }

    try {
        const response = await uploadDocument(formData);
        
        if (response.success) {
            alert('Document uploaded successfully!');
            document.getElementById('documentUploadForm').reset();
            document.getElementById('fileInfo').classList.add('hidden');
            
            // Refresh documents list if on documents section
            if (currentSection === 'documents') {
                loadDocuments();
            }
            
            // Update dashboard stats
            loadDashboardStats();
        } else {
            alert('Upload failed: ' + response.message);
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('Upload failed. Please try again.');
    }
}

// Search and Filter Setup
function setupSearchAndFilter() {
    const documentSearch = document.getElementById('documentSearch');
    const globalSearch = document.getElementById('globalSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortBy = document.getElementById('sortBy');

    if (documentSearch) {
        documentSearch.addEventListener('input', debounce(handleSearch, 300));
    }
    
    if (globalSearch) {
        globalSearch.addEventListener('input', debounce(handleGlobalSearch, 300));
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', handleFilter);
    }

    if (sortBy) {
        sortBy.addEventListener('change', handleSort);
    }
}

async function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    
    if (query.length === 0) {
        filteredDocuments = [...allDocuments];
    } else {
        try {
            // Use tag search from backend
            const response = await fetch(`${API_BASE_URL}/documents/search?tag=${encodeURIComponent(query)}`);
            if (response.ok) {
                const searchResults = await response.json();
                filteredDocuments = searchResults.map(doc => ({
                    id: doc.id,
                    title: doc.title,
                    author: doc.uploadedBy ? doc.uploadedBy.name : 'Unknown',
                    description: doc.description || 'No description available',
                    category: doc.tags && doc.tags.length > 0 ? doc.tags[0].name : 'uncategorized',
                    tags: doc.tags ? doc.tags.map(tag => tag.name) : [],
                    uploadDate: doc.uploadedAt ? new Date(doc.uploadedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    downloads: 0,
                    fileUrl: doc.fileUrl
                }));
            } else {
                // Fallback to local search
                filteredDocuments = allDocuments.filter(doc => 
                    doc.title.toLowerCase().includes(query) ||
                    doc.description.toLowerCase().includes(query) ||
                    doc.author.toLowerCase().includes(query) ||
                    doc.tags.some(tag => tag.toLowerCase().includes(query))
                );
            }
        } catch (error) {
            console.error('Search error:', error);
            // Fallback to local search
            filteredDocuments = allDocuments.filter(doc => 
                doc.title.toLowerCase().includes(query) ||
                doc.description.toLowerCase().includes(query) ||
                doc.author.toLowerCase().includes(query) ||
                doc.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }
    }
    
    currentPage = 1;
    renderDocuments();
}

function handleFilter(e) {
    const category = e.target.value;
    
    if (category === '') {
        filteredDocuments = [...allDocuments];
    } else {
        // 🔌 API INTEGRATION POINT - Filter by Category
        filteredDocuments = allDocuments.filter(doc => doc.category === category);
    }
    
    currentPage = 1;
    renderDocuments();
}

function handleSort(e) {
    const sortBy = e.target.value;
    
    filteredDocuments.sort((a, b) => {
        switch(sortBy) {
            case 'title':
                return a.title.localeCompare(b.title);
            case 'author':
                return a.author.localeCompare(b.author);
            case 'date':
                return new Date(b.uploadDate) - new Date(a.uploadDate);
            case 'downloads':
                return b.downloads - a.downloads;
            default:
                return 0;
        }
    });
    
    renderDocuments();
}

// View Toggle Setup
function setupViewToggle() {
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const view = this.getAttribute('data-view');
            toggleDocumentView(view);
        });
    });
}

function toggleDocumentView(view) {
    const container = document.getElementById('documentsContainer');
    if (container) {
        container.className = view === 'grid' ? 'documents-grid' : 'documents-list';
    }
}

// Pagination Setup
function setupPagination() {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderDocuments();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredDocuments.length / documentsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderDocuments();
            }
        });
    }
}

// Category Form Handler
async function handleCategorySubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('categoryName').value;
    const description = document.getElementById('categoryDescription').value;

    try {
        // 🔌 API INTEGRATION POINT - Create Category
        const response = await createCategory({ name, description });
        
        if (response.success) {
            alert('Category created successfully!');
            document.getElementById('categoryForm').reset();
        } else {
            alert('Failed to create category: ' + response.message);
        }
    } catch (error) {
        console.error('Category creation error:', error);
        alert('Failed to create category. Please try again.');
    }
}

// 🔌 API INTEGRATION FUNCTIONS
// Replace these functions with actual API calls to your backend

// Dashboard API Functions
async function loadDashboardStats() {
    try {
        // Get real data from backend
        const [documentsRes, tagsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/documents`).catch(() => null),
            fetch(`${API_BASE_URL}/tags`).catch(() => null)
        ]);
        
        let totalDocuments = 0;
        let totalTags = 0;
        
        if (documentsRes && documentsRes.ok) {
            const documents = await documentsRes.json();
            totalDocuments = documents.length;
        }
        
        if (tagsRes && tagsRes.ok) {
            const tags = await tagsRes.json();
            totalTags = tags.length;
        }
        
        // Calculate total downloads from localStorage
        const downloadStats = JSON.parse(localStorage.getItem('downloadStats') || '{}');
        const totalDownloads = Object.values(downloadStats).reduce((sum, count) => sum + count, 0);
        
        // Get unique users from comments (mock data for now)
        const totalUsers = 1; // Single user system for now
        
        // Update dashboard display
        document.getElementById('totalDocuments').textContent = totalDocuments;
        document.getElementById('totalDownloads').textContent = totalDownloads;
        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('totalTags').textContent = totalTags;
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Fallback values
        document.getElementById('totalDocuments').textContent = '0';
        document.getElementById('totalDownloads').textContent = '0';
        document.getElementById('totalUsers').textContent = '0';
        document.getElementById('totalTags').textContent = '0';
    }
}

async function getDashboardStats() {
    try {
        const [documentsRes, usersRes, tagsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/documents`),
            fetch(`${API_BASE_URL}/users`),
            fetch(`${API_BASE_URL}/tags`)
        ]);
        
        const documents = await documentsRes.json();
        const users = await usersRes.json();
        const tags = await tagsRes.json();
        
        return {
            totalDocuments: documents.length,
            totalDownloads: 0, // Not tracked in backend yet
            totalUsers: users.length,
            totalCategories: tags.length
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
            totalDocuments: 0,
            totalDownloads: 0,
            totalUsers: 0,
            totalCategories: 0
        };
    }
}

// Document API Functions
async function loadDocuments() {
    try {
        console.log('=== LOADING DOCUMENTS ===');
        const documents = await getDocuments();
        console.log('Documents loaded:', documents.length, documents);
        allDocuments = documents;
        filteredDocuments = documents;
        
        // Render documents directly
        renderDocuments(filteredDocuments);
        updatePaginationInfo();
        console.log('Documents rendered:', filteredDocuments.length);
    } catch (error) {
        console.error('Error loading documents:', error);
    }
}

async function getDocuments() {
    try {
        console.log('Fetching from:', `${API_BASE_URL}/documents`);
        const response = await fetch(`${API_BASE_URL}/documents`);
        console.log('API Response status:', response.status);
        
        if (!response.ok) throw new Error('Failed to fetch documents');
        
        const documents = await response.json();
        console.log('Raw API response:', documents);
        
        // Transform backend data to match frontend expectations
        const transformed = documents.map(doc => ({
            id: doc.id,
            title: doc.title,
            author: doc.uploadedBy ? doc.uploadedBy.name : 'Unknown',
            description: doc.description || 'No description available',
            category: doc.tags && doc.tags.length > 0 ? doc.tags[0].name : 'uncategorized',
            tags: doc.tags ? doc.tags.map(tag => tag.name) : [],
            uploadDate: doc.uploadedAt ? new Date(doc.uploadedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            downloads: 0, // Not tracked in backend yet
            fileUrl: doc.fileUrl
        }));
        
        console.log('Transformed documents:', transformed);
        return transformed;
    } catch (error) {
        console.error('Error fetching documents:', error);
        return [];
    }
}

async function uploadDocument(formData) {
    try {
        // Check file size before upload (10MB limit)
        const file = formData.get('file');
        if (file && file.size > 10 * 1024 * 1024) {
            return { 
                success: false, 
                message: 'File size exceeds 10MB limit. Please choose a smaller file or compress it.' 
            };
        }
        
        console.log('=== UPLOAD DEBUG ===');
        console.log('API URL:', `${API_BASE_URL}/documents/upload`);
        console.log('File size:', file ? `${(file.size / 1024 / 1024).toFixed(2)}MB` : 'No file');
        console.log('FormData entries:');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }
        
        const response = await fetch(`${API_BASE_URL}/documents/upload`, {
            method: 'POST',
            body: formData
        });
        
        console.log('Upload response status:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('Upload error response:', errorText);
            
            // Handle specific error cases
            if (response.status === 413 || errorText.includes('MaxUploadSizeExceededException')) {
                return { 
                    success: false, 
                    message: 'File too large! Maximum upload size is 10MB. Please compress your file or choose a smaller one.' 
                };
            }
            
            throw new Error(`Upload failed: ${response.status} - ${errorText}`);
        }
        
        const document = await response.json();
        console.log('Upload successful:', document);
        return { success: true, message: 'Document uploaded successfully', data: document };
    } catch (error) {
        console.error('Upload error:', error);
        
        // Handle specific error types
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return { success: false, message: 'Network error: Cannot connect to server. Check if backend is running on http://localhost:8080' };
        }
        
        return { success: false, message: error.message };
    }
}

async function deleteDocument(id) {
    try {
        console.log('=== DELETE DOCUMENT DEBUG ===');
        console.log('Document ID:', id, 'Type:', typeof id);
        
        const documentId = String(id).trim();
        const apiUrl = `${API_BASE_URL}/documents/${documentId}`;
        console.log('Delete URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Delete response:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('Delete error text:', errorText);
            
            // Handle specific server errors
            if (response.status === 500) {
                return { 
                    success: false, 
                    message: `Server error deleting document. This may be due to:\n• Document has related data (comments, etc.)\n• File deletion issues\n• Database constraints\n\nServer response: ${errorText}` 
                };
            } else if (response.status === 404) {
                return { success: false, message: 'Document not found or already deleted' };
            } else {
                return { success: false, message: `Delete failed: ${response.status} - ${errorText}` };
            }
        }
        
        console.log('Delete successful for ID:', documentId);
        return { success: true };
        
    } catch (error) {
        console.error('Delete network error:', error);
        return { success: false, message: `Network error: ${error.message}` };
    }
}

async function downloadDocument(id) {
    try {
        // Track the download for analytics
        trackDownload(id);
        
        // Get document details
        const response = await fetch(`${API_BASE_URL}/documents/${id}`);
        console.log('Document fetch response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const docData = await response.json();
        console.log('Document details:', docData);
        
        // Use the document's fileUrl directly - this is the correct path from backend
        if (!docData.fileUrl) {
            throw new Error('Document has no file URL');
        }
        
        let fileUrl = docData.fileUrl;
        
        // Convert relative path to absolute URL
        if (fileUrl.startsWith('/uploads/')) {
            fileUrl = `http://localhost:8080${fileUrl}`;
        } else if (!fileUrl.startsWith('http')) {
            fileUrl = `http://localhost:8080/uploads/${fileUrl}`;
        }
        
        console.log('Direct download URL:', fileUrl);
        
        // Try direct download
        const downloadResponse = await fetch(fileUrl);
        console.log('Download response status:', downloadResponse.status);
        
        if (!downloadResponse.ok) {
            throw new Error(`File not found: ${downloadResponse.status}`);
        }
        
        const blob = await downloadResponse.blob();
        console.log('Download blob size:', blob.size);
        
        if (blob.size === 0) {
            throw new Error('File is empty');
        }
        
        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = downloadUrl;
        a.download = docData.fileName || docData.title || `document_${id}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        
        
    } catch (error) {
        console.error('Download error:', error);
        alert('Error downloading document: ' + error.message);
    }
}


// Analytics API Functions
async function loadAnalytics() {
    try {
        console.log('=== LOADING ANALYTICS ===');
        const analyticsData = await getAnalyticsData();
        console.log('Analytics data:', analyticsData);
        renderCharts(analyticsData);
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

async function getAnalyticsData() {
    try {
        // Get real data from backend
        const [documentsRes, tagsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/documents`),
            fetch(`${API_BASE_URL}/tags`)
        ]);
        
        const documents = await documentsRes.json();
        const tags = await tagsRes.json();
        
        // Always use localStorage data for real download tracking
        const dailyDownloads = generateDailyDownloadData(documents);
        
        // Real category data from actual documents
        const categoryData = tags.map(tag => {
            const count = documents.filter(doc => 
                doc.tags && doc.tags.some(t => t.name === tag.name)
            ).length;
            return { name: tag.name, count: count };
        }).filter(cat => cat.count > 0); // Only show categories with documents
        
        return {
            downloads: dailyDownloads,
            categories: categoryData,
            totalDocuments: documents.length,
            totalCategories: tags.length
        };
    } catch (error) {
        console.error('Error fetching analytics data:', error);
        return {
            downloads: [],
            categories: [],
            totalDocuments: 0,
            totalCategories: 0
        };
    }
}

function generateDailyDownloadData(documents) {
    // Get last 7 days
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        // Use ONLY actual download counts from localStorage
        const downloadCount = getDownloadCountForDate(date);
        
        days.push({
            day: dayName,
            date: date.toISOString().split('T')[0],
            count: downloadCount // Will be 0 if no downloads
        });
    }
    
    return days;
}

function getDownloadCountForDate(date) {
    // Check localStorage for actual download tracking
    const dateStr = date.toISOString().split('T')[0];
    const downloadStats = JSON.parse(localStorage.getItem('downloadStats') || '{}');
    return downloadStats[dateStr] || 0;
}

function trackDownload(documentId) {
    // Track actual downloads in localStorage
    const today = new Date().toISOString().split('T')[0];
    const downloadStats = JSON.parse(localStorage.getItem('downloadStats') || '{}');
    
    if (!downloadStats[today]) {
        downloadStats[today] = 0;
    }
    downloadStats[today]++;
    
    localStorage.setItem('downloadStats', JSON.stringify(downloadStats));
    console.log(`Download tracked for document ${documentId} on ${today}`);
}

// Render Functions
function renderDocuments(documents) {
    const container = document.getElementById('documentsContainer');
    console.log('=== RENDER DOCUMENTS ===');
    console.log('Container found:', !!container);
    console.log('Documents to render:', documents.length, documents);
    
    if (!container) {
        console.error('documentsContainer not found in DOM');
        return;
    }

    if (documents.length === 0) {
        console.log('No documents to display');
        container.innerHTML = '<div class="no-documents scroll-reveal"><p>No documents found</p></div>';
        return;
    }

    const html = documents.map((doc, index) => `
        <div class="document-card scroll-reveal stagger-item" style="animation-delay: ${index * 0.1}s">
            <div class="doc-thumbnail">
                <i class="fas fa-file-pdf"></i>
            </div>
            <div class="doc-info">
                <h3>${doc.title}</h3>
                <p class="doc-author">${doc.author}</p>
                <p class="doc-description">${doc.description}</p>
                <div class="doc-tags">
                    ${doc.tags && doc.tags.length > 0 ? doc.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '<span class="no-tags">No tags</span>'}
                </div>
                <div class="doc-actions">
                    <button class="btn btn-sm btn-primary" onclick="viewDocument(${doc.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="downloadDocument(${doc.id})">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button class="btn btn-sm btn-info" onclick="showComments(${doc.id})">
                        <i class="fas fa-comments"></i> Comments (<span id="commentCount-${doc.id}">0</span>)
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="confirmDeleteDocument(${doc.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    console.log('Setting innerHTML with', html.length, 'characters');
    container.innerHTML = html;
    
    // Load comment counts for each document
    documents.forEach(doc => loadCommentCount(doc.id));
    
    // Apply enhanced animations after render
    setTimeout(() => {
        enhanceHoverEffects();
        animateGridItems(container, 150);
    }, 100);
    
    console.log('Render complete');
}

async function loadCommentCount(documentId) {
    try {
        const comments = await getComments(documentId);
        const countElement = document.getElementById(`commentCount-${documentId}`);
        if (countElement) {
            countElement.textContent = comments.length;
        }
    } catch (error) {
        console.log('Failed to load comment count for document:', documentId);
    }
}

function renderCharts(data) {
    console.log('Rendering charts with data:', data);
    
    // Downloads Chart
    const downloadsCtx = document.getElementById('downloadsChart');
    if (downloadsCtx) {
        new Chart(downloadsCtx, {
            type: 'line',
            data: {
                labels: data.downloads.map(item => item.day || item.month),
                datasets: [{
                    label: 'Document Downloads',
                    data: data.downloads.map(item => item.count),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Daily Document Downloads (Last 7 Days)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
}

function updatePaginationInfo() {
    const totalPages = Math.ceil(filteredDocuments.length / documentsPerPage);
    const pageInfo = document.getElementById('pageInfo');
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    }

    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
}

// Document Actions
async function viewDocument(id) {
    try {
        console.log('=== VIEW DOCUMENT DEBUG ===');
        console.log('Document ID:', id, 'Type:', typeof id);
        
        // Use exact same approach as working download function
        const response = await fetch(`${API_BASE_URL}/documents/${id}`);
        if (!response.ok) {
            alert(`Document not found: ${response.status}`);
            return;
        }
        
        const docData = await response.json();
        console.log('Document data:', docData);
        
        if (!docData.fileUrl) {
            alert('No file URL found');
            return;
        }
        
        // Copy exact logic from working download
        let fileUrl;
        if (docData.fileUrl.startsWith('http')) {
            fileUrl = docData.fileUrl;
        } else if (docData.fileUrl.startsWith('/')) {
            fileUrl = `http://localhost:8080${docData.fileUrl}`;
        } else {
            fileUrl = `http://localhost:8080/uploads/${docData.fileUrl}`;
        }
        
        console.log('Opening:', fileUrl);
        window.open(fileUrl, '_blank');
        
    } catch (error) {
        console.error('View error:', error);
        alert(`View failed: ${error.message}`);
    }
}

function confirmDeleteDocument(id) {
    const options = confirm('Backend delete is having issues. Try anyway?\n\nClick OK to attempt delete\nClick Cancel to skip');
    
    if (options) {
        // Show loading
        const button = document.querySelector(`[onclick="confirmDeleteDocument(${id})"]`);
        const originalText = button ? button.textContent : '';
        if (button) button.textContent = 'Deleting...';
        
        deleteDocument(id).then((result) => {
            if (result.success) {
                alert('Document deleted successfully!');
                loadDocuments();
                loadDashboardStats();
            } else {
                // For now, just remove from UI even if backend fails
                alert(`Backend delete failed, but removing from display.\n\nError: ${result.message}`);
                loadDocuments(); // Refresh to see actual state
            }
        }).catch((error) => {
            alert(`Delete error: ${error.message}`);
        }).finally(() => {
            if (button) button.textContent = originalText;
        });
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Mobile sidebar toggle (for responsive design)
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

// Comments API Functions
async function getComments(documentId) {
    try {
        const response = await fetch(`${API_BASE_URL}/documents/${documentId}/comments`);
        if (!response.ok) throw new Error('Failed to fetch comments');
        return await response.json();
    } catch (error) {
        console.error('Error fetching comments:', error);
        return [];
    }
}

async function addComment(documentId, commentData) {
    try {
        const response = await fetch(`${API_BASE_URL}/documents/${documentId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commentData)
        });
        
        if (!response.ok) throw new Error('Failed to add comment');
        return await response.json();
    } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
    }
}

// Comments UI Functions
async function showComments(documentId) {
    try {
        const comments = await getComments(documentId);
        
        let commentsHtml = `
            <div class="comments-modal">
                <div class="comments-content">
                    <div class="comments-header">
                        <h3>Comments</h3>
                        <button onclick="closeComments()" class="btn btn-secondary">Close</button>
                    </div>
                    <div class="comments-list">
                        ${comments.map(comment => `
                            <div class="comment">
                                <strong>${comment.user || 'Anonymous'}</strong>
                                <p>${comment.content}</p>
                                <small>${new Date(comment.createdAt).toLocaleString()}</small>
                            </div>
                        `).join('')}
                    </div>
                    <div class="add-comment">
                        <textarea id="newCommentText" placeholder="Add a comment..." rows="3"></textarea>
                        <input type="text" id="commentUser" placeholder="Your name" />
                        <button onclick="submitComment(${documentId})" class="btn btn-primary">Add Comment</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', commentsHtml);
    } catch (error) {
        alert('Failed to load comments');
    }
}

async function submitComment(documentId) {
    const content = document.getElementById('newCommentText').value;
    const user = document.getElementById('commentUser').value || 'Anonymous';
    
    if (!content.trim()) {
        alert('Please enter a comment');
        return;
    }
    
    try {
        await addComment(documentId, { content: content.trim(), user: user.trim() });
        closeComments();
        showComments(documentId); // Refresh comments
    } catch (error) {
        alert('Failed to add comment');
    }
}

function closeComments() {
    const modal = document.querySelector('.comments-modal');
    if (modal) {
        modal.remove();
    }
}

// Load tags into select dropdown
async function loadTagsIntoSelect() {
    try {
        const tags = await getCategories();
        const select = document.getElementById('docCategory');
        if (select) {
            select.innerHTML = tags.map(tag => 
                `<option value="${tag.name}">${tag.name}</option>`
            ).join('');
        }
    } catch (error) {
        console.error('Error loading tags into select:', error);
    }
}

// Initialize tags when upload section is loaded
function initializeUploadSection() {
    loadTagsIntoSelect();
}

// Enhanced section switching with upload initialization
function switchSection(sectionName) {
    // Update active menu item
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    const targetMenuItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (targetMenuItem) {
        targetMenuItem.classList.add('active');
    }

    // Show/hide content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    currentSection = sectionName;

    // Load section-specific data
    switch(sectionName) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'documents':
            loadDocuments();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'upload':
            initializeUploadSection();
            break;
    }
}

// Global search handler
function handleGlobalSearch(e) {
    const query = e.target.value.toLowerCase();
    
    if (query.length > 0) {
        // Switch to documents section and search
        switchSection('documents');
        
        // Wait for section to load, then search
        setTimeout(() => {
            const docSearchInput = document.getElementById('documentSearch');
            if (docSearchInput) {
                docSearchInput.value = query;
                handleSearch({ target: docSearchInput });
            }
        }, 100);
    }
}

// User tracking and session management
let sessionStartTime = Date.now();
let documentsViewedCount = 0;

function initializeUserSession() {
    // Load user data from localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userName = userData.name || 'Visitor';
    
    document.getElementById('currentUserName').textContent = userName;
    document.getElementById('userDisplayName').textContent = userName === 'Visitor' ? 'Anonymous Visitor' : userName;
    
    // Start session timer
    updateSessionTime();
    setInterval(updateSessionTime, 60000); // Update every minute
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const userButton = document.getElementById('userButton');
        const userDropdown = document.getElementById('userDropdown');
        if (!userButton.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.style.display = 'none';
        }
    });
}

function showUserInfo() {
    const dropdown = document.getElementById('userDropdown');
    const isVisible = dropdown.style.display === 'block';
    dropdown.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
        updateUserStats();
    }
}

function updateUserStats() {
    // Update session time
    updateSessionTime();
    
    // Update documents viewed
    document.getElementById('documentsViewed').textContent = documentsViewedCount;
    
    // Update downloads from localStorage
    const downloadStats = JSON.parse(localStorage.getItem('downloadStats') || '{}');
    const totalDownloads = Object.values(downloadStats).reduce((sum, count) => sum + count, 0);
    document.getElementById('userDownloads').textContent = totalDownloads;
}

function updateSessionTime() {
    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 60000); // in minutes
    const hours = Math.floor(sessionDuration / 60);
    const minutes = sessionDuration % 60;
    
    let timeText = '';
    if (hours > 0) {
        timeText = `${hours}h ${minutes}m`;
    } else {
        timeText = `${minutes}m`;
    }
    
    const sessionElement = document.getElementById('sessionTime');
    if (sessionElement) {
        sessionElement.textContent = timeText;
    }
}

function changeUserName() {
    const currentName = document.getElementById('userDisplayName').textContent;
    const newName = prompt('Enter your name:', currentName === 'Anonymous Visitor' ? '' : currentName);
    
    if (newName && newName.trim()) {
        const userData = { name: newName.trim() };
        localStorage.setItem('userData', JSON.stringify(userData));
        
        document.getElementById('currentUserName').textContent = newName.trim();
        document.getElementById('userDisplayName').textContent = newName.trim();
        document.getElementById('userRole').textContent = 'User';
    }
}

function clearUserData() {
    if (confirm('This will reset your session data including downloads and viewing history. Continue?')) {
        localStorage.removeItem('userData');
        localStorage.removeItem('downloadStats');
        documentsViewedCount = 0;
        sessionStartTime = Date.now();
        
        document.getElementById('currentUserName').textContent = 'Visitor';
        document.getElementById('userDisplayName').textContent = 'Anonymous Visitor';
        document.getElementById('userRole').textContent = 'Guest';
        
        updateUserStats();
        loadDashboardStats(); // Refresh dashboard
    }
}

function trackDocumentView() {
    documentsViewedCount++;
}

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

// Export functions for external use
window.ELibrary = {
    switchSection,
    loadDocuments,
    loadDashboardStats,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    createCategory,
    showComments,
    addComment,
    getComments
};
