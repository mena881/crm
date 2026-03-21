// ================================================
// نظام إدارة المخزون المتكامل - Inventory Manager
// ================================================

class InventoryManager {
    constructor(firebaseDatabase) {
        this.db = firebaseDatabase;
        this.stock = {}; // تخزين الكميات الحالية
        this.products = {}; // تخزين بيانات المنتجات
        this.bundles = {}; // تخزين بيانات الباندلات
        this.initialized = false;
    }

    // ================ التهيئة وتحميل البيانات ================
    async initialize() {
        try {
            await this.loadProducts();
            await this.loadBundles();
            await this.loadCurrentStock();
            this.initialized = true;
            console.log('✅ Inventory Manager initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Inventory Manager initialization failed:', error);
            return false;
        }
    }

    async loadProducts() {
        const snapshot = await this.db.ref('products').once('value');
        this.products = snapshot.val() || {};
    }

    async loadBundles() {
        const snapshot = await this.db.ref('bundles').once('value');
        const bundlesData = snapshot.val() || {};
        
        // تجهيز الباندلات مع منتجاتها
        for (const [bundleId, bundle] of Object.entries(bundlesData)) {
            if (bundle.active && bundle.products) {
                this.bundles[bundleId] = {
                    ...bundle,
                    id: bundleId,
                    products: bundle.products
                };
            }
        }
    }

    async loadCurrentStock() {
        const snapshot = await this.db.ref('stock').once('value');
        this.stock = snapshot.val() || {};
    }

    // ================ تحديث المخزون من فواتير البيع ================
    async processSalesInvoice(invoiceId, invoiceData) {
        console.log(`🔄 Processing sales invoice: ${invoiceId}`);
        
        if (!invoiceData || !invoiceData.items) return;

        const isReturn = invoiceData.isReturn || false;
        const isCancelled = !!invoiceData.cancelledAt;

        // لو الفاتورة ملغية، منتعملش حاجة
        if (isCancelled) {
            console.log(`⏭️ Invoice ${invoiceId} is cancelled, skipping...`);
            return;
        }

        // لو المرتجعات، نزود الكمية
        if (isReturn) {
            await this.handleSalesReturn(invoiceData);
        } 
        // لو فاتورة بيع عادية واتشحنت، ننقص الكمية
        else if (this.isShipped(invoiceData)) {
            await this.handleSalesInvoice(invoiceData);
        }
    }

    isShipped(invoiceData) {
        // التحقق من حالة الشحن
        const shippedKeywords = ['shipped', 'تم الشحن', 'جاري الشحن', 'shipping'];
        const status = (invoiceData.status || '').toLowerCase();
        const warehouseStatus = (invoiceData.warehouseStatus || '').toLowerCase();
        
        return shippedKeywords.some(keyword => 
            status.includes(keyword) || warehouseStatus.includes(keyword)
        ) || !!invoiceData.shippedAt;
    }

    async handleSalesInvoice(invoiceData) {
        const updates = {};

        for (const item of invoiceData.items) {
            if (item.type === 'product') {
                // منتج عادي - ننقص الكمية
                const stockKey = `${item.id}-${invoiceData.warehouseId}`;
                const currentQty = this.getCurrentStock(item.id, invoiceData.warehouseId);
                const newQty = currentQty - item.quantity;
                
                updates[`stock/${stockKey}`] = {
                    productId: item.id,
                    warehouseId: invoiceData.warehouseId,
                    quantity: newQty,
                    updatedAt: new Date().toISOString()
                };

                console.log(`📦 Product ${item.name}: ${currentQty} → ${newQty} (sold ${item.quantity})`);
            } 
            else if (item.type === 'bundle') {
                // باندل - ننقص منتجات الباندل
                await this.handleBundleSale(item, invoiceData.warehouseId, updates);
            }
        }

        // تطبيق التحديثات
        await this.applyStockUpdates(updates);
    }

    async handleBundleSale(bundleItem, warehouseId, updates) {
        const bundleId = bundleItem.id;
        const bundle = this.bundles[bundleId];
        
        if (!bundle) {
            console.warn(`⚠️ Bundle ${bundleId} not found`);
            return;
        }

        // نقص كل منتج في الباندل
        for (const [productId, included] of Object.entries(bundle.products)) {
            if (included) {
                const stockKey = `${productId}-${warehouseId}`;
                const currentQty = this.getCurrentStock(productId, warehouseId);
                // بنقص كمية المنتج مضروبة في عدد الباندلات المباعة
                const newQty = currentQty - (bundleItem.quantity || 1);
                
                updates[`stock/${stockKey}`] = {
                    productId: productId,
                    warehouseId: warehouseId,
                    quantity: newQty,
                    updatedAt: new Date().toISOString()
                };

                console.log(`📦 Bundle product ${productId}: ${currentQty} → ${newQty}`);
            }
        }
    }

    async handleSalesReturn(returnInvoice) {
        const updates = {};

        for (const item of returnInvoice.items) {
            if (item.type === 'product') {
                // مرتجع منتج - نزود الكمية
                const stockKey = `${item.id}-${returnInvoice.warehouseId}`;
                const currentQty = this.getCurrentStock(item.id, returnInvoice.warehouseId);
                const newQty = currentQty + item.quantity;
                
                updates[`stock/${stockKey}`] = {
                    productId: item.id,
                    warehouseId: returnInvoice.warehouseId,
                    quantity: newQty,
                    updatedAt: new Date().toISOString()
                };

                console.log(`↩️ Return product ${item.name}: ${currentQty} → ${newQty}`);
            }
            else if (item.type === 'bundle') {
                // مرتجع باندل - نزود منتجات الباندل
                await this.handleBundleReturn(item, returnInvoice.warehouseId, updates);
            }
        }

        await this.applyStockUpdates(updates);
    }

    async handleBundleReturn(bundleItem, warehouseId, updates) {
        const bundleId = bundleItem.id;
        const bundle = this.bundles[bundleId];
        
        if (!bundle) return;

        // نزود كل منتج في الباندل
        for (const [productId, included] of Object.entries(bundle.products)) {
            if (included) {
                const stockKey = `${productId}-${warehouseId}`;
                const currentQty = this.getCurrentStock(productId, warehouseId);
                const newQty = currentQty + (bundleItem.quantity || 1);
                
                updates[`stock/${stockKey}`] = {
                    productId: productId,
                    warehouseId: warehouseId,
                    quantity: newQty,
                    updatedAt: new Date().toISOString()
                };
            }
        }
    }

    // ================ تحديث المخزون من المشتريات ================
    async processPurchaseInvoice(purchaseId, purchaseData) {
        console.log(`🔄 Processing purchase: ${purchaseId}`);

        if (!purchaseData || !purchaseData.items) return;

        const updates = {};
        const isReturn = purchaseData.isReturn || false;

        for (const item of purchaseData.items) {
            if (item.type !== 'product') continue;

            const stockKey = `${item.id}-${purchaseData.warehouseId}`;
            const currentQty = this.getCurrentStock(item.id, purchaseData.warehouseId);
            
            let newQty;
            if (isReturn) {
                // مرتجع شراء - بنقص الكمية
                newQty = currentQty - item.quantity;
                console.log(`↩️ Purchase return ${item.name}: ${currentQty} → ${newQty}`);
            } else {
                // فاتورة شراء عادية - بنزيد الكمية
                newQty = currentQty + item.quantity;
                console.log(`📦 Purchase ${item.name}: ${currentQty} → ${newQty}`);
            }

            updates[`stock/${stockKey}`] = {
                productId: item.id,
                warehouseId: purchaseData.warehouseId,
                quantity: newQty,
                updatedAt: new Date().toISOString()
            };
        }

        await this.applyStockUpdates(updates);
    }

    // ================ تحديث المخزون من التحويلات ================
    async processTransfer(transferId, transferData) {
        console.log(`🔄 Processing transfer: ${transferId}`);

        if (!transferData || !transferData.items || transferData.status !== 'completed') return;

        const updates = {};

        for (const item of transferData.items) {
            const stockKeyFrom = `${item.productId}-${transferData.fromWarehouseId}`;
            const stockKeyTo = `${item.productId}-${transferData.toWarehouseId}`;
            
            // نقص من المخزن المرسل
            const currentQtyFrom = this.getCurrentStock(item.productId, transferData.fromWarehouseId);
            const newQtyFrom = currentQtyFrom - item.quantity;
            
            updates[`stock/${stockKeyFrom}`] = {
                productId: item.productId,
                warehouseId: transferData.fromWarehouseId,
                quantity: newQtyFrom,
                updatedAt: new Date().toISOString()
            };

            // زود في المخزن المستقبل
            const currentQtyTo = this.getCurrentStock(item.productId, transferData.toWarehouseId);
            const newQtyTo = currentQtyTo + item.quantity;
            
            updates[`stock/${stockKeyTo}`] = {
                productId: item.productId,
                warehouseId: transferData.toWarehouseId,
                quantity: newQtyTo,
                updatedAt: new Date().toISOString()
            };

            console.log(`🔄 Transfer ${item.productName}:`);
            console.log(`   From warehouse ${transferData.fromWarehouseId}: ${currentQtyFrom} → ${newQtyFrom}`);
            console.log(`   To warehouse ${transferData.toWarehouseId}: ${currentQtyTo} → ${newQtyTo}`);
        }

        await this.applyStockUpdates(updates);
    }

    // ================ تحديث المخزون من التسويات ================
    async processInventoryAdjustment(adjustmentId, adjustmentData) {
        console.log(`🔄 Processing inventory adjustment: ${adjustmentId}`);

        if (!adjustmentData || !adjustmentData.items) return;

        const updates = {};

        for (const item of adjustmentData.items) {
            const stockKey = `${item.productId}-${adjustmentData.warehouseId}`;
            const currentQty = this.getCurrentStock(item.productId, adjustmentData.warehouseId);
            
            let newQty = currentQty;
            
            switch (item.type) {
                case 'increase':
                    newQty = currentQty + item.quantity;
                    console.log(`📈 Increase ${item.productName}: +${item.quantity} → ${newQty}`);
                    break;
                case 'decrease':
                    newQty = currentQty - item.quantity;
                    console.log(`📉 Decrease ${item.productName}: -${item.quantity} → ${newQty}`);
                    break;
                case 'damage':
                    newQty = currentQty - item.quantity;
                    console.log(`💔 Damage ${item.productName}: -${item.quantity} → ${newQty}`);
                    break;
                default:
                    console.log(`⏭️ Unknown type ${item.type}, skipping...`);
                    continue;
            }

            updates[`stock/${stockKey}`] = {
                productId: item.productId,
                warehouseId: adjustmentData.warehouseId,
                quantity: newQty,
                updatedAt: new Date().toISOString()
            };
        }

        await this.applyStockUpdates(updates);
    }

    // ================ معالجة التعديلات على الفواتير ================
    async processInvoiceEdit(originalInvoice, updatedInvoice) {
        console.log(`🔄 Processing invoice edit`);

        if (!originalInvoice || !updatedInvoice) return;

        // لو الفاتورة اتحولت لمرتجع أو العكس
        if (originalInvoice.isReturn !== updatedInvoice.isReturn) {
            if (updatedInvoice.isReturn) {
                // اتحولت لمرتجع - نزود الكمية
                await this.handleSalesReturn(updatedInvoice);
            } else {
                // اتحولت لبيع - ننقص الكمية لو متشحنة
                if (this.isShipped(updatedInvoice)) {
                    await this.handleSalesInvoice(updatedInvoice);
                }
            }
            return;
        }

        // مقارنة العناصر القديمة والجديدة
        const oldItems = originalInvoice.items || [];
        const newItems = updatedInvoice.items || [];
        
        const updates = {};

        // معالفة التغييرات في الكميات
        for (const oldItem of oldItems) {
            const newItem = newItems.find(item => item.id === oldItem.id);
            
            if (!newItem) {
                // العنصر اتحذف - نرجع الكمية
                await this.reverseItemQuantity(oldItem, updatedInvoice.warehouseId, updates);
            } else if (newItem.quantity !== oldItem.quantity) {
                // الكمية اتغيرت
                const diff = newItem.quantity - oldItem.quantity;
                await this.adjustItemQuantity(oldItem, diff, updatedInvoice.warehouseId, updates);
            }
        }

        // العناصر الجديدة المضافة
        for (const newItem of newItems) {
            const oldItem = oldItems.find(item => item.id === newItem.id);
            if (!oldItem) {
                // عنصر جديد مضاف
                await this.addItemQuantity(newItem, updatedInvoice.warehouseId, updates);
            }
        }

        await this.applyStockUpdates(updates);
    }

    async reverseItemQuantity(item, warehouseId, updates) {
        if (item.type === 'product') {
            const stockKey = `${item.id}-${warehouseId}`;
            const currentQty = this.getCurrentStock(item.id, warehouseId);
            updates[`stock/${stockKey}`] = {
                productId: item.id,
                warehouseId: warehouseId,
                quantity: currentQty + item.quantity,
                updatedAt: new Date().toISOString()
            };
        }
    }

    async adjustItemQuantity(item, diff, warehouseId, updates) {
        if (item.type === 'product') {
            const stockKey = `${item.id}-${warehouseId}`;
            const currentQty = this.getCurrentStock(item.id, warehouseId);
            updates[`stock/${stockKey}`] = {
                productId: item.id,
                warehouseId: warehouseId,
                quantity: currentQty - diff, // عكس التغيير
                updatedAt: new Date().toISOString()
            };
        }
    }

    async addItemQuantity(item, warehouseId, updates) {
        if (item.type === 'product') {
            const stockKey = `${item.id}-${warehouseId}`;
            const currentQty = this.getCurrentStock(item.id, warehouseId);
            updates[`stock/${stockKey}`] = {
                productId: item.id,
                warehouseId: warehouseId,
                quantity: currentQty - item.quantity, // بنقص لانه بيع
                updatedAt: new Date().toISOString()
            };
        }
    }

    // ================ دوال مساعدة ================
    getCurrentStock(productId, warehouseId) {
        const key = `${productId}-${warehouseId}`;
        return this.stock[key]?.quantity || 0;
    }

    async applyStockUpdates(updates) {
        if (Object.keys(updates).length === 0) return;

        try {
            await this.db.ref().update(updates);
            
            // تحديث الذاكرة المحلية
            for (const [path, data] of Object.entries(updates)) {
                const key = path.replace('stock/', '');
                this.stock[key] = data;
            }
            
            console.log(`✅ Applied ${Object.keys(updates).length} stock updates`);
        } catch (error) {
            console.error('❌ Failed to apply stock updates:', error);
            throw error;
        }
    }

    // ================ معالجة جميع البيانات ================
    async processAllData() {
        console.log('🚀 Starting full inventory processing...');
        
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // 1. معالجة المشتريات
            console.log('\n📦 Processing purchases...');
            const purchases = await this.db.ref('purchases').once('value');
            for (const [id, data] of Object.entries(purchases.val() || {})) {
                await this.processPurchaseInvoice(id, data);
            }

            // 2. معالجة فواتير البيع
            console.log('\n📋 Processing sales invoices...');
            const invoices = await this.db.ref('invoices').once('value');
            for (const [id, data] of Object.entries(invoices.val() || {})) {
                await this.processSalesInvoice(id, data);
            }

            // 3. معالجة التحويلات
            console.log('\n🔄 Processing transfers...');
            const transfers = await this.db.ref('transfers').once('value');
            for (const [id, data] of Object.entries(transfers.val() || {})) {
                await this.processTransfer(id, data);
            }

            // 4. معالجة التسويات
            console.log('\n⚖️ Processing inventory adjustments...');
            const adjustments = await this.db.ref('inventoryAdjustments').once('value');
            for (const [id, data] of Object.entries(adjustments.val() || {})) {
                await this.processInventoryAdjustment(id, data);
            }

            console.log('\n✅ All inventory processing completed!');
            return true;

        } catch (error) {
            console.error('❌ Error processing inventory:', error);
            return false;
        }
    }
}

// ================ إعداد المستمعين المباشرين ================
class InventoryListeners {
    constructor(inventoryManager) {
        this.inventory = inventoryManager;
        this.setupListeners();
    }

    setupListeners() {
        // استماع لفواتير البيع الجديدة أو المعدلة
        this.inventory.db.ref('invoices').on('child_added', async (snapshot) => {
            console.log('🔔 New invoice detected');
            await this.inventory.processSalesInvoice(snapshot.key, snapshot.val());
        });

        this.inventory.db.ref('invoices').on('child_changed', async (snapshot) => {
            console.log('🔔 Invoice updated detected');
            // هنا محتاجين الفاتورة القديمة والجديدة
            // ممكن نجيبها من التاريخ أو نخزن snapshot قديم
        });

        // استماع للمشتريات الجديدة
        this.inventory.db.ref('purchases').on('child_added', async (snapshot) => {
            console.log('🔔 New purchase detected');
            await this.inventory.processPurchaseInvoice(snapshot.key, snapshot.val());
        });

        // استماع للتحويلات الجديدة
        this.inventory.db.ref('transfers').on('child_added', async (snapshot) => {
            console.log('🔔 New transfer detected');
            await this.inventory.processTransfer(snapshot.key, snapshot.val());
        });

        // استماع للتسويات الجديدة
        this.inventory.db.ref('inventoryAdjustments').on('child_added', async (snapshot) => {
            console.log('🔔 New adjustment detected');
            await this.inventory.processInventoryAdjustment(snapshot.key, snapshot.val());
        });

        console.log('👂 Inventory listeners activated');
    }
}

// ================ تصدير الكلاس ================
export { InventoryManager, InventoryListeners };

// ================ مثال للاستخدام ================
/*
import { getDatabase } from 'firebase/database';

const db = getDatabase();
const inventoryManager = new InventoryManager(db);

// تشغيل المعالجة الكاملة
await inventoryManager.initialize();
await inventoryManager.processAllData();

// تشغيل المستمعين
const listeners = new InventoryListeners(inventoryManager);
*/