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
    description: 'Registro forense de eventos de base de datos capturados automáticamente por triggers y login.',
    academicDocenteNote: 'Profesor, la tabla Auditoria registra la trazabilidad de cualquier alteración o inicio de sesión en el sistema. Captura la tabla afectada, la operación (INSERT, UPDATE, DELETE, LOGIN_AUTH), el usuario de BD, los valores antes y después, y la fecha exacta.',
    theoryConcept: 'Tablas de Auditoría, Integridad y Trazabilidad Forense según Estándares COBIT e ISO 27001.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'SELECT * FROM Auditoria ORDER BY IdAuditoria DESC;',
        explanation: 'Recupera el historial cronológico inverso para inspeccionar las últimas operaciones registradas automáticamente por los triggers y procedimientos del motor.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Cómo captura el trigger los valores anteriores y nuevos?',
        answer: 'En SQL Server, dentro del trigger se leen las pseudotablas del sistema "deleted" (que contiene los valores anteriores al cambio) e "inserted" (que contiene los nuevos valores ingresados).',
      },
    ],
  },

  {
    id: 'usp_validar_login',
    title: 'usp_ValidarLogin (SHA-256)',
    category: 'Auditoría & Triggers',
    badge: 'Auth SHA-256',
    badgeColor: 'emerald',
    sql: `EXEC dbo.usp_ValidarLogin 
    @p_UsuarioOCorreo = 'gerencia@urbanstyle.pe', 
    @p_ClavePlana = 'Gerencia2026';`,
    description: 'Procedimiento almacenado que ejecuta el botón Entrar del Login: verifica Salt, HASHBYTES SHA-256 y audita el acceso.',
    academicDocenteNote: 'Profesor, este es el procedimiento almacenado que ejecuta internamente el botón Entrar del Login. Nunca comparamos contraseñas en texto plano: recuperamos el Salt UNIQUEIDENTIFIER del usuario, calculamos HASHBYTES("SHA2_256", @Clave + @Salt) y verificamos que coincida con ClaveHash (VARBINARY 32). Además, registra el acceso en la tabla Auditoria.',
    theoryConcept: 'Criptografía en Base de Datos (SHA-256 + Salt), Prevención de Rainbow Tables y Control de Acceso Basado en Roles (RBAC).',
    lineByLine: [
      {
        lineNum: 1,
        code: 'EXEC dbo.usp_ValidarLogin',
        explanation: 'Invoca el procedimiento almacenado compilado en UrbanStylosDB que centraliza la seguridad de autenticación.',
      },
      {
        lineNum: 2,
        code: "@p_UsuarioOCorreo = 'gerencia@urbanstyle.pe',",
        explanation: 'Parámetro que busca coincidencias en dbo.Usuario (NombreUsuario) o dbo.Empleado (Correo) mediante INNER JOIN.',
      },
      {
        lineNum: 3,
        code: "@p_ClavePlana = 'Gerencia2026';",
        explanation: 'El SP concatena esta clave con el Salt del usuario y aplica HASHBYTES("SHA2_256") para compararlo con ClaveHash.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Para qué sirve la columna Salt (UNIQUEIDENTIFIER) en la tabla Usuario?',
        answer: 'Es un valor aleatorio de 128 bits generado con NEWID() único por usuario. Garantiza que si dos usuarios tienen la misma contraseña, sus hashes SHA-256 sean totalmente distintos, bloqueando ataques con Rainbow Tables.',
      },
      {
        question: '¿Qué pasa si las credenciales son válidas?',
        answer: 'El SP inserta un registro LOGIN_AUTH en dbo.Auditoria y retorna la proyección con INNER JOIN entre Usuario, Rol y Empleado para habilitar los permisos según IdRol.',
      },
    ],
  },

  {
    id: 'select_usuarios_roles',
    title: 'Usuarios & Roles (3FN)',
    category: 'OLTP (3FN)',
    badge: 'Seguridad 3FN',
    badgeColor: 'blue',
    sql: `SELECT u.IdUsuario, e.Nombres, u.NombreUsuario, e.Correo, r.IdRol, r.NombreRol, u.Salt, u.ClaveHash
FROM dbo.Usuario u
INNER JOIN dbo.Rol r ON r.IdRol = u.IdRol
INNER JOIN dbo.Empleado e ON e.IdEmpleado = u.IdEmpleado;`,
    description: 'Consulta normalizada en 3FN que une Empleado, Usuario y Rol mostrando el Salt y el Hash SHA-256.',
    academicDocenteNote: 'Profesor, en lugar de meter correo, nombre, rol y contraseña en una sola tabla desnormalizada, separamos en 3FN cuatro entidades: Cargo (RRHH), Empleado (persona física), Usuario (credencial criptográfica) y Rol (autorización del sistema).',
    theoryConcept: 'Tercera Forma Normal (3FN), Eliminación de Dependencias Transitivas y Separación de Entidades.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'SELECT u.IdUsuario, e.Nombres, u.NombreUsuario, ...',
        explanation: 'Proyecta los atributos de identidad, credenciales criptográficas (Salt, ClaveHash) y nivel de rol.',
      },
      {
        lineNum: 2,
        code: 'FROM dbo.Usuario u INNER JOIN dbo.Rol r ... INNER JOIN dbo.Empleado e ...',
        explanation: 'Reconstruye la vista de seguridad uniendo las claves foráneas IdRol e IdEmpleado.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Por qué separar Empleado y Usuario en dos tablas distintas?',
        answer: 'Porque un empleado puede trabajar en almacén o limpieza sin tener cuenta en el sistema informático, y si se desactiva su usuario, su registro de Empleado se conserva para no romper la integridad referencial histórica de ventas.',
      },
    ],
  },

  {
    id: 'insert_nuevo_rol',
    title: 'INSERT Nuevo Rol (RBAC)',
    category: 'Auditoría & Triggers',
    badge: 'DML Roles',
    badgeColor: 'emerald',
    sql: `INSERT INTO dbo.Rol (NombreRol, Descripcion)
VALUES ('Supervisor', 'Control de tiendas, arqueo de caja y auditoría de stock');`,
    description: 'Inserción en vivo de un nuevo Rol en dbo.Rol demostrando la escalabilidad del modelo de permisos RBAC.',
    academicDocenteNote: 'Profesor, si la empresa crece y requiere un nuevo perfil como Supervisor o Almacén, no modificamos la estructura de tablas: simplemente insertamos una nueva tupla en dbo.Rol y asignamos permisos con GRANT y DENY bajo el principio de menor privilegio.',
    theoryConcept: 'Control de Acceso Basado en Roles (RBAC), Sentencias DCL (GRANT / DENY) y Escalabilidad Relacional.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'INSERT INTO dbo.Rol (NombreRol, Descripcion)',
        explanation: 'Inserta un nuevo registro en el catálogo maestro de roles de seguridad.',
      },
      {
        lineNum: 2,
        code: "VALUES ('Supervisor', 'Control de tiendas...');",
        explanation: 'El motor genera automáticamente el siguiente IdRol (IDENTITY) y registra la creación en dbo.Auditoria.',
      },
    ],
    teacherQuestions: [
      {
        question: 'Además de insertar en la tabla Rol, ¿cómo se restringen permisos en SQL Server?',
        answer: 'Con DCL (Data Control Language): CREATE ROLE Rol_Ventas; GRANT SELECT ON vw_StockActual TO Rol_Ventas; y DENY DELETE, UPDATE ON Comprobante TO Rol_Ventas;',
      },
    ],
  },

  {
    id: 'ley_29733_ddm',
    title: 'Ley 29733 (Masking DDM)',
    category: 'Auditoría & Triggers',
    badge: 'Ley N.° 29733',
    badgeColor: 'red',
    sql: `-- Enmascaramiento Dinámico de Datos (DDM) - Ley N.° 29733 (Diapositivas 2 y 3)
SELECT SK_Cliente, TipoDocumento, NumeroDocumento, NombreRazonSocial, Correo, Telefono, Distrito
FROM dw.DimCliente;`,
    description: 'Demostración de protección de datos personales (PII) con Dynamic Data Masking en el Data Warehouse.',
    academicDocenteNote: 'Profesor, como expusimos en las Diapositivas 2 y 3, uno de los problemas críticos era la exposición de datos personales. Aplicamos Dynamic Data Masking (DDM) en SQL Server sobre dw.DimCliente para cumplir con la Ley N.° 29733 de Protección de Datos Personales del Perú.',
    theoryConcept: 'Dynamic Data Masking (DDM), Cumplimiento Normativo Ley N.° 29733 y Privacidad en Entornos Analíticos.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'SELECT SK_Cliente, TipoDocumento, NumeroDocumento, NombreRazonSocial, Correo, Telefono',
        explanation: 'Consulta la dimensión de clientes desde un rol de analista de Big Data o BI.',
      },
      {
        lineNum: 2,
        code: 'FROM dw.DimCliente;',
        explanation: 'El motor aplica automáticamente las máscaras partial(1,"XXXXXX",1) y email() ocultando el DNI, nombre, correo y teléfono real.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿El enmascaramiento dinámico (DDM) modifica el dato real en el disco?',
        answer: 'No, el dato físico permanece intacto en la página de datos para procesos internos, pero SQL Server ofusca la salida en tiempo de consulta para cualquier usuario sin el permiso UNMASK.',
      },
    ],
  },

  {
    id: 'kpis_diapositiva_3',
    title: 'Cifras Diapositiva 3 (KPIs)',
    category: 'Data Warehouse (Kimball)',
    badge: 'Diapositiva 3',
    badgeColor: 'amber',
    sql: `-- Verificación de las 4 cifras oficiales de la Diapositiva 3 (OLTP + DW + Spark)
SELECT IndicadorClave, ValorVerificado, OrigenDatos, FormulaSpark_SQL, ImpactoNegocio
FROM vw_ResumenDiapositiva3;`,
    description: 'Consolidado exacto de la Diapositiva 3: S/ 11,173.39 ventas sin IGV, S/ 1,960.75 utilidad, 31/59 pérdida y S/ 262 mil sin rotación.',
    academicDocenteNote: 'Profesor, esta vista resume los 4 hallazgos clave de nuestra Diapositiva 3 obtenidos al conectar SQL Server (OLTP), el modelo estrella de Kimball (DW) y Apache Spark: S/ 11,173.39 en ventas netas sin IGV, S/ 1,960.75 de utilidad neta total, 31 de 59 líneas vendidas con pérdida y S/ 262,564.68 de inventario sin rotación.',
    theoryConcept: 'Integración OLTP -> ETL -> Data Warehouse Kimball -> Apache Spark y Toma de Decisiones Basada en Datos.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'SELECT IndicadorClave, ValorVerificado, OrigenDatos, FormulaSpark_SQL',
        explanation: 'Muestra cada KPI de la Diapositiva 3 junto con la operación exacta de Spark / SQL que lo calculó.',
      },
      {
        lineNum: 2,
        code: 'FROM vw_ResumenDiapositiva3;',
        explanation: 'Concilia los resultados del script de PySpark con las tablas del Data Warehouse.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Cómo se calculó la cifra de S/ 11,173.39 de ventas netas sin IGV en Spark?',
        answer: 'Usando una variable Broadcast (sc.broadcast(0.18)) enviada una sola vez a cada executor y dividiendo el total de cada línea entre 1.18: rdd_ventas.map(lambda f: f[4] / (1 + tasa_igv.value)).sum().',
      },
    ],
  },

  {
    id: 'sem11_limpieza_bom',
    title: 'Sem 11: Limpieza CSV & BOM',
    category: 'Big Data (PySpark)',
    badge: 'Expositor 1',
    badgeColor: 'purple',
    sql: `-- Expositor 1 (Semana 11 - Diapositivas 5, 6 y 7): Limpieza de BOM (\\ufeff), filtro sqlcmd y cast
SELECT Dataset_CSV, FilasBrutas_SQLCMD, FilasSuciasFiltradas, RegistrosLimpios, TransformacionesAplicadas
FROM vw_LimpiezaSpark;`,
    description: 'Expositor 1 (Diapositivas 4-7): Limpieza de marca BOM de Windows, filtrado de líneas sqlcmd y casteo a 59 ventas y 275 stocks.',
    academicDocenteNote: 'Profesor, como se explica en las Diapositivas 6 y 7 (Semana 11), al exportar los CSV desde SQL Server con sqlcmd se generan dos problemas reales: la marca BOM invisible (\\ufeff) pegada a la primera columna y filas basura con guiones "---" y "rows affected". Nuestro pipeline limpia el BOM con toDF, filtra las filas corruptas y aplica cast explícito obteniendo 59 registros limpios de ventas y 275 de stock.',
    theoryConcept: 'Ingesta de Datos en Apache Spark, Remoción de Byte Order Mark (UTF-8 BOM), Schema Inference y Type Casting.',
    lineByLine: [
      {
        lineNum: 1,
        code: '-- sin_bom(df): c.replace("\\ufeff", "").strip()',
        explanation: 'Elimina el carácter invisible UTF-8 BOM al inicio del CSV para que F.col("IdComprobante") no falle.',
      },
      {
        lineNum: 2,
        code: '-- filter(~id_.contains("---") & ~id_.contains("rows affected"))',
        explanation: 'Descarta las líneas separadoras y el pie de página que sqlcmd inyecta al exportar tablas.',
      },
      {
        lineNum: 3,
        code: '-- withColumn("TotalLinea", F.col("TotalLinea").cast("double"))',
        explanation: 'Garantiza tipos numéricos estrictos (int y double) antes de ejecutar sumas o correlaciones.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Por qué configuraron spark.sql.shuffle.partitions en 8 en lugar del valor por defecto?',
        answer: 'Porque el valor por defecto en Spark es 200 particiones. Para un dataset de 59 ventas y 275 variantes en modo local[*], 200 particiones generaría sobrecarga de planificación de tareas vacías; 8 particiones aprovecha los núcleos locales de forma óptima.',
      },
    ],
  },

  {
    id: 'sem12_rdd_left_outer_join',
    title: 'Sem 12: RDD leftOuterJoin',
    category: 'Big Data (PySpark)',
    badge: 'Expositor 2',
    badgeColor: 'purple',
    sql: `-- Expositor 2 (Semana 12 - Diapositiva 10): stock_por_marca.leftOuterJoin(ventas_por_marca)
SELECT s.NombreMarca,
       SUM(s.Stock) AS Stock_Pares,
       ISNULL(SUM(v.TotalLinea), 0) AS Ventas_Soles,
       ISNULL(SUM(v.Utilidad), 0) AS Utilidad_Soles
FROM stock s
LEFT OUTER JOIN ventas v ON s.NombreMarca = v.NombreMarca
GROUP BY s.NombreMarca
ORDER BY Stock_Pares DESC;`,
    description: 'Expositor 2 (Diapositiva 10): Comparativa entre join interno (4 marcas) y leftOuterJoin (7 marcas, hallando 3 sin ventas).',
    academicDocenteNote: 'Profesor, en la Diapositiva 10 demostramos por qué el join interno entre RDDs clave-valor descartaba 3 marcas completas. Al aplicar stock_por_marca.leftOuterJoin(ventas_por_marca) partiendo del stock, conservamos las 7 marcas y descubrimos el hallazgo de negocio: New Balance, Converse y Vans tienen 675 pares cada una y cero ventas.',
    theoryConcept: 'Pair RDDs (Clave-Valor), Transformaciones reduceByKey, Inner Join vs LeftOuterJoin y Detección de Capital Inmovilizado.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'SELECT s.NombreMarca, SUM(s.Stock) AS Stock_Pares, ...',
        explanation: 'Equivalente a combinar las tuplas (marca, stock_total) con (marca, (ventas, utilidad)) tras reduceByKey.',
      },
      {
        lineNum: 2,
        code: 'FROM stock s LEFT OUTER JOIN ventas v ON s.NombreMarca = v.NombreMarca',
        explanation: 'Parte del universo de stock para conservar incluso las marcas donde el valor de ventas es None / NULL.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Por qué es preferible usar reduceByKey en lugar de groupByKey en RDDs?',
        answer: 'Porque reduceByKey combina y suma los valores localmente dentro de cada partición (map-side combine) antes del shuffle por red, mientras que groupByKey transfiere todos los registros crudos por la red, saturando la memoria.',
      },
    ],
  },

  {
    id: 'sem12_top3_takeordered',
    title: 'Sem 12: Top 3 (takeOrdered)',
    category: 'Big Data (PySpark)',
    badge: 'Expositor 2',
    badgeColor: 'purple',
    sql: `-- Expositor 2 (Semana 12 - Diapositiva 11): takeOrdered(3, key=lambda kv: -kv[1])
SELECT TOP 3 NombreMarca, NombreModelo, SUM(Cantidad) AS UnidadesVendidas
FROM ventas
GROUP BY NombreMarca, NombreModelo
ORDER BY UnidadesVendidas DESC;`,
    description: 'Expositor 2 (Diapositiva 11): Top 3 modelos más vendidos (Runfalcon 41, Air Max 29, Smash 14), particiones y linaje DAG.',
    academicDocenteNote: 'Profesor, en la Diapositiva 11 utilizamos la acción takeOrdered(3, key=lambda kv: -kv[1]) sobre el RDD para extraer los 3 modelos más vendidos (Adidas Runfalcon con 41 uds, Nike Air Max con 29 uds y Puma Smash con 14 uds) sin necesidad de ordenar todo el RDD completo.',
    theoryConcept: 'Acción takeOrdered, Gestión de Particiones (repartition vs coalesce) y Grafo de Linaje (toDebugString).',
    lineByLine: [
      {
        lineNum: 1,
        code: 'SELECT TOP 3 NombreMarca, NombreModelo, SUM(Cantidad) AS UnidadesVendidas',
        explanation: 'Agrupa por la clave compuesta (marca, modelo) y suma las unidades vendidas.',
      },
      {
        lineNum: 2,
        code: 'ORDER BY UnidadesVendidas DESC;',
        explanation: 'En el RDD equivale a takeOrdered(3, key=lambda kv: -kv[1]), manteniendo un heap de tamaño 3 por partición.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Cuál es la diferencia técnica entre repartition(4) y coalesce(1)?',
        answer: 'repartition puede aumentar o disminuir particiones ejecutando un shuffle completo de los datos; coalesce solo sirve para reducir particiones uniendo particiones existentes sin hacer shuffle.',
      },
    ],
  },

  {
    id: 'sem14_sparksql_stock',
    title: 'Sem 14: SparkSQL Valor Stock',
    category: 'Big Data (PySpark)',
    badge: 'Expositor 3',
    badgeColor: 'purple',
    sql: `-- Expositor 3 (Semana 14 - Diapositivas 13 y 14): SparkSQL y DataFrame groupBy + agg
SELECT NombreMarca,
       SUM(Stock) AS Pares_Disponibles,
       ROUND(SUM(ValorInventario), 2) AS Valor_Inventario_Soles
FROM stock
GROUP BY NombreMarca
ORDER BY Valor_Inventario_Soles DESC;`,
    description: 'Expositor 3 (Diapositivas 13-15): Valorización de stock por marca en SparkSQL, Parquet y optimizador Catalyst.',
    academicDocenteNote: 'Profesor, como mostramos en las Diapositivas 13, 14 y 15 (Expositor 3), ya sea usando la API de DataFrames (groupBy + agg) o consultando la vista temporal con spark.sql(), el optimizador Catalyst genera exactamente el mismo plan físico de ejecución (verificado con explain()).',
    theoryConcept: 'SparkSQL, Vistas Temporales (createOrReplaceTempView), Almacenamiento Columnar Parquet y Optimizador Catalyst.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'SELECT NombreMarca, SUM(Stock) AS Pares_Disponibles, ROUND(SUM(ValorInventario), 2) AS Valor_Inventario_Soles',
        explanation: 'Calcula múltiples métricas agregadas por marca en una sola pasada sobre el DataFrame cacheado.',
      },
      {
        lineNum: 2,
        code: 'FROM stock GROUP BY NombreMarca ORDER BY Valor_Inventario_Soles DESC;',
        explanation: 'Consulta la vista temporal creada con df_stock.createOrReplaceTempView("stock").',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Por qué guardar el resumen en formato Parquet en lugar de CSV?',
        answer: 'Porque Parquet es un formato columnar comprimido que conserva el esquema de tipos de datos nativamente y permite lectura selectiva de columnas (predicate pushdown), siendo mucho más rápido y ligero que CSV.',
      },
    ],
  },

  {
    id: 'sem14_stock_sin_rotacion',
    title: 'Sem 14: Stock sin Rotación',
    category: 'Big Data (PySpark)',
    badge: 'Expositor 3',
    badgeColor: 'amber',
    sql: `-- Expositor 3 (Semana 14 - Diapositiva 14): Inventario sin rotación (S/ 262,564.68)
SELECT s.NombreMarca,
       SUM(s.Stock) AS Pares_Inmovilizados,
       ROUND(SUM(s.ValorInventario), 2) AS Valor_Inmovilizado_Soles
FROM stock s
LEFT JOIN ventas v ON s.NombreMarca = v.NombreMarca
WHERE v.NombreMarca IS NULL
GROUP BY s.NombreMarca;`,
    description: 'Expositor 3 (Diapositiva 14): Consulta SparkSQL LEFT JOIN ... WHERE IS NULL que aísla los S/ 262 mil sin rotación.',
    academicDocenteNote: 'Profesor, esta segunda consulta de la Diapositiva 14 es el equivalente en SparkSQL del leftOuterJoin de RDDs. Al cruzar la vista temporal stock con ventas mediante LEFT JOIN y filtrar WHERE v.NombreMarca IS NULL, aislamos las 3 marcas (New Balance, Converse y Vans) que suman S/ 262,564.68 de capital inmovilizado.',
    theoryConcept: 'Patrón Anti-Join en SQL (LEFT JOIN + IS NULL / left_anti) y Análisis de Rotación de Inventario.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'FROM stock s LEFT JOIN ventas v ON s.NombreMarca = v.NombreMarca',
        explanation: 'Cruza las vistas temporales de inventario y ventas por nombre de marca.',
      },
      {
        lineNum: 2,
        code: 'WHERE v.NombreMarca IS NULL GROUP BY s.NombreMarca;',
        explanation: 'Filtra exclusivamente aquellas marcas del catálogo que no registran ninguna transacción de venta.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Cómo se expresa este mismo LEFT JOIN ... WHERE IS NULL en el cierre del script de PySpark?',
        answer: 'Mediante un join de tipo "left_anti": df_stock.join(df_ventas.select("NombreMarca").distinct(), "NombreMarca", "left_anti").',
      },
    ],
  },

  {
    id: 'sem14_estadistica_cuantiles',
    title: 'Sem 14: describe & Cuantiles',
    category: 'Big Data (PySpark)',
    badge: 'Expositor 4',
    badgeColor: 'purple',
    sql: `-- Expositor 4 (Semana 14 - Diapositiva 17): describe(), stat.corr() y approxQuantile()
SELECT Funcion_Spark, Columna_TotalLinea, Columna_Utilidad, Interpretacion_Analitica
FROM vw_EstadisticaSpark;`,
    description: 'Expositor 4 (Diapositiva 17): Resumen estadístico, correlación de Pearson, cuartiles con approxQuantile y 31 líneas en pérdida.',
    academicDocenteNote: 'Profesor, en la Diapositiva 17 demostramos que una correlación de Pearson positiva entre TotalLinea y Utilidad no garantiza un margen sano: al calcular los cuartiles con approxQuantile([0.25, 0.5, 0.75], 0.01) y filtrar Utilidad < 0, comprobamos que 31 de las 59 líneas de venta generan pérdida.',
    theoryConcept: 'Estadística Descriptiva Distribuida, Correlación de Pearson (stat.corr) y Algoritmo Greenwald-Khanna (approxQuantile).',
    lineByLine: [
      {
        lineNum: 1,
        code: '-- df_ventas.select("TotalLinea", "Utilidad").describe().show()',
        explanation: 'Calcula en una sola llamada count, mean, stddev, min y max de ambas variables numéricas.',
      },
      {
        lineNum: 2,
        code: '-- df_ventas.stat.approxQuantile("Utilidad", [0.25, 0.5, 0.75], 0.01)',
        explanation: 'Obtiene Q1, mediana y Q3 con un error relativo de 1% sin necesidad de ordenar millones de filas.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Qué significa el tercer parámetro (0.01) en approxQuantile?',
        answer: 'Es el error relativo aceptado (1%). Si fuera 0 calcularía el cuantil exacto ordenando todo el cluster (muy costoso); con 0.01 responde en milisegundos con alta precisión.',
      },
    ],
  },

  {
    id: 'sem14_margenes_marca',
    title: 'Sem 14: Márgenes % & Crosstab',
    category: 'Big Data (PySpark)',
    badge: 'Expositor 4',
    badgeColor: 'purple',
    sql: `-- Expositor 4 (Semana 14 - Diapositiva 18): Margen de utilidad (%) por marca y tabla de contingencia
SELECT NombreMarca,
       ROUND(SUM(Utilidad) / SUM(TotalLinea) * 100, 1) AS MargenPct
FROM ventas
GROUP BY NombreMarca
ORDER BY MargenPct DESC;`,
    description: 'Expositor 4 (Diapositiva 18): Margen porcentual por marca (Reebok 41%, Adidas 20%, Nike 14%, Puma -1%) y crosstab Marca x Canal.',
    academicDocenteNote: 'Profesor, en la Diapositiva 18 calculamos el margen relativo (SUM(Utilidad) / SUM(TotalLinea) * 100). Descubrimos que Reebok vende poco pero tiene el mejor margen (+41%), mientras que Puma tiene margen negativo (-1%): vende volumen pero no deja ganancia neta.',
    theoryConcept: 'Márgenes Relativos Agregados y Tablas de Contingencia Multivariadas (stat.crosstab).',
    lineByLine: [
      {
        lineNum: 1,
        code: 'ROUND(SUM(Utilidad) / SUM(TotalLinea) * 100, 1) AS MargenPct',
        explanation: 'Divide la utilidad neta acumulada de la marca entre sus ingresos totales facturados.',
      },
      {
        lineNum: 2,
        code: '-- df_ventas.stat.crosstab("NombreMarca", "Canal").show()',
        explanation: 'Genera la matriz de frecuencia cruzada para ver qué marcas se mueven en qué canales de venta.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Para qué sirve stat.crosstab("NombreMarca", "Canal")?',
        answer: 'Construye una tabla de contingencia entre dos variables categóricas, mostrando cuántas transacciones tiene cada marca en cada canal comercial (Tienda, Web, WhatsApp, Redes).',
      },
    ],
  },

  {
    id: 'sem14_modelos_perdida',
    title: 'Sem 14: Modelos con Pérdida',
    category: 'Big Data (PySpark)',
    badge: 'Expositor 4',
    badgeColor: 'red',
    sql: `-- Expositor 4 (Semana 14 - Diapositiva 19): Pérdida acumulada por modelo (Utilidad < 0)
SELECT NombreMarca, NombreModelo,
       ROUND(SUM(Utilidad), 2) AS Perdida
FROM ventas
WHERE Utilidad < 0
GROUP BY NombreMarca, NombreModelo
ORDER BY Perdida ASC;`,
    description: 'Expositor 4 (Diapositiva 19): Hallazgo crítico donde Adidas Runfalcon (-379.98), Nike Air Max (-155.19) y Puma Smash (-25.41) pierden dinero.',
    academicDocenteNote: 'Profesor, cerramos la Diapositiva 19 con el hallazgo más importante del análisis: al filtrar Utilidad < 0 y agrupar por modelo, demostramos que Adidas Runfalcon —que era el Top 1 más vendido con 41 pares— es también el modelo que más pérdida genera (S/ -379.98), evidenciando un error en la política de descuentos o cálculo de costos.',
    theoryConcept: 'Muestreo Reproducible con Semilla (sample seed=42), Filtrado de Anomalías Financieras y Diagnóstico de Rentabilidad.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'WHERE Utilidad < 0',
        explanation: 'Equivalente a df_ventas.filter(F.col("Utilidad") < 0), aislando las 31 líneas deficitarias.',
      },
      {
        lineNum: 2,
        code: 'GROUP BY NombreMarca, NombreModelo ORDER BY Perdida ASC;',
        explanation: 'Suma la pérdida acumulada por modelo y ordena desde la pérdida más severa (-379.98).',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Por qué se usa seed=42 en df_ventas.sample(withReplacement=False, fraction=0.10, seed=42)?',
        answer: 'Para garantizar reproducibilidad científica: al fijar la semilla pseudoaleatoria (seed=42), cualquier miembro del equipo o el docente obtendrá exactamente la misma muestra del 10% al ejecutar el código.',
      },
    ],
  },

  {
    id: 'dw_reconciliacion_olap',
    title: 'Reconciliación OLTP vs DW',
    category: 'Data Warehouse (Kimball)',
    badge: 'Script 04',
    badgeColor: 'emerald',
    sql: `-- Script 04: Reconciliación matemática multinivel OLTP vs Data Warehouse (Diferencia = 0)
SELECT Metrica_Auditada, Base_OLTP_3FN, DataWarehouse_Kimball, Diferencia, Estado_Reconciliacion
FROM dw.vw_Reconciliacion;`,
    description: 'Verificación de calidad de datos del ETL: compara las sumas de UrbanStylosDB (OLTP) contra UrbanStylosDW (Kimball) con diferencia cero.',
    academicDocenteNote: 'Profesor, todo proceso ETL profesional requiere una prueba de reconciliación financiera. Esta consulta del Script 04 compara los totales de la base transaccional 3FN contra la tabla de hechos dw.FactVentas, demostrando que la diferencia es exactamente S/ 0.00.',
    theoryConcept: 'Calidad de Datos en ETL, Reconciliación Financiera Multinivel y Consistencia OLTP-OLAP.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'SELECT Metrica_Auditada, Base_OLTP_3FN, DataWarehouse_Kimball, Diferencia',
        explanation: 'Evalúa en paralelo las sumas de ventas netas, utilidad, líneas facturadas y variantes en stock.',
      },
      {
        lineNum: 2,
        code: 'FROM dw.vw_Reconciliacion;',
        explanation: 'Verifica que ABS(SUM(OLTP) - SUM(DW)) sea igual a 0 en todas las dimensiones.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Qué pasaría si la diferencia entre OLTP y Data Warehouse no fuera cero?',
        answer: 'Indicaría una fuga de datos en el pipeline ETL (por ejemplo, un INNER JOIN que descartó registros huérfanos o una falla en la carga incremental), la cual queda registrada en meta.BitacoraETL.',
      },
    ],
  },
];

