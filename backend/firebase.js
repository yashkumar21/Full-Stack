const admin = require("firebase-admin");
const serviceAccount = require("./service-account.json");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const countersRef = db.collection('counters').doc('crudOperations');

// Initialize counters if they don't exist
async function initializeCounters() {
    const doc = await countersRef.get();
    if (!doc.exists) {
        await countersRef.set({
            create: 0,
            retrieve: 0,
            update: 0,
            delete: 0
        });
    }
}

initializeCounters();

// Use Firestore's atomic increment for updating the counter
async function incrementCounter(operation) {
    await countersRef.update({
        [operation]: admin.firestore.FieldValue.increment(1)
    });
}

module.exports = {
    db,
    countersRef,
    incrementCounter
};