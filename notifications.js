/* ===================================
NOTIFICATIONS SYSTEM
Firebase + Tasks + FollowUps
Polling Every 60 Seconds
=================================== */

const LiveNotifications = {

userId:null,
db:null,
sound:null,

init:function(){

try{

const user = loadCurrentUser();

if(!user || !user.id){
console.warn("No user for notifications");
return;
}

this.userId = user.id;
this.db = firebase.database();
this.sound = new Audio("notification.mp3");

console.log("Notification system started");

this.startNotificationLoop();
this.cleanOldNotifications();
this.startLiveTimer();

}catch(e){

console.error("Notification init error",e);

}

},

/* ===================================
CHECK LOOP EVERY MINUTE
=================================== */

startNotificationLoop:function(){

this.checkNotifications();

setInterval(()=>{

this.checkNotifications();

},60000);

},

/* ===================================
CHECK ALL NOTIFICATIONS
=================================== */

checkNotifications:function(){

this.checkTasks();
this.checkFollowUps();
this.loadMyNotifications();

},

/* ===================================
SAVE NOTIFICATION
=================================== */

saveNotification:function(data){

const notif = {

title:data.title,
message:data.message,
icon:data.icon || "fas fa-bell",
type:data.type || "info",
createdAt:new Date().toISOString(),
read:false

};

this.db
.ref("notifications/"+this.userId)
.push(notif);

},

/* ===================================
LOAD MY NOTIFICATIONS
=================================== */

loadMyNotifications:function(){

const ref = this.db.ref("notifications/"+this.userId).limitToLast(20);

ref.once("value",(snap)=>{

const list=[];

snap.forEach((child)=>{

const n = child.val();

list.unshift({

id:child.key,
title:n.title,
message:n.message,
createdAt:n.createdAt,
time:this.timeAgo(n.createdAt),
read:n.read,
icon:n.icon,
type:n.type

});

});

DesignSystem.notifications.items=list;

if(window.renderNotifications){
renderNotifications();
}

});

},

/* ===================================
CHECK TASKS
=================================== */

checkTasks:function(){

const ref = this.db.ref("tasks").limitToLast(10);

ref.once("value",(snap)=>{

snap.forEach((child)=>{

const task = child.val();
const taskId = child.key;

if(!task) return;
if(task.notificationSent) return;
if(task.assignedTo !== this.userId) return;

this.saveNotification({

title:"مهمة جديدة",
message:task.title || "تم إضافة مهمة جديدة لك",
icon:"fas fa-tasks",
type:"info"

});

this.db.ref("tasks/"+taskId+"/notificationSent").set(true);

});

});

},

/* ===================================
CHECK FOLLOW UPS
=================================== */

checkFollowUps:function(){

const ref = this.db.ref("customers").limitToLast(50);

ref.once("value",(snap)=>{

const today = new Date().toISOString().split("T")[0];

snap.forEach((child)=>{

const customer = child.val();
const customerId = child.key;

if(!customer) return;

const checks=[

{date:customer.update1NextDate,emp:customer.update1EmployeeId},
{date:customer.update2NextDate,emp:customer.update2EmployeeId},
{date:customer.update3NextDate,emp:customer.update3EmployeeId}

];

checks.forEach((c)=>{

if(!c.date) return;

const followDate = c.date.split("T")[0];

if(
followDate === today &&
c.emp === this.userId &&
!customer.followNotificationSent
){

this.saveNotification({

title:"متابعة عميل اليوم",
message:"اليوم موعد متابعة العميل: "+(customer.name||""),
icon:"fas fa-user-clock",
type:"warning"

});

this.db.ref("customers/"+customerId+"/followNotificationSent").set(true);

}

});

});

});

},

/* ===================================
TIME FORMAT
=================================== */

timeAgo:function(dateString){

const now = new Date();
const date = new Date(dateString);

const seconds = Math.floor((now - date) / 1000);

if(seconds < 60) return "الآن";

const minutes = Math.floor(seconds / 60);
if(minutes < 60) return "منذ " + minutes + " دقيقة";

const hours = Math.floor(minutes / 60);
if(hours < 24) return "منذ " + hours + " ساعة";

const days = Math.floor(hours / 24);
return "منذ " + days + " يوم";

},

/* ===================================
UPDATE TIME EVERY MINUTE
=================================== */

startLiveTimer:function(){

setInterval(()=>{

DesignSystem.notifications.items.forEach(n=>{

if(n.createdAt){
n.time = this.timeAgo(n.createdAt);
}

});

if(window.renderNotifications){
renderNotifications();
}

},60000);

},

/* ===================================
PLAY SOUND
=================================== */

playSound:function(){

try{

this.sound.currentTime = 0;
this.sound.play();

}catch(e){}

},

/* ===================================
DELETE OLD NOTIFICATIONS AFTER 7 DAYS
=================================== */

cleanOldNotifications:function(){

const week = 7 * 24 * 60 * 60 * 1000;

const ref = this.db.ref("notifications/"+this.userId);

ref.once("value",(snap)=>{

snap.forEach((child)=>{

const n = child.val();

if(!n.createdAt) return;

const time = new Date(n.createdAt).getTime();

if(Date.now() - time > week){

child.ref.remove();

}

});

});

}

};


document.addEventListener("DOMContentLoaded",()=>{

setTimeout(()=>{

LiveNotifications.init();

},1500);

});