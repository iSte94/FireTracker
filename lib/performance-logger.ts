// lib/performance-logger.ts
export class PerformanceLogger {
  private static instance: PerformanceLogger;
  private logs: Array<{
    timestamp: Date;
    operation: string;
    duration: number;
    details?: any;
    userId?: string;
  }> = [];

  static getInstance(): PerformanceLogger {
    if (!PerformanceLogger.instance) {
      PerformanceLogger.instance = new PerformanceLogger();
    }
    return PerformanceLogger.instance;
  }

  async timeOperation<T>(
    operation: string,
    fn: () => Promise<T>,
    details?: any,
    userId?: string
  ): Promise<T> {
    const start = performance.now();
    console.log(`🚀 [PERF] Starting ${operation}`, details);
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      this.logs.push({
        timestamp: new Date(),
        operation,
        duration,
        details,
        userId
      });

      if (duration > 1000) {
        console.warn(`⚠️  [PERF] SLOW OPERATION: ${operation} took ${duration.toFixed(2)}ms`, details);
      } else {
        console.log(`✅ [PERF] ${operation} completed in ${duration.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`❌ [PERF] ${operation} failed after ${duration.toFixed(2)}ms`, error, details);
      throw error;
    }
  }

  timeSync<T>(operation: string, fn: () => T, details?: any): T {
    const start = performance.now();
    console.log(`🚀 [PERF] Starting ${operation}`, details);
    
    try {
      const result = fn();
      const duration = performance.now() - start;
      
      this.logs.push({
        timestamp: new Date(),
        operation,
        duration,
        details
      });

      if (duration > 100) {
        console.warn(`⚠️  [PERF] SLOW SYNC OPERATION: ${operation} took ${duration.toFixed(2)}ms`, details);
      } else {
        console.log(`✅ [PERF] ${operation} completed in ${duration.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`❌ [PERF] ${operation} failed after ${duration.toFixed(2)}ms`, error, details);
      throw error;
    }
  }

  getSlowOperations(threshold = 1000): typeof this.logs {
    return this.logs.filter(log => log.duration > threshold);
  }

  getLogs(): typeof this.logs {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  printReport(): void {
    console.group('📊 Performance Report');
    
    const slowOps = this.getSlowOperations();
    if (slowOps.length > 0) {
      console.warn(`Found ${slowOps.length} slow operations (>1s):`);
      slowOps.forEach(log => {
        console.log(`- ${log.operation}: ${log.duration.toFixed(2)}ms`, log.details);
      });
    }

    const avgTimes = this.logs.reduce((acc, log) => {
      if (!acc[log.operation]) {
        acc[log.operation] = { total: 0, count: 0 };
      }
      acc[log.operation].total += log.duration;
      acc[log.operation].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    console.log('Average operation times:');
    Object.entries(avgTimes).forEach(([op, stats]) => {
      const avg = stats.total / stats.count;
      console.log(`- ${op}: ${avg.toFixed(2)}ms (${stats.count} executions)`);
    });

    console.groupEnd();
  }
}

export const perfLogger = PerformanceLogger.getInstance();