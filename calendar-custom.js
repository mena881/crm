/**
 * تقويم مخصص - إصدار متقدم
 * يدعم التقويمات في أي مكان في الصفحة
 */

class CustomCalendar {
  constructor(options = {}) {
    this.options = {
      container: options.container || document.body,
      inputSelector: options.inputSelector || 'input[type="date"]',
      calendarSelector: options.calendarSelector || '.calendar-container',
      onDateSelect: options.onDateSelect || null,
      onMonthChange: options.onMonthChange || null,
      language: options.language || 'ar',
      firstDayOfWeek: options.firstDayOfWeek || 6, // 0 = الأحد, 6 = السبت (مناسب للعربية)
      ...options
    };

    this.currentDate = new Date();
    this.selectedDate = null;
    this.events = [];
    this.initialize();
  }

  initialize() {
    // تهيئة جميع تقويمات الصفحة
    this.initCalendars();
    
    // تهيئة منتقيات التاريخ
    this.initDatePickers();
    
    // إضافة الأنماط الأساسية
    this.addBaseStyles();
    
    // تحديث التقويمات كلما تغيرت الصفحة
    this.observeDOMChanges();
    
    console.log('✅ تم تهيئة التقويم المخصص');
  }

  initCalendars() {
    const calendars = document.querySelectorAll(this.options.calendarSelector);
    calendars.forEach(calendar => this.buildCalendar(calendar));
  }

  initDatePickers() {
    const dateInputs = document.querySelectorAll(this.options.inputSelector);
    dateInputs.forEach(input => {
      if (!input.hasAttribute('data-custom-picker')) {
        this.buildDatePicker(input);
        input.setAttribute('data-custom-picker', 'true');
      }
    });
  }

  buildCalendar(container) {
    // إضافة الهيكل الأساسي للتقويم
    if (!container.querySelector('.calendar-header')) {
      container.innerHTML = this.getCalendarHTML();
    }

    const month = container.querySelector('.calendar-month-year');
    const daysGrid = container.querySelector('.calendar-days');
    
    // إضافة الأحداث
    this.renderCalendar(container, this.currentDate);
    
    // إضافة مستمعي الأحداث
    this.addCalendarEvents(container);
  }

  getCalendarHTML() {
    const weekdays = this.getWeekdays();
    
    return `
      <div class="calendar-header">
        <div class="calendar-title">
          <i class="fas fa-calendar-alt"></i>
          <span>التقويم</span>
        </div>
        <div class="calendar-nav">
          <button class="calendar-nav-btn" data-action="prev-year">
            <i class="fas fa-angle-double-right"></i>
          </button>
          <button class="calendar-nav-btn" data-action="prev-month">
            <i class="fas fa-chevron-right"></i>
          </button>
          <span class="calendar-month-year"></span>
          <button class="calendar-nav-btn" data-action="next-month">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="calendar-nav-btn" data-action="next-year">
            <i class="fas fa-angle-double-left"></i>
          </button>
        </div>
      </div>
      <div class="calendar-weekdays">
        ${weekdays.map(day => `<div class="calendar-weekday">${day}</div>`).join('')}
      </div>
      <div class="calendar-days"></div>
    `;
  }

  getWeekdays() {
    if (this.options.language === 'ar') {
      return ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
    }
    return ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  }

  renderCalendar(container, date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // تحديث عنوان الشهر والسنة
    const monthYearEl = container.querySelector('.calendar-month-year');
    monthYearEl.textContent = this.getMonthYearText(year, month);
    
    // حساب أيام الشهر
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const monthLength = lastDay.getDate();
    
    // حساب أيام الشهر السابق
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    let daysGrid = container.querySelector('.calendar-days');
    daysGrid.innerHTML = '';
    
    // إضافة أيام الشهر السابق
    for (let i = startingDay; i > 0; i--) {
      const dayNumber = prevMonthLastDay - i + 1;
      const dayDate = new Date(year, month - 1, dayNumber);
      daysGrid.appendChild(this.createDayElement(dayNumber, true, dayDate));
    }
    
    // إضافة أيام الشهر الحالي
    for (let i = 1; i <= monthLength; i++) {
      const dayDate = new Date(year, month, i);
      const isToday = this.isToday(dayDate);
      const isSelected = this.isSelected(dayDate);
      daysGrid.appendChild(this.createDayElement(i, false, dayDate, isToday, isSelected));
    }
    
    // إضافة أيام الشهر القادم
    const totalCells = 42; // 6 أسابيع × 7 أيام
    const remainingCells = totalCells - (startingDay + monthLength);
    
    for (let i = 1; i <= remainingCells; i++) {
      const dayDate = new Date(year, month + 1, i);
      daysGrid.appendChild(this.createDayElement(i, true, dayDate));
    }
  }

  createDayElement(dayNumber, isOtherMonth, date, isToday = false, isSelected = false) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    if (isOtherMonth) dayEl.classList.add('other-month');
    if (isToday) dayEl.classList.add('today');
    if (isSelected) dayEl.classList.add('selected');
    
    // إضافة خصائص التاريخ
    dayEl.dataset.date = date.toISOString().split('T')[0];
    dayEl.dataset.year = date.getFullYear();
    dayEl.dataset.month = date.getMonth();
    dayEl.dataset.day = dayNumber;
    
    // إضافة محتوى اليوم
    dayEl.innerHTML = `
      <div class="calendar-day-number">${dayNumber}</div>
      <div class="calendar-events" data-date="${date.toISOString().split('T')[0]}"></div>
    `;
    
    return dayEl;
  }

  getMonthYearText(year, month) {
    const monthNames = this.options.language === 'ar' 
      ? ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    return `${monthNames[month]} ${year}`;
  }

  isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  isSelected(date) {
    if (!this.selectedDate) return false;
    return date.getDate() === this.selectedDate.getDate() &&
           date.getMonth() === this.selectedDate.getMonth() &&
           date.getFullYear() === this.selectedDate.getFullYear();
  }

  addCalendarEvents(container) {
    // أزرار التنقل
    const navButtons = container.querySelectorAll('.calendar-nav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const action = btn.dataset.action;
        this.handleNavigation(action, container);
      });
    });

    // اختيار يوم
    const days = container.querySelectorAll('.calendar-day');
    days.forEach(day => {
      day.addEventListener('click', () => {
        this.selectDate(day, container);
      });
    });
  }

  handleNavigation(action, container) {
    const monthYearEl = container.querySelector('.calendar-month-year');
    const [monthName, yearStr] = monthYearEl.textContent.split(' ');
    const year = parseInt(yearStr);
    const month = this.getMonthIndex(monthName);

    switch(action) {
      case 'prev-year':
        this.currentDate.setFullYear(year - 1);
        break;
      case 'prev-month':
        this.currentDate.setMonth(month - 1);
        break;
      case 'next-month':
        this.currentDate.setMonth(month + 1);
        break;
      case 'next-year':
        this.currentDate.setFullYear(year + 1);
        break;
    }

    this.renderCalendar(container, this.currentDate);
    this.addCalendarEvents(container);
    
    if (this.options.onMonthChange) {
      this.options.onMonthChange(this.currentDate);
    }
  }

  getMonthIndex(monthName) {
    const months = this.options.language === 'ar'
      ? ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months.indexOf(monthName);
  }

  selectDate(dayElement, container) {
    // إزالة التحديد السابق
    container.querySelectorAll('.calendar-day.selected').forEach(el => {
      el.classList.remove('selected');
    });
    
    // إضافة التحديد الجديد
    dayElement.classList.add('selected');
    
    const dateStr = dayElement.dataset.date;
    this.selectedDate = new Date(dateStr);
    
    if (this.options.onDateSelect) {
      this.options.onDateSelect(this.selectedDate, dateStr);
    }
  }

  buildDatePicker(input) {
    // إنشاء حاوية منتقي التاريخ
    const container = document.createElement('div');
    container.className = 'date-picker-container';
    
    // تغليف الإدخال بالحاوية
    input.parentNode.insertBefore(container, input);
    container.appendChild(input);
    
    // إضافة القائمة المنسدلة
    const dropdown = document.createElement('div');
    dropdown.className = 'date-picker-dropdown';
    container.appendChild(dropdown);
    
    // بناء التقويم المصغر
    this.buildMiniCalendar(dropdown, input);
    
    // إظهار/إخفاء القائمة
    input.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
      this.updateMiniCalendar(dropdown, input);
    });
    
    // إخفاء القائمة عند النقر خارجها
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        dropdown.classList.remove('show');
      }
    });
  }

  buildMiniCalendar(dropdown, input) {
    dropdown.innerHTML = `
      <div class="date-picker-header">
        <button class="date-picker-nav" data-action="prev-month">
          <i class="fas fa-chevron-right"></i>
        </button>
        <span class="date-picker-month"></span>
        <button class="date-picker-nav" data-action="next-month">
          <i class="fas fa-chevron-left"></i>
        </button>
      </div>
      <div class="date-picker-weekdays"></div>
      <div class="date-picker-days"></div>
    `;
    
    this.updateMiniCalendar(dropdown, input);
  }

  updateMiniCalendar(dropdown, input) {
    const header = dropdown.querySelector('.date-picker-header');
    const monthSpan = dropdown.querySelector('.date-picker-month');
    const weekdaysDiv = dropdown.querySelector('.date-picker-weekdays');
    const daysDiv = dropdown.querySelector('.date-picker-days');
    
    let currentDate = input._calendarDate || new Date();
    
    // تحديث الشهر والسنة
    monthSpan.textContent = this.getMonthYearText(
      currentDate.getFullYear(), 
      currentDate.getMonth()
    );
    
    // تحديث أيام الأسبوع
    weekdaysDiv.innerHTML = this.getWeekdays()
      .map(day => `<div class="date-picker-weekday">${day}</div>`)
      .join('');
    
    // حساب أيام الشهر
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startingDay = firstDay.getDay();
    const monthLength = lastDay.getDate();
    
    daysDiv.innerHTML = '';
    
    // أيام الشهر السابق
    for (let i = startingDay; i > 0; i--) {
      const day = document.createElement('button');
      day.className = 'date-picker-day other-month';
      daysDiv.appendChild(day);
    }
    
    // أيام الشهر الحالي
    for (let i = 1; i <= monthLength; i++) {
      const day = document.createElement('button');
      day.className = 'date-picker-day';
      day.textContent = i;
      
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      day.dataset.date = dateStr;
      
      // التحقق مما إذا كان اليوم هو اليوم المحدد
      if (input.value === dateStr) {
        day.classList.add('selected');
      }
      
      // التحقق مما إذا كان اليوم هو اليوم الحالي
      const today = new Date();
      if (today.getDate() === i && 
          today.getMonth() === currentDate.getMonth() && 
          today.getFullYear() === currentDate.getFullYear()) {
        day.classList.add('today');
      }
      
      day.addEventListener('click', () => {
        input.value = dateStr;
        input.dispatchEvent(new Event('change'));
        dropdown.classList.remove('show');
        
        if (this.options.onDateSelect) {
          this.options.onDateSelect(new Date(dateStr), dateStr);
        }
      });
      
      daysDiv.appendChild(day);
    }
    
    // إضافة أحداث التنقل
    header.querySelectorAll('.date-picker-nav').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        
        if (action === 'prev-month') {
          currentDate.setMonth(currentDate.getMonth() - 1);
        } else if (action === 'next-month') {
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
        
        input._calendarDate = currentDate;
        this.updateMiniCalendar(dropdown, input);
      });
    });
  }

  addBaseStyles() {
    // إضافة أنماط أساسية إذا لم تكن موجودة
    if (!document.getElementById('calendar-base-styles')) {
      const style = document.createElement('style');
      style.id = 'calendar-base-styles';
      style.textContent = `
        input[type="date"] {
          -webkit-appearance: none;
          appearance: none;
        }
        
        input[type="date"]::-webkit-calendar-picker-indicator {
          display: none;
        }
        
        input[type="date"]::-webkit-inner-spin-button,
        input[type="date"]::-webkit-clear-button {
          display: none;
        }
      `;
      document.head.appendChild(style);
    }
  }

  observeDOMChanges() {
    // مراقبة التغييرات في DOM لإضافة التقويمات الجديدة
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          this.initCalendars();
          this.initDatePickers();
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // دوال عامة للاستخدام الخارجي
  addEvent(date, eventData) {
    this.events.push({ date, ...eventData });
    this.updateEventsOnCalendar();
  }

  removeEvent(eventId) {
    this.events = this.events.filter(e => e.id !== eventId);
    this.updateEventsOnCalendar();
  }

  updateEventsOnCalendar() {
    // تجميع الأحداث حسب التاريخ
    const eventsByDate = {};
    this.events.forEach(event => {
      const dateStr = event.date.toISOString().split('T')[0];
      if (!eventsByDate[dateStr]) eventsByDate[dateStr] = [];
      eventsByDate[dateStr].push(event);
    });
    
    // عرض الأحداث في التقويم
    document.querySelectorAll('.calendar-events').forEach(eventContainer => {
      const date = eventContainer.dataset.date;
      if (eventsByDate[date]) {
        eventContainer.innerHTML = eventsByDate[date]
          .map(event => `<div class="calendar-event">${event.title}</div>`)
          .join('');
      }
    });
  }

  setLanguage(lang) {
    this.options.language = lang;
    this.initCalendars();
  }

  goToDate(date) {
    this.currentDate = new Date(date);
    this.initCalendars();
  }
}

// تهيئة التقويم عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  window.customCalendar = new CustomCalendar({
    language: 'ar',
    firstDayOfWeek: 6, // السبت
    onDateSelect: (date, dateStr) => {
      console.log('تم اختيار التاريخ:', dateStr);
    }
  });
});

// تصدير الكلاس للاستخدام في أماكن أخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CustomCalendar;
}