import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const projects = await prisma.project.findMany();
    return res.status(200).json(projects);
  }

  if (req.method === 'POST') {
    const { title, description, category, image, technologies, liveUrl, githubUrl } = req.body;
    const project = await prisma.project.create({
      data: {
        title,
        description,
        category,
        image,
        technologies,
        liveUrl,
        githubUrl,
      },
    });
    return res.status(201).json(project);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}