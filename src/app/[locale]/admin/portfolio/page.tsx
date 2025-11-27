import { prisma } from '@/lib/prisma';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PortfolioAdmin() {
  const [projects, setProjects] = useState([]);
  const router = useRouter();

  async function fetchProjects() {
    const res = await fetch('/api/projects');
    const data = await res.json();
    setProjects(data);
  }

  async function deleteProject(id: string) {
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div>
      <h1>Portfolio Management</h1>
      <button onClick={fetchProjects}>Load Projects</button>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <h2>{project.title}</h2>
            <button onClick={() => deleteProject(project.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}