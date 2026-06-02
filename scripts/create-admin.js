const admin = require('firebase-admin');

// Initialize Firebase Admin SDK using environment variables
// You need to set FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY and FIREBASE_SERVICE_ACCOUNT_EMAIL
// Get these from Firebase Console > Project Settings > Service Accounts > Generate Private Key
const serviceAccount = {
  type: "service_account",
  project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
});

const db = admin.firestore();
const auth = admin.auth();

async function createAdminUser() {
  try {
    // Check if user already exists
    try {
      await auth.getUserByEmail('admin@romadlaser.com');
      console.log('Admin user already exists');
      return;
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Create the user in Firebase Auth
    const userRecord = await auth.createUser({
      email: 'admin@romadlaser.com',
      password: 'Admin123!', // Change this password after creation
      displayName: 'Admin User',
    });

    console.log('Successfully created new user:', userRecord.uid);

    // Create the user document in Firestore with admin role
    await db.collection('users').doc(userRecord.uid).set({
      email: 'admin@romadlaser.com',
      name: 'Admin User',
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('Admin user created successfully with role: admin');
    console.log('Email: admin@romadlaser.com');
    console.log('Password: Admin123! (Please change this immediately)');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    admin.app().delete();
  }
}

createAdminUser();