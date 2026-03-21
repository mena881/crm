// ========== GLOBAL STATE & CONFIGURATION ==========
const DesignSystem = {
    colors: {
        primary: '#4361ee',
        secondary: '#3a0ca3',
        useGradient: true
    },
    
    header: {
        type: 'top-header',
        height: 70,
        sidebarWidth: 280,
        sidebarVisible: true,
        sidebarPosition: 'right-top'
    },
    
    logo: {
        type: 'text',
        text: 'MR.Flow',
        imageUrl: '',
        size: 1,
        maxWidth: 180,
        pageUrl: '/layout'
    },
    
    fonts: {
        primary: 'Cairo',
        heading: 'El Messiri',
        originalPrimary: 'Cairo',
        originalHeading: 'El Messiri'
    },
    
    navigation: [
        { id: 'nav-home', type: 'item', label: 'الرئيسية', icon: 'fas fa-home', url: '/', order: 1, visible: true },
        { id: 'nav-about', type: 'item', label: 'من نحن', icon: 'fas fa-info-circle', url: '/about', order: 2, visible: true },
        { id: 'nav-services', type: 'dropdown', label: 'الخدمات', icon: 'fas fa-cogs', order: 3, visible: true, items: [
            { id: 'service-web', label: 'تطوير الويب', url: '/services/web' },
            { id: 'service-mobile', label: 'تطوير الموبايل', url: '/services/mobile' },
            { id: 'service-seo', label: 'تحسين محركات البحث', url: '/services/seo' }
        ]},
        { id: 'nav-contact', type: 'item', label: 'اتصل بنا', icon: 'fas fa-envelope', url: '/contact', order: 4, visible: true }
    ],
    
    userMenu: [
        { id: 'user-profile', label: 'الملف الشخصي', icon: 'fas fa-user', url: '/profile', order: 1 },
        { id: 'user-subscription', label: 'اشتراكي', icon: 'fas fa-crown', url: '/subscription', order: 2 },
        { id: 'user-plans', label: 'الخطط والأسعار', icon: 'fas fa-tags', url: '/plans', order: 3 },
        { id: 'user-support', label: 'الدعم الفني', icon: 'fas fa-headset', url: '/support', order: 4 },
        { id: 'user-settings', label: 'الإعدادات', icon: 'fas fa-cog', url: '/settings', order: 5 },
        { id: 'user-logout', label: 'تسجيل الخروج', icon: 'fas fa-sign-out-alt', url: '/logout', order: 6 }
    ],
    
    pages: [
        { id: 'page-home', label: 'الرئيسية', url: '/', icon: 'fas fa-home' },
        { id: 'page-about', label: 'من نحن', url: '/about', icon: 'fas fa-info-circle' },
        { id: 'page-services', label: 'الخدمات', url: '/services', icon: 'fas fa-cogs' },
        { id: 'page-contact', label: 'اتصل بنا', url: '/contact', icon: 'fas fa-envelope' }
    ],
    
    groups: [
        { id: 'group-services', label: 'الخدمات', icon: 'fas fa-cogs', pages: ['page-services'] }
    ],
    
    notifications: {
        count: 1,
        style: 'default',
        enableSound: true,
        enableDesktopNotifications: true,
        items: [
            { id: 'notif-1', title: 'ترحيب جديد', message: 'مرحبًا بك في النظام', time: 'منذ 5 دقائق', read: false, icon: 'fas fa-bell', type: 'info' },
            { id: 'notif-2', title: 'تحديث متاح', message: 'نسخة جديدة من النظام متاحة', time: 'منذ ساعة', read: false, icon: 'fas fa-sync', type: 'update' },
            { id: 'notif-3', title: 'اشتراكك ينتهي قريبًا', message: 'تبقى 7 أيام على انتهاء اشتراكك', time: 'منذ يومين', read: false, icon: 'fas fa-crown', type: 'warning' }
        ]
    },
    
    positions: {
        themeSwitchSize: 30,
        themeSwitchPosition: 'right',
        themeSwitchMove: 0,
        userMenuPosition: 0,
        subscriptionPosition: 0
    },
    
    subscription: {
        type: 'احترافي',
        code: 'BB20201',
        username: 'أحمد وزير',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        remainingDays: 183,
        status: 'نشط',
        duration: 365,
        lastUpdated: null,
        apiData: null
    },
    
    // Firebase Configuration
    firebaseConfig: {
        databaseURL: "https://test-3b890-default-rtdb.firebaseio.com/"
    },
    
    apiConfig: {
        VERIFY_API: "https://script.google.com/macros/s/AKfycbyXyhZPA-xMWsal6fpi-8dXV7hHBfjm8XEwGnHAAxEwSJAK3Qlcjh0zy3EOXbe6yGNm/exec",
        LOGIN_RECORD_API: "https://script.google.com/macros/s/AKfycbzfpHuNaSs-96CSVnrDHtcf9_gRsJvbWZfs0cz3K4U81wkjogA1zbAUy11C71aOMY1eSA/exec"
    },
    
    darkMode: true,
    lastSave: null,
    version: '2.3.1',
    lastSync: null,
    sessionExpiry: null // 10 hours from login
};

// ========== SESSION MANAGEMENT ==========
function checkSessionValidity() {
    const sessionExpiry = localStorage.getItem('designSystemSessionExpiry');
    if (sessionExpiry) {
        const expiryTime = parseInt(sessionExpiry);
        const now = Date.now();
        
        if (now > expiryTime) {
            // Session expired, clear all data
            console.log('⏰ الجلسة انتهت، جاري مسح البيانات');
            clearAllDesignData();
            return false;
        }
        return true;
    }
    return false;
}

function clearAllDesignData() {
    localStorage.removeItem('designSystemSettings');
    localStorage.removeItem('designSystemSettingsTimestamp');
    localStorage.removeItem('designSystemSessionExpiry');
    localStorage.removeItem('designSystemLastSync');
}

function setSessionExpiry() {
    const expiryTime = Date.now() + (10 * 60 * 60 * 1000); // 10 hours
    localStorage.setItem('designSystemSessionExpiry', expiryTime.toString());
    DesignSystem.sessionExpiry = expiryTime;
}

// ========== FIREBASE DATA SYNC ==========
async function fetchSettingsFromFirebase() {
    try {
        const firebaseUrl = DesignSystem.firebaseConfig.databaseURL;
        
        // Fetch settings from Firebase
        const response = await fetch(`${firebaseUrl}/settings.json`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && Object.keys(data).length > 0) {
            console.log('🔥 تم جلب الإعدادات من Firebase:', data);
            return data;
        } else {
            console.log('⚠️ لا توجد إعدادات في Firebase، استخدام الإعدادات الافتراضية');
            return null;
        }
    } catch (error) {
        console.error('❌ خطأ في جلب الإعدادات من Firebase:', error);
        return null;
    }
}

function mergeSettingsWithDesignSystem(firebaseSettings) {
    if (!firebaseSettings) return false;
    
    let changed = false;
    
    // Merge colors
    if (firebaseSettings.colors) {
        if (firebaseSettings.colors.primary && firebaseSettings.colors.primary !== DesignSystem.colors.primary) {
            DesignSystem.colors.primary = firebaseSettings.colors.primary;
            changed = true;
        }
        if (firebaseSettings.colors.secondary && firebaseSettings.colors.secondary !== DesignSystem.colors.secondary) {
            DesignSystem.colors.secondary = firebaseSettings.colors.secondary;
            changed = true;
        }
        if (typeof firebaseSettings.colors.useGradient !== 'undefined' && firebaseSettings.colors.useGradient !== DesignSystem.colors.useGradient) {
            DesignSystem.colors.useGradient = firebaseSettings.colors.useGradient;
            changed = true;
        }
    }
    
    // Merge header settings
    if (firebaseSettings.header) {
        if (firebaseSettings.header.type && firebaseSettings.header.type !== DesignSystem.header.type) {
            DesignSystem.header.type = firebaseSettings.header.type;
            changed = true;
        }
        if (firebaseSettings.header.height && firebaseSettings.header.height !== DesignSystem.header.height) {
            DesignSystem.header.height = firebaseSettings.header.height;
            changed = true;
        }
        if (firebaseSettings.header.sidebarWidth && firebaseSettings.header.sidebarWidth !== DesignSystem.header.sidebarWidth) {
            DesignSystem.header.sidebarWidth = firebaseSettings.header.sidebarWidth;
            changed = true;
        }
    }
    
    // Merge logo settings
    if (firebaseSettings.logo) {
        if (firebaseSettings.logo.type && firebaseSettings.logo.type !== DesignSystem.logo.type) {
            DesignSystem.logo.type = firebaseSettings.logo.type;
            changed = true;
        }
        if (firebaseSettings.logo.text && firebaseSettings.logo.text !== DesignSystem.logo.text) {
            DesignSystem.logo.text = firebaseSettings.logo.text;
            changed = true;
        }
        if (firebaseSettings.logo.imageUrl && firebaseSettings.logo.imageUrl !== DesignSystem.logo.imageUrl) {
            DesignSystem.logo.imageUrl = firebaseSettings.logo.imageUrl;
            changed = true;
        }
        if (firebaseSettings.logo.maxWidth && firebaseSettings.logo.maxWidth !== DesignSystem.logo.maxWidth) {
            DesignSystem.logo.maxWidth = firebaseSettings.logo.maxWidth;
            changed = true;
        }
    }
    
    // Merge fonts
    if (firebaseSettings.fonts) {
        if (firebaseSettings.fonts.primary && firebaseSettings.fonts.primary !== DesignSystem.fonts.primary) {
            DesignSystem.fonts.primary = firebaseSettings.fonts.primary;
            changed = true;
        }
        if (firebaseSettings.fonts.heading && firebaseSettings.fonts.heading !== DesignSystem.fonts.heading) {
            DesignSystem.fonts.heading = firebaseSettings.fonts.heading;
            changed = true;
        }
    }
    
    // Merge navigation (if provided)
    if (firebaseSettings.navigation && Array.isArray(firebaseSettings.navigation) && firebaseSettings.navigation.length > 0) {
        DesignSystem.navigation = firebaseSettings.navigation;
        changed = true;
    }
    
    // Merge dark mode
    if (typeof firebaseSettings.darkMode !== 'undefined' && firebaseSettings.darkMode !== DesignSystem.darkMode) {
        DesignSystem.darkMode = firebaseSettings.darkMode;
        changed = true;
    }
    
    return changed;
}

function saveSettingsToLocalStorage() {
    try {
        const settingsToSave = {
            colors: DesignSystem.colors,
            header: DesignSystem.header,
            logo: DesignSystem.logo,
            fonts: DesignSystem.fonts,
            navigation: DesignSystem.navigation,
            darkMode: DesignSystem.darkMode,
            positions: DesignSystem.positions,
            version: DesignSystem.version,
            lastSave: new Date().toISOString()
        };
        
        localStorage.setItem('designSystemSettings', JSON.stringify(settingsToSave));
        localStorage.setItem('designSystemSettingsTimestamp', Date.now().toString());
        localStorage.setItem('designSystemLastSync', new Date().toISOString());
        
        console.log('💾 الإعدادات محفوظة في localStorage:', new Date().toLocaleTimeString());
    } catch (error) {
        console.error('❌ خطأ في حفظ الإعدادات:', error);
    }
}

function loadSettingsFromLocalStorage() {
    try {
        const saved = localStorage.getItem('designSystemSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            
            // Merge saved settings with DesignSystem
            if (settings.colors) Object.assign(DesignSystem.colors, settings.colors);
            if (settings.header) Object.assign(DesignSystem.header, settings.header);
            if (settings.logo) Object.assign(DesignSystem.logo, settings.logo);
            if (settings.fonts) Object.assign(DesignSystem.fonts, settings.fonts);
            if (settings.navigation) DesignSystem.navigation = settings.navigation;
            if (typeof settings.darkMode !== 'undefined') DesignSystem.darkMode = settings.darkMode;
            if (settings.positions) Object.assign(DesignSystem.positions, settings.positions);
            
            console.log('✅ تم تحميل الإعدادات من localStorage');
            return true;
        }
    } catch (error) {
        console.error('❌ خطأ في تحميل الإعدادات من localStorage:', error);
    }
    return false;
}

// ========== MAIN SYNC FUNCTION ==========
async function syncDesignSystemFromFirebase() {
    const lastSync = localStorage.getItem('designSystemLastSync');
    const now = Date.now();

    // ⏱️ مدة الكاش (30 دقيقة)
    const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 ساعة
    // لو لسه محمل قريب → استخدم local
    if (lastSync && (now - parseInt(lastSync) < CACHE_DURATION)) {
        console.log('⚡ استخدام البيانات من localStorage');
        loadSettingsFromLocalStorage();
        return false;
    }

    console.log('🌐 تحميل من Firebase...');

    const firebaseSettings = await fetchSettingsFromFirebase();

    if (firebaseSettings) {
        const changed = mergeSettingsWithDesignSystem(firebaseSettings);

        saveSettingsToLocalStorage();

        localStorage.setItem('designSystemLastSync', now.toString());

        return changed;
    }

    return false;
}

// ========== CSS VARIABLES MANAGEMENT ==========
function updateCSSVariables() {
    const root = document.documentElement;
    const primaryRGB = hexToRgb(DesignSystem.colors.primary);
    const secondaryRGB = hexToRgb(DesignSystem.colors.secondary);
    
    if (primaryRGB) {
        root.style.setProperty('--ds-primary-rgb', `${primaryRGB.r}, ${primaryRGB.g}, ${primaryRGB.b}`);
    }
    
    if (secondaryRGB) {
        root.style.setProperty('--ds-secondary-rgb', `${secondaryRGB.r}, ${secondaryRGB.g}, ${secondaryRGB.b}`);
    }
    
    root.style.setProperty('--ds-primary', DesignSystem.colors.primary);
    root.style.setProperty('--ds-secondary', DesignSystem.colors.secondary);
    root.style.setProperty('--ds-gradient', DesignSystem.colors.useGradient ? 
        `linear-gradient(135deg, ${DesignSystem.colors.primary}, ${DesignSystem.colors.secondary})` : 
        DesignSystem.colors.primary);
    
    root.style.setProperty('--ds-theme-switch-size', `${DesignSystem.positions.themeSwitchSize}px`);
    root.style.setProperty('--ds-theme-switch-position', DesignSystem.positions.themeSwitchPosition === 'right' ? 'row-reverse' : 'row');
    root.style.setProperty('--ds-user-menu-position', `${DesignSystem.positions.userMenuPosition}px`);
    root.style.setProperty('--ds-subscription-position', `${DesignSystem.positions.subscriptionPosition}px`);
    
    const themeContainer = document.getElementById('themeSwitchContainer');
    if (themeContainer) {
        themeContainer.style.transform = `translateX(${DesignSystem.positions.themeSwitchMove}px)`;
    }
    
    root.style.setProperty('--ds-header-height', `${DesignSystem.header.height}px`);
    root.style.setProperty('--ds-sidebar-width', `${DesignSystem.header.sidebarWidth}px`);
    root.style.setProperty('--ds-logo-size', DesignSystem.logo.size);
    root.style.setProperty('--ds-logo-max-width', `${DesignSystem.logo.maxWidth}px`);
    
    const primaryFontFamily = getFontFamily(DesignSystem.fonts.primary);
    const headingFontFamily = getFontFamily(DesignSystem.fonts.heading);
    
    if (primaryFontFamily) {
        root.style.setProperty('--ds-font-primary', primaryFontFamily);
    }
    
    if (headingFontFamily) {
        root.style.setProperty('--ds-font-heading', headingFontFamily);
    }
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// ========== THEME MANAGEMENT ==========
function setupThemeSwitch() {
    const themeCheckbox = document.getElementById('themeSwitch');
    
    if (themeCheckbox) {
        themeCheckbox.checked = DesignSystem.darkMode;
        updateTheme();
        
        themeCheckbox.addEventListener('change', function() {
            DesignSystem.darkMode = this.checked;
            updateTheme();
            saveSettingsToLocalStorage();
            
            const mode = this.checked ? 'دارك' : 'فاتح';
            showNotification(`✅ تم تغيير الوضع إلى: ${mode}`, 'success');
        });
    }
}

function updateTheme() {
    if (DesignSystem.darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// ========== HEADER RENDERING ==========
function renderLiveHeader() {
    const navContainer = document.getElementById('headerNavigation');
    if (!navContainer) return;
    
    navContainer.innerHTML = '';
    
    DesignSystem.navigation
        .filter(item => item.visible)
        .sort((a, b) => a.order - b.order)
        .forEach(item => {
            if (item.type === 'item') {
                const navItem = createNavItem(item);
                navContainer.appendChild(navItem);
            } else if (item.type === 'dropdown') {
                const dropdown = createDropdownItem(item);
                navContainer.appendChild(dropdown);
            }
        });
}

function createNavItem(item) {
    const navItem = document.createElement('div');
    navItem.className = 'nav-item';
    
    navItem.innerHTML = `
        <a href="${item.url}" class="nav-link">
            <i class="${item.icon}"></i>
            <span>${item.label}</span>
        </a>
    `;
    
    return navItem;
}

function createDropdownItem(dropdown) {
    const dropdownElement = document.createElement('div');
    dropdownElement.className = 'nav-item';
    
    dropdownElement.innerHTML = `
        <a href="#" class="nav-link">
            <i class="${dropdown.icon}"></i>
            <span>${dropdown.label}</span>
            <i class="fas fa-chevron-down"></i>
        </a>
        <div class="nav-dropdown">
            ${dropdown.items.map(subItem => `
                <a href="${subItem.url}" class="dropdown-item">
                    <i class="fas fa-chevron-left"></i>
                    <span>${subItem.label}</span>
                </a>
            `).join('')}
        </div>
    `;
    
    return dropdownElement;
}

function updateLogoDisplay() {
    const logoContainer = document.getElementById('headerLogoContainer');
    const logoImage = document.getElementById('headerLogoImage');
    const logoText = document.getElementById('headerLogoText');
    
    if (!logoContainer) return;
    
    if (DesignSystem.logo.type === 'image' && DesignSystem.logo.imageUrl) {
        if (logoImage) {
            logoImage.src = DesignSystem.logo.imageUrl;
            logoImage.classList.remove('hidden');
        }
        if (logoText) logoText.classList.add('hidden');
    } else {
        if (logoImage) logoImage.classList.add('hidden');
        if (logoText) {
            logoText.textContent = DesignSystem.logo.text;
            logoText.classList.remove('hidden');
        }
    }
}

// ========== USER MENU RENDERING ==========
function renderUserMenu() {
    const dropdownContainer = document.getElementById('userDropdown');
    const user = loadCurrentUser();
    
    if (dropdownContainer) {
        const userMenuItems = DesignSystem.userMenu.map(item => {
            // التحقق من الصلاحية لعناصر معينة
            if (item.id === 'user-settings' && user && user.employeeCode !== 'BB') {
                return ''; // إخفاء الإعدادات للمستخدمين العاديين
            }
            
            return `
                <a href="${item.url}" class="dropdown-item" ${item.id === 'user-logout' ? 'onclick="signOut(); return false;"' : ''}>
                    <i class="${item.icon}"></i>
                    <span>${item.label}</span>
                </a>
            `;
        }).join('');
        
        dropdownContainer.innerHTML = `
            <div class="user-menu-header mb-2 p-2 border-bottom">
                <div class="d-flex align-items-center" style="display: flex; align-items: center; gap: 10px;">
                    <div class="user-avatar-large" style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--ds-primary), var(--ds-secondary)); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">
                        ${user ? (user.name || 'U').charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div style="flex: 1;">
                        <div class="font-weight-bold" style="font-weight: bold; margin-bottom: 4px;">${user ? user.name || 'مستخدم' : 'مستخدم'}</div>
                        <small class="text-secondary" style="font-size: 12px; color: var(--ds-text-secondary);">${user ? user.roleName || 'مستخدم' : ''}</small>
                    </div>
                </div>
            </div>
            ${userMenuItems}
        `;
    }
}

// ========== NOTIFICATION FUNCTIONS ==========
function renderNotifications() {
    const listContainer = document.getElementById('notificationsList');
    const badgeContainer = document.getElementById('notificationsBadge');
    
    if (!listContainer) return;
    
    const unreadCount = DesignSystem.notifications.items.filter(n => !n.read).length;
    DesignSystem.notifications.count = unreadCount;
    
    if (badgeContainer) {
        badgeContainer.textContent = unreadCount > 0 ? unreadCount : '';
        badgeContainer.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
    
    listContainer.innerHTML = '';
    
    if (DesignSystem.notifications.items.length === 0) {
        listContainer.innerHTML = `
            <div class="notifications-empty">
                <i class="fas fa-bell-slash fa-2x mb-3" style="color: var(--ds-text-secondary);"></i>
                <p>لا توجد إشعارات حالياً</p>
            </div>
        `;
        return;
    }
    
    DesignSystem.notifications.items.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = `notification-item ${notification.read ? 'read' : 'unread'}`;
        
        let typeBadge = '';
        if (notification.type === 'warning') {
            typeBadge = '<span class="notification-type-badge notification-type-warning">تحذير</span>';
        } else if (notification.type === 'success') {
            typeBadge = '<span class="notification-type-badge notification-type-success">نجاح</span>';
        } else if (notification.type === 'error') {
            typeBadge = '<span class="notification-type-badge notification-type-error">خطأ</span>';
        } else {
            typeBadge = '<span class="notification-type-badge notification-type-info">معلومة</span>';
        }
        
        notificationItem.innerHTML = `
            <div class="notification-actions">
                <button class="notification-action-btn" onclick="event.stopPropagation(); deleteNotification('${notification.id}')" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="notification-action-btn" onclick="event.stopPropagation(); markNotificationAsRead('${notification.id}')" title="تعيين كمقروء">
                    <i class="fas fa-check"></i>
                </button>
            </div>
            <div class="notification-icon">
                <i class="${notification.icon}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">
                    ${notification.title}
                    ${typeBadge}
                </div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">
                    <i class="far fa-clock"></i>
                    ${notification.time}
                </div>
            </div>
            <div class="notification-status"></div>
        `;
        
        notificationItem.onclick = () => markNotificationAsRead(notification.id);
        listContainer.appendChild(notificationItem);
    });
}

function markNotificationAsRead(notificationId) {
    const notification = DesignSystem.notifications.items.find(n => n.id === notificationId);
    if (notification && !notification.read) {
        notification.read = true;
        renderNotifications();
        saveSettingsToLocalStorage();
        showNotification('✅ تم تعيين الإشعار كمقروء', 'success');
    }
}

function deleteNotification(notificationId) {
    if (confirm('هل تريد حذف هذا الإشعار؟')) {
        DesignSystem.notifications.items = DesignSystem.notifications.items.filter(n => n.id !== notificationId);
        renderNotifications();
        saveSettingsToLocalStorage();
        showNotification('✅ تم حذف الإشعار', 'success');
    }
}

function markAllNotificationsAsRead() {
    DesignSystem.notifications.items.forEach(notification => {
        notification.read = true;
    });
    renderNotifications();
    saveSettingsToLocalStorage();
    showNotification('✅ تم تعيين جميع الإشعارات كمقروءة', 'success');
}

function addTestNotification() {
    const types = ['info', 'warning', 'success', 'error'];
    const icons = ['fas fa-bell', 'fas fa-exclamation-circle', 'fas fa-check-circle', 'fas fa-times-circle'];
    const titles = ['إشعار جديد', 'تحذير مهم', 'مهمة مكتملة', 'حدث خطأ'];
    const messages = [
        'تم إضافة إشعار تجريبي جديد للنظام',
        'هذا تحذير تجريبي للنظام المحسن',
        'تم حفظ جميع الإعدادات بنجاح',
        'حدث خطأ أثناء معالجة الطلب'
    ];
    
    const randomIndex = Math.floor(Math.random() * types.length);
    
    const newNotification = {
        id: 'test-' + Date.now(),
        title: titles[randomIndex],
        message: messages[randomIndex],
        time: 'الآن',
        read: false,
        icon: icons[randomIndex],
        type: types[randomIndex]
    };
    
    DesignSystem.notifications.items.unshift(newNotification);
    renderNotifications();
    saveSettingsToLocalStorage();
    
    showNotification('🔔 تم إضافة إشعار تجريبي جديد', 'success');
}

// ========== SUBSCRIPTION MANAGEMENT (KEPT INTACT) ==========
async function fetchSubscriptionFromGoogleSheets() {
    try {
        const savedCode = localStorage.getItem('licenseCode');
        if (!savedCode) {
            console.log('⚠️ لا يوجد كود ترخيص محفوظ');
            return null;
        }
        
        const response = await fetch(`${DesignSystem.apiConfig.VERIFY_API}?code=${encodeURIComponent(savedCode)}`);
        const apiData = await response.json();
        
        if (apiData.success && apiData.data) {
            return apiData;
        }
    } catch (error) {
        console.error('❌ خطأ في جلب بيانات الاشتراك:', error);
    }
    return null;
}

function formatLicenseDataFromAPI(apiData, code) {
    if (apiData.success && apiData.data) {
        const data = apiData.data;
        
        let startDate = "غير محدد";
        if (data["تاريخ البدايه"]) {
            const date = new Date(data["تاريخ البدايه"]);
            startDate = date.toLocaleDateString('ar-SA');
        }
        
        let endDate = "غير محدد";
        if (data["تاريخ البدايه"] && data["مده التفعيل "]) {
            const date = new Date(data["تاريخ البدايه"]);
            date.setDate(date.getDate() + parseInt(data["مده التفعيل "]));
            endDate = date.toLocaleDateString('ar-SA');
        }
        
        let status = data["Status"] || "Inactive";
        const daysRemaining = parseInt(data["عدد الايام اللي ناقصه"]) || 0;
        
        if (status === "Active" && daysRemaining <= 0) {
            status = "Expired";
        }
        
        return {
            success: true,
            status: status,
            user: data["User"] || "غير محدد",
            licenseCode: data["الكود "] || code,
            daysRemaining: daysRemaining,
            duration: parseInt(data["مده التفعيل "]) || 0,
            startDate: startDate,
            endDate: endDate,
            subscriptionCode: data["الكود "] || code,
            type: data["نوع الاشتراك"] || "احترافي",
            rawData: data
        };
    }
    
    return {
        success: false,
        status: "not_found",
        licenseCode: code
    };
}

function updateSubscriptionUI(subscriptionData) {
    const detailsContainer = document.getElementById('subscriptionDetails');
    
    if (!detailsContainer) return;
    
    if (subscriptionData.success === false || Object.keys(subscriptionData).length === 0) {
        detailsContainer.innerHTML = `
            <div class="subscription-data-grid">
                <div class="subscription-data-item">
                    <div class="subscription-data-label">الحالة</div>
                    <div class="subscription-data-value">
                        <span class="subscription-status-badge subscription-status-expired">
                            <i class="fas fa-exclamation-circle"></i>
                            غير متاح
                        </span>
                    </div>
                </div>
                <div class="subscription-data-item">
                    <div class="subscription-data-label">الكود</div>
                    <div class="subscription-data-value code">-</div>
                </div>
            </div>
        `;
        return;
    }
    
    let statusBadgeClass = 'subscription-status-expired';
    let statusBadgeIcon = 'fas fa-exclamation-circle';
    let statusText = 'منتهي';
    
    if (subscriptionData.status === 'Active' || subscriptionData.status === 'active') {
        statusText = 'نشط';
        if (subscriptionData.daysRemaining > 7) {
            statusBadgeClass = 'subscription-status-active';
            statusBadgeIcon = 'fas fa-check-circle';
        } else if (subscriptionData.daysRemaining > 0) {
            statusBadgeClass = 'subscription-status-warning';
            statusBadgeIcon = 'fas fa-exclamation-triangle';
            statusText = 'ينتهي قريباً';
        }
    }
    
    detailsContainer.innerHTML = `
        <div class="subscription-data-grid">
            <div class="subscription-data-item">
                <div class="subscription-data-label">الحالة</div>
                <div class="subscription-data-value">
                    <span class="subscription-status-badge ${statusBadgeClass}">
                        <i class="${statusBadgeIcon}"></i>
                        ${statusText}
                    </span>
                </div>
            </div>
            <div class="subscription-data-item">
                <div class="subscription-data-label">الكود</div>
                <div class="subscription-data-value code">${subscriptionData.licenseCode || subscriptionData.subscriptionCode}</div>
            </div>
            <div class="subscription-data-item">
                <div class="subscription-data-label">المستخدم</div>
                <div class="subscription-data-value">${subscriptionData.user || 'غير محدد'}</div>
            </div>
            <div class="subscription-data-item">
                <div class="subscription-data-label">الأيام المتبقية</div>
                <div class="subscription-data-value" style="color: ${subscriptionData.daysRemaining > 7 ? '#10b981' : subscriptionData.daysRemaining > 0 ? '#f59e0b' : '#ef4444'}">
                    ${subscriptionData.daysRemaining || 0} يوم
                </div>
            </div>
        </div>
        <div class="text-center text-secondary mt-3">
            <small><i class="fas fa-clock"></i> آخر تحديث: ${new Date().toLocaleTimeString('ar-SA')}</small>
        </div>
    `;
}

// ========== CHECK SUBSCRIPTION (KEPT INTACT) ==========
function checkSubscriptionAndRedirect() {
    if (sessionStorage.getItem("subscriptionRedirected")) {
        return true;
    }

    const subscriptionStatus = DesignSystem.subscription?.status;

    if (subscriptionStatus && subscriptionStatus !== 'نشط') {
        sessionStorage.setItem("subscriptionRedirected", "true");
        console.log('⚠️ الاشتراك منتهي أو غير نشط');
        showNotification('❌ اشتراكك منتهي. سيتم تحويلك إلى صفحة الدخول.', 'error');
        setTimeout(() => {
            window.location.href = 'license.html';
        }, 2000);
        return true;
    }
    return false;
}

async function refreshSubscriptionData() {
    const apiData = await fetchSubscriptionFromGoogleSheets();
    if (apiData) {
        const savedCode = localStorage.getItem('licenseCode');
        const formattedData = formatLicenseDataFromAPI(apiData, savedCode);
        
        DesignSystem.subscription = {
            type: formattedData.type || 'احترافي',
            code: formattedData.licenseCode || savedCode,
            username: formattedData.user || 'غير محدد',
            startDate: formattedData.startDate || 'غير محدد',
            endDate: formattedData.endDate || 'غير محدد',
            remainingDays: formattedData.daysRemaining || 0,
            status: formattedData.status === 'Active' || formattedData.status === 'active' ? 'نشط' : 'منتهي',
            duration: formattedData.duration || 0,
            lastUpdated: new Date().toISOString(),
            apiData: formattedData
        };
        
        updateSubscriptionUI(formattedData);
        saveSettingsToLocalStorage();
        
        const redirected = checkSubscriptionAndRedirect();
        if (!redirected) {
            showNotification('✅ تم تحديث بيانات الاشتراك بنجاح', 'success');
        }
        return true;
    }
    return false;
}

// ========== HAMBURGER MENU ==========
function setupHamburgerMenu() {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const liveHeader = document.getElementById('liveHeader');
    
    if (!hamburgerMenu || !liveHeader) return;
    
    hamburgerMenu.onclick = function() {
        if (DesignSystem.header.type === 'sidebar-header') {
            DesignSystem.header.sidebarVisible = !DesignSystem.header.sidebarVisible;
            
            if (DesignSystem.header.sidebarVisible) {
                liveHeader.classList.remove('hidden');
                hamburgerMenu.classList.remove('active');
            } else {
                liveHeader.classList.add('hidden');
                hamburgerMenu.classList.add('active');
            }
            
            saveSettingsToLocalStorage();
        }
    };
}

// ========== NOTIFICATION SYSTEM ==========
function showNotification(message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    if (!container) {
        const newContainer = document.createElement('div');
        newContainer.id = 'notificationContainer';
        document.body.appendChild(newContainer);
        return showNotification(message, type);
    }
    
    const notification = document.createElement('div');
    
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        </div>
        <div class="notification-message">${message}</div>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// ========== SIGN OUT FUNCTION ==========
function signOut() {
    localStorage.removeItem('currentUser');
    showNotification('✅ تم تسجيل الخروج بنجاح', 'success');
    setTimeout(() => {
        window.location.href = 'signin.html';
    }, 1500);
}

// ========== HELPER FUNCTIONS ==========
function getFontFamily(fontName) {
    const fonts = {
        'Cairo': "'Cairo', sans-serif",
        'Tajawal': "'Tajawal', sans-serif",
        'Almarai': "'Almarai', sans-serif",
        'El Messiri': "'El Messiri', serif",
        'Changa': "'Changa', sans-serif",
        'Reem Kufi': "'Reem Kufi', sans-serif",
        'Amiri': "'Amiri', serif",
        'Lemonada': "'Lemonada', cursive",
        'Scheherazade New': "'Scheherazade New', serif",
        'Markazi Text': "'Markazi Text', serif",
        'Harmattan': "'Harmattan', sans-serif",
        'Noto Naskh Arabic': "'Noto Naskh Arabic', serif",
        'Rakkas': "'Rakkas', cursive",
        'Jomhuria': "'Jomhuria', cursive",
        'Aref Ruqaa': "'Aref Ruqaa', serif"
    };
    
    return fonts[fontName] || "'Cairo', sans-serif";
}

function loadCurrentUser() {
    try {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            return JSON.parse(userData);
        }
    } catch (error) {
        console.error('خطأ في تحميل بيانات المستخدم:', error);
    }
    return null;
}

function updateUserInterface() {
    const user = loadCurrentUser();
    const userInfoElement = document.getElementById('userInfo');
    const userNameElement = document.getElementById('userName');
    const userRoleElement = document.getElementById('userRole');
    const userAvatarElement = document.getElementById('userAvatar');
    
    if (user) {
        if (userNameElement) {
            userNameElement.textContent = user.name || 'مستخدم';
        }
        
        if (userRoleElement) {
            userRoleElement.textContent = user.roleName || 'مستخدم';
        }
        
        if (userAvatarElement) {
            const initials = (user.name || 'U').charAt(0).toUpperCase();
            userAvatarElement.textContent = initials;
        }
        
        if (userInfoElement) {
            userInfoElement.classList.remove('hidden');
        }
    } else {
        if (userInfoElement) {
            userInfoElement.classList.add('hidden');
        }
    }
}

function hasPermission(permission) {
    const user = loadCurrentUser();
    if (!user) return false;
    
    if (user.employeeCode === 'BB' || user.employeeCode === 'G') {
        return true;
    }
    
    return user.permissions && user.permissions[permission] === true;
}

function updateElementsByPermissions() {
    const user = loadCurrentUser();
    if (!user) return;
    
    document.querySelectorAll('[data-permission]').forEach(element => {
        const requiredPermission = element.dataset.permission;
        if (!hasPermission(requiredPermission)) {
            element.style.display = 'none';
        } else {
            element.style.display = '';
        }
    });
}

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
    const logoContainer = document.getElementById('headerLogoContainer');
    if (logoContainer) {
        logoContainer.onclick = function() {
            if (DesignSystem.logo.pageUrl) {
                window.location.href = DesignSystem.logo.pageUrl;
            }
        };
    }
    
    const markAllReadBtn = document.querySelector('.mark-all-read');
    if (markAllReadBtn) {
        markAllReadBtn.onclick = markAllNotificationsAsRead;
    }
    
    const subscriptionBtn = document.getElementById('subscriptionBtn');
    if (subscriptionBtn) {
        subscriptionBtn.onclick = function() {
            showNotification('📊 عرض تفاصيل الاشتراك', 'info');
        };
    }
    
    const upgradeBtn = document.querySelector('[onclick*="upgradeSubscription"]');
    if (upgradeBtn) {
        upgradeBtn.onclick = function() {
            showNotification('🚀 جاري التوجيه لصفحة ترقية الاشتراك...', 'success');
        };
    }
    
    const supportBtn = document.querySelector('[onclick*="contactSupport"]');
    if (supportBtn) {
        supportBtn.onclick = function() {
            showNotification('💬 جاري فتح محادثة الدعم الفني...', 'success');
        };
    }
    
    const userBtn = document.getElementById('userBtn');
    if (userBtn) {
        userBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdown = document.getElementById('userDropdown');
            if (dropdown) {
                dropdown.classList.toggle('show');
            }
        });
    }
    
    document.addEventListener('click', function() {
        const dropdowns = document.querySelectorAll('.user-dropdown, .notifications-panel, .subscription-panel, .nav-dropdown');
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    });
}

// ========== INITIALIZATION ==========
async function initializeHeader() {
    console.log('🚀 جاري تهيئة الهيدر...');
    
    // 1. First, load settings from localStorage if they exist and session is valid
    const hasValidSession = checkSessionValidity();
    
    if (hasValidSession) {
        const loadedFromLocal = loadSettingsFromLocalStorage();
        if (loadedFromLocal) {
            console.log('✅ تم تحميل الإعدادات من localStorage');
        }
    }
    
    // 2. Sync with Firebase (always check for updates on page load)
    const syncResult = await syncDesignSystemFromFirebase();
    
    if (syncResult) {
        console.log('🔄 تم تحديث الإعدادات من Firebase');
    }
    
    // 3. Apply all settings
    updateCSSVariables();
    setupThemeSwitch();
    updateTheme();
    renderLiveHeader();
    renderUserMenu();
    renderNotifications();
    updateLogoDisplay();
    setupHamburgerMenu();
    updateUserInterface();
    updateElementsByPermissions();
    setupEventListeners();
    
    // 4. Handle subscription display (without auto-refresh)
    if (DesignSystem.subscription && DesignSystem.subscription.apiData) {
        updateSubscriptionUI(DesignSystem.subscription.apiData);
    }
    
    // 5. Check subscription redirection
    checkSubscriptionAndRedirect();
    
    console.log('✅ تم تهيئة الهيدر بنجاح');
}

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeHeader);
} else {
    initializeHeader();
}

// Export for use in other files
window.DesignSystem = DesignSystem;
window.initializeHeader = initializeHeader;
window.updateCSSVariables = updateCSSVariables;
window.renderNotifications = renderNotifications;
window.markNotificationAsRead = markNotificationAsRead;
window.deleteNotification = deleteNotification;
window.markAllNotificationsAsRead = markAllNotificationsAsRead;
window.addTestNotification = addTestNotification;
window.refreshSubscriptionData = refreshSubscriptionData;
window.showNotification = showNotification;
window.updateSubscriptionUI = updateSubscriptionUI;
window.signOut = signOut;
window.loadCurrentUser = loadCurrentUser;
window.hasPermission = hasPermission;
window.syncDesignSystemFromFirebase = syncDesignSystemFromFirebase;