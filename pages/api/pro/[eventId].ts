import type { NextApiRequest, NextApiResponse } from 'next'
import path from 'path';
import { promises as fs } from 'fs';

type EventData = {
  name: string;
  fields: string[];
  title: string;
  subtitle: string;
  terms: string;
  privacy: string;
  logo: string;
  background: string;
  color: string;
}

export async function getEventData(event: string) {
  //Find the absolute path of the json directory
  const jsonDirectory = path.join(process.cwd(), 'json');

  const filePath = jsonDirectory + `/nba.json`
  //Read the json data file data.json
  const fileContents = await fs.readFile(filePath, 'utf8');
  //Return the content of the data file in json format
  return JSON.parse(fileContents);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EventData>
) {
  const { event } = req.query;
  const data = await getEventData(String(event));
  res.status(200).json(data);
}
