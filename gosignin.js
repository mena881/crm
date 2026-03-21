// ========================================
// MR.Flow Security System
// حماية الصفحات من الدخول بدون تسجيل
// ========================================

(function () {

    "use strict";

    // ===============================
    // الإعدادات
    // ===============================

    const CONFIG = {

        signInPage: "signin.html",

        userStorageKey: "currentUser",

        requiredFields: ["name", "roleName"]

    };



    // ===============================
    // جلب المستخدم
    // ===============================

    function getCurrentUser() {

        try {

            const data = localStorage.getItem(CONFIG.userStorageKey);

            if (!data) return null;

            return JSON.parse(data);

        } catch (error) {

            console.error("خطأ في قراءة المستخدم", error);

            return null;

        }

    }



    // ===============================
    // التحقق من صحة المستخدم
    // ===============================

    function isUserValid(user) {

        if (!user) return false;

        for (let field of CONFIG.requiredFields) {

            if (!user[field]) {

                return false;

            }

        }

        return true;

    }



    // ===============================
    // تحويل لصفحة تسجيل الدخول
    // ===============================

    function redirectToSignIn() {

        if (window.location.pathname.includes(CONFIG.signInPage)) {

            return;

        }

        window.location.replace(CONFIG.signInPage);

    }



    // ===============================
    // التحقق الرئيسي
    // ===============================

    function checkAuthentication() {

        const user = getCurrentUser();

        if (!isUserValid(user)) {

            redirectToSignIn();

            return false;

        }

        return true;

    }



    // ===============================
    // منع ظهور الصفحة
    // ===============================

    function hidePage() {

        document.documentElement.style.visibility = "hidden";

    }



    function showPage() {

        document.documentElement.style.visibility = "visible";

    }



    // ===============================
    // التحقق قبل تحميل الصفحة
    // ===============================

    hidePage();

    const isAllowed = checkAuthentication();



    // ===============================
    // بعد تحميل الصفحة
    // ===============================

    document.addEventListener("DOMContentLoaded", function () {

        if (!checkAuthentication()) return;

        showPage();

    });



    // ===============================
    // فحص دوري
    // ===============================

    setInterval(function () {

        checkAuthentication();

    }, 5000);



})();