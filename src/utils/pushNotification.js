// utils/pushNotifications.js
import { Expo } from "expo-server-sdk";

const expo = new Expo();

export const sendPushNotification = async (token, title, body) => {
  if (!Expo.isExpoPushToken(token)) return;

  const message = {
    to: token,
    sound: "default",
    title,
    body,
    data: {},
  };

  try {
    await expo.sendPushNotificationsAsync([message]);
  } catch (error) {
    console.error("Push error:", error);
  }
};
