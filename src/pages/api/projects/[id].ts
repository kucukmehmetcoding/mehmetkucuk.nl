import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { title_tr, title_en, description_tr, description_en, category, image, technologies, liveUrl, githubUrl } = req.body;
    const project = await prisma.project.update({
      where: { id: String(id) },
      data: {
        title: JSON.stringify({ tr: title_tr, en: title_en }),
        description: JSON.stringify({ tr: description_tr, en: description_en }),
        category,
        image,
        technologies,
        liveUrl,
        githubUrl,
      },
    });
    return res.status(200).json(project);
  }

  if (req.method === 'DELETE') {
    await prisma.project.delete({
      where: { id: String(id) },
    });
    return res.status(204).end();
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}