// ========== CAPACITOR & NATIVE ALARM IMPORTS ==========
import { Capacitor } from '@capacitor/core';


// ========== YOUR ORIGINAL CONSTANTS & STATE (unchanged) ==========
const vaultKey = "alertly-local-vault-v1";

const avatarPresets = [
  { id: "wave", label: "Wave", className: "avatar-wave", text: "WA" },
  { id: "sun", label: "Sun", className: "avatar-sun", text: "SU" },
  { id: "mint", label: "Mint", className: "avatar-mint", text: "MI" },
  { id: "night", label: "Night", className: "avatar-night", text: "NI" }
];

const state = {
  view: "dashboard",
  editingId: null,
  selectedDate: todayISO(),
  scheduleMode: "events",
  timeFormat: "12",
  selectedPeriod: "AM",
  pendingTimes: [],
  selectedDays: [],
  vault: loadVault()
};

const content = document.querySelector("#appContent");
const phone = document.querySelector(".phone");
const onboarding = document.querySelector("#onboarding");
const accountForm = document.querySelector("#accountForm");
const loginForm = document.querySelector("#loginForm");
const resetLocalButton = document.querySelector("#resetLocalButton");
const loginMessage = document.querySelector("#loginMessage");
const avatarButton = document.querySelector("#profileButton");
const dialog = document.querySelector("#alarmDialog");
const form = document.querySelector("#alarmForm");
const deleteButton = document.querySelector("#deleteAlarmButton");
const drawer = document.querySelector("#drawer");
const alarmTime = document.querySelector("#alarmTime");
const alarmType = document.querySelector("#alarmType");
const eventHasAlarm = document.querySelector("#eventHasAlarm");
const alarmRepeat = document.querySelector("#alarmRepeat");
const eventBurstEnabled = document.querySelector("#eventBurstEnabled");
const burstControls = document.querySelector("#burstControls");
const hourWheel = document.querySelector("#hourWheel");
const minuteWheel = document.querySelector("#minuteWheel");
const ampmPicker = document.querySelector("#ampmPicker");
const format12Button = document.querySelector("#format12Button");
const format24Button = document.querySelector("#format24Button");
const eventTimeChips = document.querySelector("#eventTimeChips");
const addEventTimeButton = document.querySelector("#addEventTimeButton");

// ========== YOUR ORIGINAL HELPER FUNCTIONS (unchanged) ==========
function id() {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}

function todayISO() {
  return localISO(new Date());
}

function addDaysISO(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return localISO(date);
}

function localISO(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function blankVault() {
  return {
    account: null,
    session: false,
    settings: {
      smartSnooze: true,
      gradualVolume: true,
      vibration: false,
      compactCards: false,
      darkMode: false
    },
    items: []
  };
}

function starterItems() {
  return [
    {
      id: id(),
      type: "alarm",
      label: "Morning Wake Up",
      time: "06:45",
      date: todayISO(),
      repeat: "Daily",
      category: "Health",
      hasAlarm: true,
      burstEnabled: false,
      intervalValue: 0,
      intervalUnit: "none",
      notes: "Example standalone alarm.",
      enabled: true
    },
    {
      id: id(),
      type: "event",
      label: "Project Review",
      time: "09:00",
      date: addDaysISO(1),
      repeat: "Monthly",
      category: "Work",
      hasAlarm: true,
      alarmTimes: ["08:30", "08:50", "09:00"],
      repeatDays: [],
      monthlyDay: Number(addDaysISO(1).slice(8, 10)),
      yearlyMonth: Number(addDaysISO(1).slice(5, 7)),
      yearlyDay: Number(addDaysISO(1).slice(8, 10)),
      burstEnabled: false,
      intervalValue: 0,
      intervalUnit: "none",
      notes: "Example event with several alarm times.",
      enabled: true
    }
  ];
}

function normalizeItem(item) {
  return {
    type: "alarm",
    date: todayISO(),
    repeat: "Once",
    category: "Personal",
    hasAlarm: true,
    alarmTimes: [],
    repeatDays: [],
    monthlyDay: Number(todayISO().slice(8, 10)),
    yearlyMonth: Number(todayISO().slice(5, 7)),
    yearlyDay: Number(todayISO().slice(8, 10)),
    burstEnabled: false,
    intervalValue: 0,
    intervalUnit: "none",
    notes: "",
    enabled: true,
    ...item
  };
}

function loadVault() {
  try {
    const stored = localStorage.getItem(vaultKey);
    if (!stored) return blankVault();
    const parsed = JSON.parse(stored);
    return {
      ...blankVault(),
      ...parsed,
      settings: { ...blankVault().settings, ...(parsed.settings || {}) },
      items: (parsed.items || []).map(normalizeItem)
    };
  } catch {
    return blankVault();
  }
}

function saveVault() {
  localStorage.setItem(vaultKey, JSON.stringify(state.vault));
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function account() {
  return state.vault.account;
}

function settings() {
  return state.vault.settings;
}

function items() {
  return state.vault.items;
}

function initials(name = "Alertly") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "AB";
}

function timeParts(time = "07:30") {
  const [hour, minute] = time.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return {
    main: `${String(displayHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    suffix
  };
}

function primaryTime(item) {
  return item.time || item.alarmTimes?.[0] || "07:30";
}

function alarmTimesFor(item) {
  if (item.type === "event" && item.hasAlarm === false) return [];
  if (item.type === "event" && item.alarmTimes?.length) return [...new Set(item.alarmTimes)].sort();
  return item.hasAlarm === false ? [] : [primaryTime(item)];
}

function itemHasRingingAlarm(item) {
  return item.enabled && item.hasAlarm !== false && alarmTimesFor(item).length > 0;
}

function dateTimeForItem(item) {
  const [hour, minute] = primaryTime(item).split(":").map(Number);
  const target = new Date(`${item.date || todayISO()}T00:00:00`);
  target.setHours(hour, minute, 0, 0);
  return target;
}

function minutesUntilItem(item) {
  const now = new Date();
  const target = dateTimeForItem(item);
  if (target <= now) {
    const next = new Date(target);
    if (item.repeat === "Daily") next.setDate(next.getDate() + 1);
    else if (["Weekdays", "Weekends", "Weekly"].includes(item.repeat)) next.setDate(next.getDate() + 7);
    else if (item.repeat === "Monthly") next.setMonth(next.getMonth() + 1);
    else if (item.repeat === "Yearly") next.setFullYear(next.getFullYear() + 1);
    else next.setDate(next.getDate() + 1);
    return Math.round((next - now) / 60000);
  }
  return Math.round((target - now) / 60000);
}

function relativeTime(item) {
  const mins = minutesUntilItem(item);
  if (mins < 60) return `In ${mins}m`;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  if (hours < 24) return rest ? `In ${hours}h ${rest}m` : `In ${hours}h`;
  return `In ${Math.floor(hours / 24)}d`;
}

function intervalText(item) {
  if (!item.burstEnabled || !item.intervalUnit || item.intervalUnit === "none") return "Interval off";
  return `Rings every ${item.intervalValue || 0} ${item.intervalUnit}`;
}

function repeatDetail(item) {
  if (item.repeat === "Monthly") return `Day ${item.monthlyDay || 1} monthly`;
  if (item.repeat === "Yearly") return `Every ${monthName(item.yearlyMonth || 1)} ${item.yearlyDay || 1}`;
  if (["Weekly", "Weekdays", "Weekends"].includes(item.repeat) && item.repeatDays?.length) return item.repeatDays.join(", ");
  return item.repeat;
}

function monthName(month) {
  return new Date(2026, Number(month) - 1, 1).toLocaleDateString([], { month: "short" });
}

function sortedItems() {
  return [...items()].sort((a, b) => {
    const byDate = (a.date || "").localeCompare(b.date || "");
    return byDate || primaryTime(a).localeCompare(primaryTime(b));
  });
}

function nextItem() {
  return sortedItems()
    .filter(itemHasRingingAlarm)
    .sort((a, b) => minutesUntilItem(a) - minutesUntilItem(b))[0];
}

// ========== EMAIL & NOTIFICATION FUNCTIONS (unchanged) ==========
async function sendEmailReminder(item, minutesBefore = 30) {
  if (!account()?.email) return;
  const timeUntil = minutesUntilItem(item);
  if (timeUntil > minutesBefore || timeUntil < 0) return;

  const sentKey = `email-sent-${item.id}-${Math.floor(Date.now() / (minutesBefore * 60000))}`;
  if (localStorage.getItem(sentKey)) return;

  // Replace with your actual EmailJS credentials
  const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
  const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
  const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";

  const templateParams = {
    to_email: account().email,
    task_name: item.label,
    due_time: primaryTime(item),
    notes: item.notes || "No additional notes",
    category: item.category,
  };

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
    localStorage.setItem(sentKey, "true");
    console.log(`📧 Email reminder sent for ${item.label}`);
  } catch (err) {
    console.error("EmailJS error:", err);
  }
}

function showLocalNotification(item) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const minutes = minutesUntilItem(item);
  if (minutes <= 5 && minutes >= -2) {
    new Notification(`🔔 ${item.label}`, {
      body: `Due at ${primaryTime(item)} – ${item.notes || "Tap to open Alertly"}`,
      icon: "",
    });
  }
}

function checkAllUpcomingReminders() {
  items().filter(itemHasRingingAlarm).forEach(item => {
    sendEmailReminder(item, 1440);
    sendEmailReminder(item, 30);
    showLocalNotification(item);
  });
}

function notifyOverdueItems() {
  const now = new Date();
  const overdue = items().filter(item => {
    if (!itemHasRingingAlarm(item)) return false;
    const target = dateTimeForItem(item);
    return target < now && (target.getDate() !== now.getDate() || target.getMonth() !== now.getMonth() || target.getFullYear() !== now.getFullYear());
  });
  if (overdue.length && Notification.permission === "granted") {
    new Notification("⏰ Overdue alerts", {
      body: `${overdue.length} reminder${overdue.length === 1 ? '' : 's'} past due. Open Alertly to review.`,
    });
  }
}

// ========== NATIVE ALARM FUNCTIONS (using @capacitor/local-notifications) ==========
import { LocalNotifications } from '@capacitor/local-notifications';

async function scheduleNativeAlarm(item) {
  // Only on Android native app
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return;

  const alarmTime = dateTimeForItem(item);
  const now = new Date();
  if (alarmTime <= now) return;

  // Cancel any existing notification for this item
  await LocalNotifications.cancel({ notifications: [{ id: item.id }] });

  // Schedule a local notification
  await LocalNotifications.schedule({
    notifications: [{
      id: item.id,
      title: item.label,
      body: item.notes || "Time to check Alertly!",
      schedule: {
        at: alarmTime,
        allowWhileIdle: true,   // helps on Android, but not exact
      },
      sound: "default",
      actionTypeId: "OPEN_APP"
    }]
  });
  console.log(`⏰ Notification scheduled for ${item.label} at ${alarmTime}`);
}

async function rescheduleAllNativeAlarms() {
  if (!Capacitor.isNativePlatform()) return;
  for (const item of items().filter(itemHasRingingAlarm)) {
    await scheduleNativeAlarm(item);
  }
}

async function requestExactAlarmPermission() {
  // Not needed for LocalNotifications, but we request notification permissions
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    await LocalNotifications.requestPermissions();
  }
}

// ========== YOUR ORIGINAL RENDER FUNCTIONS (unchanged, but we'll inject native alarm reschedule) ==========
function render() {
  const hasAccount = Boolean(account());
  const isUnlocked = hasAccount && state.vault.session;
  onboarding.classList.toggle("hidden", isUnlocked);
  accountForm.classList.toggle("hidden-app-chrome", hasAccount);
  loginForm.classList.toggle("hidden-app-chrome", !hasAccount);
  phone.classList.toggle("compact", settings().compactCards);
  phone.classList.toggle("dark", settings().darkMode);
  document.body.classList.toggle("dark-stage", settings().darkMode);
  document.querySelector(".topbar").classList.toggle("hidden-app-chrome", !isUnlocked);
  document.querySelector(".bottom-nav").classList.toggle("hidden-app-chrome", !isUnlocked);
  document.querySelector("#quickAddButton").classList.toggle("hidden-app-chrome", !isUnlocked);
  renderAvatarButton();

  if (!isUnlocked) {
    content.innerHTML = "";
    return;
  }

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === state.view);
  });

  const views = {
    dashboard: renderDashboard,
    schedule: renderSchedule,
    alerts: renderAlerts,
    settings: renderSettings
  };

  content.innerHTML = views[state.view]();

  checkAllUpcomingReminders();
  notifyOverdueItems();
  rescheduleAllNativeAlarms();  // <-- added: reschedule all native alarms after each render
}

function renderAvatarButton() {
  const activeAccount = account();
  avatarButton.className = "avatar-button";
  avatarButton.innerHTML = initials(activeAccount?.nickname || activeAccount?.name || "Alertly");
  if (!activeAccount) return;
  if (activeAccount.photo) {
    avatarButton.style.backgroundImage = `url("${activeAccount.photo}")`;
    avatarButton.textContent = "";
  } else {
    avatarButton.style.backgroundImage = "";
    const preset = avatarPresets.find((item) => item.id === activeAccount.avatar) || avatarPresets[0];
    avatarButton.classList.add(preset.className);
    avatarButton.textContent = initials(activeAccount.nickname || activeAccount.name || preset.text);
  }
}

function renderDashboard() {
  const upcoming = nextItem();
  const enabledCount = items().filter(itemHasRingingAlarm).length;
  const name = account()?.nickname || account()?.name || "there";
  const cards = sortedItems().map(itemCardMarkup).join("");
  return `
    <div class="welcome-line">
      <p class="eyebrow">Hello ${escapeHTML(name)}</p>
      <button class="chip-button" type="button" data-quick-theme>${settings().darkMode ? "Light mode" : "Dark mode"}</button>
    </div>
    ${upcoming ? heroMarkup(upcoming) : emptyHeroMarkup()}
    <div class="section-title">
      <h2>Your Alerts</h2>
      <span>${enabledCount} Ringing</span>
    </div>
    <div class="alarm-list">
      ${cards || `<div class="empty">Create your first event or alarm.</div>`}
    </div>
  `;
}

function heroMarkup(item) {
  const parts = timeParts(primaryTime(item));
  return `
    <article class="hero-card">
      <p class="eyebrow">Next scheduled alert</p>
      <div class="hero-time"><strong>${parts.main}</strong><span>${parts.suffix}</span></div>
      <p class="hero-label">${escapeHTML(item.label)}</p>
      <div class="pill-row">
        <span class="pill">${relativeTime(item)}</span>
        <span class="pill category">${escapeHTML(item.category)}</span>
      </div>
    </article>
  `;
}

function emptyHeroMarkup() {
  return `
    <article class="hero-card">
      <p class="eyebrow">Next scheduled alert</p>
      <div class="hero-time"><strong>--:--</strong><span>AM</span></div>
      <p class="hero-label">No active ringing alarms. Events can still notify silently.</p>
      <div class="pill-row"><span class="pill">Ready</span><span class="pill category">Alertly</span></div>
    </article>
  `;
}

function itemCardMarkup(item) {
  const parts = timeParts(primaryTime(item));
  const typeText = item.type === "event"
    ? (item.hasAlarm === false ? "Whole-day notification" : `${alarmTimesFor(item).length} alarm time${alarmTimesFor(item).length === 1 ? "" : "s"}`)
    : "Standalone alarm";
  return `
    <article class="alarm-card ${item.enabled ? "" : "off"}" data-alarm-card="${item.id}">
      <button class="card-text" type="button" data-edit="${item.id}">
        <span class="meta">${escapeHTML(repeatDetail(item))} - ${escapeHTML(typeText)} - ${escapeHTML(intervalText(item))}</span>
        <span class="alarm-time">${item.hasAlarm === false ? "All day" : `${parts.main}<span> ${parts.suffix}</span>`}</span>
        <span class="alarm-label">${escapeHTML(item.label)}</span>
      </button>
      <label class="switch" aria-label="${item.enabled ? "Turn off" : "Turn on"} ${escapeHTML(item.label)}">
        <input type="checkbox" data-toggle="${item.id}" ${item.enabled ? "checked" : ""}>
        <span></span>
      </label>
    </article>
  `;
}

function renderSchedule() {
  const selected = state.selectedDate;
  const selectedItems = sortedItems().filter((item) => (item.date || todayISO()) === selected);
  const visibleItems = selectedItems.filter((item) => state.scheduleMode === "events" ? item.type === "event" : item.type !== "event");
  const eventCount = selectedItems.filter((item) => item.type === "event").length;
  const alarmCount = selectedItems.filter((item) => item.type !== "event").length;
  return `
    <div class="section-title">
      <h2>Schedule</h2>
      <button class="small-action" type="button" data-new-for-date="${selected}" data-new-type="${state.scheduleMode === "events" ? "event" : "alarm"}">${state.scheduleMode === "events" ? "Add event" : "Add alarm"}</button>
    </div>
    ${calendarMarkup()}
    <div class="schedule-tabs" role="tablist" aria-label="Schedule spaces">
      <button class="${state.scheduleMode === "events" ? "active" : ""}" type="button" data-schedule-mode="events">Events <span>${eventCount}</span></button>
      <button class="${state.scheduleMode === "alarms" ? "active" : ""}" type="button" data-schedule-mode="alarms">Alarms <span>${alarmCount}</span></button>
    </div>
    <div class="section-title tight">
      <h2>${formatDate(selected)}</h2>
      <span>${visibleItems.length} set</span>
    </div>
    <div class="timeline">
      ${visibleItems.map(scheduleItemMarkup).join("") || `<div class="empty">${state.scheduleMode === "events" ? "No events here. Add one as all-day, monthly, yearly, or with alarms." : "No standalone alarms here."}</div>`}
    </div>
  `;
}

function calendarMarkup() {
  const base = new Date(`${state.selectedDate}T00:00:00`);
  const year = base.getFullYear();
  const month = base.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i += 1) cells.push(`<span class="calendar-cell empty-cell"></span>`);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const iso = localISO(new Date(year, month, day));
    const count = items().filter((item) => item.date === iso).length;
    cells.push(`
      <button class="calendar-cell ${iso === state.selectedDate ? "selected" : ""}" type="button" data-date="${iso}">
        <span>${day}</span>
        ${count ? `<small>${count}</small>` : ""}
      </button>
    `);
  }
  return `
    <article class="calendar-card">
      <div class="calendar-head">
        <button type="button" data-month="-1" aria-label="Previous month">&lt;</button>
        <strong>${base.toLocaleDateString([], { month: "long", year: "numeric" })}</strong>
        <button type="button" data-month="1" aria-label="Next month">&gt;</button>
      </div>
      <div class="weekday-row"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div>
      <div class="calendar-grid">${cells.join("")}</div>
    </article>
  `;
}

function scheduleItemMarkup(item) {
  const parts = timeParts(primaryTime(item));
  const timeLine = item.hasAlarm === false
    ? "Whole-day notification only"
    : alarmTimesFor(item).map((time) => `${timeParts(time).main} ${timeParts(time).suffix}`).join(", ");
  return `
    <article class="timeline-item">
      <div class="timeline-time">${item.hasAlarm === false ? "Day" : parts.main}</div>
      <div>
        <h3>${escapeHTML(item.label)}</h3>
        <p class="small-text">${escapeHTML(repeatDetail(item))} - ${escapeHTML(intervalText(item))}</p>
        <p class="small-text">${escapeHTML(timeLine)}</p>
      </div>
      <button class="small-action" type="button" data-edit="${item.id}">Edit</button>
    </article>
  `;
}

function renderAlerts() {
  const enabled = items().filter(itemHasRingingAlarm).length;
  const paused = items().filter((item) => !item.enabled).length;
  const next = nextItem();
  return `
    <div class="section-title">
      <h2>Alerts</h2>
      <span>Live status</span>
    </div>
    <div class="summary-grid">
      <article class="summary-card"><strong>${enabled}</strong><p class="small-text">Ringing</p></article>
      <article class="summary-card"><strong>${paused}</strong><p class="small-text">Turned off</p></article>
    </div>
    <div class="section-title">
      <h2>Next Up</h2>
      <span>${next ? relativeTime(next) : "None"}</span>
    </div>
    <div class="alarm-list">
      ${next ? itemCardMarkup(next) : `<div class="empty">No active ringing alerts.</div>`}
      ${items().filter((item) => item.hasAlarm === false).map(itemCardMarkup).join("")}
    </div>
  `;
}

function renderSettings() {
  const activeAccount = account();
  const settingsRows = [
    ["darkMode", "Dark mode", "Switch the whole app into a night-friendly surface."],
    ["smartSnooze", "Smart snooze", "Suggests a shorter snooze near meetings."],
    ["gradualVolume", "Gradual volume", "Ramps alerts in gently."],
    ["vibration", "Vibration", "Adds haptics for mobile alerts."],
    ["compactCards", "Compact cards", "Keeps alarm rows tighter."]
  ];

  return `
    <div class="section-title">
      <h2>Profile</h2>
      <span>Local vault</span>
    </div>
    <form class="profile-card" id="profileForm">
      <div class="profile-row">
        ${profilePreviewMarkup(activeAccount)}
        <div>
          <h3>${escapeHTML(activeAccount.nickname || activeAccount.name)}</h3>
          <p class="small-text">${escapeHTML(activeAccount.email)} - ${escapeHTML(activeAccount.phone)}</p>
        </div>
      </div>
      <label>Nickname<input name="nickname" type="text" value="${escapeAttribute(activeAccount.nickname || "")}" placeholder="What should Alertly call you?"></label>
      <label>Name<input name="name" type="text" value="${escapeAttribute(activeAccount.name)}" required></label>
      <label>Email<input name="email" type="email" value="${escapeAttribute(activeAccount.email)}" required></label>
      <label>Phone<input name="phone" type="tel" value="${escapeAttribute(activeAccount.phone)}" required></label>
      <div>
        <p class="field-title">Choose a profile</p>
        <div class="avatar-picker">
          ${avatarPresets.map((avatar) => `<button class="avatar-choice ${avatar.className} ${activeAccount.avatar === avatar.id && !activeAccount.photo ? "selected" : ""}" type="button" data-avatar="${avatar.id}" aria-label="${avatar.label} profile">${avatar.text}</button>`).join("")}
        </div>
      </div>
      <label>Gallery image<input name="photo" type="file" accept="image/*"></label>
      <label>Change password<input name="password" type="password" minlength="4" placeholder="Leave blank to keep current"></label>
      <div class="form-row">
        <button class="primary-button" type="submit">Save profile</button>
        <button class="delete-button visible" type="button" data-clear-photo>Clear photo</button>
      </div>
    </form>
    <div class="section-title">
      <h2>Settings</h2>
      <button class="small-action" type="button" data-logout>Log out</button>
    </div>
    <div class="settings-list">
      ${settingsRows.map(([key, title, description]) => `
        <article class="setting-card">
          <div><h3>${title}</h3><p class="small-text">${description}</p></div>
          <label class="switch" aria-label="${title}">
            <input type="checkbox" data-setting="${key}" ${settings()[key] ? "checked" : ""}>
            <span></span>
          </label>
        </article>
      `).join("")}
    </div>
  `;
}

function profilePreviewMarkup(activeAccount) {
  if (activeAccount.photo) return `<span class="profile-preview image" style="background-image:url('${activeAccount.photo.replace(/'/g, "%27")}')"></span>`;
  const preset = avatarPresets.find((avatar) => avatar.id === activeAccount.avatar) || avatarPresets[0];
  return `<span class="profile-preview ${preset.className}">${initials(activeAccount.nickname || activeAccount.name)}</span>`;
}

function openDialog(idValue = null, dateValue = state.selectedDate, typeValue = "alarm") {
  state.editingId = idValue;
  const item = idValue
    ? items().find((entry) => entry.id === idValue)
    : normalizeItem({
        id: id(),
        type: typeValue,
        label: "",
        time: "07:30",
        date: dateValue || todayISO(),
        repeat: typeValue === "event" ? "Monthly" : "Daily",
        category: "Work",
        hasAlarm: typeValue !== "event" ? true : true,
        alarmTimes: typeValue === "event" ? ["07:30"] : []
      });

  document.querySelector("#dialogTitle").textContent = idValue ? "Edit reminder" : (item.type === "event" ? "New event" : "New alarm");
  alarmType.value = item.type || "alarm";
  document.querySelector("#alarmLabel").value = item.label;
  alarmTime.value = primaryTime(item);
  document.querySelector("#alarmDate").value = item.date || todayISO();
  alarmRepeat.value = item.repeat || "Once";
  document.querySelector("#alarmCategory").value = item.category;
  document.querySelector("#alarmIntervalValue").value = item.intervalValue || 0;
  document.querySelector("#alarmIntervalUnit").value = item.intervalUnit || "none";
  document.querySelector("#alarmNotes").value = item.notes || "";
  document.querySelector("#alarmEnabled").checked = item.enabled;
  eventHasAlarm.checked = item.hasAlarm !== false;
  eventBurstEnabled.checked = Boolean(item.burstEnabled);
  document.querySelector("#monthlyDay").value = item.monthlyDay || Number((item.date || todayISO()).slice(8, 10));
  document.querySelector("#yearlyMonth").value = item.yearlyMonth || Number((item.date || todayISO()).slice(5, 7));
  document.querySelector("#yearlyDay").value = item.yearlyDay || Number((item.date || todayISO()).slice(8, 10));
  state.selectedDays = item.repeatDays || [];
  state.pendingTimes = item.type === "event" ? alarmTimesFor(item) : [];
  deleteButton.classList.toggle("visible", Boolean(idValue));
  syncWheelFromTime(primaryTime(item));
  renderEventTimeChips();
  updateDialogControls();
  dialog.showModal();
}

function closeDialog() {
  dialog.close();
  form.reset();
  state.editingId = null;
}

async function upsertItem(event) {
  event.preventDefault();
  const data = new FormData(form);
  const type = data.get("type") || "alarm";
  const hasAlarm = type === "alarm" ? true : data.get("hasAlarm") === "on";
  const burstEnabled = type === "event" && hasAlarm && state.pendingTimes.length <= 1 && data.get("burstEnabled") === "on";
  const next = normalizeItem({
    id: state.editingId || id(),
    type,
    label: data.get("label").trim(),
    time: data.get("time"),
    date: data.get("date") || todayISO(),
    repeat: data.get("repeat"),
    category: data.get("category"),
    hasAlarm,
    alarmTimes: type === "event" && hasAlarm ? [...new Set([data.get("time"), ...state.pendingTimes])].sort() : [],
    repeatDays: state.selectedDays,
    monthlyDay: Number(data.get("monthlyDay")) || Number((data.get("date") || todayISO()).slice(8, 10)),
    yearlyMonth: Number(data.get("yearlyMonth")) || Number((data.get("date") || todayISO()).slice(5, 7)),
    yearlyDay: Number(data.get("yearlyDay")) || Number((data.get("date") || todayISO()).slice(8, 10)),
    burstEnabled,
    intervalValue: burstEnabled ? Number(data.get("intervalValue")) || 0 : 0,
    intervalUnit: burstEnabled ? data.get("intervalUnit") : "none",
    notes: data.get("notes").trim(),
    enabled: data.get("enabled") === "on"
  });

  if (state.editingId) {
    state.vault.items = items().map((item) => item.id === state.editingId ? next : item);
  } else {
    state.vault.items = [...items(), next];
  }
  state.selectedDate = next.date;
  saveVault();
  closeDialog();
  render();
  // Schedule native alarm for the newly saved/updated item
  await scheduleNativeAlarm(next);
}

async function deleteCurrentItem() {
  if (!state.editingId) return;
  const itemId = state.editingId;
  state.vault.items = items().filter((item) => item.id !== itemId);
  saveVault();
  closeDialog();
  render();
  // Cancel native alarm for the deleted item
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    try {
      await AndroidAlarmManager.cancel({ id: itemId });
    } catch(e) { /* ignore */ }
  }
}

function buildWheelValues() {
  hourWheel.innerHTML = wheelOptions(Array.from({ length: state.timeFormat === "12" ? 12 : 24 }, (_, index) => {
    const value = state.timeFormat === "12" ? index + 1 : index;
    return String(value).padStart(2, "0");
  }));
  minuteWheel.innerHTML = wheelOptions(Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0")));
}

function wheelOptions(values) {
  return `<button class="wheel-step" type="button" data-wheel-step="-1">+</button><div class="wheel-spacer"></div>${values.map((value) => `<button class="wheel-option" type="button" data-wheel-value="${value}">${value}</button>`).join("")}<div class="wheel-spacer"></div><button class="wheel-step" type="button" data-wheel-step="1">-</button>`;
}

function syncWheelFromTime(time) {
  const [rawHour, minute] = time.split(":").map(Number);
  state.selectedPeriod = rawHour >= 12 ? "PM" : "AM";
  buildWheelValues();
  const hourValue = state.timeFormat === "12" ? String(rawHour % 12 || 12).padStart(2, "0") : String(rawHour).padStart(2, "0");
  const minuteValue = String(minute).padStart(2, "0");
  selectWheelValue(hourWheel, hourValue);
  selectWheelValue(minuteWheel, minuteValue);
  paintWheelTime();
}

function selectWheelValue(wheel, value) {
  wheel.querySelectorAll(".wheel-option").forEach((button) => button.classList.toggle("selected", button.dataset.wheelValue === value));
  wheel.querySelector(`[data-wheel-value="${value}"]`)?.scrollIntoView({ block: "center" });
}

function selectedWheelValue(wheel) {
  return wheel.querySelector(".wheel-option.selected")?.dataset.wheelValue || "00";
}

function stepWheel(wheel, direction) {
  const options = [...wheel.querySelectorAll(".wheel-option")];
  const selectedIndex = Math.max(0, options.findIndex((option) => option.classList.contains("selected")));
  const nextIndex = Math.min(options.length - 1, Math.max(0, selectedIndex + direction));
  selectWheelValue(wheel, options[nextIndex].dataset.wheelValue);
  paintWheelTime();
}

function snapWheelFromScroll(wheel) {
  const options = [...wheel.querySelectorAll(".wheel-option")];
  if (!options.length) return;
  const scrollTop = wheel.scrollTop;
  const optionHeight = options[0]?.offsetHeight || 40;
  const nearestIndex = Math.round(scrollTop / optionHeight);
  const clamped = Math.min(options.length - 1, Math.max(0, nearestIndex));
  const targetValue = options[clamped].dataset.wheelValue;
  selectWheelValue(wheel, targetValue);
  options[clamped].scrollIntoView({ block: "center", behavior: "smooth" });
  paintWheelTime();
}

function paintWheelTime() {
  let hour = Number(selectedWheelValue(hourWheel));
  const minute = Number(selectedWheelValue(minuteWheel));
  if (state.timeFormat === "12") {
    if (state.selectedPeriod === "PM" && hour !== 12) hour += 12;
    if (state.selectedPeriod === "AM" && hour === 12) hour = 0;
  }
  alarmTime.value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  ampmPicker.classList.toggle("hidden", state.timeFormat === "24");
  format12Button.classList.toggle("active", state.timeFormat === "12");
  format24Button.classList.toggle("active", state.timeFormat === "24");
  ampmPicker.querySelectorAll("[data-period]").forEach((button) => button.classList.toggle("active", button.dataset.period === state.selectedPeriod));
}

function renderEventTimeChips() {
  eventTimeChips.innerHTML = state.pendingTimes.map((time) => {
    const parts = timeParts(time);
    return `<button type="button" data-remove-event-time="${time}">${parts.main} ${parts.suffix} x</button>`;
  }).join("");
}

function updateDialogControls() {
  const isEvent = alarmType.value === "event";
  const hasAlarm = !isEvent || eventHasAlarm.checked;
  const singleTime = state.pendingTimes.length <= 1;
  document.querySelectorAll(".event-only").forEach((element) => element.classList.toggle("hidden-app-chrome", !isEvent));
  document.querySelector(".wheel-setter").classList.toggle("hidden-app-chrome", !hasAlarm);
  addEventTimeButton.classList.toggle("hidden-app-chrome", !isEvent || !hasAlarm);
  eventTimeChips.classList.toggle("hidden-app-chrome", !isEvent || !hasAlarm);
  burstControls.classList.toggle("hidden-app-chrome", !isEvent || !hasAlarm || !singleTime || !eventBurstEnabled.checked);
  document.querySelector("#burstToggleRow").classList.toggle("hidden-app-chrome", !isEvent || !hasAlarm || !singleTime);

  const repeat = alarmRepeat.value;
  document.querySelector("#dayPicker").classList.toggle("hidden-app-chrome", !isEvent || !["Weekly", "Weekdays", "Weekends"].includes(repeat));
  document.querySelector(".monthly-field").classList.toggle("hidden-app-chrome", !isEvent || repeat !== "Monthly");
  document.querySelector(".yearly-field").classList.toggle("hidden-app-chrome", !isEvent || repeat !== "Yearly");
  document.querySelectorAll("[data-day]").forEach((button) => {
    button.classList.toggle("active", state.selectedDays.includes(button.dataset.day));
  });
}

function addCurrentWheelTimeToEvent() {
  if (alarmType.value !== "event" || !eventHasAlarm.checked) return;
  state.pendingTimes = [...new Set([...state.pendingTimes, alarmTime.value])].sort();
  renderEventTimeChips();
  updateDialogControls();
}

function changeMonth(delta) {
  const date = new Date(`${state.selectedDate}T00:00:00`);
  state.selectedDate = localISO(new Date(date.getFullYear(), date.getMonth() + delta, 1));
  render();
}

function formatDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHTML(value);
}

// ========== EVENT LISTENERS (unchanged, but we'll add native alarm reschedule on toggle) ==========
accountForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(accountForm);
  state.vault.account = {
    name: data.get("name").trim(),
    email: data.get("email").trim(),
    phone: data.get("phone").trim(),
    password: data.get("password"),
    nickname: "",
    avatar: "wave",
    photo: await fileToDataURL(data.get("photo"))
  };
  state.vault.items = starterItems();
  state.vault.session = true;
  saveVault();
  render();
  await rescheduleAllNativeAlarms();
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(loginForm);
  if (data.get("password") === account()?.password) {
    state.vault.session = true;
    loginMessage.textContent = "";
    saveVault();
    render();
  } else {
    loginMessage.textContent = "That password did not match this local account.";
  }
});

resetLocalButton.addEventListener("click", () => {
  state.vault = blankVault();
  saveVault();
  loginMessage.textContent = "";
  render();
});

content.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit]");
  const dateButton = event.target.closest("[data-date]");
  const monthButton = event.target.closest("[data-month]");
  const addForDate = event.target.closest("[data-new-for-date]");
  const scheduleMode = event.target.closest("[data-schedule-mode]");
  const avatarChoice = event.target.closest("[data-avatar]");
  const clearPhoto = event.target.closest("[data-clear-photo]");
  const viewJump = event.target.closest("[data-view-jump]");
  const quickTheme = event.target.closest("[data-quick-theme]");
  const logout = event.target.closest("[data-logout]");

  if (editButton) openDialog(editButton.dataset.edit);
  if (dateButton) {
    state.selectedDate = dateButton.dataset.date;
    render();
  }
  if (monthButton) changeMonth(Number(monthButton.dataset.month));
  if (addForDate) openDialog(null, addForDate.dataset.newForDate, addForDate.dataset.newType || "alarm");
  if (scheduleMode) {
    state.scheduleMode = scheduleMode.dataset.scheduleMode;
    render();
  }
  if (avatarChoice) {
    state.vault.account.avatar = avatarChoice.dataset.avatar;
    state.vault.account.photo = "";
    saveVault();
    render();
  }
  if (clearPhoto) {
    state.vault.account.photo = "";
    saveVault();
    render();
  }
  if (viewJump) {
    state.view = viewJump.dataset.viewLink;
    render();
  }
  if (quickTheme) {
    state.vault.settings.darkMode = !settings().darkMode;
    saveVault();
    render();
  }
  if (logout) {
    state.vault.session = false;
    saveVault();
    render();
  }
});

content.addEventListener("change", async (event) => {
  const toggle = event.target.closest("[data-toggle]");
  const setting = event.target.closest("[data-setting]");
  const profileFile = event.target.closest("#profileForm input[type='file']");

  if (toggle) {
    state.vault.items = items().map((item) => item.id === toggle.dataset.toggle ? { ...item, enabled: toggle.checked } : item);
    saveVault();
    render();
    // After toggling enabled status, reschedule native alarms for the changed item
    const changedItem = items().find(i => i.id === toggle.dataset.toggle);
    if (changedItem) {
      if (changedItem.enabled && itemHasRingingAlarm(changedItem)) {
        await scheduleNativeAlarm(changedItem);
      } else {
        // Cancel native alarm if disabled
        if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
          try {
            await AndroidAlarmManager.cancel({ id: changedItem.id });
          } catch(e) { /* ignore */ }
        }
      }
    }
  }
  if (setting) {
    state.vault.settings[setting.dataset.setting] = setting.checked;
    saveVault();
    render();
  }
  if (profileFile && profileFile.files[0]) {
    state.vault.account.photo = await fileToDataURL(profileFile.files[0]);
    saveVault();
    render();
  }
});

content.addEventListener("submit", (event) => {
  const profileForm = event.target.closest("#profileForm");
  if (!profileForm) return;
  event.preventDefault();
  const data = new FormData(profileForm);
  state.vault.account = {
    ...state.vault.account,
    nickname: data.get("nickname").trim(),
    name: data.get("name").trim(),
    email: data.get("email").trim(),
    phone: data.get("phone").trim(),
    password: data.get("password") || state.vault.account.password
  };
  saveVault();
  render();
});

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    state.view = button.dataset.view;
    render();
  });
});

document.querySelectorAll("[data-view-link]").forEach((button) => {
  button.addEventListener("click", () => {
    state.view = button.dataset.viewLink;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    render();
  });
});

document.querySelector("#quickAddButton").addEventListener("click", () => openDialog(null, state.selectedDate, "alarm"));
document.querySelector("#menuButton").addEventListener("click", () => {
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
});
document.querySelector("#profileButton").addEventListener("click", () => {
  state.view = "settings";
  render();
});
drawer.addEventListener("click", (event) => {
  if (event.target === drawer) {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
  }
});

document.querySelector("#closeDialogButton").addEventListener("click", closeDialog);
deleteButton.addEventListener("click", deleteCurrentItem);
form.addEventListener("submit", upsertItem);
alarmTime.addEventListener("change", () => syncWheelFromTime(alarmTime.value));
[alarmType, eventHasAlarm, alarmRepeat, eventBurstEnabled].forEach((element) => element.addEventListener("change", updateDialogControls));
addEventTimeButton.addEventListener("click", addCurrentWheelTimeToEvent);
eventTimeChips.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove-event-time]");
  if (!removeButton) return;
  state.pendingTimes = state.pendingTimes.filter((time) => time !== removeButton.dataset.removeEventTime);
  renderEventTimeChips();
  updateDialogControls();
});
document.querySelector("#dayPicker").addEventListener("click", (event) => {
  const button = event.target.closest("[data-day]");
  if (!button) return;
  const day = button.dataset.day;
  state.selectedDays = state.selectedDays.includes(day)
    ? state.selectedDays.filter((value) => value !== day)
    : [...state.selectedDays, day];
  updateDialogControls();
});
document.querySelectorAll("[data-format]").forEach((button) => {
  button.addEventListener("click", () => {
    state.timeFormat = button.dataset.format;
    syncWheelFromTime(alarmTime.value);
  });
});
ampmPicker.addEventListener("click", (event) => {
  const periodButton = event.target.closest("[data-period]");
  if (!periodButton) return;
  state.selectedPeriod = periodButton.dataset.period;
  paintWheelTime();
});
[hourWheel, minuteWheel].forEach((wheel) => {
  let snapTimer;
  wheel.addEventListener("click", (event) => {
    const step = event.target.closest("[data-wheel-step]");
    const option = event.target.closest("[data-wheel-value]");
    if (step) stepWheel(wheel, Number(step.dataset.wheelStep));
    if (option) {
      selectWheelValue(wheel, option.dataset.wheelValue);
      paintWheelTime();
    }
  });
  wheel.addEventListener("scroll", () => {
    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => snapWheelFromScroll(wheel), 80);
  });
  wheel.addEventListener("keydown", (event) => {
    if (!["ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    stepWheel(wheel, event.key === "ArrowDown" ? 1 : -1);
  });
});

// ========== STARTUP ==========
if ("Notification" in window && Notification.permission !== "denied") {
  Notification.requestPermission();
}
requestExactAlarmPermission();

window.addEventListener("beforeunload", (e) => {
  if (items().some(itemHasRingingAlarm)) {
    e.preventDefault();
    e.returnValue = "Alertly has active alarms. Keep this tab open to receive notifications.";
    return e.returnValue;
  }
});

setInterval(() => {
  if (state.vault.session && account()) {
    checkAllUpcomingReminders();
    notifyOverdueItems();
  }
}, 600000);

render();