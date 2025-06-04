"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { perfLogger } from '@/lib/performance-logger';

export function PerformanceMonitor() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentLogs = perfLogger.getLogs();
      setLogs([...currentLogs].reverse().slice(0, 20)); // Ultimi 20 log
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const slowOps = logs.filter(log => log.duration > 1000);
  const avgDuration = logs.length > 0 
    ? logs.reduce((sum, log) => sum + log.duration, 0) / logs.length 
    : 0;

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
        >
          🔍 Performance Monitor
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 z-50">
      <Card className="shadow-xl border-yellow-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">🔍 Performance Monitor</CardTitle>
            <Button 
              onClick={() => setIsVisible(false)}
              variant="ghost" 
              size="sm"
              className="h-6 w-6 p-0"
            >
              ✕
            </Button>
          </div>
          <CardDescription>
            <div className="flex gap-2 text-xs">
              <Badge variant={slowOps.length > 0 ? "destructive" : "secondary"}>
                {slowOps.length} operazioni lente
              </Badge>
              <Badge variant="outline">
                Avg: {avgDuration.toFixed(0)}ms
              </Badge>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 max-h-80 overflow-y-auto">
          <div className="flex gap-2 mb-3">
            <Button 
              onClick={() => perfLogger.clearLogs()}
              variant="outline" 
              size="sm"
              className="text-xs h-7"
            >
              Pulisci Log
            </Button>
            <Button 
              onClick={() => perfLogger.printReport()}
              variant="outline" 
              size="sm"
              className="text-xs h-7"
            >
              Report Console
            </Button>
          </div>
          
          {logs.length === 0 ? (
            <p className="text-xs text-gray-500">Nessuna operazione registrata</p>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={`p-2 rounded text-xs border ${
                  log.duration > 1000 
                    ? 'bg-red-50 border-red-200' 
                    : log.duration > 500 
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-medium text-gray-900 line-clamp-2">
                    {log.operation}
                  </span>
                  <Badge 
                    variant={log.duration > 1000 ? "destructive" : "secondary"}
                    className="text-xs ml-1"
                  >
                    {log.duration.toFixed(0)}ms
                  </Badge>
                </div>
                {log.details && (
                  <div className="mt-1 text-gray-600 truncate">
                    {JSON.stringify(log.details).substring(0, 50)}...
                  </div>
                )}
                <div className="text-gray-400 text-xs mt-1">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}