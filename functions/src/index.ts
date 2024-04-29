import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

exports.sendReturnNotifications = functions.pubsub
  .schedule("every 60 minutes")
  .onRun(async () => {
    const itemsRef = admin.firestore().collection("items");
    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;

    const querySnapshot = await itemsRef.where("returnDate", ">=", now)
      .get();
    querySnapshot.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
      const item = doc.data();
      const returnDate = item.returnDate.toDate();
      const diffMs = returnDate.getTime() - now.getTime();

      if (diffMs < oneDayMs && !item.notificationSent24h) {
        sendNotification(item.userId,
          `Only 24 hours remaining to return your item ${item.name}.`);
        doc.ref.update({notificationSent24h: true});
      }
      if (diffMs <= 0 && !item.notificationSentNow) {
        sendNotification(item.userId,
          `You have to return your item ${item.name} now.`);
        doc.ref.update({notificationSentNow: true});
      }
    });
  });

/**
 * Sends a notification to a specific user.
 *
 * @param {string} userId The ID of the user to send the notification to.
 * @param {string} message The message of the notification.
 */
function sendNotification(userId: string,
  message: string) {
  const notificationsRef = admin.firestore()
    .collection("users")
    .doc(userId).collection("notifications");
  notificationsRef.add({
    message: message,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    isRead: false,
  });
}
