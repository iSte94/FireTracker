'use client'

import { useEffect, useState } from 'react'
import {
  getRegisteredProviders,
  emergencyEthereumReset,
  diagnoseEthereumState
} from '@/lib/ethereum-conflict-prevention-advanced'

interface EthereumState {
  exists: boolean
  type: string
  isMetaMask: boolean
  hasDescriptor: boolean
  isConfigurable: boolean
  isWritable: boolean
  canDelete: boolean
  canModify: boolean
  conflictPrevented: boolean
}

export default function EthereumConflictMonitor() {
  const [ethereumState, setEthereumState] = useState<EthereumState | null>(null)
  const [isDebugMode, setIsDebugMode] = useState(false)

  useEffect(() => {
    // Solo in development o se esplicitamente richiesto
    const shouldShow = process.env.NODE_ENV === 'development' || 
                      window.location.search.includes('debug=ethereum') ||
                      localStorage.getItem('ethereum-debug') === 'true'
    
    if (!shouldShow) return

    const checkEthereumState = () => {
      const diagnosis = diagnoseEthereumState()
      const descriptor = diagnosis.descriptor
      
      setEthereumState({
        exists: diagnosis.exists,
        type: typeof window.ethereum,
        isMetaMask: Boolean(window.ethereum?.isMetaMask),
        hasDescriptor: Boolean(descriptor),
        isConfigurable: descriptor?.configurable ?? false,
        isWritable: descriptor?.writable ?? false,
        canDelete: diagnosis.canDelete,
        canModify: diagnosis.canModify,
        conflictPrevented: Boolean(window.__ethereumConflictPrevented)
      })
    }

    checkEthereumState()
    setIsDebugMode(true)

    // Monitora cambiamenti ogni 2 secondi
    const interval = setInterval(checkEthereumState, 2000)
    
    return () => clearInterval(interval)
  }, [])

  const handleDebugLog = () => {
    const diagnosis = diagnoseEthereumState()
    console.log('=== ETHEREUM DEBUG STATE ===')
    console.log('Current ethereum:', window.ethereum)
    console.log('Diagnosis:', diagnosis)
    console.log('Registered providers:', getRegisteredProviders())
    console.log('Extension handlers:', window.__extensionEthereumHandlers)
    console.log('Property descriptor:', diagnosis.descriptor)
  }

  const handleEmergencyFix = () => {
    console.log('[EthereumMonitor] Avvio emergency reset...')
    emergencyEthereumReset()
    
    // Ricontrolla lo stato dopo il fix
    setTimeout(() => {
      console.log('[EthereumMonitor] Ricontrollo stato dopo reset...')
      const diagnosis = diagnoseEthereumState()
      const descriptor = diagnosis.descriptor
      
      setEthereumState(prev => prev ? {
        ...prev,
        exists: diagnosis.exists,
        hasDescriptor: Boolean(descriptor),
        isConfigurable: descriptor?.configurable ?? false,
        isWritable: descriptor?.writable ?? false,
        canDelete: diagnosis.canDelete,
        canModify: diagnosis.canModify,
        conflictPrevented: Boolean(window.__ethereumConflictPrevented)
      } : null)
    }, 200)
  }

  const handleToggleDebug = () => {
    const newState = !localStorage.getItem('ethereum-debug')
    localStorage.setItem('ethereum-debug', newState.toString())
    window.location.reload()
  }

  if (!isDebugMode || !ethereumState) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <div className="text-sm font-bold mb-2 flex items-center justify-between">
        <span>Ethereum Monitor</span>
        <button 
          onClick={() => setIsDebugMode(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Exists:</span>
          <span className={ethereumState.exists ? 'text-green-400' : 'text-red-400'}>
            {ethereumState.exists ? 'Yes' : 'No'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Type:</span>
          <span>{ethereumState.type}</span>
        </div>
        
        <div className="flex justify-between">
          <span>MetaMask:</span>
          <span className={ethereumState.isMetaMask ? 'text-green-400' : 'text-gray-400'}>
            {ethereumState.isMetaMask ? 'Yes' : 'No'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Has Descriptor:</span>
          <span className={ethereumState.hasDescriptor ? 'text-green-400' : 'text-red-400'}>
            {ethereumState.hasDescriptor ? 'Yes' : 'No'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Configurable:</span>
          <span className={ethereumState.isConfigurable ? 'text-green-400' : 'text-yellow-400'}>
            {ethereumState.isConfigurable ? 'Yes' : 'No'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Writable:</span>
          <span className={ethereumState.isWritable ? 'text-green-400' : 'text-yellow-400'}>
            {ethereumState.isWritable ? 'Yes' : 'No'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Can Delete:</span>
          <span className={ethereumState.canDelete ? 'text-green-400' : 'text-red-400'}>
            {ethereumState.canDelete ? 'Yes' : 'No'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Can Modify:</span>
          <span className={ethereumState.canModify ? 'text-green-400' : 'text-red-400'}>
            {ethereumState.canModify ? 'Yes' : 'No'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Prevention:</span>
          <span className={ethereumState.conflictPrevented ? 'text-green-400' : 'text-red-400'}>
            {ethereumState.conflictPrevented ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      
      <div className="mt-3 space-y-1">
        <button 
          onClick={handleDebugLog}
          className="w-full text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
        >
          Debug Console
        </button>
        
        <button
          onClick={handleEmergencyFix}
          className={`w-full text-xs px-2 py-1 rounded ${
            ethereumState.canDelete || ethereumState.canModify
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-orange-600 hover:bg-orange-700'
          }`}
          title={!ethereumState.canDelete && !ethereumState.canModify
            ? 'Proprietà non modificabile - reset parziale'
            : 'Reset completo disponibile'
          }
        >
          {ethereumState.canDelete || ethereumState.canModify ? 'Emergency Fix' : 'Partial Reset'}
        </button>
        
        <button 
          onClick={handleToggleDebug}
          className="w-full text-xs bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded"
        >
          Toggle Persistent
        </button>
      </div>
      
      <div className="mt-2 text-xs text-gray-400">
        Per nascondere: ?debug=ethereum o localStorage
      </div>
    </div>
  )
}