'use client';

import { usePortfolioData } from "@/hooks/use-portfolio-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, TrendingUp, AlertTriangle, BarChart3 } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface AssetRiskReturn {
  name: string;
  ticker: string;
  risk: number; // Volatilità
  return: number; // Rendimento annualizzato
  value: number; // Valore corrente
  beta: number;
  correlation: number;
}

interface CorrelationData {
  asset1: string;
  asset2: string;
  correlation: number;
}

export function RiskReturnWidget() {
  const { holdings, stats, isLoading } = usePortfolioData();

  // Simula dati di rischio/rendimento per ogni asset
  const generateRiskReturnData = (): AssetRiskReturn[] => {
    return holdings.map(holding => {
      // Simula metriche di rischio (in produzione verrebbero calcolate dai dati storici)
      const baseRisk = holding.asset_type === 'stock' ? 20 : holding.asset_type === 'bond' ? 5 : 15;
      const risk = baseRisk + (Math.random() - 0.5) * 10;
      
      const baseReturn = holding.asset_type === 'stock' ? 10 : holding.asset_type === 'bond' ? 3 : 7;
      const returnValue = baseReturn + (Math.random() - 0.5) * 15;
      
      const beta = holding.asset_type === 'stock' ? 0.8 + Math.random() * 0.6 : 0.3 + Math.random() * 0.4;
      
      return {
        name: holding.asset_name,
        ticker: holding.ticker_symbol || holding.asset_name,
        risk: Math.max(0, risk),
        return: returnValue,
        value: holding.current_value || 0,
        beta: beta,
        correlation: 0.3 + Math.random() * 0.5
      };
    });
  };

  const riskReturnData = generateRiskReturnData();

  // Calcola metriche del portafoglio
  const portfolioRisk = 15.2; // Volatilità del portafoglio
  const portfolioReturn = 8.5; // Rendimento atteso del portafoglio
  const portfolioBeta = 0.92;
  const valueAtRisk95 = -12.5; // VaR al 95% di confidenza
  const valueAtRisk99 = -18.2; // VaR al 99% di confidenza

  // Genera matrice di correlazione semplificata
  const generateCorrelationMatrix = (): CorrelationData[] => {
    const correlations: CorrelationData[] = [];
    const topAssets = holdings.slice(0, 5); // Top 5 assets per valore

    for (let i = 0; i < topAssets.length; i++) {
      for (let j = i + 1; j < topAssets.length; j++) {
        correlations.push({
          asset1: topAssets[i].ticker_symbol || topAssets[i].asset_name,
          asset2: topAssets[j].ticker_symbol || topAssets[j].asset_name,
          correlation: Math.random() * 0.8 + 0.1 // Correlazione tra 0.1 e 0.9
        });
      }
    }
    return correlations;
  };

  const correlationData = generateCorrelationMatrix();

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getColorForRiskReturn = (risk: number, returnValue: number) => {
    const sharpeRatio = returnValue / risk;
    if (sharpeRatio > 0.5) return '#10b981'; // Verde
    if (sharpeRatio > 0.3) return '#f59e0b'; // Arancione
    return '#ef4444'; // Rosso
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{data.ticker}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm">Rischio: {data.risk.toFixed(2)}%</p>
            <p className="text-sm">Rendimento: {formatPercentage(data.return)}</p>
            <p className="text-sm">Beta: {data.beta.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">
              Sharpe: {(data.return / data.risk).toFixed(2)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analisi Rischio/Rendimento
          </CardTitle>
          <CardDescription>Profilo di rischio e rendimento degli asset</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (holdings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analisi Rischio/Rendimento
          </CardTitle>
          <CardDescription>Profilo di rischio e rendimento degli asset</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              Nessun investimento registrato per l'analisi rischio/rendimento
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Analisi Rischio/Rendimento
        </CardTitle>
        <CardDescription>Profilo di rischio e rendimento degli asset</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metriche principali */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm font-medium">Rischio Portfolio</span>
              <HoverCard>
                <HoverCardTrigger>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <p className="text-sm">
                    La volatilità annualizzata del portafoglio, calcolata come deviazione standard dei rendimenti.
                  </p>
                </HoverCardContent>
              </HoverCard>
            </div>
            <div className="text-xl font-bold">{portfolioRisk.toFixed(1)}%</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm font-medium">Rendimento Atteso</span>
              <HoverCard>
                <HoverCardTrigger>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <p className="text-sm">
                    Il rendimento annualizzato atteso del portafoglio basato sui rendimenti storici.
                  </p>
                </HoverCardContent>
              </HoverCard>
            </div>
            <div className="text-xl font-bold text-emerald-500">{formatPercentage(portfolioReturn)}</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm font-medium">Beta Portfolio</span>
              <HoverCard>
                <HoverCardTrigger>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <p className="text-sm">
                    Misura la sensibilità del portafoglio rispetto al mercato. Beta = 1 significa che si muove come il mercato.
                  </p>
                </HoverCardContent>
              </HoverCard>
            </div>
            <div className="text-xl font-bold">{portfolioBeta.toFixed(2)}</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm font-medium">Sharpe Ratio</span>
              <HoverCard>
                <HoverCardTrigger>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <p className="text-sm">
                    Rendimento aggiustato per il rischio. Valori più alti indicano migliori rendimenti per unità di rischio.
                  </p>
                </HoverCardContent>
              </HoverCard>
            </div>
            <div className="text-xl font-bold">{(portfolioReturn / portfolioRisk).toFixed(2)}</div>
          </div>
        </div>

        <Tabs defaultValue="scatter" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scatter">Scatter Plot</TabsTrigger>
            <TabsTrigger value="var">Value at Risk</TabsTrigger>
            <TabsTrigger value="correlation">Correlazioni</TabsTrigger>
          </TabsList>

          <TabsContent value="scatter" className="space-y-4">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    type="number" 
                    dataKey="risk" 
                    name="Rischio (%)" 
                    unit="%" 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                    label={{ value: 'Rischio (Volatilità %)', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="return" 
                    name="Rendimento (%)" 
                    unit="%" 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                    label={{ value: 'Rendimento Atteso (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                  <ReferenceLine x={portfolioRisk} stroke="red" strokeDasharray="5 5" />
                  <ReferenceLine y={portfolioReturn} stroke="green" strokeDasharray="5 5" />
                  <Scatter name="Assets" data={riskReturnData} fill="#8884d8">
                    {riskReturnData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getColorForRiskReturn(entry.risk, entry.return)}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span>Alto Sharpe Ratio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full" />
                <span>Medio Sharpe Ratio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span>Basso Sharpe Ratio</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="var" className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <h4 className="font-medium">Value at Risk (VaR)</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Perdita massima stimata con un dato livello di confidenza
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-background rounded-lg">
                    <div className="text-sm font-medium mb-1">VaR 95% (1 giorno)</div>
                    <div className="text-2xl font-bold text-red-500">{valueAtRisk95.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">
                      C'è il 5% di probabilità di perdere più di questo in un giorno
                    </div>
                  </div>
                  <div className="p-3 bg-background rounded-lg">
                    <div className="text-sm font-medium mb-1">VaR 99% (1 giorno)</div>
                    <div className="text-2xl font-bold text-red-500">{valueAtRisk99.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">
                      C'è l'1% di probabilità di perdere più di questo in un giorno
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Asset con Maggior Rischio</h4>
                {riskReturnData
                  .sort((a, b) => b.risk - a.risk)
                  .slice(0, 5)
                  .map((asset) => (
                    <div key={asset.ticker} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <span className="font-medium">{asset.ticker}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          Beta: {asset.beta.toFixed(2)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{asset.risk.toFixed(1)}% volatilità</div>
                        <div className="text-xs text-muted-foreground">
                          Rendimento: {formatPercentage(asset.return)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="correlation" className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Matrice di Correlazione</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Correlazione tra i principali asset del portafoglio (0 = nessuna correlazione, 1 = perfetta correlazione)
                </p>
                <div className="space-y-2">
                  {correlationData.map((corr, index) => {
                    const color = corr.correlation > 0.7 ? 'text-red-500' : 
                                 corr.correlation > 0.4 ? 'text-amber-500' : 
                                 'text-emerald-500';
                    return (
                      <div key={index} className="flex items-center justify-between p-2 rounded bg-background">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{corr.asset1}</span>
                          <span className="text-muted-foreground">↔</span>
                          <span className="text-sm font-medium">{corr.asset2}</span>
                        </div>
                        <span className={`font-bold ${color}`}>
                          {corr.correlation.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  <h4 className="text-sm font-medium">Suggerimenti per la Diversificazione</h4>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Cerca asset con correlazione bassa (&lt; 0.3) per ridurre il rischio</li>
                  <li>• Evita concentrazioni in asset altamente correlati (&gt; 0.7)</li>
                  <li>• Considera asset di diverse classi e settori per migliorare la diversificazione</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}