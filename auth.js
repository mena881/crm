/**
 * نظام المصادقة وإدارة التراخيص
 * الإصدار: 3.1
 * آخر تحديث: 2026-03-10
 * التعديلات: إضافة قراءة دور المستخدم من جدول roles وعرضه في الهيدر بشكل احترافي
 */

// ======================== الإعدادات العامة ========================
const FIREBASE_CONFIG = {
    databaseURL: "https://test-3b890-default-rtdb.firebaseio.com/"
};

// روابط APIs
const APIS = {
    VERIFY: "https://script.google.com/macros/s/AKfycbyXyhZPA-xMWsal6fpi-8dXV7hHBfjm8XEwGnHAAxEwSJAK3Qlcjh0zy3EOXbe6yGNm/exec",
    LOGIN_RECORD: "https://script.google.com/macros/s/AKfycbzfpHuNaSs-96CSVnrDHtcf9_gRsJvbWZfs0cz3K4U81wkjogA1zbAUy11C71aOMY1eSA/exec"
};

// ======================== دوال مساعدة للتشفير ========================

/**
 * تشفير النص إلى Base64 (لتوافق مع صفحة profileadmin.html)
 * @param {string} str - النص المراد تشفيره
 * @returns {string} النص المشفر
 */
function hashPassword(str) {
    if (!str) return '';
    try {
        // استخدام btoa لتشفير Base64 (كما في صفحة profileadmin)
        return btoa(str);
    } catch (e) {
        console.error('خطأ في تشفير كلمة المرور:', e);
        return '';
    }
}

/**
 * فك تشفير النص من Base64
 * @param {string} str - النص المشفر
 * @returns {string} النص الأصلي
 */
function decodeHash(str) {
    if (!str) return '';
    try {
        return atob(str);
    } catch (e) {
        return '';
    }
}

// ======================== Firebase ========================
let firebaseApp = null;
let database = null;

// تهيئة Firebase
function initFirebase() {
    if (!firebase.apps || !firebase.apps.length) {
        try {
            firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
            database = firebase.database();
            console.log('✅ Firebase initialized');
        } catch (error) {
            console.error('❌ Firebase initialization error:', error);
        }
    } else {
        firebaseApp = firebase.apps[0];
        database = firebase.database();
    }
}

// تحميل Firebase SDK إذا لم يكن موجوداً
function loadFirebaseSDK() {
    return new Promise((resolve, reject) => {
        if (typeof firebase !== 'undefined' && firebase.database) {
            initFirebase();
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js';
        script.onload = () => {
            const dbScript = document.createElement('script');
            dbScript.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js';
            dbScript.onload = () => {
                initFirebase();
                resolve();
            };
            dbScript.onerror = reject;
            document.head.appendChild(dbScript);
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// ======================== المتغيرات العامة ========================
let currentLicenseCode = localStorage.getItem('licenseCode') || null;
let currentUser = null; // { id, name, role, code, roleName }

// عناصر DOM
const messageDiv = document.getElementById('message');
const licenseInfoDiv = document.getElementById('licenseInfo');
const licenseCodeDisplay = document.getElementById('licenseCodeDisplay');
const licenseStatusDisplay = document.getElementById('licenseStatusDisplay');
const licenseUserName = document.getElementById('licenseUserName');
const licenseDaysLeft = document.getElementById('licenseDaysLeft');
const autoCheckInfo = document.getElementById('autoCheckInfo');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const headerUserRole = document.getElementById('headerUserRole'); // عنصر عرض الدور في الهيدر

// ======================== دالة عرض الرسائل ========================
function showMessage(msg, type = 'info') {
    if (!messageDiv) return;
    messageDiv.textContent = msg;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    // إخفاء الرسالة بعد 5 ثوان
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// ======================== دالة الحصول على اسم الدور بشكل احترافي ========================

/**
 * الحصول على اسم الدور بشكل احترافي من جدول roles
 * @param {string} roleId - معرف الدور
 * @returns {Promise<string>} اسم الدور
 */
async function getRoleName(roleId) {
    if (!database || !roleId) return 'موظف';
    
    try {
        // البحث في جدول roles
        const snapshot = await database.ref('roles').once('value');
        const roles = snapshot.val();
        
        if (roles && roles[roleId]) {
            // إذا وجدنا الدور، نعيد اسمه
            return roles[roleId].name || roles[roleId].title || 'موظف';
        }
        
        // إذا كان roleId هو owner أو كلمة محددة
        if (roleId === 'owner' || roleId === 'OWNER') {
            return 'Owner';
        }
        
        return 'موظف';
    } catch (error) {
        console.error('خطأ في الحصول على اسم الدور:', error);
        return 'موظف';
    }
}

/**
 * تحديث عرض الدور في الهيدر
 * @param {Object} user - بيانات المستخدم
 */
async function updateHeaderRole(user) {
    if (!user) return;
    
    // البحث عن عنصر الهيدر لعرض الدور
    const headerRoleElement = document.getElementById('headerUserRole') || document.querySelector('.user-role');
    
    if (headerRoleElement) {
        if (user.role === 'owner') {
            headerRoleElement.textContent = 'Owner';
            headerRoleElement.className = 'user-role role-owner';
        } else {
            // محاولة الحصول على اسم الدور من جدول roles
            const roleName = await getRoleName(user.role);
            headerRoleElement.textContent = roleName;
            headerRoleElement.className = 'user-role role-employee';
        }
    }
    
    // تحديث أي عناصر أخرى تعرض اسم المستخدم أو دوره
    const userNameElement = document.getElementById('headerUserName') || document.querySelector('.user-name');
    if (userNameElement && user.name) {
        userNameElement.textContent = user.name;
    }
}

// ======================== دوال التحقق من المالك (owner) ========================

/**
 * البحث عن المالك في قاعدة البيانات
 * @param {string} username - اسم المستخدم
 * @param {string} password - كلمة المرور
 * @returns {Promise<Object|null>} بيانات المالك أو null
 */
async function findOwner(username, password) {
    if (!database) return null;
    
    try {
        const snapshot = await database.ref('owners').once('value');
        const owners = snapshot.val();
        
        if (!owners) return null;
        
        // البحث في كل مالك
        for (const [ownerId, ownerData] of Object.entries(owners)) {
            const profile = ownerData.profile;
            if (!profile) continue;
            
            // التحقق من اسم المستخدم (يمكن أن يكون الإيميل أو أي حقل آخر)
            if (profile.email === username) {
                // تشفير كلمة المرور المدخلة ومقارنتها مع المشفرة المخزنة
                const hashedInput = hashPassword(password);
                if (hashedInput === profile.passwordHash) {
                    return {
                        id: ownerId,
                        name: profile.name || 'المالك',
                        email: profile.email,
                        phone: profile.phone,
                        role: 'owner',
                        roleName: 'Owner',
                        code: 'OWNER'
                    };
                }
            }
        }
        
        return null;
    } catch (error) {
        console.error('خطأ في البحث عن المالك:', error);
        return null;
    }
}

// ======================== دوال التحقق من الموظفين ========================

/**
 * البحث عن موظف في قاعدة البيانات مع قراءة دوره من جدول roles
 * @param {string} username - اسم المستخدم
 * @param {string} password - كلمة المرور
 * @returns {Promise<Object|null>} بيانات الموظف أو null
 */
async function findEmployee(username, password) {
    if (!database) return null;
    
    try {
        const snapshot = await database.ref('employees').once('value');
        const employees = snapshot.val();
        
        if (!employees) return null;
        
        // البحث في كل موظف
        for (const [empId, empData] of Object.entries(employees)) {
            // يمكن أن يكون اسم المستخدم هو username أو email
            if (empData.username === username || empData.email === username) {
                if (empData.password === password) {
                    
                    // قراءة اسم الدور من جدول roles إذا كان موجوداً
                    let roleName = 'موظف';
                    if (empData.roleId) {
                        const rolesSnapshot = await database.ref(`roles/${empData.roleId}`).once('value');
                        const roleData = rolesSnapshot.val();
                        if (roleData) {
                            roleName = roleData.name || roleData.title || 'موظف';
                        }
                    }
                    
                    return {
                        id: empId,
                        name: empData.name,
                        username: empData.username,
                        email: empData.email,
                        role: empData.roleId || 'employee', // معرف الدور
                        roleName: roleName, // اسم الدور المعروض
                        code: empData.employeeCode || 'EMP'
                    };
                }
            }
        }
        
        return null;
    } catch (error) {
        console.error('خطأ في البحث عن الموظف:', error);
        return null;
    }
}

// ======================== دوال التحقق من الاشتراك (الترخيص) ========================

/**
 * التحقق من صحة كود الترخيص
 * @param {string} code - كود الترخيص
 * @returns {Promise<Object|null>} بيانات الترخيص أو null
 */
async function verifyLicenseCode(code) {
    if (!code) return null;
    
    // محاكاة التحقق من الترخيص من قاعدة البيانات أو API
    try {
        // أولاً: التحقق من وجود الكود في إعدادات التصميم
        if (database) {
            const snapshot = await database.ref('design-system/subscription').once('value');
            const subData = snapshot.val();
            
            if (subData && subData.code === code) {
                return {
                    success: true,
                    subscriptionCode: subData.code,
                    user: subData.username || 'مستخدم النظام',
                    status: subData.status === 'نشط' ? 'Active' : 'Inactive',
                    daysRemaining: subData.remainingDays || 365,
                    type: subData.type || 'عادي',
                    startDate: subData.startDate,
                    endDate: subData.endDate
                };
            }
        }
        
        // إذا لم نجد في Firebase، نستخدم API خارجي
        const response = await fetch(`${APIS.VERIFY}?code=${encodeURIComponent(code)}`);
        const data = await response.json();
        
        if (data && data.success) {
            return data;
        }
        
        return null;
    } catch (error) {
        console.error('خطأ في التحقق من الترخيص:', error);
        return null;
    }
}

/**
 * تسجيل محاولة الدخول في سجل المالك
 * @param {string} ownerId - معرف المالك
 * @param {string} status - حالة الدخول (success/failed)
 */
async function recordOwnerLogin(ownerId, status = 'success') {
    if (!database || !ownerId) return;
    
    try {
        const now = new Date();
        const timestamp = now.toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' });
        
        // معلومات الجهاز
        const ua = navigator.userAgent;
        let browser = 'Chrome';
        if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Edg')) browser = 'Edge';
        
        let os = 'Windows';
        if (ua.includes('Mac')) os = 'macOS';
        else if (ua.includes('Linux')) os = 'Linux';
        else if (ua.includes('Android')) os = 'Android';
        else if (ua.includes('iPhone')) os = 'iOS';
        
        const device = `${os} · ${browser}`;
        
        // الحصول على IP (محاكاة)
        const ip = '192.168.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255);
        
        const loginEntry = {
            timestamp: timestamp,
            status: status,
            ip: ip,
            device: device,
            location: 'مصر'
        };
        
        // إضافة إلى سجل الدخول
        await database.ref(`owners/${ownerId}/loginHistory`).push(loginEntry);
        
        // تسجيل النشاط
        const activityEntry = {
            timestamp: timestamp,
            action: status === 'success' ? 'تسجيل دخول ناجح' : 'محاولة دخول فاشلة',
            details: status === 'success' ? 'تم تسجيل الدخول بنجاح' : 'فشل تسجيل الدخول',
            performedBy: 'owner'
        };
        await database.ref(`owners/${ownerId}/activityLog`).push(activityEntry);
        
    } catch (error) {
        console.error('خطأ في تسجيل سجل المالك:', error);
    }
}

// ======================== دالة تسجيل الدخول الرئيسية ========================

async function signIn() {
    const username = usernameInput?.value.trim();
    const password = passwordInput?.value.trim();
    
    if (!username || !password) {
        showMessage('الرجاء إدخال اسم المستخدم وكلمة المرور', 'error');
        return;
    }
    
    // عرض رسالة تحميل
    showMessage('جاري التحقق من البيانات...', 'info');
    
    try {
        // تحميل Firebase إذا لم يكن محملاً
        await loadFirebaseSDK();
        
        if (!database) {
            showMessage('خطأ في الاتصال بقاعدة البيانات', 'error');
            return;
        }
        
        // 1. البحث عن المالك أولاً
        const owner = await findOwner(username, password);
        
        if (owner) {
            // تم العثور على المالك
            currentUser = owner;
            
            // تسجيل الدخول الناجح في سجل المالك
            await recordOwnerLogin(owner.id, 'success');
            
            showMessage(`مرحباً بك ${owner.name} (Owner)`, 'success');
            
            // تخزين بيانات المستخدم
            localStorage.setItem('currentUser', JSON.stringify({
                id: owner.id,
                name: owner.name,
                role: owner.role,
                roleName: owner.roleName,
                code: owner.code
            }));
            
            // تخزين رمز الترخيص إذا كان موجوداً
            if (currentLicenseCode) {
                localStorage.setItem('licenseCode', currentLicenseCode);
            }
            
            // تحديث الهيدر باسم الدور
            await updateHeaderRole(owner);
            
            // التوجيه إلى لوحة التحكم المناسبة
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
            return;
        }
        
        // 2. إذا لم يكن مالكاً، نبحث بين الموظفين
        const employee = await findEmployee(username, password);
        
        if (employee) {
            currentUser = employee;
            
            showMessage(`مرحباً بك ${employee.name} (${employee.roleName})`, 'success');
            
            // تخزين بيانات المستخدم
            localStorage.setItem('currentUser', JSON.stringify({
                id: employee.id,
                name: employee.name,
                role: employee.role,
                roleName: employee.roleName,
                code: employee.code
            }));
            
            // تخزين رمز الترخيص إذا كان موجوداً
            if (currentLicenseCode) {
                localStorage.setItem('licenseCode', currentLicenseCode);
            }
            
            // تحديث الهيدر باسم الدور
            await updateHeaderRole(employee);
            
            // التوجيه إلى لوحة التحكم
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
            return;
        }
        
        // 3. إذا لم يتم العثور على المستخدم
        showMessage('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
        
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        showMessage('حدث خطأ أثناء تسجيل الدخول. الرجاء المحاولة مرة أخرى.', 'error');
    }
}

// ======================== دوال الترخيص ========================

async function verifyLicense() {
    if (!currentLicenseCode) {
        showMessage('لا يوجد كود ترخيص نشط. الرجاء إدخال كود جديد.', 'error');
        return;
    }
    
    autoCheckInfo.classList.add('show');
    
    try {
        await loadFirebaseSDK();
        
        const licenseData = await verifyLicenseCode(currentLicenseCode);
        
        autoCheckInfo.classList.remove('show');
        
        if (licenseData && licenseData.success) {
            // عرض معلومات الترخيص
            licenseCodeDisplay.textContent = licenseData.subscriptionCode || currentLicenseCode;
            licenseStatusDisplay.textContent = licenseData.status === 'Active' ? 'نشط' : 'منتهي';
            licenseStatusDisplay.className = `license-status ${licenseData.status === 'Active' ? 'status-active' : 'status-expired'}`;
            licenseUserName.textContent = licenseData.user || 'غير معروف';
            
            const daysLeft = licenseData.daysRemaining || 0;
            licenseDaysLeft.textContent = daysLeft + ' يوم';
            
            licenseInfoDiv.classList.add('show');
            
            showMessage('تم التحقق من الترخيص بنجاح', 'success');
        } else {
            showMessage('كود الترخيص غير صالح أو منتهي الصلاحية', 'error');
        }
    } catch (error) {
        autoCheckInfo.classList.remove('show');
        showMessage('خطأ في التحقق من الترخيص', 'error');
        console.error(error);
    }
}

function goToLicense() {
    window.location.href = 'license.html';
}

// ======================== التحقق التلقائي عند تحميل الصفحة ========================

window.addEventListener('load', async () => {
    // تحميل Firebase تلقائياً
    try {
        await loadFirebaseSDK();
        console.log('✅ Firebase ready');
    } catch (error) {
        console.error('❌ Firebase load error:', error);
    }
    
    // التحقق من وجود رمز ترخيص مخزن
    if (currentLicenseCode) {
        setTimeout(() => verifyLicense(), 1000);
    }
    
    // استعادة بيانات المستخدم من localStorage وتحديث الهيدر
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            await updateHeaderRole(currentUser);
        } catch (e) {
            console.error('خطأ في قراءة بيانات المستخدم:', e);
        }
    }
});

// ======================== دوال إضافية ========================

// دالة لتسجيل الخروج
function signOut() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('licenseCode');
    currentUser = null;
    currentLicenseCode = null;
    showMessage('تم تسجيل الخروج بنجاح', 'success');
    setTimeout(() => {
        window.location.href = 'SIGNIN.html';
    }, 1500);
}
    
// دالة للتحقق من صلاحيات المستخدم
function hasPermission(permission) {
    if (!currentUser) return false;
    
    // المالك لديه كل الصلاحيات
    if (currentUser.role === 'owner') return true;
    
    // يمكن إضافة منطق التحقق من الصلاحيات للموظفين هنا
    // حسب هيكل الصلاحيات في roles
    
    return false;
}

// دالة للحصول على اسم الدور الحالي
function getCurrentRoleName() {
    if (!currentUser) return 'زائر';
    return currentUser.roleName || (currentUser.role === 'owner' ? 'Owner' : 'موظف');
}