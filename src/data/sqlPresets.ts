export interface LineExplanation {
  lineNum: number;
  code: string;
  explanation: string;
}

export type SqlPresetCategory =
  | 'Seguridad & RBAC'
  | 'OLTP (3FN)'
  | 'Transaccional (ACID)'
  | 'Data Warehouse (Kimball)'
  | 'Auditoría & Triggers'
  | 'Big Data (PySpark)';

export interface SqlPreset {
  id: string;
  title: string;
  category: SqlPresetCategory;
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
  // ===========================================================================
  // MÓDULO I: DEMOSTRACIÓN SECUENCIAL DE SEGURIDAD, RBAC & USUARIOS (PASOS 1 AL 9)
  // ===========================================================================
  {
    id: 'demo_sec_paso1_consultar',
    title: '[DEMO 1] Consultar Usuarios & Roles',
    category: 'Seguridad & RBAC',
    badge: 'Paso 1: 3FN',
    badgeColor: 'blue',
    sql: `-- PASO 1: Consulta del Catálogo de Cuentas y Roles de Seguridad (3FN)
SELECT 
    u.IdUsuario,
    u.NombreUsuario,
    e.Nombres + ' ' + e.Apellidos AS Empleado,
    e.Correo,
    r.NombreRol,
    u.Salt,
    u.ClaveHash,
    CASE WHEN u.Activo = 1 THEN 'ACTIVO' ELSE 'INACTIVO' END AS Estado
FROM dbo.Usuario u
INNER JOIN dbo.Rol r ON r.IdRol = u.IdRol
INNER JOIN dbo.Empleado e ON e.IdEmpleado = u.IdEmpleado;`,
    description: 'Paso 1: Consulta normalizada en 3FN que une Empleado, Usuario y Rol mostrando credenciales criptográficas (Salt y Hash SHA-256).',
    academicDocenteNote: 'Profesor, este primer paso demuestra la Tercera Forma Normal (3FN) en la seguridad: separamos Empleado (persona física de RRHH), Usuario (cuenta criptográfica en el sistema) y Rol (perfil de autorización). Cada usuario cuenta con un Salt único y su clave encriptada.',
    theoryConcept: 'Tercera Forma Normal (3FN), Separación de Entidades, Control de Acceso Basado en Roles (RBAC) y Criptografía de Contraseñas.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'SELECT u.IdUsuario, u.NombreUsuario, e.Nombres...',
        explanation: 'Proyecta los datos de identidad laboral, el identificador de cuenta, el rol y las credenciales hash.',
      },
      {
        lineNum: 2,
        code: 'FROM dbo.Usuario u INNER JOIN dbo.Rol r... INNER JOIN dbo.Empleado e...',
        explanation: 'Une mediante llaves foráneas las tablas maestras de seguridad cumpliendo el diseño relacional 3FN.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Por qué no almacenar el correo, la clave y el rol en una sola tabla de Empleados?',
        answer: 'Porque violaría la 3FN al introducir dependencias transitivas. Además, un empleado físico puede existir sin cuenta informática, o su cuenta puede ser dada de baja sin perder el historial laboral ni la integridad referencial de comprobantes.',
      },
    ],
  },

  {
    id: 'demo_sec_paso2_crear_rol',
    title: '[DEMO 2] Crear Nuevo Rol (RBAC)',
    category: 'Seguridad & RBAC',
    badge: 'Paso 2: Rol',
    badgeColor: 'emerald',
    sql: `-- PASO 2: Creación de un Nuevo Perfil de Seguridad en el Catálogo de Roles
INSERT INTO dbo.Rol (NombreRol, Descripcion)
VALUES ('Supervisor', 'Supervisión de tienda, arqueo de caja y auditoría de inventario');`,
    description: 'Paso 2: Inserción DML de un nuevo perfil en dbo.Rol demostrando la escalabilidad del modelo RBAC sin alterar esquemas.',
    academicDocenteNote: 'Profesor, si el negocio abre nuevas sucursales y requiere un cargo de Supervisor, no alteramos la estructura de tablas ni el código fuente: simplemente insertamos la nueva tupla en dbo.Rol y el motor le asigna su IdRol autoincremental.',
    theoryConcept: 'Escalabilidad Relacional, Catálogos Dinámicos y Modelo RBAC (Role-Based Access Control).',
    lineByLine: [
      {
        lineNum: 1,
        code: 'INSERT INTO dbo.Rol (NombreRol, Descripcion)',
        explanation: 'Instrucción DML para incorporar el nuevo perfil de seguridad al catálogo maestro.',
      },
      {
        lineNum: 2,
        code: "VALUES ('Supervisor', 'Supervisión de tienda...');",
        explanation: 'Define el nombre del rol y su ámbito funcional en la organización.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Qué tipo de integridad protege que no se repitan roles duplicados?',
        answer: 'La integridad de unicidad mediante un CONSTRAINT UQ_Rol_NombreRol UNIQUE (NombreRol).',
      },
    ],
  },

  {
    id: 'demo_sec_paso3_permisos_dcl',
    title: '[DEMO 3] Asignar Permisos DCL',
    category: 'Seguridad & RBAC',
    badge: 'Paso 3: DCL',
    badgeColor: 'purple',
    sql: `-- PASO 3: Asignación de Permisos DCL (Principio de Menor Privilegio)
-- Concedemos lectura a vistas operativas y emisión de comprobantes:
GRANT SELECT ON dbo.vw_StockActual TO Rol_Supervisor;
GRANT SELECT, INSERT ON dbo.Comprobante TO Rol_Supervisor;

-- Denegamos explícitamente modificación o borrado de comprobantes fiscales:
DENY UPDATE, DELETE ON dbo.Comprobante TO Rol_Supervisor;`,
    description: 'Paso 3: Aplicación de sentencias DCL (GRANT / DENY) sobre objetos de base de datos bajo el principio de menor privilegio.',
    academicDocenteNote: 'Profesor, la seguridad no se limita a la interfaz web: en la base de datos aplicamos DCL (Data Control Language). Con GRANT concedemos SELECT sobre el inventario y con DENY prohibimos taxativamente el DELETE sobre comprobantes por normativa fiscal.',
    theoryConcept: 'Data Control Language (DCL), Principio de Menor Privilegio (PoLP) y Seguridad en Capa de Datos.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'GRANT SELECT ON dbo.vw_StockActual TO Rol_Supervisor;',
        explanation: 'Otorga derecho de lectura sobre la vista de existencias sin exponer las tablas base subyacentes.',
      },
      {
        lineNum: 2,
        code: 'DENY UPDATE, DELETE ON dbo.Comprobante TO Rol_Supervisor;',
        explanation: 'En SQL Server, un DENY explícito tiene máxima prioridad y anula cualquier permiso heredado.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Qué diferencia hay entre REVOKE y DENY?',
        answer: 'REVOKE retira un permiso previamente concedido, mientras que DENY bloquea activamente el permiso, incluso si el usuario lo hereda de otro grupo o rol.',
      },
    ],
  },

  {
    id: 'demo_sec_paso4_insert_usuario',
    title: '[DEMO 4] Registrar Usuario SHA-256',
    category: 'Seguridad & RBAC',
    badge: 'Paso 4: Hash + Salt',
    badgeColor: 'emerald',
    sql: `-- PASO 4: Inserción de Nuevo Usuario con Salt (128 bits) y Hash SHA-256
-- El motor genera un Salt aleatorio (NEWID) para blindar contra Rainbow Tables:
DECLARE @NuevoSalt UNIQUEIDENTIFIER = NEWID();
DECLARE @ClavePlana VARCHAR(50) = 'Supervisor2026*';

INSERT INTO dbo.Usuario (IdEmpleado, IdRol, NombreUsuario, Correo, ClaveHash, Salt, Activo)
VALUES (
    3, 
    3, 
    'cmendoza', 
    'carlos.mendoza@urbanstyle.pe', 
    HASHBYTES('SHA2_256', @ClavePlana + CAST(@NuevoSalt AS VARCHAR(36))), 
    @NuevoSalt, 
    1
);`,
    description: 'Paso 4: Alta de credenciales con generación de Salt criptográfico y HASHBYTES SHA-256. El usuario queda listo para operar.',
    academicDocenteNote: 'Profesor, aquí demostramos el registro seguro de credenciales: nunca guardamos contraseñas legibles en disco. Generamos un Salt único de 128 bits con NEWID() y almacenamos el resultado de HASHBYTES("SHA2_256", @ClavePlana + @Salt). El nuevo usuario ya puede iniciar sesión en la web.',
    theoryConcept: 'Funciones Criptográficas Hash Unidireccionales (SHA-256), Prevención de Rainbow Tables con Salting y Autenticación Segura.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'DECLARE @NuevoSalt UNIQUEIDENTIFIER = NEWID();',
        explanation: 'Genera un valor pseudoaleatorio único global (UUID) de 128 bits específico para esta cuenta.',
      },
      {
        lineNum: 2,
        code: "HASHBYTES('SHA2_256', @ClavePlana + CAST(@NuevoSalt AS VARCHAR(36)))",
        explanation: 'Calcula el hash criptográfico binario de 256 bits (32 bytes) combinando la clave plana con el Salt.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Por qué no basta con usar HASHBYTES("SHA2_256", @ClavePlana) sin Salt?',
        answer: 'Porque si dos usuarios eligen la misma clave débil (ej. "123456"), tendrían exactamente el mismo hash en la base de datos y un atacante con tablas precalculadas (Rainbow Tables) rompería ambas al instante.',
      },
    ],
  },

  {
    id: 'demo_sec_paso5_validar_login',
    title: '[DEMO 5] Probar Login (usp_ValidarLogin)',
    category: 'Seguridad & RBAC',
    badge: 'Paso 5: Login OK',
    badgeColor: 'emerald',
    sql: `-- PASO 5: Verificación Criptográfica de Login vía Stored Procedure
EXEC dbo.usp_ValidarLogin 
    @p_UsuarioOCorreo = 'carlos.mendoza@urbanstyle.pe', 
    @p_ClavePlana = 'Supervisor2026*';`,
    description: 'Paso 5: Ejecución del Stored Procedure que valida las credenciales del nuevo usuario creado, certificando hash y rol.',
    academicDocenteNote: 'Profesor, este es el procedimiento que ejecuta el botón "Entrar" del login. Recupera el Salt del usuario, calcula en memoria HASHBYTES("SHA2_256", @ClaveIngresada + @Salt), confirma que coincida con ClaveHash y registra el acceso exitoso en dbo.Auditoria.',
    theoryConcept: 'Procedimientos Almacenados de Autenticación, Verificación Criptográfica y Auditoría Automática.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'EXEC dbo.usp_ValidarLogin @p_UsuarioOCorreo = ..., @p_ClavePlana = ...;',
        explanation: 'Invoca el procedimiento transaccional compilado en UrbanStylosDB que centraliza las validaciones de acceso.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Qué información devuelve este procedimiento si el login es correcto?',
        answer: 'Devuelve IdUsuario, NombreUsuario, Empleado, Correo, IdRol y NombreRol mediante un INNER JOIN entre Usuario, Empleado y Rol para inicializar la sesión del usuario.',
      },
    ],
  },

  {
    id: 'demo_sec_paso6_desactivar_usuario',
    title: '[DEMO 6] Desactivar Usuario (Baja)',
    category: 'Seguridad & RBAC',
    badge: 'Paso 6: Revocación',
    badgeColor: 'amber',
    sql: `-- PASO 6: Revocación de Acceso (Baja Lógica / Desactivación de Seguridad)
UPDATE dbo.Usuario
SET Activo = 0
WHERE Correo = 'carlos.mendoza@urbanstyle.pe';`,
    description: 'Paso 6: Baja lógica de la cuenta mediante Activo = 0. Se suspende el acceso al instante sin destruir datos históricos.',
    academicDocenteNote: 'Profesor, en auditoría corporativa (COBIT / ISO 27001), los usuarios que dejan la empresa no se borran físicamente de inmediato para preservar la trazabilidad de sus operaciones pasadas; se aplica un UPDATE Usuario SET Activo = 0 que revoca el acceso en tiempo real.',
    theoryConcept: 'Baja Lógica (Soft Delete), Trazabilidad Histórica y Preservación de Claves Foráneas.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'UPDATE dbo.Usuario SET Activo = 0 WHERE Correo = ...;',
        explanation: 'Modifica el flag booleano de habilitación. Al estar en 0, el SP de login bloqueará cualquier intento posterior.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Por qué no hacer directamente un DELETE?',
        answer: 'Porque si el usuario ya registró ventas o movimientos de inventario, un DELETE provocaría un error de violación de clave foránea (FK), o rompería la integridad referencial de los reportes históricos.',
      },
    ],
  },

  {
    id: 'demo_sec_paso7_login_bloqueado',
    title: '[DEMO 7] Probar Login Desactivado',
    category: 'Seguridad & RBAC',
    badge: 'Paso 7: Rechazado',
    badgeColor: 'red',
    sql: `-- PASO 7: Comprobación de Seguridad: Rechazo de Usuario Inactivo
EXEC dbo.usp_ValidarLogin 
    @p_UsuarioOCorreo = 'carlos.mendoza@urbanstyle.pe', 
    @p_ClavePlana = 'Supervisor2026*';`,
    description: 'Paso 7: Prueba de penetración: el SP detecta Activo = 0, rechaza el acceso con código -3 y audita el bloqueo de seguridad.',
    academicDocenteNote: 'Profesor, al volver a probar el login con la contraseña correcta, el motor rechaza la autenticación: el SP verifica IF @Activo = 0 BEGIN RAISERROR("Usuario inactivo", 16, 1) RETURN -3; END. Así demostramos la efectividad inmediata de la política de revocación.',
    theoryConcept: 'Control de Acceso Dinámico, Validación de Estados de Cuenta y Bloqueo de Cuentas Inactivas.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'EXEC dbo.usp_ValidarLogin ...;',
        explanation: 'Ejecuta la validación con credenciales válidas sobre una cuenta inactiva, arrojando error de seguridad.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Qué código de error retorna el SP cuando la cuenta está inactiva?',
        answer: 'Retorna el código -3 (USUARIO_INACTIVO), diferenciándolo del código -2 (CLAVE_INCORRECTA) y -1 (USUARIO_NO_EXISTE).',
      },
    ],
  },

  {
    id: 'demo_sec_paso8_eliminar_usuario',
    title: '[DEMO 8] Eliminar Usuario (DELETE)',
    category: 'Seguridad & RBAC',
    badge: 'Paso 8: DELETE',
    badgeColor: 'red',
    sql: `-- PASO 8: Eliminación Física de Cuenta en dbo.Usuario
DELETE FROM dbo.Usuario
WHERE Correo = 'carlos.mendoza@urbanstyle.pe';`,
    description: 'Paso 8: Eliminación física DML del registro en dbo.Usuario demostrando la remoción completa de la cuenta de prueba.',
    academicDocenteNote: 'Profesor, completamos el ciclo de vida del usuario: si la cuenta fue creada para una prueba y no tiene ventas vinculadas, ejecutamos el DELETE FROM dbo.Usuario eliminando la fila del catálogo y dejando constancia en dbo.Auditoria.',
    theoryConcept: 'Ciclo de Vida de Identidades (Identity Lifecycle Management), Integridad de Datos y Operaciones DML.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'DELETE FROM dbo.Usuario WHERE Correo = ...;',
        explanation: 'Instrucción DML que remueve físicamente la fila en base al predicado de filtro único por correo.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Qué sucede si se intenta eliminar un usuario que ya tiene comprobantes asociados?',
        answer: 'El motor SQL Server aborta la transacción con error 547 (The DELETE statement conflicted with the REFERENCE constraint) protegiendo los datos contables.',
      },
    ],
  },

  {
    id: 'demo_sec_paso9_auditoria',
    title: '[DEMO 9] Auditoría Forense (Logs)',
    category: 'Seguridad & RBAC',
    badge: 'Paso 9: Auditoría',
    badgeColor: 'purple',
    sql: `-- PASO 9: Inspección Forense de Todos los Eventos de Seguridad Ejecutados
SELECT TOP 10 
    IdAuditoria, 
    Tabla, 
    Operacion, 
    IdRegistro, 
    ValorAnterior, 
    ValorNuevo, 
    Usuario, 
    Fecha
FROM dbo.Auditoria
ORDER BY IdAuditoria DESC;`,
    description: 'Paso 9: Consulta forense que comprueba que la inserción, el login, la desactivación y el borrado quedaron grabados con fecha y hora.',
    academicDocenteNote: 'Profesor, este último paso corona la demostración de seguridad: cada acción ejecutada en los pasos anteriores (INSERT de Rol, INSERT de Usuario, LOGIN_AUTH, UPDATE a inactivo y DELETE) generó automáticamente una fila en dbo.Auditoria para peritaje forense.',
    theoryConcept: 'Trazabilidad Forense, Estándares de Auditoría de Sistemas (COBIT / ISO 27001) y Tablas de Registro Inmutable.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'SELECT TOP 10 IdAuditoria, Tabla, Operacion, IdRegistro...',
        explanation: 'Extrae las últimas 10 operaciones de auditoría ordenadas descendentemente por identificador secuencial.',
      },
      {
        lineNum: 2,
        code: 'FROM dbo.Auditoria ORDER BY IdAuditoria DESC;',
        explanation: 'Permite al oficial de seguridad inspeccionar quién, cuándo y qué valores alteró en el sistema.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Por qué la tabla Auditoria no tiene trigger de DELETE?',
        answer: 'Porque una tabla de auditoría debe ser inmutable (Append-Only): nadie, ni el propio administrador, debe poder alterar los registros que documentan auditorías de seguridad.',
      },
    ],
  },

  // ===========================================================================
  // MÓDULO II: OPERACIÓN TRANSACCIONAL & OLTP EN 3FN
  // ===========================================================================
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
        code: '@Cantidad = 2,',
        explanation: 'Número de pares solicitados. El SP valida internamente que Stock >= @Cantidad antes de continuar.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Qué garantiza que dos cajeros no vendan el mismo último par simultáneamente?',
        answer: 'Dentro del SP se utiliza la cláusula WITH (UPDLOCK, ROWLOCK) al verificar el stock dentro de una transacción serializable, bloqueando la fila hasta que termine el COMMIT o ROLLBACK.',
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
    academicDocenteNote: 'Profesor, esta instrucción DML demuestra la persistencia relacional y la reactividad: al insertarse el registro en VarianteProducto, se calcula automáticamente su SKU mediante reglas de negocio y se refleja inmediatamente en el inventario.',
    theoryConcept: 'Lenguaje de Manipulación de Datos (DML), Integridad Referencial de Entidad y Claves Candidatas.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'INSERT INTO VarianteProducto (...)',
        explanation: 'Declara la operación de inserción y la lista explícita de campos a poblar en la tabla de variantes.',
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
    academicDocenteNote: 'Profesor, esta consulta representa una orden de ingreso de mercadería a almacén. Utiliza un operador de acumulación atómico (Stock = Stock + 15) que previene inconsistencias por lecturas sucias en entornos concurrentes.',
    theoryConcept: 'Actualizaciones Atómicas, Cláusula WHERE Determinista y Bloqueo de Registros.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'UPDATE VarianteProducto SET Stock = Stock + 15 WHERE NombreMarca = ...',
        explanation: 'Incrementa el inventario atómicamente restringiendo el impacto únicamente a los productos de la marca especificada.',
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
        code: 'SELECT NombreMarca, COUNT(*), SUM(Stock), AVG(Precio)...',
        explanation: 'Calcula métricas resumen agrupando los registros por la dimensión de marca comercial.',
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
    academicDocenteNote: 'Profesor, este query opera como un disparador de reposición en la cadena de suministro. Ayuda a evitar la rotura de stock priorizando los productos más cercanos a agotarse.',
    theoryConcept: 'Predicados de Rango en WHERE, Index Scans y Reglas de Punto de Reorden (ROP).',
    lineByLine: [
      {
        lineNum: 1,
        code: 'WHERE Stock <= 15 ORDER BY Stock ASC;',
        explanation: 'Filtra modelos con existencias críticas ordenándolos de menor a mayor disponibilidad.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Cómo se optimizaría esta consulta en una base de datos de 500,000 pares?',
        answer: 'Creando un índice filtrado no agrupado (Filtered Non-Clustered Index) con la condición WHERE Stock <= 15.',
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
    theoryConcept: 'Disparadores de Base de Datos (Triggers INSTEAD OF / AFTER), Rollback Transaccional e Inmutabilidad Fiscal.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'DELETE FROM Comprobante WHERE IdComprobante = 1;',
        explanation: 'Comando que intenta borrar el comprobante fiscal #1 emitido en el sistema.',
      },
      {
        lineNum: 2,
        code: '-- Disparo de TR_Comprobante_Inmutable',
        explanation: 'El trigger detecta la acción, ejecuta RAISERROR 50001, realiza ROLLBACK y escribe el intento en dbo.Auditoria.',
      },
    ],
    teacherQuestions: [
      {
        question: 'Si un cliente pide anular una compra, ¿cómo se hace si el DELETE está bloqueado?',
        answer: 'Se crea un registro de Nota de Crédito en la tabla NotaCredito que referencia al comprobante original, anulando el efecto contable sin destruir la evidencia histórica.',
      },
    ],
  },

  // ===========================================================================
  // MÓDULO III: DATA WAREHOUSE & MODELO ESTRELLA (KIMBALL)
  // ===========================================================================
  {
    id: 'kpis_negocio_consolidados',
    title: 'KPIs Clave de Negocio & Big Data',
    category: 'Data Warehouse (Kimball)',
    badge: 'KPIs Clave',
    badgeColor: 'amber',
    sql: `-- Verificación de los 4 KPIs estratégicos del negocio (OLTP + DW + Spark)
SELECT IndicadorClave, ValorVerificado, OrigenDatos, FormulaSpark_SQL, ImpactoNegocio
FROM vw_ResumenEjecutivoKPIs;`,
    description: 'Consolidado ejecutivo: S/ 11,173.39 ventas sin IGV, S/ 1,960.75 utilidad neta, 31/59 líneas en pérdida y S/ 262 mil sin rotación.',
    academicDocenteNote: 'Profesor, esta vista resume los 4 hallazgos clave de nuestro análisis integral conectando SQL Server (OLTP), el modelo estrella de Kimball (DW) y Apache Spark: S/ 11,173.39 en ventas netas sin IGV, S/ 1,960.75 de utilidad neta total, 31 de 59 líneas vendidas con pérdida y S/ 262,564.68 de inventario sin rotación.',
    theoryConcept: 'Integración OLTP -> ETL -> Data Warehouse Kimball -> Apache Spark y Toma de Decisiones Basada en Datos.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'SELECT IndicadorClave, ValorVerificado, OrigenDatos...',
        explanation: 'Muestra cada indicador clave del negocio junto con la operación exacta de Spark / SQL que lo calculó.',
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
        explanation: 'Consulta la tabla de hechos en el esquema "dw", proyectando claves SK y medidas financieras.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Qué diferencia hay entre la tabla transaccional Comprobante y dw.FactVentas?',
        answer: 'Comprobante está en 3FN optimizada para lecturas y escrituras unitarias rápidas (OLTP). FactVentas está desnormalizada, contiene medidas precalculadas (Utilidad, Margen) y está optimizada para consultas analíticas de reportería (OLAP).',
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
    id: 'ley_29733_ddm',
    title: 'Ley 29733 (Masking DDM)',
    category: 'Data Warehouse (Kimball)',
    badge: 'Ley N.° 29733',
    badgeColor: 'red',
    sql: `-- Enmascaramiento Dinámico de Datos (DDM) - Ley N.° 29733 de Protección de Datos Personales
SELECT SK_Cliente, TipoDocumento, NumeroDocumento, NombreRazonSocial, Correo, Telefono, Distrito
FROM dw.DimCliente;`,
    description: 'Demostración de protección de datos personales (PII) con Dynamic Data Masking en el Data Warehouse.',
    academicDocenteNote: 'Profesor, uno de los requerimientos críticos en analítica es proteger la información confidencial. Aplicamos Dynamic Data Masking (DDM) en SQL Server sobre dw.DimCliente para cumplir con la Ley N.° 29733 de Protección de Datos Personales del Perú.',
    theoryConcept: 'Dynamic Data Masking (DDM), Cumplimiento Normativo Ley N.° 29733 y Privacidad en Entornos Analíticos.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'SELECT SK_Cliente, TipoDocumento, NumeroDocumento, NombreRazonSocial, Correo, Telefono...',
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
    id: 'dw_reconciliacion_olap',
    title: 'Reconciliación OLTP vs DW',
    category: 'Data Warehouse (Kimball)',
    badge: 'ETL Quality',
    badgeColor: 'emerald',
    sql: `-- Reconciliación matemática multinivel OLTP vs Data Warehouse (Diferencia = 0)
SELECT Metrica_Auditada, Base_OLTP_3FN, DataWarehouse_Kimball, Diferencia, Estado_Reconciliacion
FROM dw.vw_Reconciliacion;`,
    description: 'Verificación de calidad de datos del ETL: compara las sumas de UrbanStylosDB (OLTP) contra UrbanStylosDW (Kimball) con diferencia cero.',
    academicDocenteNote: 'Profesor, todo proceso ETL profesional requiere una prueba de reconciliación financiera. Esta consulta compara los totales de la base transaccional 3FN contra la tabla de hechos dw.FactVentas, demostrando que la diferencia es exactamente S/ 0.00.',
    theoryConcept: 'Calidad de Datos en ETL, Reconciliación Financiera Multinivel y Consistencia OLTP-OLAP.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'SELECT Metrica_Auditada, Base_OLTP_3FN, DataWarehouse_Kimball, Diferencia...',
        explanation: 'Evalúa en paralelo las sumas de ventas netas, utilidad, líneas facturadas y variantes en stock.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Qué pasaría si la diferencia entre OLTP y Data Warehouse no fuera cero?',
        answer: 'Indicaría una fuga de datos en el pipeline ETL (por ejemplo, un INNER JOIN que descartó registros huérfanos o una falla en la carga incremental).',
      },
    ],
  },

  // ===========================================================================
  // MÓDULO IV: PROCESAMIENTO ANALÍTICO DISTRIBUIDO & BIG DATA (PYSPARK)
  // ===========================================================================
  {
    id: 'spark_limpieza_bom',
    title: '01. Ingesta y Limpieza CSV (BOM)',
    category: 'Big Data (PySpark)',
    badge: 'PySpark Ingesta',
    badgeColor: 'purple',
    sql: `-- Módulo 1: Ingesta de Datos, Remoción de BOM (\\ufeff), filtro sqlcmd y Type Casting
SELECT Dataset_CSV, FilasBrutas_SQLCMD, FilasSuciasFiltradas, RegistrosLimpios, TransformacionesAplicadas
FROM vw_LimpiezaSpark;`,
    description: 'Módulo 1: Limpieza de marca BOM de Windows, filtrado de líneas sqlcmd y casteo a 59 ventas y 275 stocks.',
    academicDocenteNote: 'Profesor, al exportar los CSV desde SQL Server con sqlcmd se generan dos problemas reales: la marca BOM invisible (\\ufeff) pegada a la primera columna y filas basura con guiones "---" y "rows affected". Nuestro pipeline limpia el BOM con toDF, filtra las filas corruptas y aplica cast explícito obteniendo 59 registros limpios de ventas y 275 de stock.',
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
    ],
    teacherQuestions: [
      {
        question: '¿Por qué configuraron spark.sql.shuffle.partitions en 8 en lugar del valor por defecto?',
        answer: 'Porque el valor por defecto en Spark es 200 particiones. Para un dataset de 59 ventas y 275 variantes en modo local[*], 200 particiones generaría sobrecarga de planificación de tareas vacías; 8 particiones aprovecha los núcleos locales de forma óptima.',
      },
    ],
  },

  {
    id: 'spark_left_outer_join',
    title: '02. Pair RDDs & leftOuterJoin',
    category: 'Big Data (PySpark)',
    badge: 'PySpark RDD',
    badgeColor: 'purple',
    sql: `-- Módulo 2: Operaciones sobre Pair RDDs: stock_por_marca.leftOuterJoin(ventas_por_marca)
SELECT s.NombreMarca,
       SUM(s.Stock) AS Stock_Pares,
       ISNULL(SUM(v.TotalLinea), 0) AS Ventas_Soles,
       ISNULL(SUM(v.Utilidad), 0) AS Utilidad_Soles
FROM stock s
LEFT OUTER JOIN ventas v ON s.NombreMarca = v.NombreMarca
GROUP BY s.NombreMarca
ORDER BY Stock_Pares DESC;`,
    description: 'Módulo 2: Comparativa entre join interno (4 marcas) y leftOuterJoin (7 marcas, hallando 3 sin ventas).',
    academicDocenteNote: 'Profesor, aquí demostramos por qué el join interno entre RDDs clave-valor descartaba 3 marcas completas. Al aplicar stock_por_marca.leftOuterJoin(ventas_por_marca) partiendo del stock, conservamos las 7 marcas y descubrimos el hallazgo de negocio: New Balance, Converse y Vans tienen 675 pares cada una y cero ventas.',
    theoryConcept: 'Pair RDDs (Clave-Valor), Transformaciones reduceByKey, Inner Join vs LeftOuterJoin y Detección de Capital Inmovilizado.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'SELECT s.NombreMarca, SUM(s.Stock) AS Stock_Pares, ...',
        explanation: 'Equivalente a combinar las tuplas (marca, stock_total) con (marca, (ventas, utilidad)) tras reduceByKey.',
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
    id: 'spark_top3_takeordered',
    title: '03. Ranking RDD (takeOrdered)',
    category: 'Big Data (PySpark)',
    badge: 'PySpark Acciones',
    badgeColor: 'purple',
    sql: `-- Módulo 2: Extracción eficiente de ranking: takeOrdered(3, key=lambda kv: -kv[1])
SELECT TOP 3 NombreMarca, NombreModelo, SUM(Cantidad) AS UnidadesVendidas
FROM ventas
GROUP BY NombreMarca, NombreModelo
ORDER BY UnidadesVendidas DESC;`,
    description: 'Módulo 2: Top 3 modelos más vendidos (Runfalcon 41, Air Max 29, Smash 14), particiones y linaje DAG.',
    academicDocenteNote: 'Profesor, utilizamos la acción takeOrdered(3, key=lambda kv: -kv[1]) sobre el RDD para extraer los 3 modelos más vendidos (Adidas Runfalcon con 41 uds, Nike Air Max con 29 uds y Puma Smash con 14 uds) sin necesidad de ordenar todo el RDD completo en el cluster.',
    theoryConcept: 'Acción takeOrdered, Gestión de Particiones (repartition vs coalesce) y Grafo de Linaje (toDebugString).',
    lineByLine: [
      {
        lineNum: 1,
        code: 'SELECT TOP 3 NombreMarca, NombreModelo, SUM(Cantidad)...',
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
    id: 'spark_sparksql_stock',
    title: '04. SparkSQL & Persistencia Parquet',
    category: 'Big Data (PySpark)',
    badge: 'SparkSQL',
    badgeColor: 'purple',
    sql: `-- Módulo 3: SparkSQL y DataFrame API: groupBy + agg y optimizador Catalyst
SELECT NombreMarca,
       SUM(Stock) AS Pares_Disponibles,
       ROUND(SUM(ValorInventario), 2) AS Valor_Inventario_Soles
FROM stock
GROUP BY NombreMarca
ORDER BY Valor_Inventario_Soles DESC;`,
    description: 'Módulo 3: Valorización de stock por marca en SparkSQL, Parquet y optimizador Catalyst.',
    academicDocenteNote: 'Profesor, ya sea usando la API de DataFrames (groupBy + agg) o consultando la vista temporal con spark.sql(), el optimizador Catalyst genera exactamente el mismo plan físico de ejecución (verificado con explain()).',
    theoryConcept: 'SparkSQL, Vistas Temporales (createOrReplaceTempView), Almacenamiento Columnar Parquet y Optimizador Catalyst.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'SELECT NombreMarca, SUM(Stock), ROUND(SUM(ValorInventario), 2)...',
        explanation: 'Calcula múltiples métricas agregadas por marca en una sola pasada sobre el DataFrame cacheado.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Por qué guardar el resumen en formato Parquet en lugar de CSV?',
        answer: 'Porque Parquet es un formato columnar comprimido que conserva el esquema de tipos nativamente y permite lectura selectiva de columnas (predicate pushdown), siendo mucho más rápido y ligero que CSV.',
      },
    ],
  },

  {
    id: 'spark_stock_sin_rotacion',
    title: '05. Capital Inmovilizado (Anti-Join)',
    category: 'Big Data (PySpark)',
    badge: 'SparkSQL',
    badgeColor: 'amber',
    sql: `-- Módulo 3: Aislamiento de inventario sin rotación (S/ 262,564.68 inmovilizados)
SELECT s.NombreMarca,
       SUM(s.Stock) AS Pares_Inmovilizados,
       ROUND(SUM(s.ValorInventario), 2) AS Valor_Inmovilizado_Soles
FROM stock s
LEFT JOIN ventas v ON s.NombreMarca = v.NombreMarca
WHERE v.NombreMarca IS NULL
GROUP BY s.NombreMarca;`,
    description: 'Módulo 3: Consulta SparkSQL LEFT JOIN ... WHERE IS NULL que aísla los S/ 262 mil sin rotación.',
    academicDocenteNote: 'Profesor, esta consulta es el equivalente en SparkSQL del leftOuterJoin de RDDs. Al cruzar la vista temporal stock con ventas mediante LEFT JOIN y filtrar WHERE v.NombreMarca IS NULL, aislamos las 3 marcas (New Balance, Converse y Vans) que suman S/ 262,564.68 de capital inmovilizado.',
    theoryConcept: 'Patrón Anti-Join en SQL (LEFT JOIN + IS NULL / left_anti) y Análisis de Rotación de Inventario.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'FROM stock s LEFT JOIN ventas v ON s.NombreMarca = v.NombreMarca WHERE v.NombreMarca IS NULL...',
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
    id: 'spark_estadistica_cuantiles',
    title: '06. Estadística Descriptiva & Cuantiles',
    category: 'Big Data (PySpark)',
    badge: 'PySpark Stats',
    badgeColor: 'purple',
    sql: `-- Módulo 4: Estadística descriptiva, stat.corr() y approxQuantile()
SELECT Funcion_Spark, Columna_TotalLinea, Columna_Utilidad, Interpretacion_Analitica
FROM vw_EstadisticaSpark;`,
    description: 'Módulo 4: Resumen estadístico, correlación de Pearson, cuartiles con approxQuantile y 31 líneas en pérdida.',
    academicDocenteNote: 'Profesor, demostramos que una correlación de Pearson positiva entre TotalLinea y Utilidad no garantiza un margen sano: al calcular los cuartiles con approxQuantile([0.25, 0.5, 0.75], 0.01) y filtrar Utilidad < 0, comprobamos que 31 de las 59 líneas de venta generan pérdida.',
    theoryConcept: 'Estadística Descriptiva Distribuida, Correlación de Pearson (stat.corr) y Algoritmo Greenwald-Khanna (approxQuantile).',
    lineByLine: [
      {
        lineNum: 1,
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
    id: 'spark_margenes_marca',
    title: '07. Margen de Utilidad por Marca',
    category: 'Big Data (PySpark)',
    badge: 'PySpark Crosstab',
    badgeColor: 'purple',
    sql: `-- Módulo 4: Margen de utilidad (%) por marca y tabla de contingencia
SELECT NombreMarca,
       ROUND(SUM(Utilidad) / SUM(TotalLinea) * 100, 1) AS MargenPct
FROM ventas
GROUP BY NombreMarca
ORDER BY MargenPct DESC;`,
    description: 'Módulo 4: Margen porcentual por marca (Reebok 41%, Adidas 20%, Nike 14%, Puma -1%) y crosstab Marca x Canal.',
    academicDocenteNote: 'Profesor, calculamos el margen relativo (SUM(Utilidad) / SUM(TotalLinea) * 100). Descubrimos que Reebok vende poco pero tiene el mejor margen (+41%), mientras que Puma tiene margen negativo (-1%): vende volumen pero no deja ganancia neta.',
    theoryConcept: 'Márgenes Relativos Agregados y Tablas de Contingencia Multivariadas (stat.crosstab).',
    lineByLine: [
      {
        lineNum: 1,
        code: 'ROUND(SUM(Utilidad) / SUM(TotalLinea) * 100, 1) AS MargenPct',
        explanation: 'Divide la utilidad neta acumulada de la marca entre sus ingresos totales facturados.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Para qué sirve stat.crosstab("NombreMarca", "Canal")?',
        answer: 'Construye una tabla de contingencia entre dos variables categóricas, mostrando cuántas transacciones tiene cada marca en cada canal comercial.',
      },
    ],
  },

  {
    id: 'spark_modelos_perdida',
    title: '08. Detección de Modelos con Pérdida',
    category: 'Big Data (PySpark)',
    badge: 'PySpark Auditoría',
    badgeColor: 'red',
    sql: `-- Módulo 4: Pérdida acumulada por modelo (Utilidad < 0)
SELECT NombreMarca, NombreModelo,
       ROUND(SUM(Utilidad), 2) AS Perdida
FROM ventas
WHERE Utilidad < 0
GROUP BY NombreMarca, NombreModelo
ORDER BY Perdida ASC;`,
    description: 'Módulo 4: Hallazgo crítico donde Adidas Runfalcon (-379.98), Nike Air Max (-155.19) y Puma Smash (-25.41) pierden dinero.',
    academicDocenteNote: 'Profesor, este es el hallazgo más importante del análisis: al filtrar Utilidad < 0 y agrupar por modelo, demostramos que Adidas Runfalcon —que era el Top 1 más vendido con 41 pares— es también el modelo que más pérdida genera (S/ -379.98), evidenciando un error en la política de descuentos o cálculo de costos.',
    theoryConcept: 'Muestreo Reproducible con Semilla (sample seed=42), Filtrado de Anomalías Financieras y Diagnóstico de Rentabilidad.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'WHERE Utilidad < 0 GROUP BY NombreMarca, NombreModelo ORDER BY Perdida ASC;',
        explanation: 'Suma la pérdida acumulada por modelo y ordena desde la pérdida más severa (-379.98).',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Por qué se usa seed=42 en df_ventas.sample(withReplacement=False, fraction=0.10, seed=42)?',
        answer: 'Para garantizar reproducibilidad científica: al fijar la semilla pseudoaleatoria (seed=42), cualquier evaluador obtendrá exactamente la misma muestra del 10% al ejecutar el código.',
      },
    ],
  },

  {
    id: 'pyspark_etl',
    title: '09. Simulación Pipeline PySpark ETL',
    category: 'Big Data (PySpark)',
    badge: 'PySpark ETL',
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
    description: 'Simulación SQL del pipeline distribuido de PySpark ejecutado en el cluster de procesamiento.',
    academicDocenteNote: 'Profesor, este código representa la transformación que ejecuta nuestro pipeline PySpark: df.groupBy("canal").agg(count("*"), sum("total"), avg("total")). Sirve de puente para limpiar datos antes de cargarlos al Data Warehouse.',
    theoryConcept: 'ETL Distribuido con Apache Spark / PySpark, Agregaciones en DataFrames y Arquitectura de Datos Moderna.',
    lineByLine: [
      {
        lineNum: 1,
        code: 'FROM Comprobante GROUP BY Canal ORDER BY IngresosBrutos DESC;',
        explanation: 'Agrupación y ordenamiento descendente de las operaciones consolidadas por canal.',
      },
    ],
    teacherQuestions: [
      {
        question: '¿Por qué usar PySpark en lugar de stored procedures para el ETL masivo?',
        answer: 'Porque cuando los datos crecen a terabytes de ventas de múltiples tiendas, PySpark procesa en memoria distribuida en clusters, superando las limitaciones de un solo servidor SQL.',
      },
    ],
  },
];
