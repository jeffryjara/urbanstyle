import type { Product, AuditRecord, QueryResult, UserAccount } from '../types';
import { INITIAL_USERS } from '../data/initialData';

export interface SqlRoleRecord {
  idRol: number;
  nombreRol: string;
  descripcion: string;
  nivelAcceso: string;
}

export interface SqlUserRecord {
  idUsuario: number;
  idEmpleado: number;
  empleado: string;
  dni: string;
  nombreUsuario: string;
  correo: string;
  clavePlana: string;
  salt: string;
  claveHash: string;
  idRol: number;
  rol: string;
  activo: boolean;
}

export interface SqlDatabaseState {
  products: Product[];
  auditRecords: AuditRecord[];
  roles: SqlRoleRecord[];
  usuarios: SqlUserRecord[];
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

// Deterministic simulated SHA-256 hex generator for SQL HASHBYTES('SHA2_256', @Clave + @Salt)
function computeSimulatedSha256(input: string): string {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0, ch; i < input.length; i++) {
    ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).toUpperCase().padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).toUpperCase().padStart(8, '0');
  return `0x${part1}${part2}92A4B1E7D056C912F4E8A3B7`;
}

// In-memory persistent database store initialized from the application
let dbState: SqlDatabaseState = {
  products: [],
  auditRecords: [],
  roles: [
    {
      idRol: 1,
      nombreRol: 'Gerencia',
      descripcion: 'Acceso total a Dashboard BI, Inventario, Auditoría y SQL Studio',
      nivelAcceso: 'Nivel 1 (Total - DDL/DML/OLAP)',
    },
    {
      idRol: 2,
      nombreRol: 'Ventas',
      descripcion: 'Acceso operativo a Catálogo POS, emisión SUNAT y Mis Ventas',
      nivelAcceso: 'Nivel 2 (Operativo POS - Principio de Menor Privilegio)',
    },
  ],
  usuarios: [
    {
      idUsuario: 1,
      idEmpleado: 1,
      empleado: 'Idelfonso Ayala',
      dni: '42891023',
      nombreUsuario: 'iayala',
      correo: 'gerencia@urbanstyle.pe',
      clavePlana: 'Gerencia2026',
      salt: 'E4A9F102-8B7C-4D3E-9A1B-0F2C8E6D4A11',
      claveHash: computeSimulatedSha256('Gerencia2026E4A9F102-8B7C-4D3E-9A1B-0F2C8E6D4A11'),
      idRol: 1,
      rol: 'Gerencia',
      activo: true,
    },
    {
      idUsuario: 2,
      idEmpleado: 2,
      empleado: 'Ana Quispe',
      dni: '11111111',
      nombreUsuario: 'aquispe',
      correo: 'ventas@urbanstyle.pe',
      clavePlana: 'Ventas2026',
      salt: 'B7C2D841-3F9A-4E1C-8D2B-5A7F9C1E3B22',
      claveHash: computeSimulatedSha256('Ventas2026B7C2D841-3F9A-4E1C-8D2B-5A7F9C1E3B22'),
      idRol: 2,
      rol: 'Ventas',
      activo: true,
    },
  ],
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
      valorAnterior: 'Precio=329.90; Stock=14',
      valorNuevo: 'Precio=329.90; Stock=18',
      usuario: 'sp_RegistrarCompra',
      fecha: new Date(Date.now() - 3600000).toISOString().replace('T', ' ').substring(0, 19),
    },
  ],
};

/**
 * Ejecuta el procedimiento almacenado dbo.usp_ValidarLogin desde el formulario de Login
 * verificando el Salt UNIQUEIDENTIFIER, el HASHBYTES('SHA2_256') y registrando el evento en dbo.Auditoria.
 */
export function executeSqlLogin(
  userOrEmail: string,
  plainPassword: string
): {
  success: boolean;
  errorType?: 'NOT_FOUND' | 'INACTIVE' | 'WRONG_PASSWORD';
  errorMessage?: string;
  userAccount?: UserAccount;
  sqlTrace?: string;
} {
  const cleanUser = userOrEmail.trim().toLowerCase();
  const userRow = dbState.usuarios.find(
    u => u.correo.toLowerCase() === cleanUser || u.nombreUsuario.toLowerCase() === cleanUser
  );

  if (!userRow) {
    dbState.auditLogs.unshift({
      id: dbState.auditLogs.length + 1,
      tabla: 'Usuario',
      operacion: 'LOGIN_FAIL',
      idRegistro: cleanUser,
      valorAnterior: 'NULL',
      valorNuevo: 'RAISERROR: El usuario o correo no existe en dbo.Usuario',
      usuario: 'dbo.usp_ValidarLogin',
      fecha: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });
    return {
      success: false,
      errorType: 'NOT_FOUND',
      errorMessage: 'Cuenta no registrada en dbo.Usuario',
    };
  }

  if (!userRow.activo) {
    return {
      success: false,
      errorType: 'INACTIVE',
      errorMessage: 'Usuario inactivo (Activo = 0)',
    };
  }

  const computedHash = computeSimulatedSha256(plainPassword + userRow.salt);
  if (computedHash !== userRow.claveHash) {
    dbState.auditLogs.unshift({
      id: dbState.auditLogs.length + 1,
      tabla: 'Usuario',
      operacion: 'LOGIN_FAIL',
      idRegistro: `IdUsuario=${userRow.idUsuario}`,
      valorAnterior: `HashEsperado=${userRow.claveHash.slice(0, 14)}...`,
      valorNuevo: `HashCalculado=${computedHash.slice(0, 14)}... (Mismatch SHA-256)`,
      usuario: 'dbo.usp_ValidarLogin',
      fecha: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });
    return {
      success: false,
      errorType: 'WRONG_PASSWORD',
      errorMessage: 'HASHBYTES(SHA2_256) no coincide con ClaveHash',
    };
  }

  // Register successful login in dbo.Auditoria
  dbState.auditLogs.unshift({
    id: dbState.auditLogs.length + 1,
    tabla: 'Usuario',
    operacion: 'LOGIN_AUTH',
    idRegistro: `IdUsuario=${userRow.idUsuario} (${userRow.rol})`,
    valorAnterior: `Salt=${userRow.salt.slice(0, 8)}...`,
    valorNuevo: `SHA-256 Verificado (${userRow.claveHash.slice(0, 14)}...) | INNER JOIN Rol=${userRow.rol}`,
    usuario: 'dbo.usp_ValidarLogin',
    fecha: new Date().toISOString().replace('T', ' ').substring(0, 19),
  });

  notifySubscribers(dbState);

  const baseAccount =
    userRow.idRol === 1
      ? INITIAL_USERS.gerencia
      : INITIAL_USERS.ventas;

  const userAccount: UserAccount = {
    ...baseAccount,
    role: userRow.idRol === 1 ? 'gerencia' : 'ventas',
    name: userRow.empleado,
    email: userRow.correo,
    password: userRow.clavePlana,
    title: userRow.idRol === 1 ? 'Gerente General & Administrador' : `Personal — Rol: ${userRow.rol}`,
  };

  return {
    success: true,
    userAccount,
    sqlTrace: `EXEC dbo.usp_ValidarLogin @p_UsuarioOCorreo='${userRow.correo}', @p_ClavePlana='***' -> HASHBYTES('SHA2_256') OK (IdRol=${userRow.idRol}: ${userRow.rol})`,
  };
}

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

  // -----------------------------------------------------------------
  // PRESENTACIÓN DIAPOSITIVA 3: KPIs Consolidados (OLTP -> DW -> Spark)
  // -----------------------------------------------------------------
  if (upper.includes('VW_RESUMENDIAPOSITIVA3') || upper.includes('CIFRAS_DIAPOSITIVA_3')) {
    const columns = ['IndicadorClave', 'ValorVerificado', 'OrigenDatos', 'FormulaSpark_SQL', 'ImpactoNegocio'];
    const rows = [
      ['Ventas netas sin IGV', 'S/ 11,173.39', 'Spark RDD Broadcast', 'rdd_ventas.map(f => f[4] / (1 + 0.18)).sum()', 'Descuento de tasa IGV 18% vía variable Broadcast'],
      ['Utilidad neta total', 'S/ 1,960.75', 'Spark RDD reduce & DW', 'rdd_ventas.map(f => f[5]).reduce((a, b) => a + b)', 'Rentabilidad real consolidada en las 59 líneas'],
      ['Líneas vendidas con pérdida', '31 de 59 (52.5%)', 'Spark DataFrame filter', 'df_ventas.filter(F.col("Utilidad") < 0).count()', 'Alerta comercial: 31 líneas vendidas bajo costo'],
      ['Inventario sin rotación', 'S/ 262,564.68 (S/ 262 mil)', 'SparkSQL LEFT ANTI JOIN', 'LEFT JOIN ventas WHERE v.NombreMarca IS NULL', '3 marcas inmovilizadas (New Balance, Converse, Vans)'],
    ];
    return {
      columns,
      rows,
      rowCount: rows.length,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
      operation: 'SELECT',
      message: 'Cifras oficiales verificadas de la Diapositiva 3 (OLTP + Data Warehouse Kimball + Apache Spark).',
    };
  }

  // -----------------------------------------------------------------
  // EXPOSITOR 1 (SEMANA 11 - DIAPOSITIVAS 5, 6, 7): Limpieza CSV, BOM y Cast
  // -----------------------------------------------------------------
  if (upper.includes('VW_LIMPIEZASPARK') || upper.includes('VENTAS_DEMO') || upper.includes('SIN_BOM')) {
    const columns = ['Dataset_CSV', 'FilasBrutas_SQLCMD', 'FilasSuciasFiltradas', 'RegistrosLimpios', 'TransformacionesAplicadas'];
    const rows = [
      ['ventas_demo.csv (df_ventas)', 63, '4 filas ("---" y "rows affected")', 59, 'sin_bom(\\ufeff) + filter(isNotNull) + cast(Cantidad:int, TotalLinea:double, Utilidad:double)'],
      ['stock_demo.csv (df_stock)', 279, '4 filas ("---" y "rows affected")', 275, 'sin_bom(\\ufeff) + filter(isNotNull) + cast(Stock:int, Precio:double, ValorInventario:double)'],
    ];
    return {
      columns,
      rows,
      rowCount: rows.length,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
      operation: 'SELECT',
      message: 'Expositor 1 (Semana 11): Limpieza de BOM y casteo de esquemas en DataFrames (59 ventas y 275 variantes limpias).',
    };
  }

  // -----------------------------------------------------------------
  // EXPOSITOR 2 (SEMANA 12 - DIAPOSITIVA 10): RDD leftOuterJoin Stock vs Ventas
  // -----------------------------------------------------------------
  if (upper.includes('LEFT OUTER JOIN') || upper.includes('LEFTOUTERJOIN')) {
    const columns = ['NombreMarca', 'Stock_Pares', 'Valor_Inventario', 'Ventas_Soles', 'Utilidad_Soles', 'Estado_Rotacion'];
    const rows = [
      ['New Balance', '675 pares', 'S/ 103,343.10', 'S/ 0.00', 'S/ 0.00', 'SIN VENTAS (Capital Inmovilizado)'],
      ['Converse', '675 pares', 'S/ 84,556.83', 'S/ 0.00', 'S/ 0.00', 'SIN VENTAS (Capital Inmovilizado)'],
      ['Vans', '675 pares', 'S/ 74,664.75', 'S/ 0.00', 'S/ 0.00', 'SIN VENTAS (Capital Inmovilizado)'],
      ['Reebok', '674 pares', 'S/ 84,546.10', 'S/ 3,120.50', 'S/ 1,279.41', 'con ventas (Margen +41%)'],
      ['Puma', '375 pares', 'S/ 34,507.25', 'S/ 2,540.00', 'S/ -25.41', 'con ventas (Margen -1%)'],
      ['Nike', '363 pares', 'S/ 54,678.99', 'S/ 3,890.10', 'S/ 544.61', 'con ventas (Margen +14%)'],
      ['Adidas', '355 pares', 'S/ 27,955.00', 'S/ 3,634.00', 'S/ 162.14', 'con ventas (Margen +20%)'],
    ];
    return {
      columns,
      rows,
      rowCount: rows.length,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
      operation: 'SELECT',
      message: 'Expositor 2 (Semana 12): leftOuterJoin conserva las 7 marcas (detectando 3 marcas sin rotación con 675 pares cada una).',
    };
  }

  // -----------------------------------------------------------------
  // EXPOSITOR 2 (SEMANA 12 - DIAPOSITIVA 11): Top 3 Modelos (takeOrdered)
  // -----------------------------------------------------------------
  if (upper.includes('TAKEORDERED') || upper.includes('TOP 3')) {
    const columns = ['Ranking', 'NombreMarca', 'NombreModelo', 'UnidadesVendidas', 'Particiones_Y_Linaje_RDD'];
    const rows = [
      [1, 'Adidas', 'Runfalcon', '41 pares', 'particiones: 1 -> [59] | repartition(4): 4 | coalesce(1): 1'],
      [2, 'Nike', 'Air Max', '29 pares', 'Linaje DAG: MapPartitionsRDD -> ShuffledRDD (reduceByKey)'],
      [3, 'Puma', 'Smash', '14 pares', 'takeOrdered(3, key=lambda kv: -kv[1]) sin ordenar todo el RDD'],
    ];
    return {
      columns,
      rows,
      rowCount: rows.length,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
      operation: 'SELECT',
      message: 'Expositor 2 (Semana 12): Top 3 modelos más vendidos extraídos con takeOrdered(3).',
    };
  }

  // -----------------------------------------------------------------
  // EXPOSITOR 3 (SEMANA 14 - DIAPOSITIVAS 13 Y 14): SparkSQL Stock y Valor por Marca
  // -----------------------------------------------------------------
  if (upper.includes('VALOR_INVENTARIO_SOLES') || (upper.includes('FROM STOCK') && upper.includes('GROUP BY'))) {
    if (upper.includes('IS NULL')) {
      const columns = ['NombreMarca', 'Pares_Inmovilizados', 'Valor_Inmovilizado_Soles', 'Ventas_Registradas', 'Diagnostico_SparkSQL'];
      const rows = [
        ['New Balance', 675, 'S/ 103,343.10', null, 'LEFT JOIN ventas WHERE v.NombreMarca IS NULL'],
        ['Converse', 675, 'S/ 84,556.83', null, 'LEFT JOIN ventas WHERE v.NombreMarca IS NULL'],
        ['Vans', 675, 'S/ 74,664.75', null, 'LEFT JOIN ventas WHERE v.NombreMarca IS NULL'],
      ];
      return {
        columns,
        rows,
        rowCount: rows.length,
        executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
        operation: 'SELECT',
        message: 'Expositor 3 (Semana 14): 3 marcas sin rotación que inmovilizan S/ 262,564.68 de capital.',
      };
    }

    const columns = ['NombreMarca', 'Pares_Disponibles', 'Valor_Inventario_Soles', 'Formato_Persistencia', 'Optimizador'];
    const rows = [
      ['New Balance', 675, 'S/ 103,343.10', 'resumen_stock.parquet (Columnar)', 'Catalyst Physical Plan == SQL Plan'],
      ['Converse', 675, 'S/ 84,556.83', 'resumen_stock.parquet (Columnar)', 'Catalyst Physical Plan == SQL Plan'],
      ['Reebok', 674, 'S/ 84,546.10', 'resumen_stock.parquet (Columnar)', 'Catalyst Physical Plan == SQL Plan'],
      ['Vans', 675, 'S/ 74,664.75', 'resumen_stock.parquet (Columnar)', 'Catalyst Physical Plan == SQL Plan'],
      ['Nike', 363, 'S/ 54,678.99', 'resumen_stock.parquet (Columnar)', 'Catalyst Physical Plan == SQL Plan'],
      ['Puma', 375, 'S/ 34,507.25', 'resumen_stock.parquet (Columnar)', 'Catalyst Physical Plan == SQL Plan'],
      ['Adidas', 355, 'S/ 27,955.00', 'resumen_stock.parquet (Columnar)', 'Catalyst Physical Plan == SQL Plan'],
    ];
    return {
      columns,
      rows,
      rowCount: rows.length,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
      operation: 'SELECT',
      message: 'Expositor 3 (Semana 14): Stock y valorización por marca con DataFrame API / SparkSQL sobre vista temporal.',
    };
  }

  // -----------------------------------------------------------------
  // EXPOSITOR 4 (SEMANA 14 - DIAPOSITIVA 17): Estadística Avanzada (describe, corr, approxQuantile)
  // -----------------------------------------------------------------
  if (upper.includes('VW_ESTADISTICASPARK') || upper.includes('APPROXQUANTILE') || upper.includes('DESCRIBE')) {
    const columns = ['Funcion_Spark', 'Columna_TotalLinea', 'Columna_Utilidad', 'Interpretacion_Analitica'];
    const rows = [
      ['describe() -> count', '59 líneas', '59 líneas', 'Total de registros limpios analizados en df_ventas'],
      ['describe() -> mean', 'S/ 223.47', 'S/ 33.23', 'Promedio por línea de venta facturada'],
      ['describe() -> stddev', 'S/ 118.64', 'S/ 84.12', 'Alta dispersión en utilidad por descuentos agresivos'],
      ['stat.corr("TotalLinea", "Utilidad")', 'r = 0.742', 'r = 0.742', 'Correlación Pearson positiva, pero NO implica margen sano'],
      ['approxQuantile (Q1 - 25%, err=0.01)', 'S/ 149.90', 'S/ -18.40', 'Primer cuartil negativo sin ordenar todo el dataset'],
      ['approxQuantile (Mediana - 50%)', 'S/ 199.90', 'S/ -4.20', 'Mediana negativa: más de la mitad de las ventas dan pérdida'],
      ['approxQuantile (Q3 - 75%, err=0.01)', 'S/ 299.90', 'S/ 68.50', 'Tercer cuartil con margen positivo'],
      ['filter(F.col("Utilidad") < 0).count()', '31 líneas', 'de 59 totales (52.5%)', 'Hallazgo verificado: 31 líneas vendidas con utilidad negativa'],
    ];
    return {
      columns,
      rows,
      rowCount: rows.length,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
      operation: 'SELECT',
      message: 'Expositor 4 (Semana 14): Estadística avanzada con describe(), stat.corr() y approxQuantile().',
    };
  }

  // -----------------------------------------------------------------
  // EXPOSITOR 4 (SEMANA 14 - DIAPOSITIVA 18): Márgenes (%) por Marca y Crosstab
  // -----------------------------------------------------------------
  if (upper.includes('MARGENPCT') || upper.includes('CROSSTAB')) {
    const columns = ['NombreMarca', 'MargenPct', 'TiendaFisica', 'Web_WhatsApp', 'RedesSociales', 'Conclusion_De_Negocio'];
    const rows = [
      ['Reebok', '41.0%', '5 líneas', '4 líneas', '3 líneas', 'Vende poco volumen pero con el mejor margen unitario (+41%)'],
      ['Adidas', '20.0%', '8 líneas', '7 líneas', '6 líneas', 'Buen margen global (+20%), aunque Runfalcon pierde en promos'],
      ['Nike', '14.0%', '6 líneas', '5 líneas', '4 líneas', 'Margen positivo moderado (+14%) en línea Air Max'],
      ['Puma', '-1.0%', '4 líneas', '4 líneas', '3 líneas', 'Margen negativo (-1%): vende unidades pero no deja ganancia'],
    ];
    return {
      columns,
      rows,
      rowCount: rows.length,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
      operation: 'SELECT',
      message: 'Expositor 4 (Semana 14): Margen de utilidad (%) por marca y tabla de contingencia (stat.crosstab).',
    };
  }

  // -----------------------------------------------------------------
  // EXPOSITOR 4 (SEMANA 14 - DIAPOSITIVA 19): Modelos que Generan Pérdida (Utilidad < 0)
  // -----------------------------------------------------------------
  if (upper.includes('UTILIDAD < 0') || upper.includes('PERDIDA')) {
    const columns = ['NombreMarca', 'NombreModelo', 'UnidadesVendidas', 'Perdida_Acumulada', 'Causa_Raiz_Detectada'];
    const rows = [
      ['Adidas', 'Runfalcon', '41 pares (Top 1)', 'S/ -379.98', 'Es el modelo más vendido y el que más pierde: precio o costo mal calculado'],
      ['Nike', 'Air Max', '29 pares (Top 2)', 'S/ -155.19', 'Promociones aplicadas por debajo del costo promedio ponderado'],
      ['Puma', 'Smash', '14 pares (Top 3)', 'S/ -25.41', 'Descuento de liquidación supera el margen bruto comercial'],
    ];
    return {
      columns,
      rows,
      rowCount: rows.length,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
      operation: 'SELECT',
      message: 'Expositor 4 (Semana 14): Modelos con pérdida acumulada (Utilidad < 0) coincidente entre RDD y DataFrames.',
    };
  }

  // -----------------------------------------------------------------
  // SEGURIDAD LEY N.° 29733: Enmascaramiento Dinámico (DDM) en dw.DimCliente
  // -----------------------------------------------------------------
  if (upper.includes('DIMCLIENTE') || upper.includes('29733') || upper.includes('MASKED')) {
    const columns = ['SK_Cliente', 'TipoDocumento', 'NumeroDocumento_DDM', 'NombreRazonSocial_DDM', 'Correo_DDM', 'Telefono_DDM', 'Distrito', 'Regla_Ley_29733'];
    const rows = [
      [1, 'DNI', '7XXXXXX4', 'CXXXXa RXXXXs', 'cXXX@XXXX.com', '98XXXXX21', 'Miraflores', 'partial(1,"XXXXXX",1) + email()'],
      [2, 'RUC', '2XXXXXX1', 'IXXXXs DXXXXC', 'lXXX@XXXX.com', '99XXXXX40', 'San Isidro', 'partial(1,"XXXXXX",1) + email()'],
      [3, 'DNI', '4XXXXXX8', 'MXXXXo TXXXXo', 'mXXX@XXXX.com', '94XXXXX15', 'Surco', 'partial(1,"XXXXXX",1) + email()'],
      [4, 'DNI', '7XXXXXX2', 'VXXXXa PXXXXz', 'vXXX@XXXX.com', '97XXXXX88', 'La Molina', 'partial(1,"XXXXXX",1) + email()'],
      [5, 'RUC', '2XXXXXX9', 'GXXXXo AXXXXC', 'cXXX@XXXX.com', '95XXXXX02', 'San Borja', 'partial(1,"XXXXXX",1) + email()'],
    ];
    return {
      columns,
      rows,
      rowCount: rows.length,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
      operation: 'SELECT',
      message: 'Seguridad Ley N.° 29733: Enmascaramiento Dinámico de Datos (DDM) activo sobre dw.DimCliente.',
    };
  }

  // -----------------------------------------------------------------
  // SCRIPT 04: Reconciliación Multinivel OLTP vs Data Warehouse Kimball
  // -----------------------------------------------------------------
  if (upper.includes('RECONCILIACION') || upper.includes('CUBE')) {
    const columns = ['Metrica_Auditada', 'Base_OLTP_3FN', 'DataWarehouse_Kimball', 'Diferencia', 'Estado_Reconciliacion'];
    const rows = [
      ['1. Ventas Netas sin IGV (S/)', 'S/ 11,173.39', 'S/ 11,173.39', 'S/ 0.00', 'CONCILIADO (Diferencia = 0)'],
      ['2. Utilidad Neta Total (S/)', 'S/ 1,960.75', 'S/ 1,960.75', 'S/ 0.00', 'CONCILIADO (Diferencia = 0)'],
      ['3. Líneas Totales Facturadas', '59 líneas', '59 líneas', '0', 'CONCILIADO (Diferencia = 0)'],
      ['4. Variantes en Stock (SKUs)', '275 variantes', '275 variantes', '0', 'CONCILIADO (Diferencia = 0)'],
    ];
    return {
      columns,
      rows,
      rowCount: rows.length,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
      operation: 'SELECT',
      message: 'Reconciliación matemática multinivel OLTP vs Data Warehouse Kimball: Diferencia = 0.00.',
    };
  }

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

  // Handle Usuario table query (3FN joined with Empleado & Rol)
  if (upper.includes('FROM USUARIO') || upper.includes('FROM DBO.USUARIO')) {
    const columns = ['IdUsuario', 'Empleado', 'DNI', 'NombreUsuario', 'Correo', 'IdRol', 'NombreRol', 'Salt_UUID', 'ClaveHash_SHA256', 'Estado'];
    const rows = dbState.usuarios.map(u => [
      u.idUsuario,
      u.empleado,
      u.dni,
      u.nombreUsuario,
      u.correo,
      u.idRol,
      u.rol,
      u.salt,
      `${u.claveHash.slice(0, 18)}... (SHA-256)`,
      u.activo ? 'ACTIVO (1)' : 'INACTIVO (0)',
    ]);
    return filterAndSort(columns, rows, query, startTime, 'SELECT');
  }

  // Handle Rol table query
  if (upper.includes('FROM ROL') || upper.includes('FROM DBO.ROL')) {
    const columns = ['IdRol', 'NombreRol', 'Descripcion', 'NivelAcceso_RBAC'];
    const rows = dbState.roles.map(r => [
      r.idRol,
      r.nombreRol,
      r.descripcion,
      r.nivelAcceso,
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
  const upper = query.toUpperCase();
  const valuesMatch = query.match(/VALUES\s*\((.*?)\)/i);

  // 1. INSERT INTO Rol (NombreRol, Descripcion)
  if (upper.includes('INTO ROL') || upper.includes('INTO DBO.ROL')) {
    let roleName = 'Supervisor';
    let roleDesc = 'Supervisión de operaciones, arqueo de caja y control de inventario';
    if (valuesMatch && valuesMatch[1]) {
      const rawArgs = valuesMatch[1].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
      if (rawArgs[0]) roleName = rawArgs[0];
      if (rawArgs[1]) roleDesc = rawArgs[1];
    }

    const newRole: SqlRoleRecord = {
      idRol: dbState.roles.length + 1,
      nombreRol: roleName,
      descripcion: roleDesc,
      nivelAcceso: `Nivel ${dbState.roles.length + 1} (RBAC Personalizado)`,
    };
    dbState.roles = [...dbState.roles, newRole];

    dbState.auditLogs.unshift({
      id: dbState.auditLogs.length + 1,
      tabla: 'Rol',
      operacion: 'INSERT',
      idRegistro: `IdRol=${newRole.idRol}`,
      valorAnterior: 'NULL',
      valorNuevo: `NombreRol=${newRole.nombreRol}; Descripcion=${newRole.descripcion}`,
      usuario: 'SQL_Studio_Admin',
      fecha: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });

    notifySubscribers(dbState);

    return {
      columns: ['IdRol', 'NombreRol', 'Descripcion', 'NivelAcceso_RBAC', 'Estado_INSERT'],
      rows: dbState.roles.map(r => [r.idRol, r.nombreRol, r.descripcion, r.nivelAcceso, r.idRol === newRole.idRol ? 'NUEVO ROL INSERTADO' : 'Existente']),
      rowCount: dbState.roles.length,
      affectedRows: 1,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
      operation: 'INSERT',
      message: `Nuevo rol "${newRole.nombreRol}" (IdRol = ${newRole.idRol}) registrado en dbo.Rol y auditado en dbo.Auditoria.`,
    };
  }

  // Try to parse values from INSERT statement for VarianteProducto:
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

  // usp_ValidarLogin - SHA-256 + Salt Authentication Stored Procedure
  if (upper.includes('USP_VALIDARLOGIN') || upper.includes('VALIDARLOGIN')) {
    const emailMatch = query.match(/['"]([^'"]+@[^'"]+|iayala|aquispe)['"]/i);
    const passMatch = query.match(/(?:@p_ClavePlana|@Clave)\s*=\s*['"]([^'"]+)['"]/i);
    const targetEmail = emailMatch ? emailMatch[1] : 'gerencia@urbanstyle.pe';
    const targetPass = passMatch
      ? passMatch[1]
      : targetEmail.toLowerCase().includes('ventas') || targetEmail.toLowerCase() === 'aquispe'
      ? 'Ventas2026'
      : 'Gerencia2026';

    const authRes = executeSqlLogin(targetEmail, targetPass);
    const userRow = dbState.usuarios.find(
      u => u.correo.toLowerCase() === targetEmail.toLowerCase() || u.nombreUsuario.toLowerCase() === targetEmail.toLowerCase()
    );

    if (!authRes.success || !userRow) {
      return {
        columns: ['Error_SQL', 'Codigo_Retorno', 'Procedimiento', 'Detalle_Criptografico'],
        rows: [[authRes.errorMessage || 'Credenciales inválidas', -2, 'dbo.usp_ValidarLogin', 'RAISERROR: HASHBYTES("SHA2_256", @Clave + @Salt) <> ClaveHash']],
        rowCount: 1,
        executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
        isError: true,
        operation: 'EXEC',
        message: `ERROR en usp_ValidarLogin: ${authRes.errorMessage}`,
      };
    }

    return {
      columns: ['IdUsuario', 'NombreUsuario', 'NombreCompleto', 'Correo', 'IdRol', 'NombreRol', 'Salt_UNIQUEIDENTIFIER', 'Verificacion_SHA256', 'Auditoria'],
      rows: [[
        userRow.idUsuario,
        userRow.nombreUsuario,
        userRow.empleado,
        userRow.correo,
        userRow.idRol,
        userRow.rol,
        userRow.salt,
        `${userRow.claveHash.slice(0, 18)}... (MATCH OK)`,
        'Registrado en dbo.Auditoria (LOGIN_AUTH)',
      ]],
      rowCount: 1,
      affectedRows: 1,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
      operation: 'EXEC',
      message: `usp_ValidarLogin ejecutado: Hash SHA-256 + Salt verificado con éxito para ${userRow.empleado} (Rol: ${userRow.rol}).`,
    };
  }

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
