import {ImageResponse} from 'next/og';
import {prisma} from '@/lib/prisma';
import React from 'react';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  let siteName = 'MK News Intelligence';
  try {
    const setting = await prisma.siteSetting.findUnique({where: {key: 'siteName'}});
    if (setting?.value?.trim()) siteName = setting.value.trim();
  } catch {
    // Best-effort only.
  }

  return new ImageResponse(
    React.createElement(
      'div',
      {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 96,
          backgroundColor: '#0f172a',
          color: '#ffffff',
        },
      },
      React.createElement(
        'div',
        {style: {fontSize: 72, fontWeight: 800, lineHeight: 1.05}},
        siteName
      ),
      React.createElement(
        'div',
        {style: {marginTop: 24, fontSize: 32, opacity: 0.9}},
        'Multilingual tech news'
      )
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
