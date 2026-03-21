/**
 * orders-filter.js
 * 
 * هذا الملف مسؤول عن تصفية الطلبات بحيث تظهر فقط الطلبات الخاصة بالموظف الحالي
 * يقوم بقراءة معلومات المستخدم من الهيدر ومقارنتها مع حقل salesEmployeeId في الفواتير
 */

// ========== متغيرات عامة ==========
let currentUser = null;
let currentUserId = null;
let currentUserName = null;
let currentUserCode = null;

// ========== تهيئة الفلتر ==========
document.addEventListener('DOMContentLoaded', function() {
    // محاولة الحصول على معلومات المستخدم الحالي
    extractCurrentUserInfo();
    
    // مراقبة التغييرات في المتغيرات العامة
    observeUserChanges();
});

/**
 * استخراج معلومات المستخدم الحالي من عناصر الهيدر
 */
function extractCurrentUserInfo() {
    // محاولة الحصول على اسم المستخدم من الهيدر
    const userNameElement = document.querySelector('.user-btn span, .user-info span, #userBtn span, .user-name');
    if (userNameElement) {
        currentUserName = userNameElement.textContent.trim();
        console.log('تم العثور على اسم المستخدم:', currentUserName);
    }
    
    // محاولة الحصول على اسم المستخدم من النص الموجود في الصورة
    // النص: "مينا سماح" أو "مدير" أو غيره
    const headerElements = document.querySelectorAll('.header-content span, .user-menu-module span, .user-btn');
    headerElements.forEach(el => {
        const text = el.textContent.trim();
        if (text && text.length > 0 && !text.includes('fas') && !text.includes('fa-')) {
            if (['مينا سماح', 'مدير', 'مينا سامح', 'مدحت سامح'].includes(text) || 
                text.includes('مينا') || text.includes('مدحت')) {
                currentUserName = text;
                console.log('تم العثور على اسم المستخدم من النص:', currentUserName);
            }
        }
    });
    
    // محاولة الحصول على معرف المستخدم من التخزين المحلي
    try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            currentUserId = userData.id || userData.employeeId || userData.uid;
            currentUserName = userData.name || currentUserName;
            currentUserCode = userData.employeeCode || userData.code;
            console.log('تم استرجاع بيانات المستخدم من localStorage:', currentUserCode);
        }
    } catch (e) {
        console.log('خطأ في قراءة localStorage:', e);
    }
    
    // محاولة الحصول على معلومات المستخدم من Firebase إذا كانت متاحة
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                currentUserId = user.uid;
                currentUserName = user.displayName || currentUserName;
                console.log('مستخدم Firebase:', currentUserId);
            }
        });
    }
}

/**
 * مراقبة التغييرات في المتغيرات العامة
 */
function observeUserChanges() {
    // مراقبة التغييرات في window.userInfo إذا كان موجوداً
    if (window.userInfo) {
        currentUserId = window.userInfo.id || window.userInfo.employeeId;
        currentUserName = window.userInfo.name;
        currentUserCode = window.userInfo.employeeCode;
    }
    
    // محاولة الحصول على معلومات المستخدم من العناصر بعد تحميل الهيدر
    setTimeout(() => {
        const headerScript = document.querySelector('script[src="header-script.js"]');
        if (headerScript) {
            // محاولة الوصول إلى متغيرات الهيدر
            if (window.currentEmployee) {
                currentUserId = window.currentEmployee.id;
                currentUserName = window.currentEmployee.name;
                currentUserCode = window.currentEmployee.employeeCode;
            }
        }
    }, 1000);
}

/**
 * التحقق مما إذا كان الموظف الحالي هو صاحب الفاتورة
 * @param {Object} invoice - الفاتورة المراد التحقق منها
 * @returns {boolean} - true إذا كانت الفاتورة تخص الموظف الحالي
 */
function isInvoiceForCurrentUser(invoice) {
    if (!invoice) return false;
    
    // إذا لم يكن هناك مستخدم حالياً، نرجع false (لا نظهر أي طلبات)
    if (!currentUserId && !currentUserName && !currentUserCode) {
        console.log('لا توجد معلومات للمستخدم الحالي');
        return false;
    }
    
    // الحصول على معرف الموظف المسؤول عن الفاتورة
    const invoiceEmployeeId = invoice.salesEmployeeId || invoice.employeeId;
    const invoiceEmployeeName = invoice.salesEmployeeName || invoice.employeeName;
    
    // طباعة معلومات التصحيح
    console.log('مقارنة:', {
        invoiceEmployeeId,
        currentUserId,
        invoiceEmployeeName,
        currentUserName,
        currentUserCode
    });
    
    // التحقق من التطابق بطرق مختلفة
    
    // 1. التحقق من تطابق المعرف
    if (invoiceEmployeeId && currentUserId) {
        if (invoiceEmployeeId === currentUserId) return true;
        
        // التحقق من المعرفات الخاصة (مثل OmvTt3FqcW3C_l7_2IF)
        const knownIds = {
            'مينا سامح': ['-Om20faxELPBUPFrju0r', 'mena'],
            'مدحت سامح': ['-OmvTt3FqcW3C_l7_2IF', 'BB']
        };
        
        for (let [name, ids] of Object.entries(knownIds)) {
            if (ids.includes(invoiceEmployeeId) && currentUserName && currentUserName.includes(name)) {
                return true;
            }
        }
    }
    
    // 2. التحقق من تطابق كود الموظف
    if (invoiceEmployeeId && currentUserCode) {
        if (invoiceEmployeeId === currentUserCode) return true;
    }
    
    // 3. التحقق من تطابق الاسم
    if (invoiceEmployeeName && currentUserName) {
        if (invoiceEmployeeName === currentUserName) return true;
        if (currentUserName.includes(invoiceEmployeeName) || invoiceEmployeeName.includes(currentUserName)) {
            return true;
        }
    }
    
    // 4. التحقق من المعرفات المعروفة في قاعدة البيانات
    const employeeMap = {
        '-Om20faxELPBUPFrju0r': ['مينا سامح', 'mena'],
        '-OmvTt3FqcW3C_l7_2IF': ['مدحت سامح', 'BB'],
        '-OmndEVRhCtbsteYjl88': ['مدحت سامح', 'BB']
    };
    
    if (invoiceEmployeeId && employeeMap[invoiceEmployeeId]) {
        const employeeNames = employeeMap[invoiceEmployeeId];
        if (currentUserName && employeeNames.some(name => currentUserName.includes(name))) {
            return true;
        }
    }
    
    return false;
}

/**
 * تعديل دالة renderTable الأصلية لتصفية الطلبات
 */
function patchRenderTable() {
    if (typeof renderTable === 'function') {
        const originalRenderTable = renderTable;
        window.renderTable = function() {
            console.log('تطبيق فلتر المستخدم على الطلبات');
            
            // تصفية الطلبات حسب المستخدم الحالي
            const userInvoices = allInvoices.filter(inv => isInvoiceForCurrentUser(inv));
            
            console.log(`إجمالي الطلبات: ${allInvoices.length}, طلبات المستخدم: ${userInvoices.length}`);
            
            // تخزين الطلبات المفلترة
            window.filteredUserInvoices = userInvoices;
            
            // استدعاء الدالة الأصلية مع الطلبات المفلترة
            return originalRenderTable.call(this, userInvoices);
        };
    }
}

/**
 * تعديل دالة applyFilters الأصلية
 */
function patchApplyFilters() {
    if (typeof applyFilters === 'function') {
        const originalApplyFilters = applyFilters;
        window.applyFilters = function() {
            console.log('تطبيق الفلاتر على طلبات المستخدم');
            
            // استخدام allInvoices المعدل
            if (!window._originalAllInvoices) {
                window._originalAllInvoices = allInvoices;
            }
            
            // تصفية الطلبات حسب المستخدم أولاً
            const userInvoices = window._originalAllInvoices.filter(inv => isInvoiceForCurrentUser(inv));
            
            // تحديث allInvoices مؤقتاً
            const tempInvoices = allInvoices;
            allInvoices = userInvoices;
            
            // استدعاء الدالة الأصلية
            originalApplyFilters();
            
            // إعادة allInvoices إلى حالته الأصلية
            allInvoices = tempInvoices;
        };
    }
}

/**
 * تعديل دالة setupRealtimeListeners لتصفية البيانات عند الاستقبال
 */
function patchFirebaseListeners() {
    if (typeof setupRealtimeListeners === 'function') {
        const originalSetup = setupRealtimeListeners;
        window.setupRealtimeListeners = function() {
            console.log('إعداد مستمعي Firebase مع فلتر المستخدم');
            
            // حفظ المرجع الأصلي
            const originalInvoicesRef = invoicesRef;
            
            if (invoicesRef) {
                // إزالة المستمع القديم إذا كان موجوداً
                invoicesRef.off();
                
                // إضافة مستمع جديد مع التصفية
                invoicesRef.on('value', (snapshot) => {
                    const data = snapshot.val();
                    const allInvoicesData = data 
                        ? Object.entries(data)
                            .map(([id, val]) => ({ id, ...val }))
                            .filter(inv => !inv.isReturn)
                        : [];
                    
                    // حفظ كل الطلبات
                    window._allInvoicesRaw = allInvoicesData;
                    
                    // تصفية حسب المستخدم
                    const userInvoices = allInvoicesData.filter(inv => isInvoiceForCurrentUser(inv));
                    
                    console.log(`تم استلام ${allInvoicesData.length} طلب، ${userInvoices.length} تخص المستخدم الحالي`);
                    
                    // تحديث المتغير العام
                    allInvoices = userInvoices;
                    
                    // تطبيق الفلاتر
                    if (typeof applyFilters === 'function') {
                        applyFilters();
                    } else {
                        renderTable();
                    }
                });
            }
        };
    }
}

/**
 * إضافة عنصر تحكم لتغيير المستخدم (للاختبار)
 */
function addUserDebugControls() {
    const filterBar = document.querySelector('.filter-bar');
    if (filterBar && !document.getElementById('userDebugControl')) {
        const debugDiv = document.createElement('div');
        debugDiv.id = 'userDebugControl';
        debugDiv.className = 'filter-group';
        debugDiv.style.marginRight = 'auto';
        debugDiv.innerHTML = `
            <label><i class="fas fa-user-tag"></i> المستخدم الحالي:</label>
            <select id="userDebugSelect" style="min-width: 150px;">
                <option value="">اختر المستخدم</option>
                <option value="-Om20faxELPBUPFrju0r">مينا سامح (mena)</option>
                <option value="-OmvTt3FqcW3C_l7_2IF">مدحت سامح (BB)</option>
                <option value="-OmndEVRhCtbsteYjl88">مدحت سامح 2 (BB)</option>
            </select>
        `;
        filterBar.appendChild(debugDiv);
        
        document.getElementById('userDebugSelect').addEventListener('change', function(e) {
            const userId = e.target.value;
            if (userId) {
                // محاكاة تغيير المستخدم
                currentUserId = userId;
                if (userId.includes('Om20')) {
                    currentUserName = 'مينا سامح';
                    currentUserCode = 'mena';
                } else {
                    currentUserName = 'مدحت سامح';
                    currentUserCode = 'BB';
                }
                
                console.log('تم تغيير المستخدم إلى:', { userId, currentUserName, currentUserCode });
                
                // إعادة تحميل الطلبات
                if (invoicesRef) {
                    invoicesRef.on('value', (snapshot) => {
                        const data = snapshot.val();
                        const allInvoicesData = data 
                            ? Object.entries(data)
                                .map(([id, val]) => ({ id, ...val }))
                                .filter(inv => !inv.isReturn)
                            : [];
                        
                        allInvoices = allInvoicesData.filter(inv => isInvoiceForCurrentUser(inv));
                        
                        if (typeof applyFilters === 'function') {
                            applyFilters();
                        } else {
                            renderTable();
                        }
                    });
                }
            }
        });
    }
}

// ========== تنفيذ التصحيحات ==========
// الانتظار حتى يتم تحميل جميع السكربتات
let attempts = 0;
const maxAttempts = 20;

function applyPatches() {
    attempts++;
    console.log(`محاولة تطبيق التصحيحات #${attempts}`);
    
    // محاولة الحصول على معلومات المستخدم مرة أخرى
    extractCurrentUserInfo();
    
    // تطبيق التصحيحات على الدوال
    if (typeof renderTable === 'function') {
        patchRenderTable();
    }
    
    if (typeof applyFilters === 'function') {
        patchApplyFilters();
    }
    
    if (typeof setupRealtimeListeners === 'function') {
        patchFirebaseListeners();
    }
    
    // إضافة عناصر التحكم للاختبار
    addUserDebugControls();
    
    // إذا تم تطبيق جميع التصحيحات أو وصلنا للحد الأقصى، نتوقف
    if ((typeof renderTable === 'function' && 
         typeof applyFilters === 'function' && 
         typeof setupRealtimeListeners === 'function') || attempts >= maxAttempts) {
        console.log('تم تطبيق جميع التصحيحات');
        return;
    }
    
    // وإلا نستمر في المحاولة
    setTimeout(applyPatches, 500);
}

// بدء تطبيق التصحيحات بعد تحميل الصفحة
setTimeout(applyPatches, 1000);

// ========== دوال مساعدة إضافية ==========

/**
 * الحصول على قائمة بجميع الموظفين من قاعدة البيانات
 */
function loadAllEmployees() {
    if (typeof db !== 'undefined' && db) {
        db.ref('employees').once('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                window.allEmployeesData = Object.entries(data).map(([id, val]) => ({ id, ...val }));
                console.log('تم تحميل بيانات الموظفين:', window.allEmployeesData);
            }
        });
    }
}

/**
 * تحديث معلومات المستخدم الحالي
 */
function refreshCurrentUser() {
    extractCurrentUserInfo();
    if (invoicesRef) {
        invoicesRef.on('value', (snapshot) => {
            const data = snapshot.val();
            const allInvoicesData = data 
                ? Object.entries(data)
                    .map(([id, val]) => ({ id, ...val }))
                    .filter(inv => !inv.isReturn)
                : [];
            
            allInvoices = allInvoicesData.filter(inv => isInvoiceForCurrentUser(inv));
            
            if (typeof applyFilters === 'function') {
                applyFilters();
            }
        });
    }
}

// تصدير الدوال للاستخدام العام
window.ordersFilter = {
    isInvoiceForCurrentUser,
    refreshCurrentUser,
    getCurrentUser: () => ({ id: currentUserId, name: currentUserName, code: currentUserCode })
};

// تحميل بيانات الموظفين
setTimeout(loadAllEmployees, 1500);