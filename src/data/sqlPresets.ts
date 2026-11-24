export interface LineExplanation {
  lineNum: number;
  code: string;
  explanation: string;
}

export interface SqlPreset {
  id: string;
  title: string;
  category: 'OLTP (3FN)' | 'Transaccional (ACID)' | 'Data Warehouse (Kimball)' | 'Auditoría & Triggers' | 'Big Data (PySpark)';
  badge: string;
  badgeColor: 'blue' | 'emerald' | 'amber' | 'purple' | 'red';
  sql: string;
  description: string;
  academicDocenteNote: string;
  theoryConcept: string;
  lineByLine: LineExplanation[];
  teacherQuestions: {
    question: string;
    answer: string;
  }[];
}

export const SQL_PRESETS: SqlPreset[] = [
  {
    id: 'vw_stock_actual',
    title: 'vw_StockActual',
    category: 'OLTP (3FN)',
    badge: 'Vista 3FN',
    badgeColor: 'blue',
    sql: 'SELECT * FROM vw_StockActual;',
    description: 'Vista normalizada en 3FN que unifica marcas, modelos y variantes calculando el estado del stock.',
    academicDocenteNote: 'Profesor, esta vista desacopla la capa de consulta de las 3 tablas físicas normalizadas (Marca, Modelo, VarianteProducto). Calcula en tiempo real si el calzado está NORMAL, BAJO o AGOTADO comparando el Stock con el umbral StockMinimo.',
    theoryConcept: 'Tercera Forma Normal (3FN), Vistas Indexadas y Encapsulamiento Lógico.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'SELECT *',
        explanation: 'Proyecta todas las columnas ya consolidadas y calculadas por la vista (IdVariante, SKU, Marca, Modelo, Stock, EstadoStock, Precio, Costo y ValorInventario).',
      },
      {
        lineNum: 2,
        code: 'FROM vw_StockActual;',
        explanation: 'Consulta la vista compilada del esquema transaccional UrbanStylosDB, evitando ejecutar joins manuales repetitivos desde las aplicaciones cliente.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Por qué usar una vista en lugar de consultar directamente la tabla VarianteProducto?',
        answer: 'Porque VarianteProducto solo tiene claves foráneas (IdModelo, IdMarca). La vista ejecuta los JOINs internos y la lógica condicional CASE WHEN Stock <= StockMinimo THEN "BAJO", entregando datos listos para consumir.',
      },
      {
        question: '¿Afecta el rendimiento una vista sobre tablas grandes?',
        answer: 'Para optimizar consultas masivas, en SQL Server se puede transformar en una Vista Indexada (Indexed View) creando un Clustered Index sobre ella, materializando físicamente el resultado.',
      },
    ],
  },

  {
    id: 'sp_registrar_venta',
    title: 'sp_RegistrarVenta (ACID)',
    category: 'Transaccional (ACID)',
    badge: 'Stored Proc',
    badgeColor: 'emerald',
    sql: `EXEC sp_RegistrarVenta 
    @IdCliente = 1, 
    @IdCanalVenta = 1, 
    @IdTipoComprobante = 1, 
    @IdVariante = 1, 
    @Cantidad = 2, 
    @IdMedioPago = 1;`,
    description: 'Procedimiento almacenado transaccional que valida stock, descuenta pares y emite comprobante fiscal.',
    academicDocenteNote: 'Profesor, este procedimiento implementa control de concurrencia y atomicidad estricta (ACID). Si el inventario disponible no cubre la cantidad solicitada, ejecuta un ROLLBACK TRANSACTION impidiendo inconsistencias o saldos negativos.',
    theoryConcept: 'Propiedades ACID (Atomicidad, Consistencia, Aislamiento, Durabilidad), Manejo de Errores con TRY...CATCH y Transacciones Explícitas.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'EXEC sp_RegistrarVenta',
        explanation: 'Instrucción de ejecución del procedimiento almacenado compilado en el motor de base de datos.',
      },
      {
        lineNum: 2,
        code: '@IdCliente = 1,',
        explanation: 'Parámetro de entrada que enlaza la venta con la entidad Cliente registrada en la base de datos.',
      },
      {
        lineNum: 3,
        code: '@IdCanalVenta = 1,',
        explanation: 'Identificador del canal comercial (1 = Tienda física, 2 = WhatsApp, 3 = Web, 4 = B2B).',
      },
      {
        lineNum: 4,
        code: '@IdTipoComprobante = 1,',
        explanation: 'Define la naturaleza tributaria del comprobante SUNAT (1 = Boleta de Venta, 2 = Factura Comercial).',
      },
      {
        lineNum: 5,
        code: '@IdVariante = 1,',
        explanation: 'Clave primaria de la variante de calzado seleccionada (Adidas Runfalcon, Talla 40).',
      },
      {
        lineNum: 6,
        code: '@Cantidad = 2,',
        explanation: 'Número de pares solicitados. El SP valida internamente que Stock >= @Cantidad antes de continuar.',
      },
      {
        lineNum: 7,
        code: '@IdMedioPago = 1;',
        explanation: 'Forma de pago registrada (1 = Efectivo, 2 = Tarjeta Débito/Crédito, 3 = Yape QR, 4 = Transferencia).',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Qué garantiza que dos cajeros no vendan el mismo último par simultáneamente?',
        answer: 'Dentro del SP se utiliza la cláusula WITH (UPDLOCK, ROWLOCK) al verificar el stock dentro de una transacción serializable, bloqueando la fila hasta que termine el COMMIT o ROLLBACK.',
      },
      {
        question: '¿Dónde se refleja esta venta en la aplicación?',
        answer: 'En tiempo real: descuenta el stock en la Terminal POS y en el Inventario, y genera una nueva fila en el Registro de Auditoría del Dashboard sin recargar.',
      },
    ],
  },

  {
    id: 'insert_zapatilla',
    title: 'INSERT Nueva Zapatilla',
    category: 'OLTP (3FN)',
    badge: 'DML Mutación',
    badgeColor: 'emerald',
    sql: `INSERT INTO VarianteProducto (NombreModelo, NombreMarca, Categoria, Talla, Precio, Stock)
VALUES ('Ultraboost Light 2026', 'Adidas', 'Deportiva / Running', 42, 599.90, 20);`,
    description: 'Inserción DML que crea un nuevo SKU de calzado y lo sincroniza al instante en la web.',
    academicDocenteNote: 'Profesor, esta instrucción DML demuestra la persistencia relacional y la reactividad: al insertarse el registro en VarianteProducto, se calcula automáticamente su SKU mediante reglas de negocio y se notifica a la interfaz gráfica inmediatamente.',
    theoryConcept: 'Lenguaje de Manipulación de Datos (DML), Integridad Referencial de Entidad y Claves Candidatas.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'INSERT INTO VarianteProducto (...)',
        explanation: 'Declara la operación de inserción y la lista explícita de campos a poblar en la tabla de variantes.',
      },
      {
        lineNum: 2,
        code: "VALUES ('Ultraboost Light 2026', 'Adidas', ...);",
        explanation: 'Suministra los valores tipados: Modelo ("Ultraboost Light 2026"), Marca ("Adidas"), Categoría ("Deportiva / Running"), Talla (42), Precio (599.90) y Stock físico inicial (20 pares).',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Por qué no se especifica el SKU manualmente?',
        answer: 'Porque el SKU sigue un formato corporativo normalizado generado de forma determinista para evitar colisiones entre tallas y colores.',
      },
    ],
  },

  {
    id: 'update_stock',
    title: 'UPDATE Stock +15 (Adidas)',
    category: 'OLTP (3FN)',
    badge: 'DML Mutación',
    badgeColor: 'blue',
    sql: `UPDATE VarianteProducto
SET Stock = Stock + 15
WHERE NombreMarca = 'Adidas';`,
    description: 'Actualización masiva de inventario físico por marca con recálculo de valorización en tiempo real.',
    academicDocenteNote: 'Profesor, esta consulta representa una orden de ingreso de mercadería a almacén. Utiliza un operador de acumulación atómico (Stock = Stock + 15) que previene inconsistencias por lecturas sucias en entornos multiusuario.',
    theoryConcept: 'Actualizaciones Atómicas, Cláusula WHERE Determinista y Bloqueo de Registros.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'UPDATE VarianteProducto',
        explanation: 'Indica la tabla relacional sobre la que se aplicará la modificación de columnas.',
      },
      {
        lineNum: 2,
        code: 'SET Stock = Stock + 15',
        explanation: 'Incrementa en 15 unidades el valor preexistente de cada fila que cumpla el predicado, evitando sobreescritura de valores absolutos.',
      },
      {
        lineNum: 3,
        code: "WHERE NombreMarca = 'Adidas';",
        explanation: 'Condición de filtro que restringe el impacto únicamente a los productos de la marca Adidas.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Qué pasaría si se omite la cláusula WHERE?',
        answer: 'Se cometería un error crítico de actualización masiva no intencionada, aumentando el stock de absolutamente todo el catálogo de la tienda.',
      },
    ],
  },

  {
    id: 'delete_inmutable',
    title: 'Probar Inmutabilidad (DELETE)',
    category: 'Auditoría & Triggers',
    badge: 'Seguridad / Trigger',
    badgeColor: 'red',
    sql: 'DELETE FROM Comprobante WHERE IdComprobante = 1;',
    description: 'Demostración de bloqueo fiscal: el trigger TR_Comprobante_Inmutable rechaza la eliminación con ROLLBACK.',
    academicDocenteNote: 'Profesor, por normativa de SUNAT en Perú, ningún comprobante de pago electrónico (Boleta o Factura) puede ser borrado de la base de datos. Implementamos el trigger TR_Comprobante_Inmutable que intercepta el DELETE y revoca la transacción de inmediato.',
    theoryConcept: 'Disparadores de Base de Datos (Triggers INSTEAD OF / AFTER), Rollback Transaccional y Auditoría Forense.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'DELETE FROM Comprobante WHERE IdComprobante = 1;',
        explanation: 'Comando que intenta borrar el comprobante #1 emitido en el sistema.',
      },
      {
        lineNum: 2,
        code: '-- Disparo de TR_Comprobante_Inmutable',
        explanation: 'El trigger detecta la acción sobre la tabla Comprobante, ejecuta RAISERROR 50001, realiza ROLLBACK y escribe el intento en la tabla Auditoria.',
      },
    ],
    teacherQuestions: [
      {
        question: 'Si un cliente pide anular una compra, ¿cómo se hace si el DELETE está bloqueado?',
        answer: 'Se crea un registro de Nota de Crédito en la tabla NotaCredito que referencia al comprobante original, anulando el efecto contable sin destruir la evidencia histórica.',
      },
    ],
  },

  {
    id: 'ranking_marcas',
    title: 'Ranking Marcas (OLAP)',
    category: 'OLTP (3FN)',
    badge: 'GROUP BY',
    badgeColor: 'purple',
    sql: `SELECT 
    NombreMarca,
    COUNT(*) AS TotalModelos,
    SUM(Stock) AS StockDisponible,
    AVG(Precio) AS PrecioPromedio,
    SUM(Stock * Precio) AS ValorTotal
FROM VarianteProducto
GROUP BY NombreMarca
ORDER BY ValorTotal DESC;`,
    description: 'Consulta analítica que agrupa por marca comercial, sumando pares, valor de inventario y precio medio.',
    academicDocenteNote: 'Profesor, esta consulta demuestra el uso de funciones de agregación (COUNT, SUM, AVG) con agrupación por dimensión (GROUP BY). Permite a la gerencia identificar cuál es la marca con mayor capital inmovilizado en almacén.',
    theoryConcept: 'Funciones de Agregación SQL, Cláusula GROUP BY, Ordenamiento y Métricas de Negocio.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'SELECT NombreMarca,',
        explanation: 'Columna no agregada que actúa como criterio de partición y agrupación.',
      },
      {
        lineNum: 2,
        code: 'COUNT(*) AS TotalModelos,',
        explanation: 'Cuenta la cantidad de modelos y variantes diferentes pertenecientes a cada marca.',
      },
      {
        lineNum: 3,
        code: 'SUM(Stock) AS StockDisponible,',
        explanation: 'Acumula el total físico de pares de zapatillas disponibles en bodega para esa marca.',
      },
      {
        lineNum: 4,
        code: 'AVG(Precio) AS PrecioPromedio,',
        explanation: 'Calcula la media aritmética del precio de venta al público.',
      },
      {
        lineNum: 5,
        code: 'SUM(Stock * Precio) AS ValorTotal',
        explanation: 'Cálculo del valor total comercial del inventario (Stock x Precio unitario).',
      },
      {
        lineNum: 6,
        code: 'FROM VarianteProducto',
        explanation: 'Tabla transaccional que contiene las existencias y precios.',
      },
      {
        lineNum: 7,
        code: 'GROUP BY NombreMarca',
        explanation: 'Agrupa todas las filas de la tabla según el valor de la columna NombreMarca.',
      },
      {
        lineNum: 8,
        code: 'ORDER BY ValorTotal DESC;',
        explanation: 'Ordena los resultados de mayor a menor valorización monetaria.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Por qué no podemos poner WHERE SUM(Stock) > 50?',
        answer: 'Porque WHERE filtra filas individuales antes de agrupar. Para filtrar sobre el resultado de una función agregada como SUM, se debe utilizar la cláusula HAVING SUM(Stock) > 50.',
      },
    ],
  },

  {
    id: 'dw_fact_ventas',
    title: 'dw.FactVentas (Kimball)',
    category: 'Data Warehouse (Kimball)',
    badge: 'Hechos DW',
    badgeColor: 'amber',
    sql: 'SELECT * FROM dw.FactVentas;',
    description: 'Tabla de hechos del Data Warehouse con claves subrogadas, costos, utilidades y márgenes de ganancia.',
    academicDocenteNote: 'Profesor, aquí mostramos la tabla central del modelo estrella según la metodología de Ralph Kimball. Cada fila representa un hecho de venta atómico con métricas aditivas (Total, Costo, Utilidad) y claves foráneas hacia las dimensiones.',
    theoryConcept: 'Metodología Kimball, Esquema Estrella (Star Schema), Métricas Aditivas y Claves Subrogadas (Surrogate Keys).',
    lineByLine: [
      {
        lineNum: 1,
        code: 'SELECT * FROM dw.FactVentas;',
        explanation: 'Consulta la tabla de hechos en el esquema "dw", proyectando claves SK (SK_Tiempo, SK_Producto, SK_Cliente, SK_Canal) y medidas financieras.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Qué diferencia hay entre la tabla transaccional Comprobante y dw.FactVentas?',
        answer: 'Comprobante está en 3FN optimizada para lecturas y escrituras unitarias rápidas (OLTP). FactVentas está desnormalizada, contiene medidas precalculadas (Utilidad, Margen) y está optimizada para consultas analíticas de reportería (OLAP).',
      },
      {
        question: '¿Qué es una clave subrogada (SK)?',
        answer: 'Es un identificador entero artificial sin significado de negocio generado por el proceso ETL. Permite desacoplar el DW de cambios en las claves primarias de los sistemas transaccionales.',
      },
    ],
  },

  {
    id: 'dw_fact_inventario',
    title: 'dw.FactInventario (Kimball)',
    category: 'Data Warehouse (Kimball)',
    badge: 'Snapshot DW',
    badgeColor: 'amber',
    sql: 'SELECT * FROM dw.FactInventario;',
    description: 'Instantánea periódica (Periodic Snapshot) que registra el balance de existencias y valorización diaria.',
    academicDocenteNote: 'Profesor, según Kimball existen tres tipos de tablas de hechos: Transaccionales, Snapshots Periódicos y Snapshots Acumulados. Esta tabla es un Snapshot Periódico que congela la foto del almacén cada día para auditoría de rotación.',
    theoryConcept: 'Snapshot Periódico de Inventario, Medidas Semi-aditivas y Análisis de Rotación de Mercadería.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'SELECT * FROM dw.FactInventario;',
        explanation: 'Consulta el snapshot dimensional con columnas: SK_Tiempo, Producto, Marca, StockInicial, Entradas, Salidas, StockFinal y ValorInventario.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Por qué el Stock es una medida semi-aditiva?',
        answer: 'Porque el stock se puede sumar entre diferentes productos en un mismo día, pero NO se puede sumar a lo largo del tiempo (sumar el stock del lunes con el del martes no tiene sentido contable; se debe promediar).',
      },
    ],
  },

  {
    id: 'stock_critico',
    title: 'Alerta Stock Crítico (<=15)',
    category: 'OLTP (3FN)',
    badge: 'Filtro Almacén',
    badgeColor: 'blue',
    sql: `SELECT SKU, NombreModelo, NombreMarca, Stock, StockMinimo, EstadoStock
FROM vw_StockActual
WHERE Stock <= 15
ORDER BY Stock ASC;`,
    description: 'Filtro prioritario para logística que localiza el calzado con existencias reducidas para compra inmediata.',
    academicDocenteNote: 'Profesor, este query opera como un trigger de reposición en la cadena de suministro. Ayuda a evitar la rotura de stock priorizando los productos más cercanos a agotarse.',
    theoryConcept: 'Predicados de Rango en WHERE, Index Scans y Reglas de Punto de Reorden (ROP).',
    lineByLine: [
      {
        lineNum: 1,
        code: 'SELECT SKU, NombreModelo, NombreMarca, Stock, StockMinimo, EstadoStock',
        explanation: 'Proyección optimizada que extrae únicamente las columnas operativas indispensables para el pedido a proveedores.',
      },
      {
        lineNum: 2,
        code: 'FROM vw_StockActual',
        explanation: 'Origen de datos en la vista de inventario consolidada.',
      },
      {
        lineNum: 3,
        code: 'WHERE Stock <= 15',
        explanation: 'Predicado de filtro que selecciona solo los modelos con 15 o menos pares restantes en tienda.',
      },
      {
        lineNum: 4,
        code: 'ORDER BY Stock ASC;',
        explanation: 'Ordenamiento ascendente: coloca en primer lugar las referencias más críticas (menor stock).',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Cómo se optimizaría esta consulta en una base de datos con 500,000 pares?',
        answer: 'Creando un índice filtrado no agrupado (Filtered Non-Clustered Index) con la condición WHERE Stock <= 15, haciendo que la búsqueda sea instantánea sin escanear toda la tabla.',
      },
    ],
  },

  {
    id: 'pyspark_etl',
    title: 'PySpark ETL Transformation',
    category: 'Big Data (PySpark)',
    badge: 'Big Data',
    badgeColor: 'purple',
    sql: `-- PySpark DataFrame Pipeline: Extracción, Transformación y Carga
SELECT 
    Canal,
    COUNT(*) AS TransaccionesTotales,
    SUM(Total) AS IngresosBrutos,
    ROUND(AVG(Total), 2) AS TicketPromedio
FROM Comprobante
GROUP BY Canal
ORDER BY IngresosBrutos DESC;`,
    description: 'Simulación SQL del pipeline distribuido de PySpark ejecutado en el notebook de Google Colab.',
    academicDocenteNote: 'Profesor, este código representa la transformación que ejecuta nuestro pipeline PySpark en Google Colab: df.groupBy("canal").agg(count("*"), sum("total"), avg("total")). Sirve de puente para limpiar datos antes de cargarlos al Data Warehouse.',
    theoryConcept: 'ETL Distribuido con Apache Spark / PySpark, Agregaciones en DataFrames y Arquitectura de Datos Moderna.',
    lineByLine: [
      {
        lineNum: 1,
        code: '-- PySpark DataFrame Pipeline...',
        explanation: 'Comentario explicativo que vincula la consulta analítica con el notebook en Google Colab.',
      },
      {
        lineNum: 2,
        code: 'SELECT Canal,',
        explanation: 'Dimensión de agrupación omnicanal (Tienda física, WhatsApp, Web, B2B Corporativo).',
      },
      {
        lineNum: 3,
        code: 'COUNT(*) AS TransaccionesTotales,',
        explanation: 'Equivalente en PySpark a F.count("*"), totaliza las órdenes procesadas por canal.',
      },
      {
        lineNum: 4,
        code: 'SUM(Total) AS IngresosBrutos,',
        explanation: 'Equivalente a F.sum("Total"), acumulación del volumen de ventas facturado.',
      },
      {
        lineNum: 5,
        code: 'ROUND(AVG(Total), 2) AS TicketPromedio',
        explanation: 'Equivalente a F.round(F.avg("Total"), 2), ticket medio de compra por canal comercial.',
      },
      {
        lineNum: 6,
        code: 'FROM Comprobante GROUP BY Canal ORDER BY IngresosBrutos DESC;',
        explanation: 'Agrupación y ordenamiento descendente de las operaciones consolidadas.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Por qué usar PySpark en lugar de stored procedures para el ETL?',
        answer: 'Porque cuando los datos crecen a gigabytes o terabytes de ventas de múltiples tiendas a nivel nacional, PySpark procesa en memoria distribuida en clusters (como Databricks o GCP), superando las limitaciones de un solo servidor SQL.',
      },
    ],
  },

  {
    id: 'auditoria_triggers',
    title: 'Auditoría Triggers',
    category: 'Auditoría & Triggers',
    badge: 'Seguridad',
    badgeColor: 'red',
    sql: 'SELECT * FROM Auditoria ORDER BY IdAuditoria DESC;',
    description: 'Registro forense de eventos de base de datos capturados automáticamente por triggers.',
    academicDocenteNote: 'Profesor, la tabla Auditoria registra la trazabilidad de cualquier alteración en el sistema. Los triggers capturan la tabla afectada, la operación (INSERT, UPDATE, DELETE), el usuario de BD, los valores antes y después, y la fecha exacta.',
    theoryConcept: 'Tablas de Auditoría, Integridad y Trazabilidad Forense según Estándares COBIT e ISO 27001.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'SELECT * FROM Auditoria ORDER BY IdAuditoria DESC;',
        explanation: 'Recupera el historial cronológico inverso para inspeccionar las últimas operaciones registradas automáticamente por los triggers del motor.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Cómo captura el trigger los valores anteriores y nuevos?',
        answer: 'En SQL Server, dentro del trigger se leen las pseudotablas del sistema "deleted" (que contiene los valores anteriores al cambio) e "inserted" (que contiene los nuevos valores ingresados).',
      },
    ],
  },
];
