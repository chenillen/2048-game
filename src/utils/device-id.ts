export const generateDeviceId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart1 = Math.random().toString(36).substring(2, 10);
  const randomPart2 = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomPart1}-${randomPart2}`;
};

export const getDeviceId = (): string => {
  if (typeof window === 'undefined') return '';
  
  const key = 'deviceId';
  let deviceId = localStorage.getItem(key);
  
  if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem(key, deviceId);
  }
  
  return deviceId;
};

export const getUserName = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('userName') || '';
};

export const setUserName = (name: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('userName', name);
};
