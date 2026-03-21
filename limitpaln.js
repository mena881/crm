// ===============================
// MRFLOW LIMIT SYSTEM FINAL
// ===============================

const LIMIT_API = "https://script.google.com/macros/s/AKfycbyztFTOFHunQKahA99RskXGKx6Sh9CUCLwij8gwHqDd0UUblmJ6DCzzGfAMCXf7iS1P/exec";

const LICENSE_CODE = localStorage.getItem("licenseCode");

let systemLimits = {
  employees: 0,
  invoices: 0,
  warehouses: 0
};

// ===============================
// إنشاء عنصر الـ Popup في الصفحة
// ===============================
function createLimitPopup() {
  // التحقق إذا كان الـ popup موجود مسبقاً
  if (document.getElementById('limitPopup')) return;

  const popupHTML = `
    <div id="limitPopup" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; justify-content: center; align-items: center;">
      <div style="background: white; padding: 30px; border-radius: 15px; max-width: 400px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2); animation: slideIn 0.3s ease;">
        <div style="font-size: 60px; margin-bottom: 20px;">⚠️</div>
        <h2 style="color: #e74c3c; margin-bottom: 15px; font-family: Arial, sans-serif;">تم الوصول للحد الأقصى</h2>
        <p style="color: #555; margin-bottom: 25px; font-family: Arial, sans-serif; line-height: 1.6;" id="limitMessage">لقد تجاوزت الحد المسموح به لهذا العنصر</p>
        <button onclick="closeLimitPopup()" style="background: #3498db; color: white; border: none; padding: 12px 30px; border-radius: 8px; font-size: 16px; cursor: pointer; font-family: Arial, sans-serif; transition: background 0.3s;">حسناً</button>
      </div>
    </div>
  `;

  // إضافة CSS للـ animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateY(-50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  // إضافة الـ popup للصفحة
  document.body.insertAdjacentHTML('beforeend', popupHTML);
}

// ===============================
// إظهار الـ Popup
// ===============================
window.showLimitPopup = function(type) {
  createLimitPopup();
  
  const popup = document.getElementById('limitPopup');
  const messageEl = document.getElementById('limitMessage');
  
  let message = '';
  switch(type) {
    case 'employees':
      message = 'لقد وصلت للحد الأقصى لعدد الموظفين المسموح به في النسخة الحالية';
      break;
    case 'warehouses':
      message = 'لقد وصلت للحد الأقصى لعدد المخازن المسموح به في النسخة الحالية';
      break;
    case 'invoices':
      message = 'لقد وصلت للحد الأقصى لعدد الفواتير المسموح به في النسخة الحالية';
      break;
    default:
      message = 'لقد تجاوزت الحد المسموح به لهذا العنصر';
  }
  
  messageEl.textContent = message;
  popup.style.display = 'flex';
}

// ===============================
// إغلاق الـ Popup
// ===============================
window.closeLimitPopup = function() {
  const popup = document.getElementById('limitPopup');
  if (popup) {
    popup.style.display = 'none';
  }
}

// ===============================
// تحميل limits من API
// ===============================

async function loadSystemLimits(){

  try{

    if(!LICENSE_CODE) return;

    const res = await fetch(`${LIMIT_API}?code=${LICENSE_CODE}`);

    const data = await res.json();

    if(!data.success) return;

    systemLimits = data.limits || {};

    console.log("SYSTEM LIMITS:", systemLimits);

  }
  catch(err){
    console.error(err);
  }

}

loadSystemLimits();
setInterval(loadSystemLimits,30000);

// ===============================
// منع تجاوز limits
// ===============================

const originalPush = firebase.database.Reference.prototype.push;

firebase.database.Reference.prototype.push = async function(data){

  const path = this.toString();

  try{

    // ===============================
    // EMPLOYEES
    // ===============================

    if(path.includes("/employees")){

      const snap = await firebase.database().ref("employees").once("value");

      if(snap.numChildren() >= systemLimits.employees){

        showLimitPopup('employees');

        return Promise.reject("employees limit");

      }

    }


    // ===============================
    // WAREHOUSES
    // ===============================

    if(path.includes("/warehouses")){

      const snap = await firebase.database().ref("warehouses").once("value");

      if(snap.numChildren() >= systemLimits.warehouses){

        showLimitPopup('warehouses');

        return Promise.reject("warehouse limit");

      }

    }


    // ===============================
    // INVOICES
    // ===============================

    if(path.includes("/invoices") || path.includes("/orders")){

      const snap = await firebase.database().ref("invoices").once("value");

      if(snap.numChildren() >= systemLimits.invoices){

        showLimitPopup('invoices');

        return Promise.reject("invoice limit");

      }

    }

  }
  catch(err){
    console.error(err);
  }

  return originalPush.call(this,data);

};