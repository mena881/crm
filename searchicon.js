// ========== نظام القائمة السريعة (Command Menu) - نسخة مبسطة وقوية ==========

// قائمة الصفحات والإجراءات - سهلة التعديل والإضافة
// الشكل: اسم العنصر - (اسم الصلاحية)
const QUICK_ITEMS = [

// ========== 👌👌👌👌👌👌👌👌👌 ==========
    {
        name: 'قائمة العملاء',
        permission: 'عرض العملاء',
        url: 'masterdata.html',
        group: 'العملاء',
        keywords: ['customers', 'عملاء', 'قائمة', 'عرض']
    },
    // ========== 👌👌👌👌👌👌👌👌👌 ==========

            // ========== 👌👌👌👌👌👌👌👌👌 ==========

    {
        name: 'الطلبات المعلقه',
        permission: 'متابعه الطلبات',
        url: 'orders.html',
        group: 'طلبات',
        keywords: ['my order', 'اوردر', 'شحنه', 'توصيل']
    },
            // ========== 👌👌👌👌👌👌👌👌👌 ==========

    {
        name: 'قائمة فواتير البيع',
        permission: 'عرض الفواتير',
        url: 'invoice.html',
        group: 'فواتير',
        keywords: ['invoices', 'فواتير', 'مبيعات', 'قائمة']
    },
            // ========== 👌👌👌👌👌👌👌👌👌 ==========
    {
        name: 'مبالغ التحصيل',
        permission: 'التأكد من التححصيل',
        url: 'getmoney.html',
        group: 'ماليات',
        keywords: ['تحصيل', 'تقفيل']
    },
                // ========== 👌👌👌👌👌👌👌👌👌 ==========

    {
        name: 'تحويل كميات من مخزن لمخزن',
        permission: 'تحويل منتجات',
        url: 'transfer.html',
        group: 'مخزن',
        keywords: ['مخزن', 'تحويل', 'منتجات']
    },  

    {
        name: 'تقفيل حساب السيلز',
        permission: 'تقفيل حساب السيلز في نهايه الشهر ',
        url: 'employeeclosedays.html',
        group: 'ماليات',
        keywords: ['تقفيل', 'نهايه الشهر', 'حسابات']
    },      

    {
        name: ' تحضير الطلبات  ',
        permission: 'تحضير الطلبات المعلقه في المخزن',
        url: 'prepare.html',
        group: 'مخزن',
        keywords: ['تحضير', 'prepare ', 'ارسال للشحن']
    },      

    {
        name: 'جرد المخازن',
        permission: 'معرفه الكميات المتاحه في المخزن',
        url: 'stock.html',
        group: 'مخزن',
        keywords: ['جرد', 'اصناف ', 'كميات']
    }, 
    {
        name: 'تسويه المخازن',
        permission: 'تسويه كميات  في المخزن',
        url: 'stock-adjustment.html',
        group: 'مخزن',
        keywords: ['تسويه', 'مخزن ', 'هالك', 'عجز', 'زياده']
    }, 
    {
        name: 'الارباح و المصروفات',
        permission: 'احتساب الارباح و المصروفات',
        url: 'profit.html',
        group: 'ماليات',
        keywords: ['ارباح', 'مصروفات ', 'profit']
    },  
    {
        name: ' الموردين ',
        permission: 'كشف حساب الموردين',
        url: 'supplierspayments.html',
        group: 'موردين',
        keywords: ['مورد', 'دفعات ', 'كشف حساب']
    },        
    {
        name: 'شحن الطلبات',
        permission: 'تحديث حاله شحن الطلبات',
        url: 'shippingmanagement.html',
        group: 'طلبات',
        keywords: ['شحن', 'طلبات ', 'تحديث']
    },
    {
        name: 'اداره حساب الادمن ',
        permission: 'اداره ايميل و باسوردد الادمن ',
        url: 'settings.html?page=profileadmin.html',
        group: 'اعدادات',
        keywords: ['ادمن', 'owner', 'حساب الادمن']
    },       
    {
        name: 'اداره موظفين',
        permission: 'اضافه موظف جديد',
        url: 'settings.html?page=users.html',
        group: 'اعدادات',
        keywords: ['موظف', 'سيلز ', 'اضافه']
    },
    {
        name: 'اداره شركات الشحن',
        permission: 'اضافه شركه شحن',
        url: 'settings.html?page=shipping.html',
        group: 'اعدادات',
        keywords: ['اضافه شركه شحن', 'شركه ', 'شحن']
    },    
    {
        name: 'اداره مصادر العملاء ',
        permission: 'اضافه مصادر عملاء اخري',
        url: 'settings.html?page=lead-sources.html',
        group: 'اعدادات',
        keywords: ['اضافه مصدر عميل', 'مصدر ', 'عميل']
    },  
    {
        name: 'اداره طرق الدفع',
        permission: 'اضافه طرق دفع اخري',
        url: 'settings.html?page=paymentmethods.html',
        group: 'اعدادات',
        keywords: ['اضافه مصدر عميل', 'مصدر ', 'عميل']
    },  
    {
        name: 'اداره الطلبات من السيلز ',
        permission: 'تحديث الحاله م بين السيلز و المخزن',
        url: 'pending.html',
        group: 'طلبات',
        keywords: ['ارسال للمخزن', 'طلب معلق ', 'سكرتاريه']
    }, 
    {
        name: 'اداره صلاحيات الموظفين',
        permission: 'تحديث الحاله م بين السيلز و المخزن',
        url: 'settings.html?page=Permission.html',
        group: 'اعدادات',
        keywords: ['صلاحيات', 'موظف', 'صلاحيات موظف']
    }, 
    {
        name: 'اداره المخازن و المنتجات ',
        permission: ' اضافه منتج او مخزن',
        url: 'settings.html?page=store.html',
        group: 'اعدادات',
        keywords: ['اضافه', 'منتج', 'باندل']
    }, 
    {
        name: 'اداره الموردين',
        permission: ' اضافه مورد  ',
        url: 'settings.html?page=suppliers.html',
        group: 'اعدادات',
        keywords: ['اضافه', 'مورد', 'اضافه مورد']
    },     
    {
        name: 'اداره المهام',
        permission: 'اداره المهمات للموظفين',
        url: 'tasks.html',
        group: 'مهام',
        keywords: ['task', 'مهمه', 'مهام', 'تاسك']
    }, 
    {
        name: 'اداره حالات المتابعه',
        permission: 'اداره حالات الشحن و الموظفين ',
        url: 'settings.html?page=updates.html',
        group: 'اعدادات',
        keywords: ['حالات', 'ابديت', 'حاله', 'update']
    },
    {
        name: 'فواتير الشراء',
        permission: 'اداره فواتير الشراء  ',
        url: 'purchase-invoices.html',
        group: 'فواتير',
        keywords: ['فواتير', 'شراء', 'فاتوره', 'بضاعه']
    },
    {
        name: 'فواتير مرتجع الشراء',
        permission: 'اداره فواتير مرتجع الشراء  ',
        url: 'PURCHASERETURNS.html',
        group: 'فواتير',
        keywords: ['فواتير', 'مرتجع', 'فاتوره', 'بضاعه']
    },
    {
        name: 'فواتير مرتجع البيع',
        permission: 'اداره فواتير مرتجع البيع  ',
        url: 'returns.html',
        group: 'فواتير',
        keywords: ['فواتير', 'مرتجع', 'فاتوره', 'بضاعه']
    },
    {
        name: 'اداره النسخ الاحتياطي',
        permission: 'النسخ الاحتياطي و الاستعاده',
        url: 'settings.html?page=backup.html',
        group: 'اعدادات',
        keywords: ['backup', 'نسخ احتياطي', 'بيك اب ']
    },  
    {
        name: 'لوحه التحكم',
        permission: 'لوحه التحكم و تقارير ',
        url: 'dashboard.html',
        group: 'تقارير',
        keywords: ['داش بورد', 'dashboard', 'تقارير']
    },        
];

// متغيرات القائمة السريعة
let quickMenuOpen = false;
let quickSelectedIndex = -1;
let quickCurrentResults = [];
let quickSearchTimeout = null;

// تهيئة نظام القائمة السريعة
function initializeQuickMenu() {
    console.log('✅ جاري تهيئة القائمة السريعة...');

    if (!document.getElementById('quickMenuContainer')) {
        createQuickMenu();
    }

    setupQuickMenuListeners();
    document.addEventListener('keydown', handleQuickMenuKeyboard);
}

// إنشاء واجهة القائمة السريعة
function createQuickMenu() {
    const quickMenuHTML = `
    <div id="quickMenuContainer" class="quick-menu-container">
        <div class="quick-menu-btn" id="quickMenuBtn">
            ☰
            <span class="quick-shortcut-hint">Ctrl + K</span>
        </div>
        
        <div class="quick-menu-overlay" id="quickMenuOverlay">
            <div class="quick-menu-modal">
                <div class="quick-menu-header">
                    <h3><i class="fas fa-bolt"></i> القائمة السريعة</h3>
                    <button class="quick-menu-close" id="quickMenuClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="quick-search-wrapper">
                    <i class="fas fa-search quick-search-icon"></i>
                    <input 
                        type="text" 
                        class="quick-search-input" 
                        id="quickSearchInput" 
                        placeholder=""
                        autocomplete="off"
                    >
                </div>
                
                <div class="quick-results" id="quickResults"></div>
                
                <div class="quick-menu-footer">
                    <div class="quick-footer-hint">
                        <span class="quick-hint-item">
                            <span class="quick-hint-key">↑</span>
                            <span class="quick-hint-key">↓</span>
                            <span>للتنقل</span>
                        </span>
                        <span class="quick-hint-item">
                            <span class="quick-hint-key">↵</span>
                            <span>للفتح</span>
                        </span>
                    </div>
                    <span>⚡ بحث سريع</span>
                </div>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', quickMenuHTML);
}

// إعداد مستمعي الأحداث
function setupQuickMenuListeners() {
    document.getElementById('quickMenuBtn')?.addEventListener('click', openQuickMenu);
    document.getElementById('quickMenuClose')?.addEventListener('click', closeQuickMenu);
    
    document.getElementById('quickMenuOverlay')?.addEventListener('click', (e) => {
        if (e.target.id === 'quickMenuOverlay') closeQuickMenu();
    });

    const searchInput = document.getElementById('quickSearchInput');
    searchInput?.addEventListener('input', (e) => {
        clearTimeout(quickSearchTimeout);
        quickSearchTimeout = setTimeout(() => {
            searchQuickItems(e.target.value);
        }, 150);
    });

    searchInput?.addEventListener('keydown', handleQuickMenuNavigation);
}

// فتح القائمة السريعة
function openQuickMenu() {
    const overlay = document.getElementById('quickMenuOverlay');
    const searchInput = document.getElementById('quickSearchInput');
    
    overlay.classList.add('open');
    quickMenuOpen = true;
    
    setTimeout(() => {
        searchInput?.focus();
        searchInput?.select();
    }, 100);
    
    displayQuickResults(QUICK_ITEMS);
    document.addEventListener('keydown', handleQuickMenuEscape);
}

// إغلاق القائمة السريعة
function closeQuickMenu() {
    const overlay = document.getElementById('quickMenuOverlay');
    overlay.classList.remove('open');
    quickMenuOpen = false;
    quickSelectedIndex = -1;
    document.removeEventListener('keydown', handleQuickMenuEscape);
}

// التعامل مع اختصارات لوحة المفاتيح
function handleQuickMenuKeyboard(e) {
    if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        quickMenuOpen ? closeQuickMenu() : openQuickMenu();
    }
}

function handleQuickMenuEscape(e) {
    if (e.key === 'Escape' && quickMenuOpen) closeQuickMenu();
}

// البحث في العناصر
function searchQuickItems(searchTerm) {
    searchTerm = searchTerm.trim().toLowerCase();
    
    if (!searchTerm) {
        displayQuickResults(QUICK_ITEMS);
        return;
    }

    const results = QUICK_ITEMS.filter(item => {
        if (item.name.toLowerCase().includes(searchTerm)) return true;
        if (item.permission.toLowerCase().includes(searchTerm)) return true;
        if (item.group.toLowerCase().includes(searchTerm)) return true;
        if (item.keywords?.some(k => k.toLowerCase().includes(searchTerm))) return true;
        return false;
    });

    displayQuickResults(results);
}

// عرض نتائج البحث - بدون أيقونات، فقط نصوص
function displayQuickResults(results) {
    const container = document.getElementById('quickResults');
    quickCurrentResults = results;
    quickSelectedIndex = results.length > 0 ? 0 : -1;

    if (!container) return;

    if (results.length === 0) {
        container.innerHTML = `
            <div class="quick-no-results">
                <i class="fas fa-search"></i>
                <div>لا توجد نتائج للبحث</div>
                <div class="quick-suggestion">جرب كلمات بحث مختلفة</div>
            </div>
        `;
        return;
    }

    // تجميع النتائج حسب المجموعة
    const groupedResults = {};
    results.forEach(item => {
        if (!groupedResults[item.group]) groupedResults[item.group] = [];
        groupedResults[item.group].push(item);
    });

    let html = '';
    
    for (const [group, items] of Object.entries(groupedResults)) {
        html += `
            <div class="quick-result-group">
                <div class="quick-group-title">${group}</div>
        `;
        
        items.forEach((item, index) => {
            html += `
                <div class="quick-result-item ${quickSelectedIndex === results.indexOf(item) ? 'selected' : ''}" 
                     onclick="goToQuickPage('${item.url}')"
                     data-index="${results.indexOf(item)}">
                    <div class="quick-result-content">
                        <div class="quick-result-name">
                            ${item.name}
                        </div>
                        <div class="quick-result-permission">
                            <i class="fas fa-key"></i>
                            <span>${item.permission}</span>
                        </div>
                    </div>
                    <div class="quick-result-shortcut">
                        ↵
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
    }

    container.innerHTML = html;
}

// التنقل في النتائج باستخدام لوحة المفاتيح
function handleQuickMenuNavigation(e) {
    const results = quickCurrentResults;
    if (results.length === 0) return;

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            quickSelectedIndex = (quickSelectedIndex + 1) % results.length;
            updateQuickSelectedItem();
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            quickSelectedIndex = (quickSelectedIndex - 1 + results.length) % results.length;
            updateQuickSelectedItem();
            break;
            
        case 'Enter':
            e.preventDefault();
            if (quickSelectedIndex >= 0 && quickSelectedIndex < results.length) {
                goToQuickPage(results[quickSelectedIndex].url);
            }
            break;
    }
}

// تحديث العنصر المحدد
function updateQuickSelectedItem() {
    document.querySelectorAll('.quick-result-item').forEach(item => {
        item.classList.remove('selected');
    });

    const selectedItem = document.querySelector(`.quick-result-item[data-index="${quickSelectedIndex}"]`);
    if (selectedItem) {
        selectedItem.classList.add('selected');
        selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
}

// الانتقال إلى الصفحة
function goToQuickPage(url) {
    closeQuickMenu();
    
    document.body.style.opacity = '0.5';
    document.body.style.transition = 'opacity 0.2s';
    
    setTimeout(() => {
        window.location.href = url;
    }, 150);
}

// دالة مساعدة لإضافة عناصر جديدة بسهولة
function addQuickItem(name, permission, url, group, keywords = []) {
    QUICK_ITEMS.push({
        name: name,
        permission: permission,
        url: url,
        group: group,
        keywords: keywords
    });
    console.log(`✅ تم إضافة: ${name}`);
}

// ========== تصدير الدوال ==========
window.initializeQuickMenu = initializeQuickMenu;
window.openQuickMenu = openQuickMenu;
window.closeQuickMenu = closeQuickMenu;
window.goToQuickPage = goToQuickPage;
window.addQuickItem = addQuickItem;

// تهيئة تلقائية عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeQuickMenu);
} else {
window.initializeQuickMenu = initializeQuickMenu;
}