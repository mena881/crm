// ===============================
// Page Guard V8
// تحديث فوري + كل 30 ثانية
// ===============================

const PAGE_GUARD_API = "https://script.google.com/macros/s/AKfycbyztFTOFHunQKahA99RskXGKx6Sh9CUCLwij8gwHqDd0UUblmJ6DCzzGfAMCXf7iS1P/exec";

function getCurrentPage(){

    let page = window.location.pathname
    .split("/")
    .pop()
    .replace(".html","")
    .toLowerCase();

    if(!page || page === ""){
        page = "index";
    }

    return page;

}

function blockPage(){

document.body.innerHTML = `
<div style="
position:fixed;
top:0;
left:0;
width:100%;
height:100%;
background:linear-gradient(135deg,#f8f9fb,#eef1f7);
display:flex;
align-items:center;
justify-content:center;
font-family:Cairo, sans-serif;
z-index:999999999;
">

<div style="
background:#ffffff;
padding:40px 50px;
border-radius:14px;
box-shadow:0 20px 60px rgba(0,0,0,0.15);
text-align:center;
max-width:420px;
width:90%;
">

<div style="
width:70px;
height:70px;
border-radius:50%;
background:#ffe9e9;
display:flex;
align-items:center;
justify-content:center;
margin:auto;
font-size:32px;
color:#e53935;
margin-bottom:18px;
">
🚫
</div>

<h2 style="
margin:0;
font-size:22px;
color:#222;
margin-bottom:10px;
">
غير مسموح بالوصول
</h2>

<p style="
margin:0;
color:#666;
font-size:15px;
line-height:1.6;
">
هذه الصفحة غير متاحة في خطتك الحالية
</p>

<div style="
margin-top:22px;
font-size:13px;
color:#999;
">
يرجى ترقية الاشتراك أو التواصل مع الإدارة
</div>

</div>
</div>
`;

}

function checkPage(){

    const pages = JSON.parse(localStorage.getItem("allowedPages") || "{}");

    const page = getCurrentPage();

    if(pages[page] === false){
        blockPage();
    }

}

checkPage();

async function refreshPages(){

    const licenseCode = localStorage.getItem("licenseCode");
    if(!licenseCode) return;

    try{

        const res = await fetch(PAGE_GUARD_API + "?code=" + licenseCode + "&t=" + Date.now(), {
            cache: "no-store"
        });

        const data = await res.json();

        if(data.success){

            localStorage.setItem("allowedPages", JSON.stringify(data.pages || {}));

            checkPage();

        }

    }catch(err){

        console.error("PageGuard Error:", err);

    }

}

refreshPages();

setInterval(refreshPages, 30000);