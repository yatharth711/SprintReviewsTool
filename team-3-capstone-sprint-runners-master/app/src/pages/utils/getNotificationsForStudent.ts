export async function getNotificationsForStudent(userID: number) {
  try {
    const response = await fetch(`/api/getNotificationsForStudent?userID=${userID}`);
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}
