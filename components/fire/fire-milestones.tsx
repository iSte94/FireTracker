"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Star, Target, CheckCircle2, Circle, Sparkles } from "lucide-react"
import { formatCurrency, calculateMilestones, FIRE_TYPES } from "@/lib/fire-calculations"
import { cn } from "@/lib/utils"
// import confetti from "canvas-confetti" // TODO: install canvas-confetti

interface FireMilestonesProps {
  currentSavings: number
  annualExpenses: number
  onMilestoneReached?: (milestone: string) => void
}

interface MilestoneCard {
  id: string
  title: string
  description: string
  amount: number
  percentage: number
  reached: boolean
  justReached?: boolean
  icon: React.ElementType
  color: string
}

export function FireMilestones({
  currentSavings,
  annualExpenses,
  onMilestoneReached
}: FireMilestonesProps) {
  const [celebratedMilestones, setCelebratedMilestones] = useState<Set<string>>(new Set())
  const [recentlyReached, setRecentlyReached] = useState<string | null>(null)
  
  // Calcola tutte le milestone
  const generateAllMilestones = (): MilestoneCard[] => {
    const milestones: MilestoneCard[] = []
    
    // Milestone generali basate sul Traditional FIRE
    const traditionalFireNumber = annualExpenses * FIRE_TYPES.traditional.multiplier
    const generalMilestones = calculateMilestones(currentSavings, traditionalFireNumber)
    
    generalMilestones.forEach((milestone, index) => {
      const icons = [Trophy, Star, Target, CheckCircle2, Sparkles, Trophy]
      const colors = ["text-yellow-500", "text-blue-500", "text-purple-500", "text-green-500", "text-orange-500", "text-yellow-500"]
      
      milestones.push({
        id: `general-${milestone.percentage}`,
        title: milestone.label,
        description: `Hai raggiunto il ${milestone.percentage}% del tuo obiettivo Traditional FIRE`,
        amount: milestone.amount,
        percentage: milestone.percentage,
        reached: milestone.reached,
        icon: icons[index] || Trophy,
        color: colors[index] || "text-gray-500"
      })
    })
    
    // Milestone specifiche per tipo di FIRE
    Object.entries(FIRE_TYPES).forEach(([key, fireType]) => {
      const fireNumber = annualExpenses * fireType.multiplier
      const percentage = (currentSavings / fireNumber) * 100
      
      if (percentage >= 100) {
        milestones.push({
          id: `fire-${key}`,
          title: `${fireType.name} Raggiunto!`,
          description: fireType.description,
          amount: fireNumber,
          percentage: 100,
          reached: true,
          icon: Trophy,
          color: "text-green-500"
        })
      }
    })
    
    // Milestone speciali
    const specialMilestones = [
      {
        id: "first-100k",
        title: "Primo €100k",
        description: "Il primo €100k è il più difficile!",
        amount: 100000,
        reached: currentSavings >= 100000,
        icon: Star,
        color: "text-yellow-500"
      },
      {
        id: "half-million",
        title: "Mezzo Milione",
        description: "Sei entrato nel club del mezzo milione!",
        amount: 500000,
        reached: currentSavings >= 500000,
        icon: Trophy,
        color: "text-purple-500"
      },
      {
        id: "millionaire",
        title: "Milionario",
        description: "Benvenuto nel club dei milionari!",
        amount: 1000000,
        reached: currentSavings >= 1000000,
        icon: Sparkles,
        color: "text-yellow-500"
      }
    ]
    
    specialMilestones.forEach(special => {
      if (special.amount <= traditionalFireNumber * 1.5) { // Solo se rilevante per il percorso
        milestones.push({
          ...special,
          percentage: (special.amount / traditionalFireNumber) * 100
        })
      }
    })
    
    return milestones.sort((a, b) => a.amount - b.amount)
  }
  
  const allMilestones = generateAllMilestones()
  const reachedMilestones = allMilestones.filter(m => m.reached)
  const nextMilestones = allMilestones.filter(m => !m.reached).slice(0, 3)
  
  // Celebra nuove milestone
  useEffect(() => {
    reachedMilestones.forEach(milestone => {
      if (!celebratedMilestones.has(milestone.id)) {
        // Lancia coriandoli (TODO: install canvas-confetti)
        // confetti({
        //   particleCount: 100,
        //   spread: 70,
        //   origin: { y: 0.6 }
        // })
        
        // Segna come celebrata
        setCelebratedMilestones(prev => new Set(prev).add(milestone.id))
        setRecentlyReached(milestone.id)
        
        // Notifica il parent component
        if (onMilestoneReached) {
          onMilestoneReached(milestone.title)
        }
        
        // Rimuovi l'highlight dopo 5 secondi
        setTimeout(() => {
          setRecentlyReached(null)
        }, 5000)
      }
    })
  }, [reachedMilestones, celebratedMilestones, onMilestoneReached])
  
  return (
    <div className="space-y-6">
      {/* Milestone raggiunte */}
      {reachedMilestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Milestone Raggiunte
            </CardTitle>
            <CardDescription>
              I tuoi traguardi nel percorso verso il FIRE
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {reachedMilestones.map((milestone) => {
                const Icon = milestone.icon
                const isRecent = recentlyReached === milestone.id
                
                return (
                  <div
                    key={milestone.id}
                    className={cn(
                      "relative overflow-hidden rounded-lg border p-4 transition-all",
                      isRecent && "ring-2 ring-yellow-500 ring-offset-2"
                    )}
                  >
                    {isRecent && (
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 animate-pulse" />
                    )}
                    
                    <div className="relative flex items-start gap-3">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full bg-muted",
                        milestone.color
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold">{milestone.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {milestone.description}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {formatCurrency(milestone.amount)}
                          </Badge>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Prossime milestone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Prossime Milestone
          </CardTitle>
          <CardDescription>
            I prossimi traguardi da raggiungere
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {nextMilestones.map((milestone) => {
              const Icon = milestone.icon
              const progress = (currentSavings / milestone.amount) * 100
              const remaining = milestone.amount - currentSavings
              
              return (
                <div key={milestone.id} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full bg-muted",
                      milestone.color
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{milestone.title}</h4>
                        <span className="text-sm text-muted-foreground">
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="ml-13 space-y-2">
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Mancano: {formatCurrency(remaining)}</span>
                      <span>Obiettivo: {formatCurrency(milestone.amount)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Riepilogo progresso */}
      <Card>
        <CardHeader>
          <CardTitle>Riepilogo Progresso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{reachedMilestones.length}</p>
              <p className="text-sm text-muted-foreground">Milestone raggiunte</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{allMilestones.length - reachedMilestones.length}</p>
              <p className="text-sm text-muted-foreground">Milestone rimanenti</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}