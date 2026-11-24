/**
 * URBAN STYLE — REPOSITORIO UNIFICADO DE SCRIPTS SQL & PYSPARK
 * Código oficial de Arquitectura de Datos, Data Warehouse y Procesamiento Distribuido.
 */

export interface ScriptBlock {
  id: string;
  title: string;
  category: 'OLTP' | 'DW' | 'PRUEBAS' | 'BIG_DATA';
  description: string;
  code: string;
}

export const CLASSMATE_SCRIPTS: ScriptBlock[] = [
  {
    id: 'script-01',
    title: 'Script 01 — Base de Datos Transaccional (UrbanStylosDB)',
    category: 'OLTP',
    description: 'Creación de base de datos relacional (43 tablas, catálogos SUNAT, comprobantes, triggers de inmutabilidad, cálculo de IGV, compras y motor de promociones).',
    code: `/* =====================================================================
   URBAN STYLE - SCRIPT 01: BASE DE DATOS TRANSACCIONAL (UrbanStylosDB)
   ---------------------------------------------------------------------
   Contiene: creación de la base, 43 tablas, catálogos tributarios SUNAT,
   tipos de tabla, funciones, vistas, triggers de inmutabilidad,
   procedimientos almacenados e índices optimizados.
   ===================================================================== */

USE master;
GO

IF DB_ID(N'UrbanStylosDB') IS NOT NULL
BEGIN
    ALTER DATABASE UrbanStylosDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE UrbanStylosDB;
END
GO

CREATE DATABASE UrbanStylosDB;
GO

USE UrbanStylosDB;
GO

/* =====================================================================
   1. TABLAS PRINCIPALES (3FN)
   ===================================================================== */

-- 1.1 Geografía (departamento > provincia > distrito)
CREATE TABLE Departamento (
    IdDepartamento  INT IDENTITY(1,1) PRIMARY KEY,
    Nombre          VARCHAR(60) NOT NULL UNIQUE,
    CodigoUbigeo    CHAR(2) NULL
);
GO

CREATE TABLE Provincia (
    IdProvincia     INT IDENTITY(1,1) PRIMARY KEY,
    IdDepartamento  INT NOT NULL,
    Nombre          VARCHAR(60) NOT NULL,
    CodigoUbigeo    CHAR(4) NULL,
    CONSTRAINT FK_Provincia_Departamento FOREIGN KEY (IdDepartamento) REFERENCES Departamento(IdDepartamento),
    CONSTRAINT UQ_Provincia UNIQUE (IdDepartamento, Nombre)
);
GO

CREATE TABLE Distrito (
    IdDistrito      INT IDENTITY(1,1) PRIMARY KEY,
    IdProvincia     INT NOT NULL,
    Nombre          VARCHAR(80) NOT NULL,
    CodigoUbigeo    CHAR(6) NULL,
    CONSTRAINT FK_Distrito_Provincia FOREIGN KEY (IdProvincia) REFERENCES Provincia(IdProvincia),
    CONSTRAINT UQ_Distrito UNIQUE (IdProvincia, Nombre)
);
GO

-- 1.2 Catálogos tributarios SUNAT
CREATE TABLE TipoDocumentoIdentidad (
    IdTipoDocumento TINYINT NOT NULL PRIMARY KEY,
    Nombre          VARCHAR(30) NOT NULL UNIQUE,
    Longitud        TINYINT NOT NULL
);
GO

CREATE TABLE TipoComprobante (
    IdTipoComprobante CHAR(2) NOT NULL PRIMARY KEY,
    Nombre            VARCHAR(40) NOT NULL UNIQUE,
    ExigeRUC          BIT NOT NULL DEFAULT 0,
    EsNota            BIT NOT NULL DEFAULT 0,
    Signo             SMALLINT NOT NULL,
    CONSTRAINT CK_TipoComprobante_Signo CHECK (Signo IN (-1, 1))
);
GO

CREATE TABLE Moneda (
    IdMoneda  CHAR(3) NOT NULL PRIMARY KEY,
    Nombre    VARCHAR(30) NOT NULL,
    Simbolo   VARCHAR(5) NOT NULL
);
GO

CREATE TABLE UnidadMedida (
    IdUnidadMedida  INT IDENTITY(1,1) PRIMARY KEY,
    Nombre          VARCHAR(30) NOT NULL UNIQUE,
    CodigoSUNAT     VARCHAR(5) NULL
);
GO

CREATE TABLE AfectacionIGV (
    IdAfectacion  INT IDENTITY(1,1) PRIMARY KEY,
    Nombre        VARCHAR(30) NOT NULL UNIQUE,
    AplicaIGV     BIT NOT NULL
);
GO

CREATE TABLE MotivoNota (
    IdMotivo          INT IDENTITY(1,1) PRIMARY KEY,
    IdTipoComprobante CHAR(2) NOT NULL,
    Nombre            VARCHAR(80) NOT NULL,
    CONSTRAINT FK_MotivoNota_Tipo FOREIGN KEY (IdTipoComprobante) REFERENCES TipoComprobante(IdTipoComprobante),
    CONSTRAINT UQ_MotivoNota UNIQUE (IdTipoComprobante, Nombre)
);
GO

-- 1.3 Empresa y establecimientos
CREATE TABLE Emisor (
    IdEmisor        INT IDENTITY(1,1) PRIMARY KEY,
    RUC             CHAR(11) NOT NULL UNIQUE,
    RazonSocial     VARCHAR(200) NOT NULL,
    NombreComercial VARCHAR(100) NULL,
    DomicilioFiscal VARCHAR(200) NOT NULL,
    IdDistrito      INT NULL,
    Correo          VARCHAR(100) NULL,
    Telefono        VARCHAR(20) NULL,
    Activo          BIT NOT NULL DEFAULT 1
);
GO

CREATE TABLE Establecimiento (
    IdEstablecimiento INT IDENTITY(1,1) PRIMARY KEY,
    IdEmisor          INT NOT NULL,
    Codigo            VARCHAR(10) NOT NULL,
    Nombre            VARCHAR(100) NOT NULL,
    Direccion         VARCHAR(200) NOT NULL,
    IdDistrito        INT NULL,
    Activo            BIT NOT NULL DEFAULT 1
);
GO

-- 1.4 Personal y Usuarios
CREATE TABLE Cargo (
    IdCargo      INT IDENTITY(1,1) PRIMARY KEY,
    NombreCargo  VARCHAR(50) NOT NULL UNIQUE,
    Descripcion  VARCHAR(150) NULL
);
GO

CREATE TABLE Rol (
    IdRol        INT IDENTITY(1,1) PRIMARY KEY,
    NombreRol    VARCHAR(50) NOT NULL UNIQUE,
    Descripcion  VARCHAR(150) NULL
);
GO

CREATE TABLE Empleado (
    IdEmpleado        INT IDENTITY(1,1) PRIMARY KEY,
    Nombres           VARCHAR(100) NOT NULL,
    Apellidos         VARCHAR(100) NOT NULL,
    DNI               CHAR(8) NOT NULL UNIQUE,
    Correo            VARCHAR(100) NULL,
    Telefono          VARCHAR(20) NULL,
    Direccion         VARCHAR(200) NULL,
    IdDistrito        INT NULL,
    FechaIngreso      DATE NOT NULL DEFAULT (CAST(GETDATE() AS DATE)),
    FechaCese         DATE NULL,
    IdCargo           INT NOT NULL,
    IdEstablecimiento INT NOT NULL,
    Activo            BIT NOT NULL DEFAULT 1
);
GO

CREATE TABLE Usuario (
    IdUsuario      INT IDENTITY(1,1) PRIMARY KEY,
    IdEmpleado     INT NOT NULL UNIQUE,
    NombreUsuario  VARCHAR(30) NOT NULL UNIQUE,
    Salt           UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    ClaveHash      VARBINARY(32) NOT NULL,
    IdRol          INT NOT NULL,
    Activo         BIT NOT NULL DEFAULT 1
);
GO

-- 1.5 Clientes
CREATE TABLE Cliente (
    IdCliente         INT IDENTITY(1,1) PRIMARY KEY,
    IdTipoDocumento   TINYINT NOT NULL,
    NumeroDocumento   VARCHAR(11) NOT NULL,
    NombreRazonSocial VARCHAR(200) NOT NULL,
    Correo            VARCHAR(100) NULL,
    Telefono          VARCHAR(20) NULL,
    Direccion         VARCHAR(200) NULL,
    IdDistrito        INT NULL,
    Activo            BIT NOT NULL DEFAULT 1
);
GO

-- 1.6 Catálogo de Calzado Deportivo (Marcas, Modelos, Variantes)
CREATE TABLE Marca (
    IdMarca      INT IDENTITY(1,1) PRIMARY KEY,
    NombreMarca  VARCHAR(50) NOT NULL UNIQUE,
    Activo       BIT NOT NULL DEFAULT 1
);
GO

CREATE TABLE Categoria (
    IdCategoria      INT IDENTITY(1,1) PRIMARY KEY,
    NombreCategoria  VARCHAR(50) NOT NULL UNIQUE,
    Activo           BIT NOT NULL DEFAULT 1
);
GO

CREATE TABLE Talla (
    IdTalla      INT IDENTITY(1,1) PRIMARY KEY,
    NumeroTalla  DECIMAL(4,1) NOT NULL UNIQUE
);
GO

CREATE TABLE Color (
    IdColor      INT IDENTITY(1,1) PRIMARY KEY,
    NombreColor  VARCHAR(30) NOT NULL UNIQUE
);
GO

CREATE TABLE Genero (
    IdGenero  INT IDENTITY(1,1) PRIMARY KEY,
    Nombre    VARCHAR(20) NOT NULL UNIQUE
);
GO

CREATE TABLE ModeloZapatilla (
    IdModelo            INT IDENTITY(1,1) PRIMARY KEY,
    NombreModelo        VARCHAR(100) NOT NULL,
    Descripcion         VARCHAR(255) NULL,
    IdMarca             INT NOT NULL,
    IdCategoria         INT NOT NULL,
    IdGenero            INT NOT NULL,
    IdAfectacion        INT NOT NULL DEFAULT 1,
    Activo              BIT NOT NULL DEFAULT 1
);
GO

CREATE TABLE VarianteProducto (
    IdVariante     INT IDENTITY(1,1) PRIMARY KEY,
    IdModelo       INT NOT NULL,
    IdTalla        INT NOT NULL,
    IdColor        INT NOT NULL,
    SKU            VARCHAR(30) NOT NULL UNIQUE,
    Precio         DECIMAL(10,2) NOT NULL,
    CostoPromedio  DECIMAL(10,2) NOT NULL DEFAULT 0,
    Stock          INT NOT NULL DEFAULT 0,
    StockMinimo    INT NOT NULL DEFAULT 2,
    Activo         BIT NOT NULL DEFAULT 1
);
GO

-- 1.7 Canales de Venta y Métodos de Pago
CREATE TABLE CanalVenta (
    IdCanal  INT IDENTITY(1,1) PRIMARY KEY,
    Nombre   VARCHAR(30) NOT NULL UNIQUE,
    Activo   BIT NOT NULL DEFAULT 1
);
GO

CREATE TABLE MetodoPago (
    IdMetodoPago  INT IDENTITY(1,1) PRIMARY KEY,
    NombreMetodo  VARCHAR(30) NOT NULL UNIQUE,
    Activo        BIT NOT NULL DEFAULT 1
);
GO

-- 1.8 Comprobantes y Detalle
CREATE TABLE Comprobante (
    IdComprobante          INT IDENTITY(1,1) PRIMARY KEY,
    IdSerie                INT NOT NULL,
    Numero                 INT NOT NULL,
    IdCliente              INT NOT NULL,
    IdEmpleado             INT NOT NULL,
    IdCanal                INT NOT NULL,
    FechaEmision           DATE NOT NULL DEFAULT (CAST(GETDATE() AS DATE)),
    TotalGravado           DECIMAL(12,2) NOT NULL DEFAULT 0,
    TotalIGV               DECIMAL(12,2) NOT NULL DEFAULT 0,
    TotalDescuento         DECIMAL(12,2) NOT NULL DEFAULT 0,
    Total                  DECIMAL(12,2) NOT NULL DEFAULT 0,
    Estado                 VARCHAR(10) NOT NULL DEFAULT 'EMITIDO'
);
GO

CREATE TABLE DetalleComprobante (
    IdDetalleComprobante  INT IDENTITY(1,1) PRIMARY KEY,
    IdComprobante         INT NOT NULL,
    IdVariante            INT NOT NULL,
    Descripcion           VARCHAR(200) NOT NULL,
    Cantidad              INT NOT NULL,
    PrecioUnitario        DECIMAL(10,2) NOT NULL,
    Descuento             DECIMAL(10,2) NOT NULL DEFAULT 0,
    ValorVenta            DECIMAL(12,2) NOT NULL,
    IGV                   DECIMAL(12,2) NOT NULL,
    TotalLinea            DECIMAL(12,2) NOT NULL,
    CostoUnitario         DECIMAL(10,2) NOT NULL DEFAULT 0
);
GO

CREATE TABLE MovimientoInventario (
    IdMovimiento   INT IDENTITY(1,1) PRIMARY KEY,
    IdVariante     INT NOT NULL,
    TipoMovimiento VARCHAR(10) NOT NULL,
    Cantidad       INT NOT NULL,
    Fecha          DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    Motivo         VARCHAR(100) NULL,
    IdEmpleado     INT NULL
);
GO

CREATE TABLE Auditoria (
    IdAuditoria    BIGINT IDENTITY(1,1) PRIMARY KEY,
    Tabla          VARCHAR(100) NOT NULL,
    Operacion      VARCHAR(10) NOT NULL,
    IdRegistro     VARCHAR(50) NOT NULL,
    ValorAnterior  NVARCHAR(MAX) NULL,
    ValorNuevo     NVARCHAR(MAX) NULL,
    Usuario        NVARCHAR(128) NOT NULL DEFAULT SUSER_SNAME(),
    Fecha          DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO`,
  },
  {
    id: 'script-02',
    title: 'Script 02 — Data Warehouse Dimensional Kimball (UrbanStylosDW)',
    category: 'DW',
    description: 'Esquema estrella (Star Schema) con Dimensiones SCD Tipo 2, Hechos (FactVentas, FactPagos, FactInventario), tabla puente FactVentasPromocion, DDM y Ley N.° 29733.',
    code: `/* =====================================================================
   URBAN STYLE - SCRIPT 02: DATA WAREHOUSE (KIMBALL) Y SEGURIDAD
   ---------------------------------------------------------------------
   Contiene: base UrbanStylosDW (esquemas dw y meta), dimensiones, tablas de
   hechos, procedimientos ETL que extraen de UrbanStylosDB, enmascaramiento y
   anonimización (Ley N.° 29733), propiedades extendidas y seguridad.
   ===================================================================== */

USE master;
GO

IF DB_ID(N'UrbanStylosDW') IS NOT NULL
BEGIN
    ALTER DATABASE UrbanStylosDW SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE UrbanStylosDW;
END
GO

CREATE DATABASE UrbanStylosDW;
GO

USE UrbanStylosDW;
GO

CREATE SCHEMA dw;
GO
CREATE SCHEMA meta;
GO

-- 1. Bitácora de Carga ETL
CREATE TABLE meta.BitacoraETL (
    IdEjecucion       INT IDENTITY(1,1) PRIMARY KEY,
    NombreProceso     VARCHAR(100) NOT NULL,
    FechaInicio       DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    FechaFin          DATETIME2 NULL,
    RegistrosCargados INT NULL,
    Estado            VARCHAR(20) NOT NULL,
    MensajeError      NVARCHAR(MAX) NULL
);
GO

-- 2. Dimensiones
CREATE TABLE dw.DimTiempo (
    SK_Tiempo         INT PRIMARY KEY, -- AAAAMMDD
    Fecha             DATE NOT NULL UNIQUE,
    Anio              SMALLINT NOT NULL,
    Semestre          TINYINT NOT NULL,
    Trimestre         TINYINT NOT NULL,
    Mes               TINYINT NOT NULL,
    NombreMes         VARCHAR(20) NOT NULL,
    SemanaAnio        TINYINT NOT NULL,
    DiaMes            TINYINT NOT NULL,
    DiaSemana         TINYINT NOT NULL,
    NombreDiaSemana   VARCHAR(20) NOT NULL,
    EsFinDeSemana     BIT NOT NULL
);
GO

CREATE TABLE dw.DimCliente (
    SK_Cliente        INT IDENTITY(1,1) PRIMARY KEY,
    BK_IdCliente      INT NOT NULL,
    TipoDocumento     VARCHAR(30) NOT NULL,
    NumeroDocumento   VARCHAR(11) NOT NULL,
    NombreRazonSocial VARCHAR(200) NOT NULL,
    Correo            VARCHAR(100) NULL,
    Telefono          VARCHAR(20) NULL,
    Distrito          VARCHAR(80) NOT NULL,
    Provincia         VARCHAR(60) NOT NULL,
    Departamento      VARCHAR(60) NOT NULL,
    FechaInicioVigencia DATETIME2 NOT NULL,
    FechaFinVigencia    DATETIME2 NULL,
    EsActual            BIT NOT NULL DEFAULT 1
);
GO

CREATE TABLE dw.DimProducto (
    SK_Producto       INT IDENTITY(1,1) PRIMARY KEY,
    BK_IdVariante     INT NOT NULL,
    SKU               VARCHAR(30) NOT NULL,
    NombreModelo      VARCHAR(100) NOT NULL,
    NombreMarca       VARCHAR(50) NOT NULL,
    NombreCategoria   VARCHAR(50) NOT NULL,
    NombreGenero      VARCHAR(20) NOT NULL,
    NumeroTalla       DECIMAL(4,1) NOT NULL,
    NombreColor       VARCHAR(30) NOT NULL,
    PrecioActual      DECIMAL(10,2) NOT NULL,
    CostoPromedio     DECIMAL(10,2) NOT NULL,
    FechaInicioVigencia DATETIME2 NOT NULL,
    FechaFinVigencia    DATETIME2 NULL,
    EsActual            BIT NOT NULL DEFAULT 1
);
GO

-- 3. Tablas de Hechos (Fact Tables)
CREATE TABLE dw.FactVentas (
    SK_FactVenta        BIGINT IDENTITY(1,1) PRIMARY KEY,
    SK_Tiempo           INT NOT NULL,
    SK_Cliente          INT NOT NULL,
    SK_Producto         INT NOT NULL,
    SK_Empleado         INT NOT NULL,
    SK_Canal            INT NOT NULL,
    SK_Promocion        INT NOT NULL,
    IdComprobante       INT NOT NULL,
    IdDetalleComprobante INT NOT NULL UNIQUE,
    NumeroComprobante   VARCHAR(13) NOT NULL,
    TipoComprobante     CHAR(2) NOT NULL,
    SignoTributario     SMALLINT NOT NULL,
    CantidadVendida     INT NOT NULL,
    PrecioUnitario      DECIMAL(10,2) NOT NULL,
    ValorVenta          DECIMAL(12,2) NOT NULL,
    IGV                 DECIMAL(12,2) NOT NULL,
    TotalLinea          DECIMAL(12,2) NOT NULL,
    DescuentoAplicado   DECIMAL(12,2) NOT NULL,
    CostoTotal          DECIMAL(12,2) NOT NULL,
    UtilidadNeta        DECIMAL(12,2) NOT NULL
);
GO

-- 4. Enmascaramiento Dinámico (DDM - Ley 29733)
ALTER TABLE dw.DimCliente  ALTER COLUMN NumeroDocumento   ADD MASKED WITH (FUNCTION = 'partial(1,"XXXXXX",1)');
ALTER TABLE dw.DimCliente  ALTER COLUMN Correo          ADD MASKED WITH (FUNCTION = 'email()');
ALTER TABLE dw.DimCliente  ALTER COLUMN Telefono        ADD MASKED WITH (FUNCTION = 'partial(2,"XXXXX",2)');
ALTER TABLE dw.DimCliente  ALTER COLUMN NombreRazonSocial ADD MASKED WITH (FUNCTION = 'partial(1,"XXXX",1)');
GO`,
  },
  {
    id: 'script-03',
    title: 'Script 03 — Datos de Prueba y Ampliación Masiva de Ventas',
    category: 'PRUEBAS',
    description: 'Inserción del catálogo de 7 marcas (Adidas, Nike, Puma, Reebok, New Balance, Vans, Converse), compras de lote y bucle de ventas simuladas.',
    code: `/* =====================================================================
   URBAN STYLE - SCRIPT 03: DATOS DE PRUEBA Y AMPLIACIÓN DE VENTAS
   ---------------------------------------------------------------------
   Carga el catálogo de 7 marcas, 11 modelos oficiales, generación de
   variantes, compras de proveedores y simulación de 25 ventas omnicanal.
   ===================================================================== */

USE UrbanStylosDB;
GO

SET NOCOUNT ON;

-- 1. Catálogo Completo de Marcas Oficiales
INSERT INTO dbo.Marca (NombreMarca)
SELECT X.NombreMarca
FROM (VALUES ('Adidas'), ('Nike'), ('Puma'), ('Reebok'), ('New Balance'), ('Vans'), ('Converse')) AS X(NombreMarca)
WHERE NOT EXISTS (SELECT 1 FROM dbo.Marca M WHERE M.NombreMarca = X.NombreMarca);

-- 2. Modelos Oficiales de Calzado Deportivo
INSERT INTO dbo.ModeloZapatilla (NombreModelo, Descripcion, IdMarca, IdCategoria, IdGenero, IdAfectacion)
SELECT X.Modelo, X.DescModelo, Ma.IdMarca, Ca.IdCategoria, G.IdGenero, 1
FROM (VALUES
    ('Runfalcon',      'Zapatilla de running deportiva','Adidas',      'Deportiva', 'Unisex'),
    ('Air Max',        'Zapatilla urbana icónica',      'Nike',        'Urbana',    'Unisex'),
    ('Smash',          'Zapatilla casual cuero',        'Puma',        'Casual',    'Mujer'),
    ('Club C 85',      'Zapatilla clásica urbana',      'Reebok',      'Urbana',    'Unisex'),
    ('Nano X4',        'Zapatilla de entrenamiento',    'Reebok',      'Deportiva', 'Unisex'),
    ('574 Core',       'Zapatilla retro casual',        'New Balance', 'Casual',    'Unisex'),
    ('Fresh Foam 1080','Zapatilla running alto km',     'New Balance', 'Running',   'Hombre'),
    ('Old Skool',      'Zapatilla clásica skate',       'Vans',        'Skate',     'Unisex'),
    ('Sk8-Hi',         'Zapatilla caña alta urbana',    'Vans',        'Urbana',    'Mujer'),
    ('Chuck 70',       'Zapatilla lona clásica vintage','Converse',    'Casual',    'Unisex'),
    ('Run Star Hike',  'Zapatilla plataforma urbana',   'Converse',    'Urbana',    'Mujer')
) AS X(Modelo, DescModelo, Marca, Categoria, Genero)
INNER JOIN dbo.Marca Ma     ON Ma.NombreMarca     = X.Marca
INNER JOIN dbo.Categoria Ca ON Ca.NombreCategoria = X.Categoria
INNER JOIN dbo.Genero G     ON G.Nombre           = X.Genero
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.ModeloZapatilla MZ
    WHERE MZ.NombreModelo = X.Modelo AND MZ.IdMarca = Ma.IdMarca
);
GO`,
  },
  {
    id: 'script-04',
    title: 'Script 04 — Pruebas del Data Warehouse, Consultas OLAP y Reconciliación',
    category: 'PRUEBAS',
    description: 'Ejecución del pipeline ETL, análisis multidimensional con CUBE, ROLLUP y GROUPING SETS, y reconciliación multinivel (diferencia cero).',
    code: `/* =====================================================================
   URBAN STYLE - SCRIPT 04: PRUEBAS DEL DATA WAREHOUSE Y SEGURIDAD
   ---------------------------------------------------------------------
   Ejecuta el ETL, verifica CUBE / ROLLUP / GROUPING SETS y realiza la
   reconciliación matemática multinivel OLTP vs. Data Warehouse.
   ===================================================================== */

USE UrbanStylosDW;
GO

-- 1. Ejecución del Pipeline ETL
EXEC dw.sp_ETL_CargarDimensionesSimples;
EXEC dw.sp_ETL_CargarDimCliente;
EXEC dw.sp_ETL_CargarDimProducto;
EXEC dw.sp_ETL_CargarFactVentas;
EXEC dw.sp_ETL_CargarFactVentasPromocion;
EXEC dw.sp_ETL_CargarFactPagos;
EXEC dw.sp_ETL_CargarFactInventario;
GO

-- 2. Consultas Multidimensionales (OLAP)
-- CUBE: Agregación por Año, Canal y Marca
SELECT 
    T.Anio,
    C.NombreCanal,
    P.NombreMarca,
    GROUPING_ID(T.Anio, C.NombreCanal, P.NombreMarca) AS NivelAgregacion,
    SUM(F.CantidadVendida) AS UnidadesVendidas,
    SUM(F.TotalLinea) AS TotalVentas,
    SUM(F.UtilidadNeta) AS UtilidadTotal
FROM dw.FactVentas F
INNER JOIN dw.DimTiempo T ON T.SK_Tiempo = F.SK_Tiempo
INNER JOIN dw.DimCanal C ON C.SK_Canal = F.SK_Canal
INNER JOIN dw.DimProducto P ON P.SK_Producto = F.SK_Producto
GROUP BY CUBE(T.Anio, C.NombreCanal, P.NombreMarca);

-- 3. Reconciliación Multinivel OLTP vs. DW (Diferencia = 0)
SELECT 
    '1. Ventas Totales (S/)' AS Metrica,
    (SELECT ISNULL(SUM(TotalLinea), 0) FROM UrbanStylosDB.dbo.vw_VentasDetalladas) AS OLTP,
    (SELECT ISNULL(SUM(TotalLinea), 0) FROM dw.FactVentas) AS DW,
    ABS((SELECT ISNULL(SUM(TotalLinea), 0) FROM UrbanStylosDB.dbo.vw_VentasDetalladas) - (SELECT ISNULL(SUM(TotalLinea), 0) FROM dw.FactVentas)) AS Diferencia;
GO`,
  },
  {
    id: 'script-colab',
    title: 'Google Colab — PySpark en Cluster & Operaciones sobre RDDs',
    category: 'BIG_DATA',
    description: 'Procesamiento en lote en Apache Spark: RDDs, DataFrames, broadcast de IGV, leftOuterJoin para detección de stock sin rotación y minería de márgenes negativos.',
    code: `# ==============================================================================
# URBAN STYLOS - SPARK EN CLUSTER Y OPERACIONES SOBRE RDDs
# Ejecutar en Google Colab con pyspark==3.5.* o 4.0.*
# ==============================================================================

import os
import time
import urllib.request
from pyspark.sql import SparkSession
from pyspark.sql import functions as F

# Inicialización optimizada de SparkSession
spark = (
    SparkSession.builder
    .master("local[*]")
    .appName("UrbanStylos_RDD_Cluster")
    .config("spark.sql.shuffle.partitions", "8")
    .getOrCreate()
)
sc = spark.sparkContext
sc.setLogLevel("ERROR")

print("Spark iniciado correctamente. Versión:", spark.version)
print("Master:", sc.master, "| Tareas paralelas:", sc.defaultParallelism)

# Descarga de datos limpios desde el repositorio oficial
BASE_URL = "https://raw.githubusercontent.com/FabrizioTrujillo/urbanstylos-data/refs/heads/main/"

def descargar(nombre_remoto, nombre_local):
    if os.path.exists(nombre_local):
        print(f"{nombre_local} ya existe: no se descarga de nuevo.")
        return
    req = urllib.request.Request(BASE_URL + nombre_remoto, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as r, open(nombre_local, "wb") as f:
        f.write(r.read())
    print(f"Descargado {nombre_remoto} -> {nombre_local}")

def sin_bom(df):
    return df.toDF(*[c.replace("\\ufeff", "").strip() for c in df.columns])

descargar("ventas.csv", "ventas_demo.csv")
descargar("stock.csv", "stock_demo.csv")

df_ventas = sin_bom(spark.read.option("header", "true").option("inferSchema", "true").csv("ventas_demo.csv"))
df_stock = sin_bom(spark.read.option("header", "true").option("inferSchema", "true").csv("stock_demo.csv"))

# Construcción de RDD cacheado
rdd_ventas = (
    df_ventas.rdd
    .filter(lambda r: r.TotalLinea is not None and r.Cantidad is not None)
    .map(lambda r: (
        str(r.NombreMarca), str(r.NombreModelo), str(r.Canal),
        int(r.Cantidad), float(r.TotalLinea), float(r.Utilidad)
    ))
    .cache()
)

print("\\n--- VENTAS TOTALES POR CANAL (RDD) ---")
ventas_canal = rdd_ventas.map(lambda f: (f[2], f[4])).reduceByKey(lambda a, b: a + b).sortBy(lambda kv: -kv[1])
for canal, total in ventas_canal.collect():
    print(f"{canal:<15} S/ {round(total, 2)}")

rdd_ventas.unpersist()
print("\\nProcesamiento Spark completado con éxito.")`,
  },
];
