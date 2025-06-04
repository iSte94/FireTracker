/**
 * Modulo per prevenire il conflitto "Cannot redefine property: ethereum"
 * Questo modulo deve essere caricato prima di qualsiasi altro script che potrebbe
 * tentare di definire window.ethereum
 */

declare global {
  interface Window {
    ethereum?: any;
    __ethereumConflictPrevented?: boolean;
  }
}

// Flag per evitare inizializzazione multipla
let isInitialized = false;

/**
 * Previene il conflitto window.ethereum creando un descriptor configurabile
 * se la proprietà non esiste ancora
 */
export function preventEthereumConflict(): void {
  // Solo nel browser
  if (typeof window === 'undefined') return;
  
  // Evita doppia inizializzazione
  if (isInitialized || window.__ethereumConflictPrevented) {
    console.log('[EthereumConflictPrevention] Già inizializzato, skip');
    return;
  }

  console.log('[EthereumConflictPrevention] Inizializzazione prevenzione conflitto...');

  try {
    // Controlla se window.ethereum esiste già
    const currentDescriptor = Object.getOwnPropertyDescriptor(window, 'ethereum');
    
    if (currentDescriptor) {
      console.log('[EthereumConflictPrevention] window.ethereum già presente:', {
        writable: currentDescriptor.writable,
        configurable: currentDescriptor.configurable,
        value: typeof window.ethereum
      });
      
      // Se non è configurabile, potrebbe causare problemi
      if (!currentDescriptor.configurable) {
        console.warn('[EthereumConflictPrevention] window.ethereum non configurabile - possibili conflitti');
      }
    } else {
      // Crea un placeholder configurabile per window.ethereum
      Object.defineProperty(window, 'ethereum', {
        value: undefined,
        writable: true,
        configurable: true,
        enumerable: false
      });
      
      console.log('[EthereumConflictPrevention] Placeholder window.ethereum creato');
    }

    // Intercetta future ridefinizioni
    interceptEthereumRedefinition();
    
    // Marca come inizializzato
    isInitialized = true;
    window.__ethereumConflictPrevented = true;
    
    console.log('[EthereumConflictPrevention] ✅ Prevenzione conflitto attivata');
    
  } catch (error) {
    console.error('[EthereumConflictPrevention] ❌ Errore durante inizializzazione:', error);
  }
}

/**
 * Intercetta tentativi di ridefinizione di window.ethereum
 * per prevenire conflitti e fornire logging dettagliato
 */
function interceptEthereumRedefinition(): void {
  const originalDefineProperty = Object.defineProperty;
  
  Object.defineProperty = function(obj: any, prop: string | symbol, descriptor: PropertyDescriptor): any {
    // Intercetta solo ridefinizioni di window.ethereum
    if (obj === window && prop === 'ethereum') {
      console.log('[EthereumConflictPrevention] Tentativo di ridefinizione window.ethereum intercettato');
      
      const currentDescriptor = Object.getOwnPropertyDescriptor(window, 'ethereum');
      
      if (currentDescriptor && !currentDescriptor.configurable) {
        console.error('[EthereumConflictPrevention] ❌ Tentativo di ridefinire proprietà non configurabile');
        
        // Log stack trace per debug
        console.trace('Stack trace della ridefinizione bloccata:');
        
        // Ritorna l'oggetto senza errore invece di lanciare eccezione
        return obj;
      }
      
      // Se la proprietà è configurabile o non esiste, consenti la ridefinizione
      console.log('[EthereumConflictPrevention] ✅ Ridefinizione window.ethereum consentita');
    }
    
    return originalDefineProperty.apply(this, [obj, prop, descriptor]);
  };
}

/**
 * Monitora lo stato di window.ethereum per debug
 */
export function debugEthereumState(): void {
  if (typeof window === 'undefined') return;
  
  console.log('[EthereumConflictPrevention] Stato window.ethereum:');
  console.log('- Exists:', typeof window.ethereum !== 'undefined');
  console.log('- Value:', window.ethereum);
  console.log('- Type:', typeof window.ethereum);
  
  const descriptor = Object.getOwnPropertyDescriptor(window, 'ethereum');
  if (descriptor) {
    console.log('- Descriptor:', {
      writable: descriptor.writable,
      configurable: descriptor.configurable,
      enumerable: descriptor.enumerable,
      hasValue: 'value' in descriptor,
      hasGetter: 'get' in descriptor
    });
  } else {
    console.log('- Descriptor: non trovato');
  }
  
  // Controlla per estensioni comuni
  if (window.ethereum) {
    console.log('- MetaMask detected:', Boolean(window.ethereum.isMetaMask));
    console.log('- Coinbase detected:', Boolean(window.ethereum.isCoinbaseWallet));
    console.log('- Trust Wallet detected:', Boolean(window.ethereum.isTrust));
  }
}

/**
 * Applica una soluzione di emergenza se il conflitto è già avvenuto
 */
export function emergencyEthereumFix(): void {
  if (typeof window === 'undefined') return;
  
  console.log('[EthereumConflictPrevention] Applicazione fix di emergenza...');
  
  try {
    // Prova a rimuovere la proprietà se possibile
    if (window.hasOwnProperty('ethereum')) {
      delete (window as any).ethereum;
      console.log('[EthereumConflictPrevention] Proprietà ethereum rimossa');
    }
    
    // Ricrea con configurazione sicura
    preventEthereumConflict();
    
  } catch (error) {
    console.error('[EthereumConflictPrevention] ❌ Fix di emergenza fallito:', error);
  }
}

// Auto-inizializzazione se nel browser
if (typeof window !== 'undefined') {
  // Esegui immediatamente
  preventEthereumConflict();
  
  // Esegui anche al DOMContentLoaded per sicurezza
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preventEthereumConflict);
  }
}