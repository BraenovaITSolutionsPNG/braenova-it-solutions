// ─────────────────────────────────────────────────────────────────────────────
// BraeNova IT Solutions — Firebase Configuration
// ─────────────────────────────────────────────────────────────────────────────
//
// SETUP INSTRUCTIONS (5 minutes):
//
// 1. Go to: https://console.firebase.google.com
// 2. Click "Add project" → Name it "braenova-website" → Create
// 3. In the left panel: Build → Firestore Database → Create database
//    - Choose "Start in test mode" → Select a region → Enable
// 4. In the left panel: Build → Authentication → Get started
//    - Enable "Email/Password" provider
//    - Go to "Users" tab → Add user → set your admin email & password
// 5. In the left panel: Project Settings (gear icon) → General
//    - Scroll to "Your apps" → Click </> (Web)
//    - Register app (nickname: "BraeNova Web") → Copy the config below
// 6. Replace all "YOUR_..." values below with your actual config
//
// ─────────────────────────────────────────────────────────────────────────────
// FIRESTORE SECURITY RULES (paste in Firestore → Rules tab):
//
//   rules_version = '2';
//   service cloud.firestore {
//     match /databases/{database}/documents {
//       match /site_config/{doc} { allow read; allow write: if request.auth != null; }
//       match /services/{doc}    { allow read; allow write: if request.auth != null; }
//       match /products/{doc}    { allow read; allow write: if request.auth != null; }
//       match /team_members/{doc}{ allow read; allow write: if request.auth != null; }
//       match /testimonials/{doc}{ allow read; allow write: if request.auth != null; }
//       match /contact_messages/{doc} {
//         allow create: if true;
//         allow read, update, delete: if request.auth != null;
//       }
//     }
//   }
// ─────────────────────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
