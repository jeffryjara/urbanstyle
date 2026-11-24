import type { Product, AuditRecord, QueryResult } from '../types';

export interface SqlDatabaseState {
  products: Product[];
  auditRecords: AuditRecord[];
  auditLogs: {
    id: number;
    tabla: string;
    operacion: string;
    idRegistro: string;
    valorAnterior: string;
    valorNuevo: string;
    usuario: string;
    fecha: string;
  }[];
}

let subscribers: ((state: SqlDatabaseState) => void)[] = [];

export function subscribeToDatabase(cb: (state: SqlDatabaseState) => void) {
  subscribers.push(cb);
  return () => {
    subscribers = subscribers.filter(s => s !== cb);
  };
}

function notifySubscribers(state: SqlDatabaseState) {
  subscribers.forEach(cb => cb(state));
}

// In-memory persistent database store initialized from the application
let dbState: SqlDatabaseState = {
  products: [],
  auditRecords: [],
  auditLogs: [
    {
      id: 1,
      tabla: 'VarianteProducto',
      operacion: 'INSERT',
      idRegistro: 'US-1-40-1-1',
      valorAnterior: 'NULL',
      valorNuevo: 'Modelo=Runfalcon; Marca=Adidas; Precio=159.90; Stock=25',
      usuario: 'dbo_admin',
      fecha: new Date(Date.now() - 3600000 * 2).toISOString().replace('T', ' ').substring(0, 19),
    },
    {
      id: 2,
      tabla: 'VarianteProducto',
      operacion: 'UPDATE',
      idRegistro: 'US-2-41-2-2',
      valorAnterior: 'Precio=399.90; Stock=14',
      valorNuevo: 'Precio=399.90; Stock=18',
      usuario: 'sp_RegistrarCompra',
      fecha: new Date(Date.now() - 3600000).toISOString().replace('T', ' ').substring(0, 19),
    },
  ],
};

export function initSqlEngine(initialProducts: Product[], initialAudit: AuditRecord[]) {
  if (dbState.products.length === 0) {
    dbState.products = [...initialProducts];
    dbState.auditRecords = [...initialAudit];
  }
}

export function syncSqlEngineState(products: Product[], audit: AuditRecord[]) {
  dbState.products = [...products];
  dbState.auditRecords = [...audit];
}

export function executeSQL(rawQuery: string): QueryResult {
  const startTime = performance.now();
  const trimmed = rawQuery.trim();

  if (!trimmed) {
    return {
      columns: ['Resultado'],
      rows: [['Ingrese una consulta SQL para ejecutar']],
      rowCount: 0,
      executionTimeMs: 0,
      isError: true,
      message: 'Consulta vacía.',
    };
  }

  // Sanitize query lines and remove comments
  const lines = trimmed.split('\n')
    .map(l => l.replace(/--.*$/, '').trim())
    .filter(l => l.length > 0 && l !== 'GO' && l !== 'go');
  const query = lines.join(' ').replace(/;+$/, '').trim();
  const upper = query.toUpperCase();

  try {
    // 1. DELETE FROM Comprobante -> Inmutability Trigger Test
    if (upper.startsWith('DELETE FROM COMPROBANTE')) {
      return {
        columns: ['Error', 'Código', 'Trigger'],
        rows: [['Un comprobante emitido no se puede eliminar. Emita una nota de crédito.', '50001', 'TR_Comprobante_Inmutable']],
        rowCount: 1,
        executionTimeMs: Math.round(performance.now() - startTime),
        isError: true,
        message: 'ERROR 50001: Bloqueado por TR_Comprobante_Inmutable (Inmutabilidad SUNAT Ley 29733).',
        operation: 'DELETE',
      };
    }

    // 2. INSERT INTO VarianteProducto / Producto
    if (upper.startsWith('INSERT INTO')) {
      return handleInsert(query, startTime);
    }

    // 3. UPDATE VarianteProducto
    if (upper.startsWith('UPDATE')) {
      return handleUpdate(query, startTime);
    }

    // 4. DELETE FROM VarianteProducto
    if (upper.startsWith('DELETE FROM VARIANTEPRODUCTO') || upper.startsWith('DELETE FROM PRODUCTO')) {
      return handleDelete(query, startTime);
    }

    // 5. SELECT Queries
    if (upper.startsWith('SELECT')) {
      return handleSelect(query, startTime);
    }

    // 6. EXEC Stored Procedure
    if (upper.startsWith('EXEC') || upper.startsWith('EXECUTE')) {
      return handleExec(query, startTime);
    }

    // Fallback for generic DDL / USE
    if (upper.startsWith('USE') || upper.startsWith('SET') || upper.startsWith('CREATE')) {
      return {
        columns: ['Instrucción', 'Estado', 'Mensaje'],
        rows: [[query.substring(0, 40) + '...', 'Completado', 'Comando DDL ejecutado correctamente en el esquema en memoria']],
        rowCount: 1,
        executionTimeMs: Math.round(performance.now() - startTime),
        message: 'Comando ejecutado con éxito.',
        operation: 'OTHER',
      };
    }

    // Unknown command
    return {
      columns: ['Resultado'],
      rows: [[`Consulta ejecutada: "${query}"`]],
      rowCount: 1,
      executionTimeMs: Math.round(performance.now() - startTime),
      message: 'Comando procesado.',
      operation: 'OTHER',
    };
  } catch (err: any) {
    return {
      columns: ['Error', 'Detalle'],
      rows: [['Error de ejecución SQL', err?.message || String(err)]],
      rowCount: 1,
      executionTimeMs: Math.round(performance.now() - startTime),
      isError: true,
      message: err?.message || 'Error de sintaxis SQL.',
    };
  }
}

// -------------------------------------------------------------
// SELECT HANDLER
// -------------------------------------------------------------
function handleSelect(query: string, startTime: number): QueryResult {
  const upper = query.toUpperCase();

  // Check GROUP BY Brand (OLAP Aggregation)
  if (upper.includes('GROUP BY NOMBREMARCA') || upper.includes('GROUP BY MARCA')) {
    const brandMap = new Map<string, { count: number; stock: number; priceSum: number; valueSum: number }>();
    dbState.products.forEach(p => {
      const existing = brandMap.get(p.brand) || { count: 0, stock: 0, priceSum: 0, valueSum: 0 };
      existing.count += 1;
      existing.stock += p.stock;
      existing.priceSum += p.price;
      existing.valueSum += (p.stock * p.price);
      brandMap.set(p.brand, existing);
    });

    const columns = ['NombreMarca', 'TotalModelos', 'StockDisponible', 'PrecioPromedio', 'ValorTotal'];
    const rows = Array.from(brandMap.entries())
      .sort((a, b) => b[1].valueSum - a[1].valueSum)
      .map(([brand, data]) => [
        brand,
        data.count,
        `${data.stock} pares`,
        `S/ ${(data.priceSum / data.count).toFixed(2)}`,
        `S/ ${data.valueSum.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      ]);

    return {
      columns,
      rows,
      rowCount: rows.length,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
      operation: 'SELECT',
      message: `Agrupación analítica OLAP por marca: ${rows.length} marcas comerciales procesadas.`,
    };
  }

  // Check GROUP BY Channel (PySpark ETL Simulation)
  if (upper.includes('GROUP BY CANAL')) {
    const channelMap = new Map<string, { count: number; total: number }>();
    dbState.auditRecords.forEach(r => {
      const existing = channelMap.get(r.channel) || { count: 0, total: 0 };
      existing.count += 1;
      existing.total += r.total;
      channelMap.set(r.channel, existing);
    });

    const columns = ['Canal', 'TransaccionesTotales', 'IngresosBrutos', 'TicketPromedio'];
    const rows = Array.from(channelMap.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .map(([channel, data]) => [
        channel,
        data.count,
        `S/ ${data.total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `S/ ${(data.total / data.count).toFixed(2)}`,
      ]);

    return {
      columns,
      rows,
      rowCount: rows.length,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
      operation: 'SELECT',
      message: `Transformación PySpark ejecutada: ${rows.length} canales agregados con éxito.`,
    };
  }

  // Determine target table/view
  if (upper.includes('FROM VW_STOCKACTUAL') || upper.includes('FROM STOCK')) {
    const columns = ['IdVariante', 'SKU', 'NombreMarca', 'NombreModelo', 'Talla', 'Stock', 'StockMinimo', 'EstadoStock', 'Precio', 'Costo', 'ValorInventario'];
    const rows = dbState.products.map((p, idx) => {
      const estado = p.stock === 0 ? 'AGOTADO' : p.stock <= 3 ? 'BAJO' : 'NORMAL';
      const valor = Math.round(p.stock * (p.cost || p.price * 0.52) * 100) / 100;
      return [
        idx + 1,
        p.sku,
        p.brand,
        p.name,
        p.sizes.join(', '),
        p.stock,
        3,
        estado,
        `S/ ${p.price.toFixed(2)}`,
        `S/ ${(p.cost || p.price * 0.52).toFixed(2)}`,
        `S/ ${valor.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
      ];
    });

    return filterAndSort(columns, rows, query, startTime, 'SELECT');
  }

  if (upper.includes('FROM COMPROBANTE') || upper.includes('FROM VW_COMPROBANTERESUMEN')) {
    const columns = ['IdComprobante', 'NumeroComprobante', 'Tipo', 'Cliente', 'Canal', 'Fecha', 'Total', 'Estado'];
    const rows = dbState.auditRecords.map((r, idx) => [
      idx + 1,
      r.sunatNumber,
      r.type,
      r.client,
      r.channel,
      r.time,
      `S/ ${r.total.toFixed(2)}`,
      r.status,
    ]);

    return filterAndSort(columns, rows, query, startTime, 'SELECT');
  }

  if (upper.includes('FROM AUDITORIA') || upper.includes('FROM LOG')) {
    const columns = ['IdAuditoria', 'Tabla', 'Operacion', 'IdRegistro', 'ValorAnterior', 'ValorNuevo', 'Usuario', 'Fecha'];
    const rows = dbState.auditLogs.map(l => [
      l.id,
      l.tabla,
      l.operacion,
      l.idRegistro,
      l.valorAnterior,
      l.valorNuevo,
      l.usuario,
      l.fecha,
    ]);

    return filterAndSort(columns, rows, query, startTime, 'SELECT');
  }

  if (upper.includes('FROM DW.FACTVENTAS') || upper.includes('FROM FACTVENTAS') || upper.includes('FROM VW_VENTASDETALLADAS')) {
    const columns = ['SK_FactVenta', 'NumeroComprobante', 'Tipo', 'Canal', 'Cliente', 'TotalLinea', 'CostoTotal', 'UtilidadNeta', 'MargenPct'];
    const rows = dbState.auditRecords.map((r, idx) => {
      const costo = Math.round(r.total * 0.54 * 100) / 100;
      const utilidad = Math.round((r.total - costo) * 100) / 100;
      const margen = Math.round((utilidad / r.total) * 1000) / 10;
      return [
        idx + 1001,
        r.sunatNumber,
        r.type,
        r.channel,
        r.client,
        `S/ ${r.total.toFixed(2)}`,
        `S/ ${costo.toFixed(2)}`,
        `S/ ${utilidad.toFixed(2)}`,
        `${margen}%`,
      ];
    });

    return filterAndSort(columns, rows, query, startTime, 'SELECT');
  }

  if (upper.includes('FROM DW.FACTINVENTARIO') || upper.includes('FROM FACTINVENTARIO')) {
    const columns = ['SK_Tiempo', 'Producto', 'Marca', 'StockInicial', 'Entradas', 'Salidas', 'StockFinal', 'ValorInventario'];
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rows = dbState.products.map(p => {
      const valor = Math.round(p.stock * (p.cost || p.price * 0.5) * 100) / 100;
      return [
        today,
        p.name,
        p.brand,
        p.stock + 5,
        5,
        0,
        p.stock,
        `S/ ${valor.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
      ];
    });

    return filterAndSort(columns, rows, query, startTime, 'SELECT');
  }

  // Default: query on VarianteProducto
  const columns = ['Id', 'SKU', 'NombreModelo', 'Marca', 'Categoria', 'Precio', 'Stock', 'Tallas'];
  const rows = dbState.products.map((p, idx) => [
    idx + 1,
    p.sku,
    p.name,
    p.brand,
    p.category,
    `S/ ${p.price.toFixed(2)}`,
    p.stock,
    p.sizes.join(', '),
  ]);

  return filterAndSort(columns, rows, query, startTime, 'SELECT');
}

function filterAndSort(
  columns: string[],
  rows: (string | number | boolean | null)[][],
  query: string,
  startTime: number,
  operation: 'SELECT'
): QueryResult {
  let filtered = [...rows];
  const upper = query.toUpperCase();

  // Check WHERE filters for brand
  const brandMatches = ['ADIDAS', 'NIKE', 'PUMA', 'REEBOK', 'NEW BALANCE', 'VANS', 'CONVERSE'];
  for (const b of brandMatches) {
    if (upper.includes(`WHERE NOMBREMARCA = '${b}'`) || upper.includes(`WHERE MARCA = '${b}'`) || upper.includes(`='${b}'`)) {
      filtered = filtered.filter(row => row.some(cell => String(cell).toUpperCase() === b));
    }
  }

  // Check WHERE for Stock <= N or Stock < N
  const stockMatch = upper.match(/STOCK\s*(<=|<)\s*(\d+)/);
  if (stockMatch) {
    const op = stockMatch[1];
    const limit = parseInt(stockMatch[2], 10);
    const stockIdx = columns.findIndex(c => c.toLowerCase() === 'stock');
    if (stockIdx !== -1) {
      if (op === '<=') {
        filtered = filtered.filter(row => Number(row[stockIdx]) <= limit);
      } else {
        filtered = filtered.filter(row => Number(row[stockIdx]) < limit);
      }
    }
  }

  // Check TOP / LIMIT
  const topMatch = upper.match(/TOP\s+(\d+)/) || upper.match(/LIMIT\s+(\d+)/);
  if (topMatch) {
    const limit = parseInt(topMatch[1], 10);
    filtered = filtered.slice(0, limit);
  }

  return {
    columns,
    rows: filtered,
    rowCount: filtered.length,
    executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
    operation,
    message: `${filtered.length} filas recuperadas de la base de datos en tiempo real.`,
  };
}

// -------------------------------------------------------------
// INSERT HANDLER
// -------------------------------------------------------------
function handleInsert(query: string, startTime: number): QueryResult {
  // Try to parse values from INSERT statement:
  // e.g. INSERT INTO VarianteProducto (NombreModelo, NombreMarca, Categoria, Talla, Precio, Stock) VALUES ('Puma Nitro', 'Puma', 'Running', 41, 489.00, 15)
  const valuesMatch = query.match(/VALUES\s*\((.*?)\)/i);
  let name = 'Nuevo Calzado Urban Style';
  let brand: any = 'Adidas';
  let category = 'Urbana / Deportiva';
  let price = 299.90;
  let stock = 12;
  let sizes = [39, 40, 41, 42];

  if (valuesMatch && valuesMatch[1]) {
    const rawArgs = valuesMatch[1].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
    if (rawArgs.length >= 1 && isNaN(Number(rawArgs[0]))) name = rawArgs[0];
    if (rawArgs.length >= 2) {
      const b = rawArgs[1];
      if (['Adidas', 'Nike', 'Puma', 'Reebok', 'New Balance', 'Vans', 'Converse'].includes(b)) {
        brand = b;
      }
    }
    // Search for price (float) and stock (integer) in parsed args
    for (const arg of rawArgs) {
      const num = parseFloat(arg);
      if (!isNaN(num)) {
        if (num > 50 && num < 2000 && price === 299.90) price = num;
        else if (num > 0 && num <= 50 && stock === 12) stock = Math.round(num);
      }
    }
  }

  const newSku = `US-${Math.floor(Math.random() * 80) + 20}-40-1-${dbState.products.length + 1}`;
  const brandImages: Record<string, string> = {
    Adidas: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=800&q=80',
    Nike: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    Puma: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
    Reebok: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
    'New Balance': 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80',
    Vans: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
    Converse: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=800&q=80',
  };

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    name,
    brand,
    category,
    sku: newSku,
    price,
    cost: Math.round(price * 0.5 * 100) / 100,
    stock,
    sizes,
    image: brandImages[brand] || brandImages.Adidas,
    isNew: true,
  };

  // Mutate database state
  dbState.products = [newProduct, ...dbState.products];

  // Log in Auditoria
  dbState.auditLogs.unshift({
    id: dbState.auditLogs.length + 1,
    tabla: 'VarianteProducto',
    operacion: 'INSERT',
    idRegistro: newSku,
    valorAnterior: 'NULL',
    valorNuevo: `Modelo=${name}; Marca=${brand}; Precio=${price}; Stock=${stock}`,
    usuario: 'SQL_Studio_User',
    fecha: new Date().toISOString().replace('T', ' ').substring(0, 19),
  });

  notifySubscribers(dbState);

  return {
    columns: ['Id', 'SKU', 'NombreModelo', 'Marca', 'Precio', 'Stock', 'Impacto En Vivo'],
    rows: [[
      dbState.products.length,
      newSku,
      name,
      brand,
      `S/ ${price.toFixed(2)}`,
      stock,
      'Sincronizado al instante con Terminal POS e Inventario',
    ]],
    rowCount: 1,
    affectedRows: 1,
    executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
    operation: 'INSERT',
    message: `1 fila insertada en VarianteProducto. El producto "${name}" se reflejó automáticamente en la Terminal POS y en el Inventario.`,
  };
}

// -------------------------------------------------------------
// UPDATE HANDLER
// -------------------------------------------------------------
function handleUpdate(query: string, startTime: number): QueryResult {
  const upper = query.toUpperCase();
  let affected = 0;

  // Stock increment (e.g. SET Stock = Stock + 10)
  const stockAddMatch = upper.match(/STOCK\s*=\s*STOCK\s*\+\s*(\d+)/);
  // Specific stock value (e.g. SET Stock = 20)
  const stockSetMatch = upper.match(/STOCK\s*=\s*(\d+)/);
  // Specific price value (e.g. SET Precio = 199.90)
  const priceSetMatch = upper.match(/PRECIO\s*=\s*([\d.]+)/);

  // Filter criteria: brand or model
  let targetBrand: string | null = null;
  for (const b of ['ADIDAS', 'NIKE', 'PUMA', 'REEBOK', 'NEW BALANCE', 'VANS', 'CONVERSE']) {
    if (upper.includes(`'${b}'`)) {
      targetBrand = b;
      break;
    }
  }

  dbState.products = dbState.products.map(p => {
    let matches = true;
    if (targetBrand && p.brand.toUpperCase() !== targetBrand) matches = false;

    if (matches) {
      affected++;
      let updatedStock = p.stock;
      let updatedPrice = p.price;

      if (stockAddMatch) {
        updatedStock += parseInt(stockAddMatch[1], 10);
      } else if (stockSetMatch) {
        updatedStock = parseInt(stockSetMatch[1], 10);
      }

      if (priceSetMatch) {
        updatedPrice = parseFloat(priceSetMatch[1]);
      }

      return {
        ...p,
        stock: updatedStock,
        price: updatedPrice,
      };
    }
    return p;
  });

  if (affected > 0) {
    dbState.auditLogs.unshift({
      id: dbState.auditLogs.length + 1,
      tabla: 'VarianteProducto',
      operacion: 'UPDATE',
      idRegistro: targetBrand ? `Marca=${targetBrand}` : 'LoteGlobal',
      valorAnterior: 'Stock/Precio previo',
      valorNuevo: `Actualización ejecutada por consola SQL sobre ${affected} registros`,
      usuario: 'SQL_Studio_User',
      fecha: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });

    notifySubscribers(dbState);
  }

  return {
    columns: ['Operación', 'Registros Afectados', 'Estado', 'Sincronización'],
    rows: [['UPDATE', affected, 'EXITOSO', 'Actualizado en tiempo real en Inventario y POS']],
    rowCount: 1,
    affectedRows: affected,
    executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
    operation: 'UPDATE',
    message: `${affected} variantes actualizadas en VarianteProducto. Los cambios ya son visibles en toda la web.`,
  };
}

// -------------------------------------------------------------
// DELETE HANDLER
// -------------------------------------------------------------
function handleDelete(query: string, startTime: number): QueryResult {
  const upper = query.toUpperCase();
  const prevCount = dbState.products.length;

  let targetBrand: string | null = null;
  for (const b of ['ADIDAS', 'NIKE', 'PUMA', 'REEBOK', 'NEW BALANCE', 'VANS', 'CONVERSE']) {
    if (upper.includes(`'${b}'`)) {
      targetBrand = b;
      break;
    }
  }

  if (targetBrand) {
    dbState.products = dbState.products.filter(p => p.brand.toUpperCase() !== targetBrand);
  } else {
    // Delete oldest item
    dbState.products = dbState.products.slice(0, dbState.products.length - 1);
  }

  const deleted = prevCount - dbState.products.length;
  if (deleted > 0) {
    notifySubscribers(dbState);
  }

  return {
    columns: ['Operación', 'Filas Eliminadas', 'Estado'],
    rows: [['DELETE', deleted, 'Registro eliminado del catálogo en vivo']],
    rowCount: 1,
    affectedRows: deleted,
    executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
    operation: 'DELETE',
    message: `${deleted} registros eliminados de VarianteProducto.`,
  };
}

// -------------------------------------------------------------
// EXEC HANDLER
// -------------------------------------------------------------
function handleExec(query: string, startTime: number): QueryResult {
  const upper = query.toUpperCase();

  // sp_RegistrarVenta - Transactional ACID procedure with stock deduction & live sync
  if (upper.includes('SP_REGISTRARVENTA') || upper.includes('REGISTRARVENTA')) {
    const prod = dbState.products[0];
    const qty = 2;
    if (prod) {
      prod.stock = Math.max(0, prod.stock - qty);
    }
    const modelName = prod ? prod.name : 'Adidas Runfalcon';
    const brandName = prod ? prod.brand : 'Adidas';
    const unitPrice = prod ? prod.price : 159.90;
    const totalAmount = Math.round(unitPrice * qty * 100) / 100;
    const ticketNum = `B001-${String(Math.floor(Math.random() * 800) + 120).padStart(8, '0')}`;

    const newRecord: AuditRecord = {
      id: `TR-${Math.floor(Math.random() * 800) + 9500}`,
      time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      client: 'Estudiante / Demostración Docente',
      channel: 'Tienda física',
      payment: 'Efectivo',
      total: totalAmount,
      sunatNumber: ticketNum,
      type: 'Boleta',
      status: 'Procesado',
    };

    dbState.auditRecords = [newRecord, ...dbState.auditRecords];

    dbState.auditLogs.unshift({
      id: dbState.auditLogs.length + 1,
      tabla: 'Comprobante',
      operacion: 'INSERT',
      idRegistro: ticketNum,
      valorAnterior: 'NULL',
      valorNuevo: `Cliente=Demostracion Docente; Total=${totalAmount}; StockRestante=${prod ? prod.stock : 0}`,
      usuario: 'dbo_sp_RegistrarVenta',
      fecha: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });

    notifySubscribers(dbState);

    return {
      columns: ['Comprobante', 'Fecha / Hora', 'Cliente', 'Producto', 'Cantidad', 'Total Venta', 'Stock Restante', 'Transacción ACID'],
      rows: [[
        ticketNum,
        newRecord.time,
        newRecord.client,
        `${brandName} ${modelName}`,
        `${qty} pares`,
        `S/ ${totalAmount.toFixed(2)}`,
        `${prod ? prod.stock : 0} pares disp.`,
        'COMMIT TRANSACTION (Exitoso)',
      ]],
      rowCount: 1,
      affectedRows: 1,
      executionTimeMs: Math.max(2, Math.round(performance.now() - startTime)),
      operation: 'EXEC',
      message: `sp_RegistrarVenta ejecutado con éxito bajo control de transacción ACID. Se emitio ${ticketNum} y se descontaron ${qty} pares de ${modelName}. Sincronizado en tiempo real con POS e Inventario.`,
    };
  }

  if (upper.includes('SP_ETL_') || upper.includes('ETL')) {
    return {
      columns: ['Procedimiento', 'Estado', 'FilasCargadas', 'TiempoEjecución'],
      rows: [
        ['dw.sp_ETL_CargarDimensionesSimples', 'EXITOSO', 4, '0.32s'],
        ['dw.sp_ETL_CargarDimCliente', 'EXITOSO', 12, '0.41s'],
        ['dw.sp_ETL_CargarDimProducto', 'EXITOSO', 28, '0.55s'],
        ['dw.sp_ETL_CargarFactVentas', 'EXITOSO', dbState.auditRecords.length, '0.84s'],
        ['dw.sp_ETL_CargarFactInventario', 'EXITOSO', dbState.products.length, '0.28s'],
      ],
      rowCount: 5,
      executionTimeMs: Math.max(2, Math.round(performance.now() - startTime)),
      operation: 'EXEC',
      message: 'Pipeline ETL de Kimball ejecutado con éxito en UrbanStylosDW.',
    };
  }

  if (upper.includes('SP_REPORTEVENTAS') || upper.includes('REPORTE')) {
    return {
      columns: ['CanalVenta', 'ParesVendidos', 'VentasBrutas', 'DescuentoPromo', 'UtilidadNeta', 'MargenPct'],
      rows: [
        ['Tienda física', 41, 'S/ 4,408.35', 'S/ 249.90', 'S/ 1,842.20', '41.8%'],
        ['TikTok', 18, 'S/ 1,889.25', 'S/ 159.90', 'S/ 798.10', '42.2%'],
        ['WhatsApp', 17, 'S/ 1,819.25', 'S/ 0.00', 'S/ 812.40', '44.6%'],
        ['Web', 16, 'S/ 1,779.25', 'S/ 23.99', 'S/ 745.30', '41.9%'],
        ['Facebook', 15, 'S/ 1,679.25', 'S/ 0.00', 'S/ 710.00', '42.3%'],
        ['Instagram', 14, 'S/ 1,609.25', 'S/ 183.89', 'S/ 689.50', '42.8%'],
      ],
      rowCount: 6,
      executionTimeMs: Math.max(2, Math.round(performance.now() - startTime)),
      operation: 'EXEC',
      message: 'Reporte de ventas omnicanal consolidado generado por sp_ReporteVentas.',
    };
  }

  return {
    columns: ['Procedimiento', 'Estado', 'Mensaje'],
    rows: [[query.replace(/^EXEC\s+/i, '').substring(0, 35), 'EXITOSO', 'Procedimiento ejecutado satisfactoriamente']],
    rowCount: 1,
    executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
    operation: 'EXEC',
    message: 'Procedimiento almacenado ejecutado correctamente.',
  };
}
