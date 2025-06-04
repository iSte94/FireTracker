/**
 * Soluzione avanzata per conflitti window.ethereum causati da estensioni browser
 * Gestisce specificatamente evmAsk.js e altre estensioni problematiche
 */

declare global {
  interface Window {
    ethereum?: any;
    __ethereumConflictPrevented?: boolean;
    __ethereumOriginalDescriptor?: PropertyDescriptor;
    __extensionEthereumHandlers?: Map<string, any>;
  }
}

let isAdvancedInitialized = false;

/**
 * Prevenzione avanzata che gestisce estensioni aggressive
 */
export function advancedEthereumConflictPrevention(): void {
  if (typeof window === 'undefined' || isAdvancedInitialized) return;

  console.log('[AdvancedEthereumPrevention] Inizializzazione protezione avanzata...');

  try {
    // 1. Salva il descriptor originale se esiste
    const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'ethereum');
    if (originalDescriptor) {
      window.__ethereumOriginalDescriptor = originalDescriptor;
    }

    // 2. Crea un proxy per ethereum che gestisce modifiche sicure
    setupEthereumProxy();

    // 3. Intercetta defineProperty globalmente
    interceptGlobalDefineProperty();

    // 4. Gestisci eventi di extension injection
    setupExtensionEventHandlers();

    isAdvancedInitialized = true;
    console.log('[AdvancedEthereumPrevention] ✅ Protezione avanzata attivata');

  } catch (error) {
    console.error('[AdvancedEthereumPrevention] ❌ Errore inizializzazione:', error);
  }
}

/**
 * Crea un proxy per window.ethereum che gestisce modifiche sicure
 */
function setupEthereumProxy(): void {
  // Se ethereum non esiste, crea un oggetto gestibile
  if (typeof window.ethereum === 'undefined') {
    const ethereumProxy = new Proxy({}, {
      set(target: any, prop: string | symbol, value: any) {
        console.log(`[EthereumProxy] Setting ${String(prop)}:`, typeof value);
        target[prop] = value;
        return true;
      },
      
      get(target: any, prop: string | symbol) {
        return target[prop];
      }
    });

    // Definisci ethereum come proprietà configurabile con il proxy
    Object.defineProperty(window, 'ethereum', {
      get: () => ethereumProxy,
      set: (value) => {
        console.log('[EthereumProxy] Tentativo di sostituzione ethereum:', typeof value);
        // Permetti la sostituzione ma mantieni la configurabilità
        Object.defineProperty(window, 'ethereum', {
          value: value,
          writable: true,
          configurable: true,
          enumerable: true
        });
      },
      configurable: true,
      enumerable: true
    });
  }
}

/**
 * Intercetta defineProperty globalmente per gestire conflitti
 */
function interceptGlobalDefineProperty(): void {
  const originalDefineProperty = Object.defineProperty;

  Object.defineProperty = function(obj: any, prop: string | symbol, descriptor: PropertyDescriptor): any {
    // Intercetta solo ethereum su window
    if (obj === window && prop === 'ethereum') {
      console.log('[DefinePropertyInterceptor] Tentativo ridefinizione ethereum intercettato');
      
      const currentDescriptor = Object.getOwnPropertyDescriptor(window, 'ethereum');
      
      // Se la proprietà esiste e non è configurabile, gestisci il conflitto
      if (currentDescriptor && !currentDescriptor.configurable) {
        console.warn('[DefinePropertyInterceptor] Proprietà ethereum non configurabile - applicazione workaround');
        
        // Salva lo stack trace per debug
        console.trace('Stack trace della ridefinizione bloccata:');
        
        // Invece di lanciare errore, modifica il valore esistente se possibile
        if (currentDescriptor.writable && 'value' in currentDescriptor) {
          try {
            window.ethereum = descriptor.value;
            console.log('[DefinePropertyInterceptor] ✅ Valore ethereum aggiornato via assignment');
            return obj;
          } catch (assignError) {
            console.error('[DefinePropertyInterceptor] Assignment fallito:', assignError);
          }
        }
        
        // Se tutto fallisce, ritorna l'oggetto senza errore
        return obj;
      }

      // Forza la proprietà come configurabile
      const safeDescriptor = {
        ...descriptor,
        configurable: true,
        writable: descriptor.writable !== false
      };

      console.log('[DefinePropertyInterceptor] ✅ Definizione ethereum con descriptor sicuro');
      return originalDefineProperty.call(this, obj, prop, safeDescriptor);
    }

    // Per altre proprietà, comportamento normale
    return originalDefineProperty.apply(this, [obj, prop, descriptor]);
  };
}

/**
 * Gestisce eventi di injection delle estensioni
 */
function setupExtensionEventHandlers(): void {
  // Inizializza la mappa degli handler se non esiste
  if (!window.__extensionEthereumHandlers) {
    window.__extensionEthereumHandlers = new Map();
  }

  // Listener per eventi di extension injection
  window.addEventListener('ethereum#initialized', (event: any) => {
    console.log('[ExtensionHandler] Ethereum initialized event:', event.detail);
    handleEthereumInjection(event.detail, 'ethereum#initialized');
  });

  // Listener per eventi di provider injection
  window.addEventListener('eip6963:announceProvider', (event: any) => {
    console.log('[ExtensionHandler] EIP-6963 provider announced:', event.detail);
    handleEthereumInjection(event.detail.provider, 'eip6963');
  });

  // Monitor per cambiamenti diretti a window.ethereum
  let lastEthereumValue = window.ethereum;
  const checkEthereumChanges = () => {
    if (window.ethereum !== lastEthereumValue) {
      console.log('[ExtensionHandler] Direct ethereum change detected');
      lastEthereumValue = window.ethereum;
    }
  };

  setInterval(checkEthereumChanges, 1000);
}

/**
 * Gestisce l'injection di ethereum da parte delle estensioni
 */
function handleEthereumInjection(provider: any, source: string): void {
  console.log(`[ExtensionHandler] Handling ethereum injection from ${source}`);
  
  try {
    // Salva il provider nella mappa
    if (window.__extensionEthereumHandlers && provider) {
      const providerId = provider.isMetaMask ? 'metamask' : 
                        provider.isCoinbaseWallet ? 'coinbase' : 
                        provider.isTrust ? 'trust' : 
                        `unknown-${Date.now()}`;
      
      window.__extensionEthereumHandlers.set(providerId, provider);
      console.log(`[ExtensionHandler] Provider ${providerId} registrato`);
    }

    // Se non c'è ethereum o è il primo provider, impostalo
    if (!window.ethereum || Object.keys(window.ethereum).length === 0) {
      try {
        Object.defineProperty(window, 'ethereum', {
          value: provider,
          writable: true,
          configurable: true,
          enumerable: true
        });
        console.log('[ExtensionHandler] ✅ Provider impostato come ethereum principale');
      } catch (error) {
        console.warn('[ExtensionHandler] Impossibile impostare provider:', error);
      }
    }

  } catch (error) {
    console.error('[ExtensionHandler] Errore gestione injection:', error);
  }
}

/**
 * Fornisce informazioni debug sui provider registrati
 */
export function getRegisteredProviders(): Record<string, any> {
  if (!window.__extensionEthereumHandlers) return {};
  
  const providers: Record<string, any> = {};
  window.__extensionEthereumHandlers.forEach((provider, id) => {
    providers[id] = {
      isMetaMask: provider.isMetaMask,
      isCoinbaseWallet: provider.isCoinbaseWallet,
      isTrust: provider.isTrust,
      chainId: provider.chainId,
      selectedAddress: provider.selectedAddress
    };
  });
  
  return providers;
}

/**
 * Reset completo in caso di problemi critici
 */
export function emergencyEthereumReset(): void {
  console.log('[AdvancedEthereumPrevention] 🚨 Esecuzione reset di emergenza...');
  
  try {
    // Controlla il descriptor attuale
    const currentDescriptor = Object.getOwnPropertyDescriptor(window, 'ethereum');
    
    if (currentDescriptor) {
      console.log('[EmergencyReset] Descriptor attuale:', {
        configurable: currentDescriptor.configurable,
        writable: currentDescriptor.writable,
        hasValue: 'value' in currentDescriptor
      });
      
      // Se la proprietà è configurabile, rimuovila completamente
      if (currentDescriptor.configurable) {
        try {
          delete (window as any).ethereum;
          console.log('[EmergencyReset] ✅ Proprietà ethereum cancellata');
        } catch (deleteError) {
          console.warn('[EmergencyReset] Impossibile cancellare ethereum:', deleteError);
        }
      } else {
        // Se non è configurabile, prova a sostituire il valore
        console.warn('[EmergencyReset] Proprietà ethereum non configurabile - tentativo sostituzione valore');
        
        if (currentDescriptor.writable || currentDescriptor.set) {
          try {
            window.ethereum = undefined;
            console.log('[EmergencyReset] ✅ Valore ethereum azzerato via assignment');
          } catch (assignError) {
            console.error('[EmergencyReset] Assignment fallito:', assignError);
            
            // Ultima risorsa: ridefinisci forzatamente se possibile
            try {
              Object.defineProperty(window, 'ethereum', {
                value: undefined,
                writable: true,
                configurable: true,
                enumerable: true
              });
              console.log('[EmergencyReset] ✅ Proprietà ethereum ridefinita forzatamente');
            } catch (forceError) {
              console.error('[EmergencyReset] Ridefinizione forzata fallita:', forceError);
            }
          }
        } else {
          console.warn('[EmergencyReset] Proprietà ethereum non modificabile - nessuna azione possibile');
        }
      }
    }

    // Pulisci handler registrati
    if (window.__extensionEthereumHandlers) {
      window.__extensionEthereumHandlers.clear();
      console.log('[EmergencyReset] ✅ Handler delle estensioni puliti');
    }

    // Se ethereum non esiste più, ricrea con configurazione sicura
    if (!Object.getOwnPropertyDescriptor(window, 'ethereum')) {
      try {
        Object.defineProperty(window, 'ethereum', {
          value: undefined,
          writable: true,
          configurable: true,
          enumerable: true
        });
        console.log('[EmergencyReset] ✅ Proprietà ethereum ricreata con configurazione sicura');
      } catch (recreateError) {
        console.error('[EmergencyReset] Impossibile ricreare ethereum:', recreateError);
      }
    }

    // Reset flag di inizializzazione per consentire re-inizializzazione
    isAdvancedInitialized = false;
    window.__ethereumConflictPrevented = false;

    console.log('[AdvancedEthereumPrevention] ✅ Reset di emergenza completato');
    
  } catch (error) {
    console.error('[AdvancedEthereumPrevention] ❌ Reset di emergenza fallito:', error);
    
    // Fallback: almeno pulisci gli handler
    try {
      if (window.__extensionEthereumHandlers) {
        window.__extensionEthereumHandlers.clear();
      }
      isAdvancedInitialized = false;
      window.__ethereumConflictPrevented = false;
      console.log('[AdvancedEthereumPrevention] ✅ Pulizia minima completata');
    } catch (fallbackError) {
      console.error('[AdvancedEthereumPrevention] ❌ Anche la pulizia minima è fallita:', fallbackError);
    }
  }
}

/**
 * Funzione di diagnostica per il debug
 */
export function diagnoseEthereumState(): {
  exists: boolean;
  descriptor: PropertyDescriptor | undefined;
  canDelete: boolean;
  canModify: boolean;
  providers: Record<string, any>;
} {
  const descriptor = Object.getOwnPropertyDescriptor(window, 'ethereum');
  
  return {
    exists: typeof window.ethereum !== 'undefined',
    descriptor,
    canDelete: descriptor?.configurable ?? false,
    canModify: descriptor?.writable || Boolean(descriptor?.set) || false,
    providers: getRegisteredProviders()
  };
}

// Auto-inizializzazione
if (typeof window !== 'undefined') {
  // Esegui subito
  advancedEthereumConflictPrevention();
  
  // Esegui anche al DOMContentLoaded per sicurezza
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', advancedEthereumConflictPrevention);
  }
}