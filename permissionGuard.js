// ===============================
// Permission Guard V6
// سريع + آمن + مراقبة DOM
// ===============================


// اخفاء الصفحة مؤقتا
document.documentElement.style.visibility = "hidden";


// ===============================
// جلب المستخدم
// ===============================

function loadCurrentUser(){

    let user = localStorage.getItem("currentUser");

    if(!user) return null;

    try{
        user = JSON.parse(user);
    }catch{
        return null;
    }

    if(!user) return null;

    // owner يحصل على كل الصلاحيات
    if(
        (user.roleName && user.roleName.toLowerCase() === "owner") ||
        (user.role && user.role.toLowerCase() === "owner")
    ){
        user.permissions = {"*":true};
    }

    return user;
}


// ===============================
// ربط الصفحات بالصلاحيات
// ===============================

const PAGE_PERMISSIONS = {

    "invoice.html":"view_invoice_done",
    "masterdata.html":"view_customers",
    "purchase-invoices.html":"view_purchase_invoices",
    "purchasereturns.html":"view_purchase_returns",
    "returns.html":"view_returns",
    "transfer.html":"view_transfers",
    "employeeclosedays.html":"view_sales_account_page",
    "supplierspayments.html":"view_supplier_payments",
    "prepare.html":"view_prepare_page",
    "profileadmin.html":"view_profile_admin",
    "updates.html":"view_updates",
    "users.html":"view_users",
    "shipping.html":"view_shipping",
    "suppliers.html":"view_suppliers",
    "store.html":"view_store",
    "stock.html":"view_stock",
    "tasks.html":"view_tasks",
    "paymentmethods.html":"view_paymentmethods",
    "lead-sources.html":"view_lead-sources",
    "pending.html":"view_pending_orders",
    "orders.html":"view_orders",
    "permission.html":"view_Permission",
    "profit.html":"control_expense",
    "stock-adjustment.html":"view_stockadjustment",
    "backup.html":"view_backup",
    "shippingmanagement.html":"view_shipping_page"

};


// ===============================
// معرفة الصفحة الحالية
// ===============================

const pageName = window.location.pathname.split("/").pop().toLowerCase();
const PAGE_PERMISSION = PAGE_PERMISSIONS[pageName];


// ===============================
// اظهار الصفحة
// ===============================

function showPage(){
    document.documentElement.style.visibility="visible";
}


// ===============================
// رسالة عدم الصلاحية
// ===============================

function showNoPermission(){

    document.body.innerHTML=`
    <div style="
        display:flex;
        justify-content:center;
        align-items:center;
        height:100vh;
        font-family:Cairo;
        font-size:22px;
        color:#ef4444;
    ">
        ليس لديك صلاحية لدخول هذه الصفحة
    </div>
    `;

    showPage();
}


// ===============================
// فحص الصلاحيات
// ===============================

function hasPermission(user,permission){

    if(!user) return false;

    if(user.permissions && user.permissions["*"]) return true;

    if(!user.permissions) return false;

    return !!user.permissions[permission];
}


// ===============================
// اخفاء / اظهار العناصر
// ===============================

function updateElementsByPermissions(){

    const user = loadCurrentUser();

    if(!user) return;

    const elements = document.querySelectorAll("[data-permission]");

    elements.forEach(el=>{

        const permission = el.getAttribute("data-permission");

        if(!permission) return;

        if(hasPermission(user,permission)){
            el.style.display="";
        }else{
            el.style.display="none";
        }

    });

}


// ===============================
// تطبيق الصلاحيات من الكاش
// ===============================

function applyCachedPermissions(){

    const user = loadCurrentUser();

    if(!user){
        showPage();
        return;
    }

    if(PAGE_PERMISSION && !hasPermission(user,PAGE_PERMISSION)){
        showNoPermission();
        return;
    }

    updateElementsByPermissions();

    showPage();

}


// ===============================
// تحميل الصلاحيات من Firebase
// ===============================

async function refreshPermissionsFromServer(){

    const user = loadCurrentUser();

    if(!user) return;

    if(user.permissions && user.permissions["*"]) return;

    const roleId = user.role;

    if(!roleId) return;

    try{

        const snapshot = await firebase
        .database()
        .ref("roles/"+roleId+"/permissions")
        .once("value");

        const permissions = snapshot.val();

        if(!permissions) return;

        user.permissions = permissions;

        localStorage.setItem("currentUser",JSON.stringify(user));

    }catch(err){

        console.error("Permission refresh error:",err);

    }

}


// ===============================
// مراقبة DOM لأي عناصر جديدة
// ===============================

function observeDOM(){

    const observer = new MutationObserver(()=>{

        updateElementsByPermissions();

    });

    observer.observe(document.body,{
        childList:true,
        subtree:true
    });

}


// ===============================
// تشغيل النظام
// ===============================

async function initPermissionSystem(){

    applyCachedPermissions();

    observeDOM();

    await refreshPermissionsFromServer();

    updateElementsByPermissions();

}

initPermissionSystem();


// ===============================
// تحديث الصلاحيات دورياً
// ===============================

setInterval(()=>{

    refreshPermissionsFromServer().then(()=>{

        updateElementsByPermissions();

    });

},30000);