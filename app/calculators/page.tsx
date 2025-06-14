"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsFireOnly } from "@/components/providers/view-mode-provider"

// Lazy imports per i calcolatori
import {
  LazyFireCalculator,
  LazyBaristaFireCalculator,
  LazyCoastFireCalculator,
  LazyExpenseSimulator,
  LazyFireTimelineComparison,
  LazyFutureExpenseImpact,
  LazySwrVariations,
} from "@/components/calculators/lazy-calculators"

export default function CalculatorsPage() {
  const isFireOnly = useIsFireOnly()
  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Calcolatori</h1>
          <p className="text-muted-foreground">Strumenti avanzati per calcolare e simulare il tuo percorso FIRE.</p>
        </div>

        <Tabs defaultValue="fire" className="space-y-4">
          <TabsList className={`grid w-full ${isFireOnly ? 'grid-cols-7' : 'grid-cols-4'}`}>
            <TabsTrigger value="fire">FIRE</TabsTrigger>
            <TabsTrigger value="coast">COAST FIRE</TabsTrigger>
            <TabsTrigger value="barista">Barista FIRE</TabsTrigger>
            <TabsTrigger value="expense">Simulatore Spese</TabsTrigger>
            {isFireOnly && (
              <>
                <TabsTrigger value="future-expense">Impatto Spese</TabsTrigger>
                <TabsTrigger value="swr">Variazioni SWR</TabsTrigger>
                <TabsTrigger value="timeline">Timeline FIRE</TabsTrigger>
              </>
            )}
          </TabsList>
          <TabsContent value="fire" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Calcolatore FIRE</CardTitle>
                <CardDescription>
                  Calcola il tuo "FIRE number" e gli anni necessari per raggiungere l'indipendenza finanziaria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LazyFireCalculator />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="coast" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Calcolatore COAST FIRE</CardTitle>
                <CardDescription>
                  Calcola quando puoi smettere di risparmiare e lasciare che i tuoi investimenti crescano fino al
                  pensionamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LazyCoastFireCalculator />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="barista" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Calcolatore Barista FIRE</CardTitle>
                <CardDescription>
                  Calcola quanto hai bisogno per coprire parte delle tue spese con investimenti e il resto con lavoro
                  part-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LazyBaristaFireCalculator />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="expense" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Simulatore di Impatto Spese</CardTitle>
                <CardDescription>
                  Simula l'impatto di spese future (una tantum o ricorrenti) sul tuo FIRE number
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LazyExpenseSimulator />
              </CardContent>
            </Card>
          </TabsContent>
          
          {isFireOnly && (
            <>
              <TabsContent value="future-expense" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Calcolatore Impatto Spese Future</CardTitle>
                    <CardDescription>
                      Analizza come una spesa futura impatta il tuo percorso verso diversi tipi di FIRE
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LazyFutureExpenseImpact />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="swr" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Calcolatore Variazioni SWR</CardTitle>
                    <CardDescription>
                      Confronta come diversi Safe Withdrawal Rate influenzano il capitale necessario per il FIRE
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LazySwrVariations />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="timeline" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Timeline FIRE Comparativo</CardTitle>
                    <CardDescription>
                      Visualizza e confronta il percorso temporale verso diversi tipi di FIRE con scenari multipli
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LazyFireTimelineComparison />
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </main>
  )
}
