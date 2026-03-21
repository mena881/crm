(function(){

let userName="";
let roleName="";
let permissions={};

document.addEventListener("DOMContentLoaded",start);

function start(){

const check=setInterval(()=>{

if(typeof loadCurrentUser!=="function") return;

const user=loadCurrentUser();
if(!user) return;

userName=(user.name||"").trim().toLowerCase();
roleName=(user.roleName||"").toLowerCase();
permissions=user.permissions||{};

initCustomers();
initOrders();

},200);

}

/* =========================
   CUSTOMERS PAGE
========================= */

function initCustomers(){

const body=document.querySelector("#customersTableBody");
if(!body) return;

const rows=body.querySelectorAll("tr");
if(rows.length===0) return;

filterCustomers(body);
observe(body,filterCustomers);

}

function canViewAllCustomers(){

if(roleName==="owner") return true;
if(permissions.view_all_customers===true) return true;

return false;

}

function filterCustomers(body){

if(canViewAllCustomers()) return;

const rows=body.querySelectorAll("tr");

rows.forEach(row=>{

const cell=row.children[12];
if(!cell) return;

const responsible=(cell.innerText||"").trim().toLowerCase();

row.style.display=responsible.includes(userName) ? "" : "none";

});

}

/* =========================
   ORDERS PAGE
========================= */

function initOrders(){

const body=document.querySelector("#ordersTableBody");
if(!body) return;

const rows=body.querySelectorAll("tr");
if(rows.length===0) return;

filterOrders(body);
observe(body,filterOrders);

}

function canViewAllOrders(){

if(roleName==="owner") return true;
if(permissions.view_all_orders===true) return true;

return false;

}

function filterOrders(body){

if(canViewAllOrders()) return;

const rows=body.querySelectorAll("tr");

rows.forEach(row=>{

const cell=row.children[9];
if(!cell) return;

const responsible=(cell.innerText||"").trim().toLowerCase();

row.style.display=responsible.includes(userName) ? "" : "none";

});

}

/* =========================
   OBSERVER
========================= */

function observe(body,callback){

const observer=new MutationObserver(()=>{
callback(body);
});

observer.observe(body,{
childList:true,
subtree:true
});

}

})();