/**
 * Prevenzione Ultra-Precoce dei Conflitti Ethereum
 * Specificatamente progettata per bloccare evmAsk.js e script simili
 * DEVE essere caricata PRIMA di qualsiasi altro script
 */

// Flag globale per evitare doppie inizializzazioni
if (!(globalThis as any).__ethereumEarlyPrevention) {
  (globalThis as any).__ethereumEarlyPrevention = true;

  // 1. BACKUP DEL DEFINEPROPERTY ORIGINALE
  const originalDefineProperty = Object.defineProperty;
  const originalGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  
  // 2. TRACCIAMENTO TENTATIVI DI RIDEFINIZIONE
  let redirectionAttempts = 0;
  const suspiciousScripts: string[] = [];

  // 3. INTERCEPTOR AVANZATO PER DEFINEPROPERTY
  Object.defineProperty = function(obj: any, prop: string | symbol, descriptor: PropertyDescriptor): any {
    // Intercetta SOLO i tentativi su window.ethereum
    if (obj === globalThis && prop === 'ethereum') {
      redirectionAttempts++;
      
      // Ottieni stack trace per identificare la fonte
      const stack = new Error().stack || '';
      const isEvmAsk = stack.includes('evmAsk') || 
                      stack.includes('evm-ask') || 
                      stack.includes('extension') ||
                      stack.toLowerCase().includes('chrome-extension://');
      
      if (isEvmAsk) {
        suspiciousScripts.push(stack.split('\n')[2] || 'unknown');
        console.warn(`[EthereumEarlyPrevention] 🚫 BLOCCATO tentativo evmAsk.js #${redirectionAttempts}`);
        console.trace('Stack trace del tentativo bloccato:');
      }

      const currentDescriptor = originalGetOwnPropertyDescriptor.call(Object, obj, prop);
      
      // Se la proprietà esiste già e non è configurabile, gestisci il conflitto
      if (currentDescriptor && !currentDescriptor.configurable) {
        console.warn(`[EthereumEarlyPrevention] ⚠️ Tentativo di ridefinizione proprietà non-configurabile`);
        
        // Invece di lanciare errore, modifica silenziosamente il valore se possibile
        if (currentDescriptor.writable || currentDescriptor.set) {
          try {
            if (currentDescriptor.set) {
              currentDescriptor.set.call(obj, descriptor.value);
            } else {
              (obj as any)[prop] = descriptor.value;
            }
            console.log(`[EthereumEarlyPrevention] ✅ Valore ethereum aggiornato via assignment`);
            return obj;
          } catch (assignError) {
            console.warn(`[EthereumEarlyPrevention] Assignment fallito:`, assignError);
          }
        }
        
        // Se non modificabile, ignora silenziosamente invece di lanciare errore
        console.warn(`[EthereumEarlyPrevention] 🔕 Tentativo ignorato - proprietà immutabile`);
        return obj;
      }

      // Per nuove definizioni o proprietà configurabili, forza sempre la configurabilità
      const safeDescriptor = {
        ...descriptor,
        configurable: true,
        writable: descriptor.writable !== false
      };

      console.log(`[EthereumEarlyPrevention] ✅ Definizione ethereum sicura applicata`);
      return originalDefineProperty.call(this, obj, prop, safeDescriptor);
    }

    // Per tutte le altre proprietà, comportamento normale
    return originalDefineProperty.call(this, obj, prop, descriptor);
  };

  // 4. PREVENZIONE PROATTIVA: Crea ethereum configurabile se non esiste
  const setupConfigurableEthereum = () => {
    if (typeof (globalThis as any).ethereum === 'undefined') {
      console.log('[EthereumEarlyPrevention] 🛡️ Creazione ethereum configurabile proattiva');
      
      try {
        originalDefineProperty.call(Object, globalThis, 'ethereum', {
          value: undefined,
          writable: true,
          configurable: true,
          enumerable: true
        });
      } catch (error) {
        console.warn('[EthereumEarlyPrevention] Impossibile creare ethereum proattivo:', error);
      }
    }
  };

  // 5. MONITORING DEGLI SCRIPT CARICATI
  const monitorScriptLoading = () => {
    // Osserva nuovi script aggiunti al DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.tagName === 'SCRIPT') {
              const script = element as HTMLScriptElement;
              if (script.src && (script.src.includes('evmAsk') || script.src.includes('evm-ask'))) {
                console.warn('[EthereumEarlyPrevention] 🚨 Script evmAsk rilevato:', script.src);
                
                // Blocca il caricamento se possibile
                script.onload = script.onerror = (e) => {
                  console.log('[EthereumEarlyPrevention] Script evmAsk caricato - controllo ethereum...');
                  setTimeout(validateEthereumState, 100);
                };
              }
            }
          }
        });
      });
    });

    if (typeof document !== 'undefined' && document.documentElement) {
      observer.observe(document.documentElement, { 
        childList: true, 
        subtree: true 
      });
    }

    return observer;
  };

  // 6. VALIDAZIONE STATO ETHEREUM
  const validateEthereumState = () => {
    const descriptor = originalGetOwnPropertyDescriptor.call(Object, globalThis, 'ethereum');
    
    if (descriptor && !descriptor.configurable) {
      console.warn('[EthereumEarlyPrevention] ⚠️ Ethereum diventa non-configurabile - possibile conflitto');
      
      // Tenta un fix immediato
      try {
        if (descriptor.writable) {
          (globalThis as any).ethereum = undefined;
          
          // Ricrea come configurabile
          originalDefineProperty.call(Object, globalThis, 'ethereum', {
            value: undefined,
            writable: true,
            configurable: true,
            enumerable: true
          });
          
          console.log('[EthereumEarlyPrevention] ✅ Fix automatico applicato');
        }
      } catch (fixError) {
        console.error('[EthereumEarlyPrevention] Fix automatico fallito:', fixError);
      }
    }
  };

  // 7. EMERGENCY RESET FUNCTION
  (globalThis as any).emergencyEthereumEarlyReset = () => {
    console.log('[EthereumEarlyPrevention] 🚨 Emergency reset attivato');
    
    try {
      const descriptor = originalGetOwnPropertyDescriptor.call(Object, globalThis, 'ethereum');
      
      if (descriptor) {
        if (descriptor.configurable) {
          delete (globalThis as any).ethereum;
        } else if (descriptor.writable) {
          (globalThis as any).ethereum = undefined;
        }
      }
      
      // Ricrea sempre come configurabile
      originalDefineProperty.call(Object, globalThis, 'ethereum', {
        value: undefined,
        writable: true,
        configurable: true,
        enumerable: true
      });
      
      console.log('[EthereumEarlyPrevention] ✅ Emergency reset completato');
      location.reload();
      
    } catch (error) {
      console.error('[EthereumEarlyPrevention] Emergency reset fallito:', error);
    }
  };

  // 8. DEBUG INFO FUNCTION
  (globalThis as any).ethereumEarlyDebugInfo = () => {
    const descriptor = originalGetOwnPropertyDescriptor.call(Object, globalThis, 'ethereum');
    
    return {
      redirectionAttempts,
      suspiciousScripts,
      currentDescriptor: descriptor,
      ethereumExists: typeof (globalThis as any).ethereum !== 'undefined',
      ethereumValue: (globalThis as any).ethereum,
      timestamp: new Date().toISOString()
    };
  };

  // 9. INIZIALIZZAZIONE
  const initialize = () => {
    console.log('[EthereumEarlyPrevention] 🚀 Inizializzazione prevenzione ultra-precoce');
    
    setupConfigurableEthereum();
    
    if (typeof document !== 'undefined') {
      monitorScriptLoading();
      
      // Controlla periodicamente lo stato
      setInterval(validateEthereumState, 5000);
    }
    
    console.log('[EthereumEarlyPrevention] ✅ Prevenzione ultra-precoce attiva');
  };

  // Inizializza immediatamente
  initialize();

  // Export delle funzioni per l'uso esterno
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      emergencyEthereumEarlyReset: (globalThis as any).emergencyEthereumEarlyReset,
      ethereumEarlyDebugInfo: (globalThis as any).ethereumEarlyDebugInfo
    };
  }
}

export {};