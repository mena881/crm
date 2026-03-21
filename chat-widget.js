// ========== نظام المحادثة المتكامل ==========
// يدعم Owner و Employee مع المجموعات والظهور والرسائل المقروءة
// نسخة مطورة مع إدارة المجموعات والرد على الرسائل
// تم إصلاح مشاكل chatId والتوافق بين الطرفين

// التحقق من وجود Firebase
if (typeof firebase === 'undefined') {
    console.error('⚠️ Firebase SDK must be loaded first');
}

// تكامل مع نظام التصميم الحالي
const ChatSystem = {
    config: {
        databaseURL: 'https://test-3b890-default-rtdb.firebaseio.com/',
        onlineCheckInterval: 30000,
        typingTimeout: 3000,
        messagesLimit: 50,
        messageRetentionDays: 7 // الاحتفاظ بالرسائل لمدة 7 أيام
    },
    
    currentUser: null,
    currentUserType: null,
    currentUserId: null,
    currentChatId: null,
    currentChatPartner: null,
    currentChatType: null,
    isOwner: false,
    listeners: [],
    typingTimeouts: {},
    replyToMessage: null,
    messagesListenerRef: null,
    typingListenerRef: null,
    selectedMessageId: null, // للتعامل مع عرض تفاصيل القراءة
    
    // تهيئة النظام بالكامل
    async initialize() {
        this.soundEnabled = false;
        
        console.log('🚀 جاري تهيئة نظام المحادثة...');
        
        this.loadCurrentUser();
        
        if (!this.currentUser) {
            console.warn('⚠️ لا يوجد مستخدم مسجل الدخول');
            return;
        }
        
        console.log('✅ المستخدم الحالي:', this.currentUser);
        console.log('✅ نوع المستخدم:', this.currentUserType);
        console.log('✅ معرف المستخدم:', this.currentUserId);
        console.log('✅ هل هو مالك؟', this.isOwner);
        
        if (!document.getElementById('chatSystemContainer')) {
            this.createChatWidget();
        }
        
        this.setupEventListeners();
        this.startOnlineStatusTracking();
        
        // بدء مهمة تنظيف الرسائل القديمة
        this.startMessageCleanupTask();
        
        await this.loadChatList();
        const messagesRef = firebase.database().ref('chatMessages');

messagesRef.on('child_added', (snapshot) => {
    const message = { id: snapshot.key, ...snapshot.val() };

    if (message.senderId === this.currentUserId) return;

    const isForMe =
        message.receiverId === this.currentUserId ||
        (message.isGroup && message.receivers && message.receivers.includes(this.currentUserId));

    if (!isForMe) return;
this.playNotificationSound();
    if (message.chatId === this.currentChatId) {
        const existing = document.querySelector(`[data-message-id="${message.id}"]`);
        if (!existing) {
            this.appendMessage(message);
            this.markMessageAsRead(message.id);
        }
    } else {
        this.updateChatListItemLastMessage(message);
        this.updateUnreadBadge(message);
    }
});
        console.log('✅ تم تهيئة نظام المحادثة بنجاح');
    },
    
    // بدء مهمة تنظيف الرسائل القديمة
    startMessageCleanupTask() {
        // تشغيل التنظيف كل ساعة
        setInterval(() => this.cleanOldMessages(), 3600000);
        // تشغيل فوري بعد التهيئة
        setTimeout(() => this.cleanOldMessages(), 5000);
    },
    
    // تنظيف الرسائل الأقدم من 7 أيام
    async cleanOldMessages() {
        try {
            const cutoffDate = Date.now() - (this.config.messageRetentionDays * 24 * 60 * 60 * 1000);
            const messagesRef = firebase.database().ref('chatMessages');
            const snapshot = await messagesRef.orderByChild('timestamp').endAt(cutoffDate).once('value');
            
            const updates = {};
            snapshot.forEach(child => {
                updates[child.key] = null;
            });
            
            if (Object.keys(updates).length > 0) {
                await messagesRef.update(updates);
                console.log(`🧹 تم تنظيف ${Object.keys(updates).length} رسالة قديمة`);
            }
        } catch (error) {
            console.error('❌ خطأ في تنظيف الرسائل القديمة:', error);
        }
    },
    
    // تحميل المستخدم الحالي من نظام الهيدر
    loadCurrentUser() {
        try {
            if (window.currentUser) {
                this.currentUser = window.currentUser;
                
                const userName = this.currentUser.name || '';
                const userRole = this.currentUser.role || '';
                const employeeCode = this.currentUser.employeeCode || '';
                
                this.isOwner = (
                    userRole === 'owner' || 
                    userRole === 'Owner' || 
                    userName === 'Owner' ||
                    userName.startsWith('Owner') ||
                    employeeCode === 'BB' || 
                    employeeCode === 'G'
                );
                
                this.currentUserType = this.isOwner ? 'owner' : 'employee';
                
                if (this.isOwner) {
                    this.currentUserId = 'owner_001';
                    this.currentUser.id = 'owner_001';
                    this.currentUser.name = this.currentUser.name || 'المالك';
                } else {
                    this.currentUserId = this.currentUser.employeeId || 
                                         this.currentUser.id || 
                                         `emp_${Date.now()}`;
                    this.currentUser.id = this.currentUserId;
                }
            } 
            else {
                const userData = localStorage.getItem('currentUser');
                if (userData) {
                    this.currentUser = JSON.parse(userData);
                    
                    const userName = this.currentUser.name || '';
                    const userRole = this.currentUser.role || '';
                    const employeeCode = this.currentUser.employeeCode || '';
                    
                    this.isOwner = (
                        userRole === 'owner' || 
                        userRole === 'Owner' || 
                        userName === 'Owner' ||
                        userName.startsWith('Owner') ||
                        employeeCode === 'BB' || 
                        employeeCode === 'G'
                    );
                    
                    this.currentUserType = this.isOwner ? 'owner' : 'employee';
                    
                    if (this.isOwner) {
                        this.currentUserId = 'owner_001';
                        this.currentUser.id = 'owner_001';
                    } else {
                        this.currentUserId = this.currentUser.employeeId || 
                                             this.currentUser.id || 
                                             `emp_${Date.now()}`;
                        this.currentUser.id = this.currentUserId;
                    }
                }
            }
            
            if (this.currentUser && !this.currentUser.name) {
                this.currentUser.name = this.isOwner ? 'المالك' : 'موظف';
            }
            
        } catch (error) {
            console.error('❌ خطأ في تحميل المستخدم:', error);
        }
    },
    
    getPrivateChatId(userId1, userId2) {
        const ids = [userId1, userId2].sort();
        return ids.join('_');
    },
    
    createChatWidget() {
        const chatHTML = `
        <div id="chatSystemContainer" class="chat-system-container">
            <div class="chat-icon" id="chatToggleBtn">
                <i class="fas fa-comments"></i>
                <span class="chat-badge" id="chatUnreadBadge">0</span>
            </div>
            
            <div class="chat-window" id="chatWindow">
                <div class="chat-header">
                    <div class="chat-header-title">
                        <i class="fas fa-comment-dots"></i>
                        <span id="chatHeaderTitle">المحادثات</span>
                    </div>
                    <div class="chat-header-actions">
                        <button class="chat-header-btn" id="filterUnreadBtn" title="الرسائل غير المقروءة">
                            <i class="fas fa-envelope"></i>
                        </button>
                        ${this.isOwner ? `
                        <button class="chat-header-btn" id="createGroupBtn" title="إنشاء مجموعة">
                            <i class="fas fa-users"></i>
                        </button>
                        ` : ''}
                        <button class="chat-header-btn" id="minimizeChatBtn">
                            <i class="fas fa-minus"></i>
                        </button>
                        <button class="chat-header-btn" id="closeChatBtn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div class="chat-list-view" id="chatListView">
                    <div class="chat-search">
                        <i class="fas fa-search"></i>
                        <input type="text" id="chatSearchInput" placeholder="بحث عن محادثة أو موظف...">
                    </div>
                    <div class="chat-tabs">
                        <button class="chat-tab active" data-tab="all">الكل</button>
                        <button class="chat-tab" data-tab="unread">غير مقروءة</button>
                        <button class="chat-tab" data-tab="groups">المجموعات</button>
                        <button class="chat-tab" data-tab="employees">الموظفين</button>
                    </div>
                    <div class="chat-list-scroll" id="chatListContainer">
                        <div class="chat-loading">
                            <i class="fas fa-spinner fa-spin"></i> جاري التحميل...
                        </div>
                    </div>
                </div>
                
                <div class="chat-conversation-view" id="chatConversationView" style="display: none;">
                    <div class="chat-conversation-header">
                        <button class="chat-back-btn" id="backToChatListBtn">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                        <div class="chat-partner-info" id="chatPartnerInfo">
                            <div class="chat-partner-name"></div>
                            <div class="chat-partner-status" id="chatPartnerStatus"></div>
                        </div>
                        <div class="chat-conversation-actions">
                            ${this.isOwner ? `
                            <button class="chat-header-btn" id="groupManagementBtn" style="display: none;" title="إدارة المجموعة">
                                <i class="fas fa-cog"></i>
                            </button>
                            ` : ''}
                            <button class="chat-header-btn" id="groupInfoBtn" style="display: none;" title="معلومات المجموعة">
                                <i class="fas fa-info-circle"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="chat-messages-container" id="chatMessagesContainer">
                        <div class="chat-messages-loading">
                            <i class="fas fa-spinner fa-spin"></i> جاري تحميل الرسائل...
                        </div>
                    </div>
                    
                    <div class="chat-input-area">
                        <div class="chat-reply-indicator" id="chatReplyIndicator" style="display: none;">
                            <div class="chat-reply-content">
                                <i class="fas fa-reply"></i>
                                <span id="replyToText">الرد على: ...</span>
                            </div>
                            <button class="chat-cancel-reply" id="cancelReplyBtn">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="chat-typing-indicator" id="chatTypingIndicator"></div>
                        <div class="chat-input-wrapper">
                            <textarea id="chatMessageInput" placeholder="اكتب رسالتك..." rows="1"></textarea>
                            <button class="chat-send-btn" id="sendMessageBtn">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- نافذة تفاصيل القراءة -->
            <div class="chat-modal" id="readByModal" style="display: none;">
                <div class="chat-modal-content">
                    <div class="chat-modal-header">
                        <h3><i class="fas fa-eye"></i> الذين قرأوا الرسالة</h3>
                        <button class="chat-modal-close" id="closeReadByModalBtn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="chat-modal-body">
                        <div class="chat-readby-list" id="readByList">
                            <div class="chat-loading-small">جاري التحميل...</div>
                        </div>
                    </div>
                </div>
            </div>
            
            ${this.isOwner ? `
            <div class="chat-modal" id="createGroupModal" style="display: none;">
                <div class="chat-modal-content">
                    <div class="chat-modal-header">
                        <h3><i class="fas fa-users"></i> إنشاء مجموعة جديدة</h3>
                        <button class="chat-modal-close" id="closeGroupModalBtn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="chat-modal-body">
                        <div class="form-group">
                            <label>اسم المجموعة</label>
                            <input type="text" id="groupNameInput" placeholder="أدخل اسم المجموعة..." class="chat-input">
                        </div>
                        <div class="form-group">
                            <label>اختر الموظفين</label>
                            <div class="chat-employees-list" id="groupEmployeesList">
                                <div class="chat-loading-small">
                                    <i class="fas fa-spinner fa-spin"></i> جاري تحميل الموظفين...
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="chat-modal-footer">
                        <button class="chat-btn-secondary" id="cancelGroupBtn">إلغاء</button>
                        <button class="chat-btn-primary" id="createGroupConfirmBtn">إنشاء المجموعة</button>
                    </div>
                </div>
            </div>
            
            <div class="chat-modal" id="groupManagementModal" style="display: none;">
                <div class="chat-modal-content">
                    <div class="chat-modal-header">
                        <h3><i class="fas fa-cog"></i> إدارة المجموعة</h3>
                        <button class="chat-modal-close" id="closeGroupManagementBtn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="chat-modal-body">
                        <div class="form-group">
                            <label>اسم المجموعة</label>
                            <input type="text" id="editGroupNameInput" class="chat-input">
                        </div>
                        <div class="form-group">
                            <label>الصلاحيات</label>
                            <div class="chat-permissions">
                                <label class="chat-radio">
                                    <input type="radio" name="groupPermission" value="owner_only" checked>
                                    <span>المالك فقط يمكنه الكتابة</span>
                                </label>
                                <label class="chat-radio">
                                    <input type="radio" name="groupPermission" value="all">
                                    <span>الجميع يمكنهم الكتابة</span>
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>إدارة الأعضاء</label>
                            <div class="chat-members-list" id="groupMembersList"></div>
                        </div>
                        <div class="form-group">
                            <label>إضافة أعضاء جدد</label>
                            <div class="chat-employees-list" id="addMembersList"></div>
                        </div>
                    </div>
                    <div class="chat-modal-footer">
                        <button class="chat-btn-secondary" id="closeManagementBtn">إغلاق</button>
                        <button class="chat-btn-primary" id="saveGroupSettingsBtn">حفظ التغييرات</button>
                    </div>
                </div>
            </div>
            ` : ''}
        </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', chatHTML);
    },
    
    setupEventListeners() {
        document.getElementById('chatToggleBtn')?.addEventListener('click', () => this.toggleChat());
        document.getElementById('closeChatBtn')?.addEventListener('click', () => this.closeChat());
        document.getElementById('minimizeChatBtn')?.addEventListener('click', () => this.minimizeChat());
        document.getElementById('backToChatListBtn')?.addEventListener('click', () => this.showChatList());
        document.getElementById('chatSearchInput')?.addEventListener('input', (e) => this.searchChats(e.target.value));
        document.getElementById('filterUnreadBtn')?.addEventListener('click', () => this.filterUnreadMessages());
        document.getElementById('closeReadByModalBtn')?.addEventListener('click', () => this.closeReadByModal());
        
        document.getElementById('sendMessageBtn')?.addEventListener('click', () => this.sendMessage());
        const messageInput = document.getElementById('chatMessageInput');
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            messageInput.addEventListener('input', () => this.handleTyping());
        }
        
        document.getElementById('cancelReplyBtn')?.addEventListener('click', () => this.cancelReply());
        
        // تبويبات المحادثات
        document.querySelectorAll('.chat-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.chat-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                const tabType = e.target.dataset.tab;
                this.filterChatListByTab(tabType);
            });
        });
        
        if (this.isOwner) {
            document.getElementById('createGroupBtn')?.addEventListener('click', () => this.showCreateGroupModal());
            document.getElementById('closeGroupModalBtn')?.addEventListener('click', () => this.hideCreateGroupModal());
            document.getElementById('cancelGroupBtn')?.addEventListener('click', () => this.hideCreateGroupModal());
            document.getElementById('createGroupConfirmBtn')?.addEventListener('click', () => this.createGroup());
            document.getElementById('groupManagementBtn')?.addEventListener('click', () => this.showGroupManagement());
            document.getElementById('closeGroupManagementBtn')?.addEventListener('click', () => this.hideGroupManagementModal());
            document.getElementById('closeManagementBtn')?.addEventListener('click', () => this.hideGroupManagementModal());
            document.getElementById('saveGroupSettingsBtn')?.addEventListener('click', () => this.saveGroupSettings());
        }
        
        document.addEventListener('click', (e) => {
            const chatWindow = document.getElementById('chatWindow');
            const chatIcon = document.getElementById('chatToggleBtn');
            if (chatWindow?.classList.contains('open') && 
                !chatWindow.contains(e.target) && 
                !chatIcon?.contains(e.target)) {
                this.minimizeChat();
            }
        });
    },
    
    toggleChat() {
        const chatWindow = document.getElementById('chatWindow');
        const chatIcon = document.getElementById('chatToggleBtn');
        
        if (chatWindow.classList.contains('open')) {
            chatWindow.classList.remove('open');
            chatIcon.classList.remove('hidden');
        } else {
            chatWindow.classList.add('open');
            chatIcon.classList.add('hidden');
            this.loadChatList();
        }
    },
    
    closeChat() {
        document.getElementById('chatWindow').classList.remove('open');
        document.getElementById('chatToggleBtn').classList.remove('hidden');
        this.showChatList();
    },
    
    minimizeChat() {
        document.getElementById('chatWindow').classList.remove('open');
        document.getElementById('chatToggleBtn').classList.remove('hidden');
    },
    
    // فلتر المحادثات حسب التبويب
    filterChatListByTab(tabType) {
        const items = document.querySelectorAll('.chat-list-item');
        let currentFilter = tabType;
        
        items.forEach(item => {
            const isGroup = item.classList.contains('group-item');
            const isUnread = item.classList.contains('unread');
            
            if (currentFilter === 'all') {
                item.style.display = 'flex';
            } else if (currentFilter === 'unread') {
                item.style.display = isUnread ? 'flex' : 'none';
            } else if (currentFilter === 'groups') {
                item.style.display = isGroup ? 'flex' : 'none';
            } else if (currentFilter === 'employees') {
                item.style.display = !isGroup ? 'flex' : 'none';
            }
        });
    },
    
    // فلتر الرسائل غير المقروءة
    filterUnreadMessages() {
        const unreadTab = document.querySelector('.chat-tab[data-tab="unread"]');
        if (unreadTab) {
            unreadTab.click();
        }
    },
    
    startOnlineStatusTracking() {
        if (!this.currentUserId) return;
        
        this.updateOnlineStatus(true);
        setInterval(() => this.updateOnlineStatus(true), ChatSystem.config.onlineCheckInterval);
        
        window.addEventListener('beforeunload', () => {
            this.updateOnlineStatus(false);
        });
    },
    
    async updateOnlineStatus(online) {
        if (!this.currentUserId) return;
        
        try {
            const userRef = firebase.database().ref(`onlineUsers/${this.currentUserId}`);
            const userData = {
                online: online,
                lastSeen: Date.now(),
                name: this.currentUser?.name || 'مستخدم',
                type: this.currentUserType
            };
            
            await userRef.set(userData);
            
            if (online) {
                userRef.onDisconnect().update({
                    online: false,
                    lastSeen: Date.now()
                });
            }
        } catch (error) {
            console.error('❌ خطأ في تحديث حالة الاتصال:', error);
        }
    },
    
    async loadChatList() {
        const container = document.getElementById('chatListContainer');
        if (!container) return;
        
        container.innerHTML = '<div class="chat-loading"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>';
        
        try {
            if (this.isOwner) {
                await this.loadEmployeesForOwner();
            } else {
                await this.loadChatsForEmployee();
            }
            
            await this.loadUnreadCounts();
        } catch (error) {
            console.error('❌ خطأ في تحميل قائمة المحادثات:', error);
            container.innerHTML = '<div class="chat-error">حدث خطأ في التحميل</div>';
        }
    },
    
    async loadEmployeesForOwner() {
        const container = document.getElementById('chatListContainer');
        
        try {
            const snapshot = await firebase.database().ref('employees').once('value');
            const employees = snapshot.val() || {};
            
            let html = '';
            let hasItems = false;
            
            // تحميل المجموعات أولاً
            const groupsSnapshot = await firebase.database().ref('chatGroups').once('value');
            const groups = groupsSnapshot.val() || {};
            
            // إضافة المجموعات
            for (const [id, group] of Object.entries(groups)) {
                if (group.members && group.members[this.currentUserId]) {
                    hasItems = true;
                    const lastMessageData = await this.getLastMessageByChatId(id);
                    const unreadCount = group.unread?.[this.currentUserId] || 0;
                    html += this.createChatListItem({
                        id: id,
                        name: group.name,
                        type: 'group',
                        chatType: 'group',
                        chatId: id,
                        isGroup: true,
                        lastMessage: lastMessageData.text || 'لا توجد رسائل',
                        lastTime: lastMessageData.timestamp,
                        unread: unreadCount,
                        members: group.members,
                        settings: group.settings || { whoCanSend: 'all' }
                    });
                }
            }
            
            // إضافة الموظفين
            for (const [id, emp] of Object.entries(employees)) {
                if (emp.active !== false) {
                    hasItems = true;
                    const onlineData = await this.getUserOnlineStatus(id);
                    const chatId = this.getPrivateChatId('owner_001', id);
                    const lastMessageData = await this.getLastMessageByChatId(chatId);
                    
                    html += this.createChatListItem({
                        id: id,
                        name: emp.name,
                        type: 'employee',
                        chatType: 'private',
                        chatId: chatId,
                        online: onlineData.online,
                        lastSeen: onlineData.lastSeen,
                        lastMessage: lastMessageData.text || 'انقر لبدء المحادثة',
                        lastTime: lastMessageData.timestamp,
                        unread: 0,
                        isGroup: false
                    });
                }
            }
            
            container.innerHTML = hasItems ? html : '<div class="chat-empty">لا توجد محادثات متاحة</div>';
            
        } catch (error) {
            console.error('❌ خطأ في تحميل الموظفين:', error);
            container.innerHTML = '<div class="chat-error">خطأ في تحميل البيانات</div>';
        }
    },
    
    async loadChatsForEmployee() {
        const container = document.getElementById('chatListContainer');
        
        try {
            let html = '';
            let hasItems = false;
            
            // إضافة المجموعات أولاً
            const groupsSnapshot = await firebase.database().ref('chatGroups').once('value');
            const groups = groupsSnapshot.val() || {};
            
            for (const [id, group] of Object.entries(groups)) {
                if (group.members && group.members[this.currentUserId]) {
                    hasItems = true;
                    const lastMessageData = await this.getLastMessageByChatId(id);
                    const unreadCount = group.unread?.[this.currentUserId] || 0;
                    html += this.createChatListItem({
                        id: id,
                        name: group.name,
                        type: 'group',
                        chatType: 'group',
                        chatId: id,
                        isGroup: true,
                        lastMessage: lastMessageData.text || 'لا توجد رسائل',
                        lastTime: lastMessageData.timestamp,
                        unread: unreadCount,
                        members: group.members,
                        settings: group.settings || { whoCanSend: 'all' }
                    });
                }
            }
            
            // إضافة المحادثة مع المالك
            const chatId = this.getPrivateChatId(this.currentUserId, 'owner_001');
            const ownerOnline = await this.getUserOnlineStatus('owner_001');
            const ownerLastMessage = await this.getLastMessageByChatId(chatId);
            
            html += this.createChatListItem({
                id: 'owner_001',
                name: 'المالك',
                type: 'owner',
                chatType: 'private',
                chatId: chatId,
                online: ownerOnline.online,
                lastSeen: ownerOnline.lastSeen,
                lastMessage: ownerLastMessage.text || 'انقر لبدء المحادثة',
                lastTime: ownerLastMessage.timestamp,
                unread: 0,
                isGroup: false
            });
            hasItems = true;
            
            container.innerHTML = html || '<div class="chat-empty">لا توجد محادثات</div>';
            
        } catch (error) {
            console.error('❌ خطأ في تحميل المحادثات:', error);
            container.innerHTML = '<div class="chat-error">خطأ في التحميل</div>';
        }
    },
    
    createChatListItem(data) {
        const time = data.lastTime ? this.formatTime(data.lastTime) : '';
        const statusClass = data.online ? 'online' : 'offline';
        const unreadBadge = data.unread > 0 ? `<span class="chat-item-badge">${data.unread}</span>` : '';
        const groupIcon = data.isGroup ? '<i class="fas fa-users"></i>' : '<i class="fas fa-user-circle"></i>';
        const groupClass = data.isGroup ? 'group-item' : '';
        const unreadClass = data.unread > 0 ? 'unread' : '';
        
        return `
        <div class="chat-list-item ${groupClass} ${unreadClass}" 
             data-chat-id="${data.id}"
             data-chat-type="${data.chatType}"
             data-chat-real-id="${data.chatId}"
             data-is-group="${data.isGroup}"
             onclick="ChatSystem.openChat('${data.id}', '${data.chatType}', '${data.chatId}', this)">
            <div class="chat-item-avatar ${data.isGroup ? 'group' : statusClass}">
                ${groupIcon}
                ${!data.isGroup ? `<span class="chat-item-status ${statusClass}"></span>` : ''}
            </div>
            <div class="chat-item-info">
                <div class="chat-item-name">${data.name}</div>
                <div class="chat-item-last-message">${data.lastMessage || ''}</div>
            </div>
            <div class="chat-item-meta">
                <div class="chat-item-time">${time}</div>
                ${unreadBadge}
            </div>
        </div>
        `;
    },
    
    async openChat(partnerId, chatType, chatId, element) {
        this.removeMessagesListener();
        this.removeTypingListener();
        
        const itemData = {
            id: partnerId,
            name: element.querySelector('.chat-item-name').textContent,
            type: chatType === 'private' ? 
                (partnerId === 'owner_001' ? 'owner' : 'employee') : 
                'group',
            chatType: chatType,
            isGroup: chatType === 'group'
        };
        
        if (chatType === 'group') {
            const groupData = await this.getGroupData(partnerId);
            itemData.members = groupData.members || {};
            itemData.settings = groupData.settings || { whoCanSend: 'all' };
            itemData.name = groupData.name || itemData.name;
        }
        
        this.currentChatPartner = itemData;
        this.currentChatType = chatType;
        this.currentChatId = chatId;
        
        console.log('فتح محادثة:', {
            partnerId,
            chatType,
            chatId,
            currentUserId: this.currentUserId
        });
        
        document.getElementById('chatListView').style.display = 'none';
        document.getElementById('chatConversationView').style.display = 'flex';
        
        document.getElementById('chatHeaderTitle').textContent = itemData.name;
        document.querySelector('.chat-partner-name').textContent = itemData.name;
        
        if (chatType === 'group') {
            document.getElementById('groupInfoBtn').style.display = 'flex';
            if (this.isOwner) {
                document.getElementById('groupManagementBtn').style.display = 'flex';
            }
            this.updateGroupPermissionStatus();
        } else {
            document.getElementById('groupInfoBtn').style.display = 'none';
            if (this.isOwner) {
                document.getElementById('groupManagementBtn').style.display = 'none';
            }
        }
        
        this.updatePartnerStatus();
        await this.loadMessages();
        await this.markMessagesAsRead();
        this.cancelReply();
    },
    
    removeMessagesListener() {
        if (this.messagesListenerRef) {
            try {
                const messagesRef = firebase.database().ref('chatMessages');
                if (this.messagesListenerRef.callback) {
                    messagesRef.off('child_added', this.messagesListenerRef.callback);
                }
            } catch (e) {
                console.warn('خطأ في إزالة مستمع الرسائل:', e);
            }
            this.messagesListenerRef = null;
        }
    },
    
    removeTypingListener() {
        if (this.typingListenerRef && this.currentChatId) {
            try {
                firebase.database().ref(`typingStatus/${this.currentChatId}`).off('value', this.typingListenerRef);
            } catch (e) {
                console.warn('خطأ في إزالة مستمع الكتابة:', e);
            }
            this.typingListenerRef = null;
        }
    },
    
    updateGroupPermissionStatus() {
        if (this.currentChatType !== 'group' || !this.currentChatPartner) return;
        
        const settings = this.currentChatPartner.settings || { whoCanSend: 'all' };
        const messageInput = document.getElementById('chatMessageInput');
        const sendBtn = document.getElementById('sendMessageBtn');
        
        if (settings.whoCanSend === 'owner_only' && !this.isOwner) {
            messageInput.disabled = true;
            messageInput.placeholder = 'فقط المالك يمكنه الكتابة في هذه المجموعة';
            if (sendBtn) sendBtn.disabled = true;
        } else {
            messageInput.disabled = false;
            messageInput.placeholder = 'اكتب رسالتك...';
            if (sendBtn) sendBtn.disabled = false;
        }
    },
    
    async updatePartnerStatus() {
        if (!this.currentChatPartner || this.currentChatPartner.isGroup) return;
        
        const statusEl = document.getElementById('chatPartnerStatus');
        const onlineData = await this.getUserOnlineStatus(this.currentChatPartner.id);
        
        if (onlineData.online) {
            statusEl.innerHTML = '<span class="status online"></span> متصل الآن';
        } else if (onlineData.lastSeen) {
            const timeAgo = this.formatTimeAgo(onlineData.lastSeen);
            statusEl.innerHTML = `<span class="status offline"></span> آخر ظهور: ${timeAgo}`;
        } else {
            statusEl.innerHTML = '<span class="status offline"></span> غير متصل';
        }
    },
    
    async getGroupData(groupId) {
        try {
            const snapshot = await firebase.database().ref(`chatGroups/${groupId}`).once('value');
            return snapshot.val() || {};
        } catch (error) {
            console.error('❌ خطأ في تحميل بيانات المجموعة:', error);
            return {};
        }
    },
    
    async loadMessages() {
        const container = document.getElementById('chatMessagesContainer');
        if (!container || !this.currentChatId) return;
        
        container.innerHTML = '<div class="chat-messages-loading"><i class="fas fa-spinner fa-spin"></i> جاري تحميل الرسائل...</div>';
        
        try {
            const messagesRef = firebase.database().ref('chatMessages');
            const snapshot = await messagesRef
                .orderByChild('chatId')
                .equalTo(this.currentChatId)
                .once('value');
            
            const messages = [];
            
            snapshot.forEach(child => {
                messages.push({ id: child.key, ...child.val() });
            });
            
            messages.sort((a, b) => a.timestamp - b.timestamp);
            this.displayMessages(messages);
            this.listenForNewMessages();
            this.listenForTyping();
            
        } catch (error) {
            console.error('❌ خطأ في تحميل الرسائل:', error);
            container.innerHTML = '<div class="chat-error">حدث خطأ في تحميل الرسائل</div>';
        }
    },
    
    displayMessages(messages) {
        const container = document.getElementById('chatMessagesContainer');
        container.innerHTML = '';
        
        if (messages.length === 0) {
            container.innerHTML = '<div class="chat-empty-messages">لا توجد رسائل سابقة</div>';
            return;
        }
        
        messages.forEach(msg => {
            this.appendMessage(msg);
        });
        
        this.scrollToBottom();
    },
    
    appendMessage(message) {
        const container = document.getElementById('chatMessagesContainer');
        const isMine = message.senderId === this.currentUserId;
        const time = new Date(message.timestamp).toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // نظام علامات القراءة
        let readStatus = '';
        if (isMine) {
            const readCount = message.readBy ? Object.keys(message.readBy).length : 1;
            const totalReceivers = this.currentChatType === 'group' && this.currentChatPartner?.members ? 
                Object.keys(this.currentChatPartner.members).length : 2;
            
            if (readCount >= totalReceivers) {
                readStatus = '<span class="message-read read-by-all" title="تمت القراءة من قبل الجميع">✓✓</span>';
            } else if (readCount > 1) {
                readStatus = `<span class="message-read read-by-some" title="قرأها ${readCount} شخص">✓✓</span>`;
            } else {
                readStatus = '<span class="message-read" title="تم الإرسال">✓</span>';
            }
        }
        
        let senderName = '';
        if (this.currentChatType === 'group' && !isMine && message.senderName) {
            senderName = `<div class="message-sender-name">${message.senderName}</div>`;
        }
        
        let replyHtml = '';
        if (message.replyTo) {
            replyHtml = `
            <div class="message-reply" onclick="ChatSystem.highlightMessage('${message.replyTo}')">
                <i class="fas fa-reply"></i>
                <span>${message.replyToText || 'رد على رسالة'}</span>
            </div>
            `;
        }
        
        const messageHTML = `
        <div class="chat-message ${isMine ? 'my-message' : 'other-message'}" 
             data-message-id="${message.id}"
             data-sender-id="${message.senderId}"
             onclick="ChatSystem.showMessageActions(event, '${message.id}', '${message.text.replace(/'/g, "\\'")}')">
            ${senderName}
            <div class="message-bubble">
                ${replyHtml}
                <div class="message-content">${this.linkify(message.text)}</div>
                <div class="message-footer">
                    <span class="message-time">${time}</span>
                    <div class="message-actions">
                        <button class="message-action-btn reply-btn" onclick="ChatSystem.setReplyTo('${message.id}', '${message.text.replace(/'/g, "\\'")}'); event.stopPropagation();">
                            <i class="fas fa-reply"></i>
                        </button>
                        ${isMine && this.currentChatType === 'group' ? `
                        <button class="message-action-btn readby-btn" onclick="ChatSystem.showReadBy('${message.id}'); event.stopPropagation();">
                            <i class="fas fa-eye"></i>
                        </button>
                        ` : ''}
                    </div>
                    ${readStatus}
                </div>
            </div>
        </div>
        `;
        
        container.insertAdjacentHTML('beforeend', messageHTML);
        this.scrollToBottom();
        
        // تشغيل صوت الإشعار للرسائل الجديدة
        if (!isMine) {
            this.playNotificationSound();
        }
    },
    
    showMessageActions(event, messageId, messageText) {
        document.querySelectorAll('.message-actions-popup').forEach(el => el.remove());
        
        const popup = document.createElement('div');
        popup.className = 'message-actions-popup';
        popup.innerHTML = `
            <button onclick="ChatSystem.setReplyTo('${messageId}', '${messageText}'); this.parentElement.remove();">
                <i class="fas fa-reply"></i> رد
            </button>
        `;
        
        popup.style.position = 'fixed';
        popup.style.left = event.pageX + 'px';
        popup.style.top = event.pageY + 'px';
        
        document.body.appendChild(popup);
        
        setTimeout(() => {
            document.addEventListener('click', function closePopup(e) {
                if (!popup.contains(e.target)) {
                    popup.remove();
                    document.removeEventListener('click', closePopup);
                }
            });
        }, 100);
    },
    
    // عرض من قرأ الرسالة
    async showReadBy(messageId) {
        try {
            const snapshot = await firebase.database().ref(`chatMessages/${messageId}`).once('value');
            const message = snapshot.val();
            
            if (!message || !message.readBy) {
                return;
            }
            
            const readByUsers = message.readBy || {};
            const members = this.currentChatPartner?.members || {};
            
            const modal = document.getElementById('readByModal');
            const listContainer = document.getElementById('readByList');
            
            let html = '';
            for (const [userId, read] of Object.entries(readByUsers)) {
                if (userId !== this.currentUserId) {
                    const userData = members[userId] || { name: userId === 'owner_001' ? 'المالك' : userId };
                    html += `
                    <div class="chat-readby-item">
                        <i class="fas fa-user-circle"></i>
                        <span>${userData.name}</span>
                        <i class="fas fa-check-circle" style="color: #4caf50;"></i>
                    </div>
                    `;
                }
            }
            
            if (html === '') {
                html = '<div class="chat-empty">لا يوجد قراء آخرون</div>';
            }
            
            listContainer.innerHTML = html;
            modal.style.display = 'flex';
            
        } catch (error) {
            console.error('❌ خطأ في تحميل تفاصيل القراءة:', error);
        }
    },
    
    closeReadByModal() {
        document.getElementById('readByModal').style.display = 'none';
    },
    
    setReplyTo(messageId, messageText) {
        this.replyToMessage = {
            id: messageId,
            text: messageText
        };
        
        const indicator = document.getElementById('chatReplyIndicator');
        const replyText = document.getElementById('replyToText');
        
        replyText.textContent = `الرد على: ${messageText.substring(0, 30)}${messageText.length > 30 ? '...' : ''}`;
        indicator.style.display = 'flex';
        
        document.getElementById('chatMessageInput').focus();
    },
    
    cancelReply() {
        this.replyToMessage = null;
        document.getElementById('chatReplyIndicator').style.display = 'none';
    },
    
    highlightMessage(messageId) {
        const messageEl = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageEl) {
            messageEl.classList.add('highlight');
            messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            setTimeout(() => {
                messageEl.classList.remove('highlight');
            }, 2000);
        }
    },
    
    linkify(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
    },
    
    listenForNewMessages() {
        this.removeMessagesListener();
        
        const messagesRef = firebase.database().ref('chatMessages');
        
        const callback = (snapshot) => {
            const message = { id: snapshot.key, ...snapshot.val() };
            
            if (message.chatId === this.currentChatId) {
                const existing = document.querySelector(`[data-message-id="${message.id}"]`);
                if (!existing) {
                    this.appendMessage(message);
                    
                    if (message.senderId !== this.currentUserId) {
                        this.markMessageAsRead(message.id);
                    }
                }
            } else {
                // تحديث قائمة المحادثات عند استلام رسالة جديدة في محادثة أخرى
                this.updateChatListItemLastMessage(message);
                this.updateUnreadBadge(message);
            }
        };
        
        messagesRef.orderByChild('chatId').equalTo(this.currentChatId).on('child_added', callback);
        
        this.messagesListenerRef = {
            callback: callback
        };
    },
    
    // تحديث آخر رسالة في قائمة المحادثات
    async updateChatListItemLastMessage(message) {
        const chatId = message.chatId;
        const items = document.querySelectorAll(`.chat-list-item[data-chat-real-id="${chatId}"]`);
        
        if (items.length > 0) {
            const lastMsgEl = items[0].querySelector('.chat-item-last-message');
            const timeEl = items[0].querySelector('.chat-item-time');
            
            if (lastMsgEl) {
                lastMsgEl.textContent = message.text.substring(0, 50);
            }
            if (timeEl) {
                timeEl.textContent = this.formatTime(message.timestamp);
            }
            
            // إضافة علامة غير مقروء إذا لم تكن الرسالة من المستخدم الحالي
            if (message.senderId !== this.currentUserId && 
                (!items[0].classList.contains('unread'))) {
                items[0].classList.add('unread');
                const badge = items[0].querySelector('.chat-item-badge');
                if (badge) {
                    const currentCount = parseInt(badge.textContent) || 0;
                    badge.textContent = currentCount + 1;
                } else {
                    items[0].insertAdjacentHTML('beforeend', `<span class="chat-item-badge">1</span>`);
                }
            }
        }
    },
    
    // تحديث الشارة العامة للرسائل غير المقروءة
    async updateUnreadBadge(message) {
        if (message.senderId !== this.currentUserId) {
            const badge = document.getElementById('chatUnreadBadge');
            if (badge) {
                const currentCount = parseInt(badge.textContent) || 0;
                badge.textContent = currentCount + 1;
                badge.style.display = 'flex';
            }
        }
    },
    
    playNotificationSound() {
        try {
            const audio = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => {
                // محاولة استخدام صوت بديل
                const fallbackAudio = new Audio('data:audio/wav;base64,UklGRlwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVoAAACAgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f38=');
                fallbackAudio.volume = 0.3;
                fallbackAudio.play().catch(() => {});
            });
        } catch (e) {
            // تجاهل أخطاء الصوت
        }
    },
    
    async sendMessage() {
        const input = document.getElementById('chatMessageInput');
        const message = input.value.trim();
        
        if (!message || !this.currentChatId || !this.currentChatPartner) return;
        
        console.log('إرسال رسالة:', {
            currentChatId: this.currentChatId,
            currentUserId: this.currentUserId,
            currentChatPartner: this.currentChatPartner
        });
        
        if (this.currentChatType === 'group') {
            const settings = this.currentChatPartner.settings || { whoCanSend: 'all' };
            if (settings.whoCanSend === 'owner_only' && !this.isOwner) {
                window.showNotification?.('فقط المالك يمكنه الكتابة في هذه المجموعة', 'error');
                return;
            }
        }
        
        const messageData = {
            chatId: this.currentChatId,
            senderId: this.currentUserId,
            senderName: this.currentUser.name,
            text: message,
            timestamp: Date.now(),
            delivered: false,
            readBy: {
                [this.currentUserId]: true
            },
            type: 'text'
        };
        
        if (this.currentChatType === 'private') {
            messageData.receiverId = this.currentChatPartner.id;
            messageData.receiverType = this.currentChatPartner.type;
            const expectedChatId = this.getPrivateChatId(this.currentUserId, this.currentChatPartner.id);
            if (messageData.chatId !== expectedChatId) {
                messageData.chatId = expectedChatId;
                this.currentChatId = expectedChatId;
            }
        } else if (this.currentChatType === 'group') {
            messageData.isGroup = true;
            messageData.groupId = this.currentChatId;
            messageData.readBy = {
                [this.currentUserId]: true
            };
            
            const members = this.currentChatPartner.members || {};
            messageData.receivers = Object.keys(members);
        }
        
        if (this.replyToMessage) {
            messageData.replyTo = this.replyToMessage.id;
            messageData.replyToText = this.replyToMessage.text;
        }
        
        try {
            const newMessageRef = await firebase.database().ref('chatMessages').push(messageData);
            
            await firebase.database().ref(`chats/${this.currentChatId}`).update({
                lastMessage: message,
                lastSenderId: this.currentUserId,
                lastSenderName: this.currentUser.name,
                lastTimestamp: Date.now()
            });
            
            input.value = '';
            input.style.height = 'auto';
            this.cancelReply();
            this.stopTyping();
            
            // تحديث واجهة المحادثة
            const newMessage = { id: newMessageRef.key, ...messageData };
            this.appendMessage(newMessage);
            
            console.log('✅ تم إرسال الرسالة بنجاح');
            
        } catch (error) {
            console.error('❌ خطأ في إرسال الرسالة:', error);
            window.showNotification?.('حدث خطأ في إرسال الرسالة', 'error');
        }
    },
    
    handleTyping() {
        if (!this.currentChatId || !this.currentChatPartner) return;
        
        const typingRef = firebase.database().ref(`typingStatus/${this.currentChatId}/${this.currentUserId}`);
        
        typingRef.set({
            isTyping: true,
            name: this.currentUser.name,
            timestamp: Date.now()
        });
        
        if (this.typingTimeouts[this.currentChatId]) {
            clearTimeout(this.typingTimeouts[this.currentChatId]);
        }
        
        this.typingTimeouts[this.currentChatId] = setTimeout(() => {
            this.stopTyping();
        }, ChatSystem.config.typingTimeout);
    },
    
    stopTyping() {
        if (!this.currentChatId) return;
        firebase.database().ref(`typingStatus/${this.currentChatId}/${this.currentUserId}`).remove();
    },
    
    listenForTyping() {
        this.removeTypingListener();
        
        if (!this.currentChatId) return;
        
        const callback = (snapshot) => {
            const typingData = snapshot.val() || {};
            const typingUsers = [];
            
            for (const [userId, data] of Object.entries(typingData)) {
                if (userId !== this.currentUserId && data.isTyping) {
                    typingUsers.push(data.name || 'شخص');
                }
            }
            
            const indicator = document.getElementById('chatTypingIndicator');
            if (typingUsers.length > 0) {
                if (typingUsers.length === 1) {
                    indicator.textContent = `${typingUsers[0]} يكتب...`;
                } else {
                    indicator.textContent = `${typingUsers.length} أشخاص يكتبون...`;
                }
                indicator.style.display = 'block';
            } else {
                indicator.textContent = '';
                indicator.style.display = 'none';
            }
        };
        
        firebase.database().ref(`typingStatus/${this.currentChatId}`).on('value', callback);
        this.typingListenerRef = callback;
    },
    
    async markMessageAsRead(messageId) {
        try {
            await firebase.database().ref(`chatMessages/${messageId}/readBy/${this.currentUserId}`).set(true);
            await firebase.database().ref(`chatMessages/${messageId}/delivered`).set(true);
            this.loadUnreadCounts();
        } catch (error) {
            console.error('❌ خطأ في تعليم الرسالة كمقروءة:', error);
        }
    },
    
    async markMessagesAsRead() {
        if (!this.currentChatId) return;
        
        try {
            const snapshot = await firebase.database().ref('chatMessages')
                .orderByChild('chatId')
                .equalTo(this.currentChatId)
                .once('value');
            
            const updates = {};
            snapshot.forEach(child => {
                const message = child.val();
                if (message.senderId !== this.currentUserId && 
                    (!message.readBy || !message.readBy[this.currentUserId])) {
                    updates[`${child.key}/readBy/${this.currentUserId}`] = true;
                }
            });
            
            if (Object.keys(updates).length > 0) {
                await firebase.database().ref('chatMessages').update(updates);
            }
            
            await this.loadUnreadCounts();
            
        } catch (error) {
            console.error('❌ خطأ في تعليم الرسائل كمقروءة:', error);
        }
    },
    
    async loadUnreadCounts() {
        if (!this.currentUserId) return;
        
        try {
            const snapshot = await firebase.database().ref('chatMessages').once('value');
            
            let totalUnread = 0;
            
            snapshot.forEach(child => {
                const message = child.val();
                if (message.senderId !== this.currentUserId) {
                    if (message.receiverId === this.currentUserId) {
                        if (!message.readBy || !message.readBy[this.currentUserId]) {
                            totalUnread++;
                        }
                    }
                    else if (message.isGroup && message.receivers && message.receivers.includes(this.currentUserId)) {
                        if (!message.readBy || !message.readBy[this.currentUserId]) {
                            totalUnread++;
                        }
                    }
                }
            });
            
            const badge = document.getElementById('chatUnreadBadge');
            if (badge) {
                badge.textContent = totalUnread > 0 ? totalUnread : '';
                badge.style.display = totalUnread > 0 ? 'flex' : 'none';
            }
            
        } catch (error) {
            console.error('❌ خطأ في تحميل عدد الرسائل:', error);
        }
    },
    
    searchChats(query) {
        const items = document.querySelectorAll('.chat-list-item');
        const searchTerm = query.toLowerCase();
        
        items.forEach(item => {
            const name = item.querySelector('.chat-item-name')?.textContent.toLowerCase() || '';
            if (name.includes(searchTerm) || searchTerm === '') {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    },
    
    showChatList() {
        this.removeMessagesListener();
        this.removeTypingListener();
        
        document.getElementById('chatListView').style.display = 'flex';
        document.getElementById('chatConversationView').style.display = 'none';
        document.getElementById('chatHeaderTitle').textContent = 'المحادثات';
        
        this.currentChatId = null;
        this.currentChatPartner = null;
        this.currentChatType = null;
        
        this.loadChatList();
    },
    
    async getUserOnlineStatus(userId) {
        try {
            const snapshot = await firebase.database().ref(`onlineUsers/${userId}`).once('value');
            const data = snapshot.val() || {};
            return {
                online: data.online || false,
                lastSeen: data.lastSeen
            };
        } catch {
            return { online: false, lastSeen: null };
        }
    },
    
    async getLastMessageByChatId(chatId) {
        try {
            const snapshot = await firebase.database().ref(`chats/${chatId}`).once('value');
            const data = snapshot.val();
            return {
                text: data?.lastMessage || '',
                timestamp: data?.lastTimestamp
            };
        } catch {
            return { text: '', timestamp: null };
        }
    },
    
    async showCreateGroupModal() {
        const modal = document.getElementById('createGroupModal');
        if (!modal) return;
        
        modal.style.display = 'flex';
        
        const listContainer = document.getElementById('groupEmployeesList');
        listContainer.innerHTML = '<div class="chat-loading-small"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>';
        
        try {
            const snapshot = await firebase.database().ref('employees').once('value');
            const employees = snapshot.val() || {};
            
            let html = '';
            for (const [id, emp] of Object.entries(employees)) {
                if (emp.active !== false) {
                    html += `
                    <label class="chat-employee-checkbox">
                        <input type="checkbox" value="${id}" data-name="${emp.name}">
                        <span class="checkmark"></span>
                        <span>${emp.name}</span>
                    </label>
                    `;
                }
            }
            
            listContainer.innerHTML = html || '<div class="chat-empty">لا يوجد موظفين</div>';
            
        } catch (error) {
            console.error('❌ خطأ في تحميل الموظفين:', error);
            listContainer.innerHTML = '<div class="chat-error">حدث خطأ في التحميل</div>';
        }
    },
    
    hideCreateGroupModal() {
        document.getElementById('createGroupModal').style.display = 'none';
    },
    
    async createGroup() {
        const groupName = document.getElementById('groupNameInput').value.trim();
        const selectedEmployees = Array.from(
            document.querySelectorAll('#groupEmployeesList input:checked')
        ).map(cb => ({
            id: cb.value,
            name: cb.dataset.name
        }));
        
        if (!groupName) {
            window.showNotification?.('الرجاء إدخال اسم المجموعة', 'error');
            return;
        }
        
        if (selectedEmployees.length === 0) {
            window.showNotification?.('الرجاء اختيار موظف واحد على الأقل', 'error');
            return;
        }
        
        try {
            const groupData = {
                name: groupName,
                createdBy: this.currentUserId,
                createdAt: Date.now(),
                settings: {
                    whoCanSend: 'owner_only'
                },
                members: {
                    [this.currentUserId]: {
                        name: this.currentUser.name,
                        type: 'owner',
                        joinedAt: Date.now()
                    }
                },
                unread: {}
            };
            
            selectedEmployees.forEach(emp => {
                groupData.members[emp.id] = {
                    name: emp.name,
                    type: 'employee',
                    joinedAt: Date.now()
                };
                groupData.unread[emp.id] = 0;
            });
            
            await firebase.database().ref('chatGroups').push(groupData);
            
            window.showNotification?.('✅ تم إنشاء المجموعة بنجاح', 'success');
            this.hideCreateGroupModal();
            this.loadChatList();
            
        } catch (error) {
            console.error('❌ خطأ في إنشاء المجموعة:', error);
            window.showNotification?.('حدث خطأ في إنشاء المجموعة', 'error');
        }
    },
    
    async showGroupManagement() {
        if (!this.currentChatPartner || this.currentChatType !== 'group') return;
        
        const modal = document.getElementById('groupManagementModal');
        if (!modal) return;
        
        modal.style.display = 'flex';
        
        document.getElementById('editGroupNameInput').value = this.currentChatPartner.name;
        
        const settings = this.currentChatPartner.settings || { whoCanSend: 'owner_only' };
        const radioValue = settings.whoCanSend === 'all' ? 'all' : 'owner_only';
        document.querySelector(`input[name="groupPermission"][value="${radioValue}"]`).checked = true;
        
        await this.loadGroupMembers();
        await this.loadAvailableEmployees();
    },
    
    async loadGroupMembers() {
        const container = document.getElementById('groupMembersList');
        if (!container || !this.currentChatPartner) return;
        
        const members = this.currentChatPartner.members || {};
        let html = '';
        
        for (const [id, member] of Object.entries(members)) {
            if (id === this.currentUserId) continue;
            
            html += `
            <div class="chat-member-item">
                <span><i class="fas fa-user-circle"></i> ${member.name}</span>
                <button class="chat-remove-member" onclick="ChatSystem.removeFromGroup('${id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            `;
        }
        
        container.innerHTML = html || '<div class="chat-empty">لا يوجد أعضاء آخرين</div>';
    },
    
    async loadAvailableEmployees() {
        const container = document.getElementById('addMembersList');
        if (!container || !this.currentChatPartner) return;
        
        container.innerHTML = '<div class="chat-loading-small"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>';
        
        try {
            const snapshot = await firebase.database().ref('employees').once('value');
            const employees = snapshot.val() || {};
            const currentMembers = this.currentChatPartner.members || {};
            
            let html = '';
            for (const [id, emp] of Object.entries(employees)) {
                if (emp.active !== false && !currentMembers[id] && id !== this.currentUserId) {
                    html += `
                    <label class="chat-employee-checkbox">
                        <input type="checkbox" value="${id}" data-name="${emp.name}">
                        <span class="checkmark"></span>
                        <span>${emp.name}</span>
                    </label>
                    `;
                }
            }
            
            container.innerHTML = html || '<div class="chat-empty">لا يوجد موظفين للإضافة</div>';
            
        } catch (error) {
            console.error('❌ خطأ في تحميل الموظفين:', error);
            container.innerHTML = '<div class="chat-error">حدث خطأ في التحميل</div>';
        }
    },
    
    async removeFromGroup(memberId) {
        if (!confirm('هل أنت متأكد من إزالة هذا العضو من المجموعة؟')) return;
        
        try {
            const groupId = this.currentChatId;
            const updates = {};
            
            updates[`chatGroups/${groupId}/members/${memberId}`] = null;
            updates[`chatGroups/${groupId}/unread/${memberId}`] = null;
            
            await firebase.database().ref().update(updates);
            
            window.showNotification?.('✅ تم إزالة العضو بنجاح', 'success');
            
            await this.loadGroupMembers();
            await this.loadAvailableEmployees();
            
            const groupData = await this.getGroupData(groupId);
            this.currentChatPartner.members = groupData.members || {};
            
        } catch (error) {
            console.error('❌ خطأ في إزالة العضو:', error);
            window.showNotification?.('حدث خطأ في إزالة العضو', 'error');
        }
    },
    
    async saveGroupSettings() {
        const groupName = document.getElementById('editGroupNameInput').value.trim();
        const whoCanSend = document.querySelector('input[name="groupPermission"]:checked')?.value;
        
        if (!groupName) {
            window.showNotification?.('الرجاء إدخال اسم المجموعة', 'error');
            return;
        }
        
        const selectedEmployees = Array.from(
            document.querySelectorAll('#addMembersList input:checked')
        ).map(cb => ({
            id: cb.value,
            name: cb.dataset.name
        }));
        
        try {
            const groupId = this.currentChatId;
            const updates = {};
            
            updates[`chatGroups/${groupId}/name`] = groupName;
            updates[`chatGroups/${groupId}/settings/whoCanSend`] = whoCanSend;
            
            selectedEmployees.forEach(emp => {
                updates[`chatGroups/${groupId}/members/${emp.id}`] = {
                    name: emp.name,
                    type: 'employee',
                    joinedAt: Date.now()
                };
                updates[`chatGroups/${groupId}/unread/${emp.id}`] = 0;
            });
            
            await firebase.database().ref().update(updates);
            
            window.showNotification?.('✅ تم تحديث إعدادات المجموعة بنجاح', 'success');
            
            this.currentChatPartner.name = groupName;
            this.currentChatPartner.settings = { whoCanSend };
            document.querySelector('.chat-partner-name').textContent = groupName;
            
            this.updateGroupPermissionStatus();
            this.hideGroupManagementModal();
            
        } catch (error) {
            console.error('❌ خطأ في تحديث المجموعة:', error);
            window.showNotification?.('حدث خطأ في تحديث المجموعة', 'error');
        }
    },
    
    hideGroupManagementModal() {
        document.getElementById('groupManagementModal').style.display = 'none';
    },
    
    scrollToBottom() {
        const container = document.getElementById('chatMessagesContainer');
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    },
    
    formatTime(timestamp) {
        if (!timestamp) return '';
        
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'الآن';
        if (diff < 3600000) return `منذ ${Math.floor(diff/60000)} د`;
        if (diff < 86400000) return `منذ ${Math.floor(diff/3600000)} س`;
        
        return date.toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit' });
    },
    
    formatTimeAgo(timestamp) {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'الآن';
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        if (hours < 24) return `منذ ${hours} ساعة`;
        return `منذ ${days} يوم`;
    }
    
};

window.ChatSystem = ChatSystem;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ChatSystem.initialize());
} else {
    ChatSystem.initialize();
}