// pushNotifications.js (OneSignal Frontend Setup)
import OneSignal from 'react-onesignal';

export async function initializePushNotifications() {
  await OneSignal.init({
    appId: 'YOUR_ONESIGNAL_APP_ID',
    notifyButton: {
      enable: true,
    },
    allowLocalhostAsSecureOrigin: true
  });
  OneSignal.showSlidedownPrompt();
  OneSignal.setExternalUserId(localStorage.getItem('userEmail') || 'guest');
}
export async function sendPushNotification(title, message) {
  try {
    await OneSignal.sendSelfNotification(
      title,
      message,
      null,
      null,
      null
    );
  } catch (error) {
    console.error('Failed to send push notification:', error);
  }
}       
export function subscribeToPushNotifications() {
  OneSignal.on('notificationDisplay', (event) => {
    console.log('OneSignal notification displayed:', event);
  });

  OneSignal.on('notificationClick', (event) => {
    console.log('OneSignal notification clicked:', event);
  });
}
export function unsubscribeFromPushNotifications() {
  OneSignal.off('notificationDisplay');
  OneSignal.off('notificationClick');
}
export function isPushNotificationsEnabled() {
  return OneSignal.isPushNotificationsEnabled();
}
export function requestPushNotificationPermission() {
  OneSignal.registerForPushNotifications();
}
export function getPushNotificationSubscriptionStatus() {
  return OneSignal.getUserId().then(userId => {
    return userId ? true : false;
  });
}
export function setPushNotificationTags(tags) {
  OneSignal.sendTags(tags);
}
export function getPushNotificationTags() {
  return OneSignal.getTags().then(tags => {
    return tags;
  });
}
export function clearPushNotificationTags() {
  OneSignal.deleteTags();
}
export function setPushNotificationExternalUserId(userId) {
  OneSignal.setExternalUserId(userId);
}
export function getPushNotificationExternalUserId() {
  return OneSignal.getExternalUserId().then(userId => {
    return userId;
  });
}
export function clearPushNotificationExternalUserId() {
  OneSignal.removeExternalUserId();
}
export function getPushNotificationPermissionStatus() {
  return OneSignal.getNotificationPermission().then(permission => {
    return permission;
  });
}
export function getPushNotificationSubscriptionId() {
  return OneSignal.getUserId().then(userId => {
    return userId;
  });
}
export function getPushNotificationSubscriptionInfo() {
  return OneSignal.getUserId().then(userId => {
    return {
      userId: userId,
      isSubscribed: !!userId,
    };
  });
}
export function getPushNotificationSubscriptionCount() {
  return OneSignal.getTags().then(tags => {
    return tags ? Object.keys(tags).length : 0;
  });
}
export function getPushNotificationSubscriptionDate() {
  return OneSignal.getUserId().then(userId => {
    if (!userId) return null;
    return new Date();
  });
}
export function getPushNotificationSubscriptionTime() {
  return OneSignal.getUserId().then(userId => {
    if (!userId) return null;
    return new Date().getTime();
  });
}
export function getPushNotificationSubscriptionStatusText() {
  return OneSignal.getUserId().then(userId => {
    return userId ? 'Subscribed' : 'Not Subscribed';
  });
}
export function getPushNotificationSubscriptionStatusIcon() {
  return OneSignal.getUserId().then(userId => {
    return userId ? '✅' : '❌';
  });
}
export function getPushNotificationSubscriptionStatusColor() {
  return OneSignal.getUserId().then(userId => {
    return userId ? 'green' : 'red';
  });
}
export function getPushNotificationSubscriptionStatusClass() {
  return OneSignal.getUserId().then(userId => {
    return userId ? 'subscribed' : 'not-subscribed';
  });
}
export function getPushNotificationSubscriptionStatusStyle() {
  return OneSignal.getUserId().then(userId => {
    return userId ? { color: 'green' } : { color: 'red' };
  });
}
export function getPushNotificationSubscriptionStatusTextColor() {
  return OneSignal.getUserId().then(userId => {
    return userId ? 'green' : 'red';
  });
}
export function getPushNotificationSubscriptionStatusBackgroundColor() {
  return OneSignal.getUserId().then(userId => {
    return userId ? 'lightgreen' : 'lightcoral';
  });
}
export function getPushNotificationSubscriptionStatusBorderColor() {
  return OneSignal.getUserId().then(userId => {
    return userId ? 'green' : 'red';
  });
}
export function getPushNotificationSubscriptionStatusBorderStyle() {
  return OneSignal.getUserId().then(userId => {
    return userId ? 'solid' : 'dashed';
  });
}
export function getPushNotificationSubscriptionStatusBorderWidth() {
  return OneSignal.getUserId().then(userId => {
    return userId ? '2px' : '1px';
  });
}
export function getPushNotificationSubscriptionStatusFontSize() {
  return OneSignal.getUserId().then(userId => {
    return userId ? '16px' : '14px';
  });
}
export function getPushNotificationSubscriptionStatusFontWeight() {
  return OneSignal.getUserId().then(userId => {
    return userId ? 'bold' : 'normal';
  });
}
export function getPushNotificationSubscriptionStatusFontFamily() {
  return OneSignal.getUserId().then(userId => {
    return userId ? 'Arial, sans-serif' : 'Courier New, monospace';
  });
}

export function getPushNotificationSubscriptionStatusTextAlign() {
  return OneSignal.getUserId().then(userId => {
    return userId ? 'center' : 'left';
  });
}
export function getPushNotificationSubscriptionStatusLineHeight() {
  return OneSignal.getUserId().then(userId => {
    return userId ? '1.5' : '1.2';
  });
}
export function getPushNotificationSubscriptionStatusLetterSpacing() {
  return OneSignal.getUserId().then(userId => {
    return userId ? '0.05em' : '0.02em';
  });
}



export function getPushNotificationSubscriptionStatusTextTransform() {
  return OneSignal.getUserId().then(userId => {
    return userId ? 'uppercase' : 'none';
  });
}


export function getPushNotificationSubscriptionStatusTextDecoration() {
  return OneSignal.getUserId().then(userId => {
    return userId ? 'underline' : 'none';
  });
}
export function getPushNotificationSubscriptionStatusTextShadow() {
  return OneSignal.getUserId().then(userId => {
    return userId ? '1px 1px 2px rgba(0,0,0,0.5)' : 'none';
  });
}
export function getPushNotificationSubscriptionStatusTextOverflow() {
  return OneSignal.getUserId().then(userId => {
    return userId ? 'ellipsis' : 'clip';
  });
}