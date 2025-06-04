// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { perfLogger } from './performance-logger';

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-unused-vars
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'info',
      },
      {
        emit: 'event',
        level: 'warn',
      },
      {
        emit: 'event',
        level: 'error',
      },
    ],
  });

// Event listeners per il logging delle performance
prisma.$on('query', (e) => {
  const duration = e.duration;
  const query = e.query.substring(0, 100) + (e.query.length > 100 ? '...' : '');
  
  if (duration > 1000) {
    console.warn(`🐌 [PRISMA] SLOW QUERY (${duration}ms): ${query}`, {
      params: e.params,
      target: e.target
    });
  } else if (duration > 500) {
    console.log(`⚠️  [PRISMA] Moderately slow query (${duration}ms): ${query}`);
  } else if (process.env.NODE_ENV === 'development') {
    console.log(`⚡ [PRISMA] Query (${duration}ms): ${query}`);
  }
});

prisma.$on('info', (e) => {
  console.log('ℹ️  [PRISMA INFO]', e);
});

prisma.$on('warn', (e) => {
  console.warn('⚠️  [PRISMA WARN]', e);
});

prisma.$on('error', (e) => {
  console.error('❌ [PRISMA ERROR]', e);
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}