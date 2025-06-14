"use client"

import { useEffect, useState } from "react"
import { BudgetAlert, getBudgetAlerts, markAlertAsRead } from "@/lib/budget-client"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertTriangle,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Bell,
  BellOff
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { it } from "date-fns/locale"

export default function BudgetAlerts() {
  const [alerts, setAlerts] = useState<BudgetAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('unread')
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user?.id) {
      loadAlerts()
    }
  }, [session?.user?.id])

  const loadAlerts = async () => {
    try {
      if (!session?.user?.id) return

      const alertList = await getBudgetAlerts(session.user.id)
      setAlerts(alertList)
    } catch (error) {
      console.error("Error loading alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await markAlertAsRead(alertId)
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ))
    } catch (error) {
      console.error("Error marking alert as read:", error)
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'THRESHOLD_REACHED':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case 'BUDGET_EXCEEDED':
        return <TrendingUp className="h-5 w-5 text-red-500" />
      case 'PERIOD_ENDING':
        return <Calendar className="h-5 w-5 text-blue-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'THRESHOLD_REACHED':
        return 'warning'
      case 'BUDGET_EXCEEDED':
        return 'destructive'
      case 'PERIOD_ENDING':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const getAlertTitle = (type: string) => {
    switch (type) {
      case 'THRESHOLD_REACHED':
        return 'Soglia di Avviso Raggiunta'
      case 'BUDGET_EXCEEDED':
        return 'Budget Superato'
      case 'PERIOD_ENDING':
        return 'Periodo in Scadenza'
      default:
        return 'Avviso Budget'
    }
  }

  if (loading) {
    return <div>Caricamento avvisi...</div>
  }

  const filteredAlerts = filter === 'unread' 
    ? alerts.filter(alert => !alert.is_read)
    : alerts

  const unreadCount = alerts.filter(a => !a.is_read).length

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8">
        <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          Nessun avviso al momento
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Riceverai notifiche quando i tuoi budget raggiungeranno le soglie impostate
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Non letti
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Tutti
          </Button>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              for (const alert of alerts.filter(a => !a.is_read)) {
                await handleMarkAsRead(alert.id)
              }
            }}
          >
            Segna tutti come letti
          </Button>
        )}
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Tutti gli avvisi sono stati letti
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <Alert
              key={alert.id}
              variant={getAlertColor(alert.alert_type) as any}
              className={`${alert.is_read ? 'opacity-60' : ''} transition-opacity`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.alert_type)}
                  <div className="space-y-1">
                    <AlertTitle className="text-sm font-medium">
                      {getAlertTitle(alert.alert_type)}
                    </AlertTitle>
                    <AlertDescription className="text-sm">
                      {alert.message}
                    </AlertDescription>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(alert.created_at), { 
                          addSuffix: true,
                          locale: it 
                        })}
                      </span>
                      {alert.percentage_used && (
                        <Badge variant="outline" className="text-xs">
                          {alert.percentage_used.toFixed(0)}% utilizzato
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {!alert.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAsRead(alert.id)}
                  >
                    Segna come letto
                  </Button>
                )}
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Alert Settings Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h4 className="text-sm font-medium mb-2">Impostazioni Avvisi</h4>
          <p className="text-xs text-muted-foreground">
            Gli avvisi vengono generati automaticamente quando:
          </p>
          <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
            <li>Le spese raggiungono la soglia di avviso impostata per un budget</li>
            <li>Un budget viene superato</li>
            <li>Un periodo di budget sta per terminare (ultimi 3 giorni)</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-3">
            Puoi modificare la soglia di avviso per ogni budget dalle impostazioni del budget stesso.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}