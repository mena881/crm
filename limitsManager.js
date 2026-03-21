// ======================= CONFIG =======================

const LIMIT_API =
"https://script.google.com/macros/s/AKfycbyztFTOFHunQKahA99RskXGKx6Sh9CUCLwij8gwHqDd0UUblmJ6DCzzGfAMCXf7iS1P/exec";

const LIMIT_NODE = "systemLimits";


// ======================= GLOBAL =======================

let LIMITS = null;

let COUNTERS = {
employees:0,
invoices:0,
warehouses:0
};


// ======================= LOAD LIMITS =======================

async function loadLimits(){

const code = localStorage.getItem("licenseCode");

if(!code){
console.warn("No license code");
return;
}

try{

const res = await fetch(`${LIMIT_API}?code=${code}`);
const data = await res.json();

if(data.success){

LIMITS = data.data.limits;

console.log("Limits loaded:",LIMITS);

}

}catch(err){

console.error("Limits API error",err);

}

}


// ======================= COUNT REAL DATA =======================

async function countEmployees(){

const snap = await firebase.database().ref("employees").once("value");
return snap.numChildren();

}

async function countInvoices(){

const snap = await firebase.database().ref("invoices").once("value");
return snap.numChildren();

}

async function countWarehouses(){

const snap = await firebase.database().ref("warehouses").once("value");
return snap.numChildren();

}


// ======================= INIT COUNTERS =======================

async function initCounters(){

try{

const employees = await countEmployees();
const invoices = await countInvoices();
const warehouses = await countWarehouses();

COUNTERS = {
employees:employees,
invoices:invoices,
warehouses:warehouses
};

await firebase.database().ref(LIMIT_NODE).set(COUNTERS);

console.log("Counters synced:",COUNTERS);

}catch(err){

console.error("Counter init error",err);

}

}


// ======================= UPDATE COUNTER =======================

async function updateCounter(type,value){

try{

await firebase.database()
.ref(`${LIMIT_NODE}/${type}`)
.set(value);

COUNTERS[type] = value;

}catch(err){

console.error("Update counter error",err);

}

}


// ======================= CAN ADD =======================

async function canAdd(type){

if(!LIMITS){
await loadLimits();
}

if(!LIMITS) return true;

if(type === "employee"){

return COUNTERS.employees < LIMITS.employees;

}

if(type === "invoice"){

return COUNTERS.invoices < LIMITS.invoices;

}

if(type === "warehouse"){

return COUNTERS.warehouses < LIMITS.warehouses;

}

return true;

}


// ======================= INCREASE =======================

async function increase(type){

const newValue = COUNTERS[type] + 1;

await updateCounter(type,newValue);

}


// ======================= DECREASE =======================

async function decrease(type){

const newValue = COUNTERS[type] - 1;

if(newValue < 0) return;

await updateCounter(type,newValue);

}


// ======================= GET USAGE =======================

function getUsage(){

if(!LIMITS) return null;

return {

employees: COUNTERS.employees + " / " + LIMITS.employees,
invoices: COUNTERS.invoices + " / " + LIMITS.invoices,
warehouses: COUNTERS.warehouses + " / " + LIMITS.warehouses

};

}


// ======================= AUTO SYNC =======================

function startAutoSync(){

setInterval(async ()=>{

await initCounters();

},3000);

}


// ======================= INIT SYSTEM =======================

window.addEventListener("load",async()=>{

await loadLimits();

await initCounters();

startAutoSync();

console.log("Limits system ready");

});