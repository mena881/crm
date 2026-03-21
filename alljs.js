(function(){

function loadScript(src){
return new Promise((resolve,reject)=>{

const s = document.createElement("script");
s.src = src;
s.async = false;

// نجاح التحميل
s.onload = () => {
console.log("Loaded:", src);
resolve();
};

// فشل التحميل
s.onerror = () => {
console.error("Failed To Load:", src);
reject(src);
};

// timeout لو السيرفر بطيء
setTimeout(()=>{
reject("Timeout: " + src);
}, 10000);

document.body.appendChild(s);

});
}

async function start(){

try{

const scripts = [

"header-script.js",
"auth.js",
"searchicon.js",
"stock.js",
"limitplan.js",
"notifications.js",
"gosignin.js",
"block.js",
"chat-widget.js",
"permissionGuard.js"

];

// تحميل آمن (ميوقفش لو ملف وقع)
for(const file of scripts){
try{
await loadScript(file);
}catch(e){
console.error("Error loading:", file, e);
}
}

// تشغيل القائمة السريعة لو موجودة
if(typeof initializeQuickMenu === "function"){
initializeQuickMenu();
}else{
console.warn("initializeQuickMenu not found");
}

// تشغيل الإشعارات
try{

const savedUser = localStorage.getItem("currentUser");

if(savedUser){

const user = JSON.parse(savedUser);

if(user && user.id && typeof NotificationsManager !== "undefined"){

NotificationsManager.init(
user.id,
user.name || "User"
);

console.log("Notifications Started For:", user.name);

}

}

}catch(err){
console.warn("Notifications Init Error:", err);
}

}catch(err){
console.error("System Load Error:", err);
}

}

// تشغيل بعد تحميل الصفحة
document.addEventListener("DOMContentLoaded", start);

})();