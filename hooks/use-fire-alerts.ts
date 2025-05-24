"use client"

import { useEffect, useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { calculateMilestones, FIRE_TYPES, calculateTimeToFire } from "@/lib/fire-calculations"
import { AlertCircle, TrendingDown, TrendingUp, Trophy, Zap } from "lucide-react"

interface FireAlert {
  id: string
  type: "milestone" | "deviation" | "suggestion" | "achievement"
  title: string
  description: string
  icon: React.ElementType
  severity: "info" | "warning" | "success"
  timestamp: Date
}

interface UseFireAlertsProps {
  currentSavings: number
  annualExpenses: number
  annualSavings: number
  monthlyTarget?: number
  expectedReturn?: number
  inflationRate?: number
  checkInterval?: number // in millisecondi
}

export function useFireAlerts({
  currentSavings,
  annualExpenses,
  annualSavings,
  monthlyTarget,
  expectedReturn = 0.07,
  inflationRate = 0.02,
  checkInterval = 60000 // Controlla ogni minuto
}: UseFireAlertsProps) {
  const { toast } = useToast()
  const [alerts, setAlerts] = useState<FireAlert[]>([])
  const [lastCheckedValues, setLastCheckedValues] = useState({
    savings: currentSavings,
    milestones: new Set<string>()
  })
  
  // Controlla milestone raggiunte
  const checkMilestones = useCallback(() => {
    const traditionalFireNumber = annualExpenses * FIRE_TYPES.traditional.multiplier
    const milestones = calculateMilestones(currentSavings, traditionalFireNumber)
    
    milestones.forEach(milestone => {
      if (milestone.reached && !lastCheckedValues.milestones.has(milestone.label)) {
        const alert: FireAlert = {
          id: `milestone-${milestone.label}-${Date.now()}`,
          type: "milestone",
          title: `Milestone Raggiunta: ${milestone.label}!`,
          description: `Hai raggiunto il ${milestone.percentage}% del tuo obiettivo FIRE!`,
          icon: Trophy,
          severity: "success",
          timestamp: new Date()
        }
        
        setAlerts(prev => [...prev, alert])
        toast({
          title: alert.title,
          description: alert.description,
          duration: 5000
        })
        
        setLastCheckedValues(prev => ({
          ...prev,
          milestones: new Set(prev.milestones).add(milestone.label)
        }))
      }
    })
  }, [currentSavings, annualExpenses, lastCheckedValues.milestones, toast])
  
  // Controlla deviazioni dal piano
  const checkDeviations = useCallback(() => {
    if (!monthlyTarget) return
    
    const actualMonthlySavings = annualSavings / 12
    const deviationPercentage = ((actualMonthlySavings - monthlyTarget) / monthlyTarget) * 100
    
    if (deviationPercentage < -20) {
      const alert: FireAlert = {
        id: `deviation-${Date.now()}`,
        type: "deviation",
        title: "Attenzione: Risparmio sotto target",
        description: `Il tuo tasso di risparmio è diminuito del ${Math.abs(deviationPercentage).toFixed(0)}% rispetto al target`,
        icon: TrendingDown,
        severity: "warning",
        timestamp: new Date()
      }
      
      setAlerts(prev => [...prev, alert])
      toast({
        title: alert.title,
        description: alert.description,
        variant: "destructive",
        duration: 5000
      })
    } else if (deviationPercentage > 20) {
      const alert: FireAlert = {
        id: `deviation-positive-${Date.now()}`,
        type: "achievement",
        title: "Ottimo lavoro!",
        description: `Stai risparmiando il ${deviationPercentage.toFixed(0)}% in più del target!`,
        icon: TrendingUp,
        severity: "success",
        timestamp: new Date()
      }
      
      setAlerts(prev => [...prev, alert])
      toast({
        title: alert.title,
        description: alert.description,
        duration: 5000
      })
    }
  }, [annualSavings, monthlyTarget, toast])
  
  // Genera suggerimenti per accelerare il progresso
  const generateSuggestions = useCallback(() => {
    const suggestions: FireAlert[] = []
    
    // Calcola tempo per Traditional FIRE
    const traditionalFireNumber = annualExpenses * FIRE_TYPES.traditional.multiplier
    const timeToFire = calculateTimeToFire(
      currentSavings,
      annualSavings,
      traditionalFireNumber,
      expectedReturn,
      inflationRate
    )
    
    // Suggerimento se il tempo è molto lungo
    if (timeToFire.years > 20) {
      suggestions.push({
        id: `suggestion-savings-${Date.now()}`,
        type: "suggestion",
        title: "Suggerimento: Aumenta il tasso di risparmio",
        description: `Con il tasso attuale ci vorranno ${timeToFire.years.toFixed(0)} anni. Aumentando i risparmi del 10% potresti ridurre il tempo di diversi anni.`,
        icon: Zap,
        severity: "info",
        timestamp: new Date()
      })
    }
    
    // Suggerimento per Coast FIRE
    const coastFireNumber = annualExpenses * FIRE_TYPES.coast.multiplier
    const yearsToRetirement = 65 - 30 // Assumendo età attuale 30
    const coastFireAmount = coastFireNumber / Math.pow(1 + expectedReturn - inflationRate, yearsToRetirement)
    
    if (currentSavings >= coastFireAmount * 0.8 && currentSavings < coastFireAmount) {
      suggestions.push({
        id: `suggestion-coast-${Date.now()}`,
        type: "suggestion",
        title: "Vicino al Coast FIRE!",
        description: `Sei all'80% del Coast FIRE. Una volta raggiunto, potresti smettere di risparmiare e lasciare che i tuoi investimenti crescano.`,
        icon: Zap,
        severity: "info",
        timestamp: new Date()
      })
    }
    
    // Suggerimento per diversificazione (se abbiamo dati)
    const savingsRate = (annualSavings / (annualSavings + annualExpenses)) * 100
    if (savingsRate < 20) {
      suggestions.push({
        id: `suggestion-rate-${Date.now()}`,
        type: "suggestion",
        title: "Tasso di risparmio basso",
        description: `Il tuo tasso di risparmio è del ${savingsRate.toFixed(0)}%. Cerca di raggiungere almeno il 20-30% per accelerare il percorso FIRE.`,
        icon: AlertCircle,
        severity: "warning",
        timestamp: new Date()
      })
    }
    
    return suggestions
  }, [currentSavings, annualExpenses, annualSavings, expectedReturn, inflationRate])
  
  // Controlla periodicamente
  useEffect(() => {
    const checkAlerts = () => {
      checkMilestones()
      checkDeviations()
      
      // Genera suggerimenti ogni 5 controlli
      if (Math.random() < 0.2) {
        const suggestions = generateSuggestions()
        suggestions.forEach(suggestion => {
          setAlerts(prev => [...prev, suggestion])
          toast({
            title: suggestion.title,
            description: suggestion.description,
            duration: 7000
          })
        })
      }
    }
    
    // Controlla immediatamente
    checkAlerts()
    
    // Imposta intervallo
    const interval = setInterval(checkAlerts, checkInterval)
    
    return () => clearInterval(interval)
  }, [checkMilestones, checkDeviations, generateSuggestions, checkInterval, toast])
  
  // Funzione per rimuovere un alert
  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }, [])
  
  // Funzione per ottenere alert per tipo
  const getAlertsByType = useCallback((type: FireAlert["type"]) => {
    return alerts.filter(alert => alert.type === type)
  }, [alerts])
  
  // Funzione per pulire vecchi alert (più di 24 ore)
  const cleanOldAlerts = useCallback(() => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    setAlerts(prev => prev.filter(alert => alert.timestamp > oneDayAgo))
  }, [])
  
  return {
    alerts,
    dismissAlert,
    getAlertsByType,
    cleanOldAlerts,
    // Statistiche
    stats: {
      totalAlerts: alerts.length,
      milestoneAlerts: getAlertsByType("milestone").length,
      deviationAlerts: getAlertsByType("deviation").length,
      suggestionAlerts: getAlertsByType("suggestion").length,
      achievementAlerts: getAlertsByType("achievement").length
    }
  }
}