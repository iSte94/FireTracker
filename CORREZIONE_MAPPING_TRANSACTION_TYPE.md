# Correzione Mapping Campo transaction_type

## Problema Identificato
Il database utilizza lo schema "investment" che richiede il campo `transaction_type`, ma il codice applicativo mappava il campo come `type`. Quando il client inviava `{type: "buy"}`, il database si aspettava `{transaction_type: "buy"}`, causando violazioni del constraint NOT NULL.

## Correzioni Implementate

### 1. Metodo `createTransaction` (linee 218-231)
**PRIMA:**
```typescript
const dbTransaction = {
  user_id: user.id,
  date: transaction.date,
  type: transaction.type,  // ❌ Campo errato
  // ... altri campi
}
```

**DOPO:**
```typescript
const dbTransaction = {
  user_id: user.id,
  date: transaction.date,
  transaction_type: transaction.type,  // ✅ Campo corretto
  // ... altri campi
}
```

### 2. Metodo `updateTransaction` (linea 324)
**PRIMA:**
```typescript
if (transaction.transaction_type !== undefined) dbUpdate.type = transaction.transaction_type
```

**DOPO:**
```typescript
if (transaction.transaction_type !== undefined) dbUpdate.transaction_type = transaction.transaction_type
```

### 3. Mapping di lettura in `getTransactions` (linea 150)
**PRIMA:**
```typescript
transaction_type: item.type,  // ❌ Leggeva dal campo errato
```

**DOPO:**
```typescript
transaction_type: item.transaction_type,  // ✅ Legge dal campo corretto
```

### 4. Mapping di lettura in `createTransaction` e `updateTransaction`
Aggiornato il mapping di ritorno per leggere correttamente dal campo `transaction_type` del database.

### 5. Test di schema aggiornato (linea 769)
Aggiornata la query di test per verificare il campo `transaction_type` invece di `type`.

## Compatibilità Mantenuta
- Il frontend continua a usare il campo `type` nei suoi dati
- Il mapping avviene automaticamente nel client
- Nessuna modifica richiesta ai componenti frontend esistenti

## Test di Verifica
```javascript
// Dati frontend (formato originale):
const frontendData = { type: 'buy' }

// Dati database (dopo mapping corretto):
const dbData = { transaction_type: 'buy' }
```

## Risultato
✅ Le transazioni finanziarie ora possono essere create correttamente senza violare il constraint NOT NULL su `transaction_type`.

## File Modificato
- `lib/financial-transactions-client.ts`

## Data Implementazione
23/05/2025, 15:00 (Europe/Rome)