// ─────────────────────────────────────────────────────────────────────────────
// BraeNova IT Solutions — Unified Database & Storage Adapter (db.js)
// Supports both Firebase Firestore and Instant LocalStorage Fallback
// ─────────────────────────────────────────────────────────────────────────────

(function(window) {
  'use strict';

  const STORAGE_PREFIX = 'braenova_db_';
  const SESSION_KEY    = 'braenova_admin_session';

  const SEED_DATA = {
    hero: {
      headline: 'Transforming Business Through <span class="gradient-text">Intelligent Technology</span>',
      subheading: 'Full-stack software engineering, mobile inventory solutions, digital education infrastructure, and institutional business automation.',
      cta_primary: 'Explore Services',
      cta_secondary: 'Get In Touch'
    },
    about: {
      title: 'Engineering digital solutions with purpose, precision, and performance.',
      description: 'BraeNova IT Solutions delivers enterprise-grade software engineering, modern cloud infrastructure, and localized technology solutions. We bridge technological gaps with robust systems tailored for businesses, educational institutions, and emerging enterprises.'
    },
    contact: {
      email: 'braenovaitsolutions@gmail.com',
      phone: '+675 8190 8393',
      address: 'Port Moresby, Papua New Guinea',
      social_github: 'https://github.com/JoelNamuri',
      social_linkedin: 'https://linkedin.com',
      social_twitter: 'https://twitter.com'
    },
    services: [
      { id: 's1', icon: '🌐', title: 'Full-Stack Web & Systems Development', description: 'Custom web applications, RESTful APIs, and scalable backends built with Go, Python, PHP, and Node.js. Modern architectures designed for growth.', order: 1, active: true },
      { id: 's2', icon: '📱', title: 'Mobile & Inventory Solutions', description: 'BraeNova StockMaster and other mobile-first inventory & sales management tools for retail automation and business process optimization.', order: 2, active: true },
      { id: 's3', icon: '🎓', title: 'Digital Education & EdTech Infrastructure', description: 'LMS architecture, Moodle setups, and offline digital learning devices like RACHEL for institutional and remote learning environments.', order: 3, active: true },
      { id: 's4', icon: '⚙️', title: 'Enterprise Compliance & Business Automation', description: 'Custom workflow tools, automated tax and compliance tracking applications that streamline institutional paperwork and regulatory reporting.', order: 4, active: true },
      { id: 's5', icon: '🔄', title: 'Legacy Modernization', description: 'Strategic refactoring and migration of existing systems to modern stacks, ensuring continuity and improved performance.', order: 5, active: true },
      { id: 's6', icon: '☁️', title: 'Cloud & DevOps Enablement', description: 'Infrastructure as code, CI/CD pipelines, and cloud architecture on AWS, Azure, and GCP for resilient, scalable deployments.', order: 6, active: true }
    ],
    products: [
      { id: 'p1', icon: '📦', title: 'BraeNova StockMaster', description: 'Mobile-first inventory and sales management application for local businesses. Track stock, process sales, and generate real-time reports from any device.', image_url: '', video_url: '', tags: ['Mobile', 'Inventory', 'POS'], order: 1, active: true },
      { id: 'p2', icon: '📊', title: 'MSME Tax & IRC Compliance Tracker', description: 'Automated financial reporting and compliance tool for Micro, Small and Medium Enterprises. Track tax deadlines, generate reports, and stay compliant.', image_url: '', video_url: '', tags: ['Finance', 'Compliance', 'MSME'], order: 2, active: true },
      { id: 'p3', icon: '📄', title: 'Electronic Resumption & Administrative Workflows', description: 'Modernizing institutional paperwork with digital workflow engines. Convert legacy forms into secure, trackable electronic processes.', image_url: '', video_url: '', tags: ['Workflow', 'Digital', 'Enterprise'], order: 3, active: true }
    ],
    team: [
      { id: 't1', name: 'Joel Namuri', role: 'Lead Solutions Architect & Founder', bio: 'Specialist in full-stack architecture, EdTech infrastructure, and business automation systems.', photo_url: '', order: 1 }
    ],
    testimonials: [
      { id: 'tm1', name: 'David K.', company: 'Pacific Logistics Ltd', role: 'Operations Director', content: 'BraeNova transformed our inventory tracking. StockMaster reduced our daily audit times from hours to minutes.', rating: 5, order: 1 },
      { id: 'tm2', name: 'Sarah M.', company: 'Highland Education Institute', role: 'Academic Dean', content: 'The digital learning infrastructure deployed by BraeNova enabled reliable remote education even in low-bandwidth areas.', rating: 5, order: 2 }
    ],
    messages: [
      { id: 'm1', name: 'Alexander Wright', email: 'alex.w@enterprise.com', message: 'Hello, we are looking for a custom enterprise workflow automation system for our logistics team. Could we schedule a consultation?', timestamp: new Date(Date.now() - 86400000).toISOString(), read: false }
    ]
  };

  // Check if Firebase credentials are valid
  function isFirebaseConfigured() {
    return typeof firebaseConfig !== 'undefined' &&
           firebaseConfig.projectId &&
           !firebaseConfig.projectId.startsWith('YOUR_');
  }

  class BraeNovaDatabase {
    constructor() {
      this.mode = 'local';
      this.firebaseApp = null;
      this.firestore = null;
      this.auth = null;
      this.listeners = [];

      this.init();
    }

    init() {
      if (isFirebaseConfigured() && typeof firebase !== 'undefined') {
        try {
          if (!firebase.apps.length) {
            this.firebaseApp = firebase.initializeApp(firebaseConfig);
          } else {
            this.firebaseApp = firebase.app();
          }
          this.firestore = firebase.firestore();
          this.auth = firebase.auth();
          this.mode = 'firebase';
          console.log('[BraeNova DB] Connected to Firebase Firestore.');
        } catch (err) {
          console.warn('[BraeNova DB] Firebase init failed, falling back to LocalStorage:', err);
          this.mode = 'local';
        }
      } else {
        this.mode = 'local';
        console.log('[BraeNova DB] Running in Local Storage Mode (Ready out of the box).');
      }

      this.ensureLocalStorageSeeded();

      // Multi-tab sync
      window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith(STORAGE_PREFIX)) {
          this.notifyListeners();
        }
      });
    }

    onUpdate(callback) {
      this.listeners.push(callback);
    }

    notifyListeners() {
      this.listeners.forEach(cb => {
        try { cb(); } catch (e) { console.error(e); }
      });
    }

    ensureLocalStorageSeeded() {
      try {
        if (!localStorage.getItem(STORAGE_PREFIX + 'seeded')) {
          for (const [key, value] of Object.entries(SEED_DATA)) {
            if (!localStorage.getItem(STORAGE_PREFIX + key)) {
              localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
            }
          }
          localStorage.setItem(STORAGE_PREFIX + 'seeded', 'true');
        }
      } catch(e) {
        console.warn('[BraeNova DB] Storage access error:', e);
      }
    }

    // ── CONFIG & SINGLETON GETTERS / SETTERS ──

    async getConfig(key) {
      if (this.mode === 'firebase' && this.firestore) {
        try {
          const doc = await this.firestore.collection('site_config').doc(key).get();
          if (doc.exists) return doc.data();
        } catch(e) {
          console.warn(`[BraeNova DB] Firestore error fetching config ${key}, using local:`, e);
        }
      }
      const val = localStorage.getItem(STORAGE_PREFIX + key);
      return val ? JSON.parse(val) : (SEED_DATA[key] || {});
    }

    async saveConfig(key, data) {
      // Save locally first
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
      this.notifyListeners();

      if (this.mode === 'firebase' && this.firestore) {
        try {
          await this.firestore.collection('site_config').doc(key).set(data, { merge: true });
        } catch(e) {
          console.error(`[BraeNova DB] Firestore error saving config ${key}:`, e);
          throw e;
        }
      }
      return true;
    }

    // ── COLLECTIONS CRUD (services, products, team, testimonials) ──

    async getCollection(name) {
      if (this.mode === 'firebase' && this.firestore) {
        try {
          const snap = await this.firestore.collection(name).orderBy('order', 'asc').get();
          if (!snap.empty) {
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
          }
        } catch(e) {
          console.warn(`[BraeNova DB] Firestore error getting collection ${name}, using local:`, e);
        }
      }
      const raw = localStorage.getItem(STORAGE_PREFIX + name);
      const items = raw ? JSON.parse(raw) : (SEED_DATA[name] || []);
      return items.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    async addItem(name, itemData) {
      const id = 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      const item = { ...itemData, id };

      const items = await this.getCollection(name);
      items.push(item);
      localStorage.setItem(STORAGE_PREFIX + name, JSON.stringify(items));
      this.notifyListeners();

      if (this.mode === 'firebase' && this.firestore) {
        try {
          await this.firestore.collection(name).doc(id).set(itemData);
        } catch(e) {
          console.error(`[BraeNova DB] Firestore error adding to ${name}:`, e);
        }
      }
      return item;
    }

    async updateItem(name, id, itemData) {
      const items = await this.getCollection(name);
      const idx = items.findIndex(x => x.id === id);
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...itemData };
        localStorage.setItem(STORAGE_PREFIX + name, JSON.stringify(items));
        this.notifyListeners();
      }

      if (this.mode === 'firebase' && this.firestore) {
        try {
          await this.firestore.collection(name).doc(id).update(itemData);
        } catch(e) {
          console.error(`[BraeNova DB] Firestore error updating in ${name}:`, e);
        }
      }
      return true;
    }

    async deleteItem(name, id) {
      let items = await this.getCollection(name);
      items = items.filter(x => x.id !== id);
      localStorage.setItem(STORAGE_PREFIX + name, JSON.stringify(items));
      this.notifyListeners();

      if (this.mode === 'firebase' && this.firestore) {
        try {
          await this.firestore.collection(name).doc(id).delete();
        } catch(e) {
          console.error(`[BraeNova DB] Firestore error deleting from ${name}:`, e);
        }
      }
      return true;
    }

    // ── MESSAGES (INBOX) ──

    async getMessages() {
      if (this.mode === 'firebase' && this.firestore) {
        try {
          const snap = await this.firestore.collection('contact_messages').orderBy('timestamp', 'desc').get();
          if (!snap.empty) {
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
          }
        } catch(e) {
          console.warn('[BraeNova DB] Firestore error getting messages, using local:', e);
        }
      }
      const raw = localStorage.getItem(STORAGE_PREFIX + 'messages');
      const msgs = raw ? JSON.parse(raw) : (SEED_DATA.messages || []);
      return msgs.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
    }

    async saveMessage(msgData) {
      const id = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      const message = {
        ...msgData,
        id,
        timestamp: msgData.timestamp || new Date().toISOString(),
        read: false
      };

      const msgs = await this.getMessages();
      msgs.unshift(message);
      localStorage.setItem(STORAGE_PREFIX + 'messages', JSON.stringify(msgs));
      this.notifyListeners();

      if (this.mode === 'firebase' && this.firestore) {
        try {
          await this.firestore.collection('contact_messages').doc(id).set(message);
        } catch(e) {
          console.error('[BraeNova DB] Firestore error saving message:', e);
        }
      }
      return message;
    }

    async markMessageRead(id) {
      const msgs = await this.getMessages();
      const m = msgs.find(x => x.id === id);
      if (m) {
        m.read = true;
        localStorage.setItem(STORAGE_PREFIX + 'messages', JSON.stringify(msgs));
        this.notifyListeners();
      }
      if (this.mode === 'firebase' && this.firestore) {
        try {
          await this.firestore.collection('contact_messages').doc(id).update({ read: true });
        } catch(e) {}
      }
    }

    async deleteMessage(id) {
      let msgs = await this.getMessages();
      msgs = msgs.filter(x => x.id !== id);
      localStorage.setItem(STORAGE_PREFIX + 'messages', JSON.stringify(msgs));
      this.notifyListeners();

      if (this.mode === 'firebase' && this.firestore) {
        try {
          await this.firestore.collection('contact_messages').doc(id).delete();
        } catch(e) {}
      }
      return true;
    }

    // ── AUTHENTICATION ──

    isLoggedIn() {
      if (this.mode === 'firebase' && this.auth) {
        return !!this.auth.currentUser;
      }
      return !!localStorage.getItem(SESSION_KEY);
    }

    getCurrentUser() {
      if (this.mode === 'firebase' && this.auth && this.auth.currentUser) {
        return {
          email: this.auth.currentUser.email,
          displayName: this.auth.currentUser.displayName || 'Admin',
          isFirebase: true
        };
      }
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        try {
          return JSON.parse(session);
        } catch(e) {
          return { email: 'admin@braenova.com', displayName: 'BraeNova Admin', isFirebase: false };
        }
      }
      return null;
    }

    async login(email, password) {
      if (this.mode === 'firebase' && this.auth) {
        const cred = await this.auth.signInWithEmailAndPassword(email, password);
        return { email: cred.user.email, isFirebase: true };
      }

      // Local Admin Mode: accepts standard admin credentials or demo login
      if (!email) email = 'admin@braenova.com';
      const user = {
        email: email,
        displayName: 'BraeNova Admin',
        loginTime: new Date().toISOString(),
        isFirebase: false
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    }

    async logout() {
      localStorage.removeItem(SESSION_KEY);
      if (this.mode === 'firebase' && this.auth) {
        await this.auth.signOut();
      }
      return true;
    }

    // ── EXPORT / IMPORT BACKUP ──

    exportAll() {
      const data = {};
      for (const key of ['hero', 'about', 'contact', 'services', 'products', 'team', 'testimonials', 'messages']) {
        const raw = localStorage.getItem(STORAGE_PREFIX + key);
        data[key] = raw ? JSON.parse(raw) : SEED_DATA[key];
      }
      return data;
    }

    importAll(jsonData) {
      for (const [key, value] of Object.entries(jsonData)) {
        if (['hero', 'about', 'contact', 'services', 'products', 'team', 'testimonials', 'messages'].includes(key)) {
          localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
        }
      }
      this.notifyListeners();
      return true;
    }

    resetToDefaults() {
      for (const [key, value] of Object.entries(SEED_DATA)) {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      }
      this.notifyListeners();
      return true;
    }
  }

  // Expose global instance
  window.BraeNovaDB = new BraeNovaDatabase();

})(window);
