/* @flow */
import { NotificationsAndroid, PendingNotifications } from 'react-native-notifications';

import registerPush from '../api/registerPush';
import { streamNarrow, privateNarrow } from '../utils/narrow';
import type { Auth } from '../types';
import { logErrorRemotely } from '../utils/logging';

const handlePendingNotifications = async switchNarrow => {
  const notification = await PendingNotifications.getInitialNotification();
  if (notification) {
    const data = notification.getData();
    console.log('Opened app by notification', data); //eslint-disable-line
    if (data.recipient_type === 'stream') {
      switchNarrow(streamNarrow(data.stream, data.topic));
    } else if (data.recipient_type === 'private') {
      switchNarrow(privateNarrow(data.sender_email));
    }
  }
};

const handleRegistrationUpdates = (auth: Auth, saveTokenPush) => {
  NotificationsAndroid.setRegistrationTokenUpdateListener(async deviceToken => {
    try {
      await registerPush(auth, deviceToken);
      saveTokenPush(deviceToken);
    } catch (e) {
      logErrorRemotely(e, 'failed to register GCM');
    }
  });
};

export const initializeNotifications = (auth: Auth, saveTokenPush: string, doNarrow) => {
  handlePendingNotifications(doNarrow);
  handleRegistrationUpdates(auth, saveTokenPush);
};

export const refreshNotificationToken = () => {
  NotificationsAndroid.refreshToken();
};
