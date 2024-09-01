import type { NextApiRequest, NextApiResponse } from 'next';
import cron from 'node-cron';
import { autoRelease } from '../../../db'; // Adjust the import based on your project structure

let scheduledJobs: { [key: string]: cron.ScheduledTask } = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { assignmentID, startDate } = req.body;

    if (!assignmentID || !startDate) {
      return res.status(400).json({ message: 'Missing assignmentID or startDate' });
    }

    try {
      const releaseDate = new Date(startDate);
      const cronTime = `${releaseDate.getMinutes()} ${releaseDate.getHours()} ${releaseDate.getDate()} ${releaseDate.getMonth() + 1} *`;

      if (scheduledJobs[assignmentID]) {
        scheduledJobs[assignmentID].stop();
      }

      scheduledJobs[assignmentID] = cron.schedule(cronTime, async () => {
        try {
          await autoRelease(assignmentID);
          console.log(`Assignment ${assignmentID} auto-released successfully on ${startDate}`);
        } catch (error) {
          console.error(`Failed to auto-release assignment ${assignmentID}:`, error);
        }
      });

      res.status(200).json({ message: 'Auto-release scheduled successfully' });
    } catch (error) {
      console.error('Error scheduling auto-release:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
