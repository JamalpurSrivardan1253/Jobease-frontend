import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Checks for missing/expired token or 401 response and logs out if needed.
 * @param {object} navigation - React Navigation object
 * @param {Response} response - fetch API response
 * @returns {boolean} true if logout was triggered, false otherwise
 */
export async function checkAndHandleAuthError(navigation, response) {
  if (!response) {
    // No response, treat as error
    await AsyncStorage.removeItem('token');
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    return true;
  }
  if (response.status === 401) {
    await AsyncStorage.removeItem('token');
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    return true;
  }
  return false;
}

/**
 * Checks if token exists, logs out if not.
 * @param {object} navigation - React Navigation object
 * @returns {Promise<string|null>} token or null if logged out
 */
export async function getTokenOrLogout(navigation) {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    await AsyncStorage.removeItem('token');
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    return null;
  }
  return token;
}
