// utils/pushNotifications.js
import { Expo } from 'expo-server-sdk';

const expo = new Expo();

export const sendPushNotification = async (token, title, body, turnoId) => {
	if (!Expo.isExpoPushToken(token)) return;

	const message = {
		to: token,
		sound: 'default',
		title,
		body,
		data: {
			id: turnoId,
		},
	};

	try {
		await expo.sendPushNotificationsAsync([message]);
	} catch (error) {
		console.error('Push error:', error);
	}
};
