'use client';

import { usePortfolioData } from "@/hooks/use-portfolio-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, PieChart } from "lucide-react";
import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

// Colori per i grafici
const COLORS = {
  assetClass: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'],
  geography: ['#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1'],
  sector: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']
};

interface ConcentrationAlert {
  type: 'asset' | 'geography' | 'sector';
  name: string;
  percentage: number;
}

export function PortfolioDiversificationWidget() {
  const { holdings, isLoading } = usePortfolioData();

  // Calcola diversificazione per asset class
  const assetClassData = holdings.reduce((acc, holding) => {
    const assetType = holding.asset_type || 'Altri';
    const value = holding.current_value || 0;
    
    if (!acc[assetType]) {
      acc[assetType] = 0;
    }
    acc[assetType] += value;
    
    return acc;
  }, {} as Record<string, number>);

  const totalValue = Object.values(assetClassData).reduce((sum, val) => sum + val, 0);

  const assetClassChartData = Object.entries(assetClassData).map(([name, value]) => ({
    name: name === 'stock' ? 'Azioni' : name === 'bond' ? 'Obbligazioni' : name === 'etf' ? 'ETF' : name === 'cash' ? 'Liquidità' : name,
    value,
    percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
  }));

  // Simula dati per area geografica (in produzione questi verrebbero dal database)
  const geographyData = [
    { name: 'USA', value: totalValue * 0.45, percentage: 45 },
    { name: 'Europa', value: totalValue * 0.30, percentage: 30 },
    { name: 'Asia Pacifico', value: totalValue * 0.15, percentage: 15 },
    { name: 'Mercati Emergenti', value: totalValue * 0.10, percentage: 10 }
  ];

  // Simula dati per settore (in produzione questi verrebbero dal database)
  const sectorData = [
    { name: 'Tecnologia', value: totalValue * 0.25, percentage: 25 },
    { name: 'Finanza', value: totalValue * 0.20, percentage: 20 },
    { name: 'Salute', value: totalValue * 0.15, percentage: 15 },
    { name: 'Beni di Consumo', value: totalValue * 0.12, percentage: 12 },
    { name: 'Industriali', value: totalValue * 0.10, percentage: 10 },
    { name: 'Energia', value: totalValue * 0.08, percentage: 8 },
    { name: 'Utilities', value: totalValue * 0.05, percentage: 5 },
    { name: 'Altri', value: totalValue * 0.05, percentage: 5 }
  ];

  // Identifica concentrazioni rischiose (>25%)
  const concentrationAlerts: ConcentrationAlert[] = [];
  
  assetClassChartData.forEach(item => {
    if (item.percentage > 25) {
      concentrationAlerts.push({
        type: 'asset',
        name: item.name,
        percentage: item.percentage
      });
    }
  });

  geographyData.forEach(item => {
    if (item.percentage > 25) {
      concentrationAlerts.push({
        type: 'geography',
        name: item.name,
        percentage: item.percentage
      });
    }
  });

  sectorData.forEach(item => {
    if (item.percentage > 25) {
      concentrationAlerts.push({
        type: 'sector',
        name: item.name,
        percentage: item.percentage
      });
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm font-medium">
            {payload[0].payload.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderPieChart = (data: any[], colors: string[]) => (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ percentage }) => `${percentage.toFixed(1)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value) => <span className="text-sm">{value}</span>}
        />
      </RechartsChart>
    </ResponsiveContainer>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Diversificazione Portafoglio
          </CardTitle>
          <CardDescription>Analisi della distribuzione degli investimenti</CardDescription>
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
            <PieChart className="h-5 w-5" />
            Diversificazione Portafoglio
          </CardTitle>
          <CardDescription>Analisi della distribuzione degli investimenti</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              Nessun investimento registrato per mostrare la diversificazione
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
          <PieChart className="h-5 w-5" />
          Diversificazione Portafoglio
        </CardTitle>
        <CardDescription>Analisi della distribuzione degli investimenti</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alert concentrazione */}
        {concentrationAlerts.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <span className="font-medium">Attenzione:</span> Rilevate concentrazioni elevate
              <div className="mt-2 space-y-1">
                {concentrationAlerts.map((alert, index) => (
                  <div key={index} className="text-sm">
                    • {alert.name}: {alert.percentage.toFixed(1)}% 
                    {alert.type === 'asset' && ' (Asset Class)'}
                    {alert.type === 'geography' && ' (Area Geografica)'}
                    {alert.type === 'sector' && ' (Settore)'}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs per diversi tipi di diversificazione */}
        <Tabs defaultValue="asset-class" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="asset-class">Asset Class</TabsTrigger>
            <TabsTrigger value="geography">Geografia</TabsTrigger>
            <TabsTrigger value="sector">Settore</TabsTrigger>
          </TabsList>

          <TabsContent value="asset-class" className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Distribuzione per tipologia di asset
              </p>
              {renderPieChart(assetClassChartData, COLORS.assetClass)}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {assetClassChartData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS.assetClass[index % COLORS.assetClass.length] }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <Badge variant={item.percentage > 25 ? "destructive" : "secondary"} className="text-xs">
                    {item.percentage.toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="geography" className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Distribuzione per area geografica
              </p>
              {renderPieChart(geographyData, COLORS.geography)}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {geographyData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS.geography[index % COLORS.geography.length] }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <Badge variant={item.percentage > 25 ? "destructive" : "secondary"} className="text-xs">
                    {item.percentage.toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sector" className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Distribuzione per settore industriale
              </p>
              {renderPieChart(sectorData, COLORS.sector)}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {sectorData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS.sector[index % COLORS.sector.length] }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <Badge variant={item.percentage > 25 ? "destructive" : "secondary"} className="text-xs">
                    {item.percentage.toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Suggerimenti */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Suggerimenti per la diversificazione</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Mantieni ogni asset class sotto il 25% per ridurre il rischio</li>
            <li>• Diversifica geograficamente per proteggerti da rischi regionali</li>
            <li>• Bilancia i settori per evitare sovraesposizione a singole industrie</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}