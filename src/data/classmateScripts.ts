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
GO

/* =====================================================================
   2. TRIGGERS DE INMUTABILIDAD Y PROCEDIMIENTO DE LOGIN (SHA-256)
   ===================================================================== */

CREATE OR ALTER TRIGGER dbo.TR_Comprobante_Inmutable
ON dbo.Comprobante
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;
    RAISERROR('Un comprobante emitido no se puede eliminar. Emita una nota de crédito.', 16, 1);
    ROLLBACK TRANSACTION;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ValidarLogin
    @p_UsuarioOCorreo VARCHAR(100),
    @p_ClavePlana     VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @v_Salt UNIQUEIDENTIFIER, @v_ClaveHash VARBINARY(32), @v_IdUsuario INT, @v_Activo BIT;

    SELECT @v_IdUsuario = u.IdUsuario, @v_Salt = u.Salt, @v_ClaveHash = u.ClaveHash, @v_Activo = u.Activo
    FROM dbo.Usuario u
    INNER JOIN dbo.Empleado e ON e.IdEmpleado = u.IdEmpleado
    WHERE u.NombreUsuario = @p_UsuarioOCorreo OR e.Correo = @p_UsuarioOCorreo;

    IF @v_IdUsuario IS NULL OR @v_Activo = 0
    BEGIN
        RAISERROR('Credenciales inválidas o cuenta inactiva.', 16, 1);
        RETURN -1;
    END;

    IF HASHBYTES('SHA2_256', @p_ClavePlana + CAST(@v_Salt AS VARCHAR(36))) <> @v_ClaveHash
    BEGIN
        RAISERROR('Contraseña incorrecta.', 16, 1);
        RETURN -2;
    END;

    INSERT INTO dbo.Auditoria (Tabla, Operacion, IdRegistro, ValorAnterior, ValorNuevo)
    VALUES ('Usuario', 'LOGIN_AUTH', CAST(@v_IdUsuario AS VARCHAR(20)), 'SESION_CERRADA', 'AUTENTICACION_SHA256_EXITOSA');

    SELECT u.IdUsuario, u.NombreUsuario, r.IdRol, r.NombreRol,
           CONCAT(e.Nombres, ' ', e.Apellidos) AS NombreCompleto, e.Correo
    FROM dbo.Usuario u
    INNER JOIN dbo.Rol r      ON r.IdRol = u.IdRol
    INNER JOIN dbo.Empleado e ON e.IdEmpleado = u.IdEmpleado
    WHERE u.IdUsuario = @v_IdUsuario;
END;
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
    title: 'Google Colab — Gestión de Datos, RDD, SparkSQL y Estadística con Apache Spark',
    category: 'BIG_DATA',
    description: 'Pipeline analítico empresarial de Big Data (PySpark): SparkSession, limpieza de BOM, Pair RDDs, leftOuterJoin, SparkSQL, Parquet, Catalyst y Estadística Avanzada.',
    code: `# ==============================================================================
# URBAN STYLE - PROCESAMIENTO ANALÍTICO DISTRIBUIDO CON APACHE SPARK
# Arquitectura de Datos, Data Warehouse & Big Data
# Pipeline de cómputo en memoria estructurado por módulos técnicos.
#
# ÍNDICE TÉCNICO:
#   MÓDULO 1 | Ingesta de Datos, Remoción de BOM y Esquemas Tipados
#   MÓDULO 2 | Cómputo Distribuido con Pair RDDs (leftOuterJoin y takeOrdered)
#   MÓDULO 3 | SparkSQL, Vistas Temporales y Optimizador Catalyst
#   MÓDULO 4 | Estadística Descriptiva, Correlación y Auditoría de Rentabilidad
#   CIERRE   | Conciliación de Métricas Clave y Liberación de Memoria
# ==============================================================================


# ##############################################################################
# MÓDULO 1: INGESTA Y LIMPIEZA DE DATOS CON SPARK
# Temas: SparkSession, carga de datos CSV, remoción de UTF-8 BOM y casting
# ##############################################################################

# ------------------------------------------------------------------------------
# 1.1 Iniciar SparkSession y SparkContext
# ------------------------------------------------------------------------------
import os
import time
import urllib.request
from pyspark.sql import SparkSession
from pyspark.sql import functions as F

spark = (
    SparkSession.builder
    .master("local[*]")                              # todo en esta maquina, todos los nucleos
    .appName("UrbanStylos_RDD_Cluster")
    .config("spark.sql.shuffle.partitions", "8")     # con pocos datos, 8 en vez de 200
    .config("spark.sql.ansi.enabled", "false")       # evita errores de cast con filas sucias
    .getOrCreate()
)
sc = spark.sparkContext                              # entrada a la API de RDD
sc.setLogLevel("ERROR")

print("Version:", spark.version)
print("Master:", sc.master, "| tareas a la vez:", sc.defaultParallelism)

# ------------------------------------------------------------------------------
# 1.2  Descargar los CSV y quitar el BOM (UTF-8)
# ------------------------------------------------------------------------------
BASE_URL = "https://raw.githubusercontent.com/FabrizioTrujillo/urbanstylos-data/refs/heads/main/"


def descargar(nombre_remoto, nombre_local):
    if os.path.exists(nombre_local):                 # no repetir la descarga
        print(f"{nombre_local} ya existe")
        return
    req = urllib.request.Request(BASE_URL + nombre_remoto,
                                 headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r, open(nombre_local, "wb") as f:
            f.write(r.read())
        print(f"Descargado {nombre_remoto} -> {nombre_local}")
    except Exception as e:
        raise RuntimeError(f"No se pudo descargar {nombre_remoto}: {e}. "
                           "Revisa tu internet o que el repositorio sea publico.")


def sin_bom(df):
    # el BOM (marca invisible de Windows) queda pegado a la 1.a columna y rompe F.col()
    return df.toDF(*[c.replace("\\ufeff", "").strip() for c in df.columns])


descargar("ventas.csv", "ventas_demo.csv")
descargar("stock.csv", "stock_demo.csv")

# ------------------------------------------------------------------------------
# 1.3  Lectura, filtrado de líneas corruptas y Schema Casting
# ------------------------------------------------------------------------------
df_ventas_raw = sin_bom(
    spark.read.option("header", "true").option("inferSchema", "true").csv("ventas_demo.csv")
)
df_stock_raw = sin_bom(
    spark.read.option("header", "true").option("inferSchema", "true").csv("stock_demo.csv")
)

# sqlcmd ensucia el CSV con lineas "---" y "rows affected": se filtran
id_v = F.col("IdComprobante").cast("string")
df_ventas = (
    df_ventas_raw
    .filter(F.col("IdComprobante").isNotNull()
            & ~id_v.contains("---")
            & ~id_v.contains("rows affected"))
    .withColumn("Cantidad", F.col("Cantidad").cast("int"))
    .withColumn("TotalLinea", F.col("TotalLinea").cast("double"))
    .withColumn("Utilidad", F.col("Utilidad").cast("double"))
)

id_s = F.col("IdVariante").cast("string")
df_stock = (
    df_stock_raw
    .filter(F.col("IdVariante").isNotNull()
            & ~id_s.contains("---")
            & ~id_s.contains("rows affected"))
    .withColumn("Stock", F.col("Stock").cast("int"))
    .withColumn("Precio", F.col("Precio").cast("double"))
    .withColumn("ValorInventario", F.col("ValorInventario").cast("double"))
)

print("Registros limpios de ventas:", df_ventas.count())
print("Registros limpios de stock :", df_stock.count())


# ##############################################################################
# MÓDULO 2: CÓMPUTO DISTRIBUIDO Y PAIR RDDS
# Temas: transformación a RDD, reduce, clave-valor, join vs leftOuterJoin,
#        takeOrdered, gestión de particiones y grafo de linaje DAG
# ##############################################################################

# ------------------------------------------------------------------------------
# 2.1  Construir un RDD y calcular agregaciones con reduce
# ------------------------------------------------------------------------------
columnas_ventas = set(df_ventas.columns)
col_canal = "Canal" if "Canal" in columnas_ventas else ("NombreCanal" if "NombreCanal" in columnas_ventas else None)

# fila: (marca, modelo, canal, cantidad, total, utilidad)
rdd_ventas = (
    df_ventas.rdd
    .filter(lambda r: r.TotalLinea is not None and r.Cantidad is not None)
    .map(lambda r, c=col_canal: (
        str(r.NombreMarca) if r.NombreMarca is not None else "SinMarca",
        str(r.NombreModelo) if r.NombreModelo is not None else "SinModelo",
        str(r[c]) if (c is not None and r[c] is not None) else "General",
        int(r.Cantidad),
        float(r.TotalLinea),
        float(r.Utilidad or 0.0)
    ))
    .cache()                                         # se reutiliza sin releer el CSV
)

utilidades = rdd_ventas.map(lambda f: f[5])
utilidad_total = 0.0 if utilidades.isEmpty() else utilidades.reduce(lambda a, b: a + b)
print(f"Utilidad total neta: S/ {round(utilidad_total, 2)}")

# ------------------------------------------------------------------------------
# 2.2  Clave-valor, join y leftOuterJoin
# ------------------------------------------------------------------------------
# (marca, (ventas, utilidad))
ventas_por_marca = (
    rdd_ventas
    .map(lambda f: (f[0], (f[4], f[5])))
    .reduceByKey(lambda a, b: (a[0] + b[0], a[1] + b[1]))
)

# (marca, stock_total)
stock_por_marca = (
    df_stock.rdd
    .filter(lambda r: r.Stock is not None and r.NombreMarca is not None)
    .map(lambda r: (str(r.NombreMarca), int(r.Stock)))
    .reduceByKey(lambda a, b: a + b)
)

# join interno: solo marcas con ventas Y stock
interno = ventas_por_marca.join(stock_por_marca)
# leftOuterJoin parte del STOCK: conserva las marcas sin ventas
completo = stock_por_marca.leftOuterJoin(ventas_por_marca)

print("\njoin interno:", interno.count(), "marcas")
print("leftOuter   :", completo.count(), "marcas")

print("\n--- STOCK VS VENTAS POR MARCA (leftOuterJoin) ---")
for marca, (stock_pares, vu) in completo.sortBy(lambda kv: -kv[1][0]).collect():
    ventas_soles, utilidad_soles = vu if vu is not None else (0.0, 0.0)
    estado = "SIN VENTAS" if vu is None else "con ventas"
    print(f"{marca:<12} | Stock: {stock_pares:>4} pares | Ventas: S/ {round(ventas_soles, 2):>9} | "
          f"Utilidad: S/ {round(utilidad_soles, 2):>8} | {estado}")

sin_ventas = completo.filter(lambda kv: kv[1][1] is None).map(lambda kv: (kv[0], kv[1][0])).collect()
print("\nSIN VENTAS:", sin_ventas)

# ------------------------------------------------------------------------------
# 2.3  takeOrdered, particiones y linaje DAG
# ------------------------------------------------------------------------------
top3 = (
    rdd_ventas
    .map(lambda f: ((f[0], f[1]), f[3]))             # (marca, modelo) -> unidades
    .reduceByKey(lambda a, b: a + b)
    .takeOrdered(3, key=lambda kv: -kv[1])
)
print("\n--- TOP 3 MODELOS (takeOrdered) ---")
for (marca, modelo), unidades in top3:
    print(f"{marca} {modelo}: {unidades}")

print("\nparticiones:", rdd_ventas.getNumPartitions(), "->", rdd_ventas.glom().map(len).collect())
print("repartition(4):", rdd_ventas.repartition(4).getNumPartitions())
print("coalesce(1)   :", rdd_ventas.coalesce(1).getNumPartitions())

print("\n--- LINAJE (toDebugString) ---")
print(ventas_por_marca.toDebugString().decode("utf-8"))

# ------------------------------------------------------------------------------
# 2.4  Evaluación Perezosa y Variable Broadcast (Tasa IGV)
# ------------------------------------------------------------------------------
print("\n--- EVALUACION PEREZOSA: TRANSFORMACION VS ACCION ---")
t0 = time.time()
con_perdida = rdd_ventas.filter(lambda f: f[5] < 0)
print(f"Definir el filtro (transformacion): {time.time() - t0:.3f} s")
t0 = time.time()
print("Lineas con utilidad negativa      :", con_perdida.count())
print(f"Ejecutar la accion                : {time.time() - t0:.3f} s")

print("\n--- BROADCAST: ventas netas sin IGV (Cálculo Distribuido) ---")
tasa_igv = sc.broadcast(0.18)                        # se envia UNA vez a cada executor
ventas_sin_igv = rdd_ventas.map(lambda f: f[4] / (1 + tasa_igv.value)).sum()
print(f"Ventas netas sin IGV: S/ {round(ventas_sin_igv, 2)}")


# ##############################################################################
# MÓDULO 3: SPARKSQL Y DATAFRAMES
# Temas: DataFrame API (groupBy/agg), SparkSQL con vistas temporales,
#        cache, Parquet y optimizador Catalyst
# ##############################################################################

# ------------------------------------------------------------------------------
# 3.1  DataFrame API: groupBy y agg
# ------------------------------------------------------------------------------
print("\n--- TOP MODELOS MAS VENDIDOS (DataFrame) ---")
df_ventas.groupBy("NombreMarca", "NombreModelo") \
    .agg(F.sum("Cantidad").alias("Total_Zapatillas")) \
    .orderBy(F.desc("Total_Zapatillas")) \
    .show(5, truncate=False)

print("--- STOCK Y VALOR DE INVENTARIO POR MARCA (DataFrame) ---")
df_stock.groupBy("NombreMarca") \
    .agg(
        F.sum("Stock").alias("Pares_Disponibles"),
        F.round(F.sum("ValorInventario"), 2).alias("Valor_Inventario_Soles")
    ) \
    .orderBy(F.desc("Valor_Inventario_Soles")) \
    .show(truncate=False)

# ------------------------------------------------------------------------------
# 3.2  SparkSQL con vistas temporales
# ------------------------------------------------------------------------------
df_stock.createOrReplaceTempView("stock")
df_ventas.createOrReplaceTempView("ventas")

print("--- SparkSQL: stock y valor por marca ---")
spark.sql("""
    SELECT NombreMarca, SUM(Stock) AS Pares,
           ROUND(SUM(ValorInventario), 2) AS Valor
    FROM stock
    GROUP BY NombreMarca
    ORDER BY Valor DESC""").show()

print("--- SparkSQL: inventario sin rotacion (marcas con stock y sin ventas) ---")
spark.sql("""
    SELECT s.NombreMarca, SUM(s.Stock) AS Pares
    FROM stock s
    LEFT JOIN ventas v ON s.NombreMarca = v.NombreMarca
    WHERE v.NombreMarca IS NULL
    GROUP BY s.NombreMarca""").show()

# ------------------------------------------------------------------------------
# 3.3  Cache en memoria, persistencia Parquet y plan de Catalyst
# ------------------------------------------------------------------------------
df_stock.cache()
df_stock.count()                                     # 1.a accion: llena la cache

resumen = df_stock.groupBy("NombreMarca").agg(F.sum("Stock").alias("Pares"))
resumen.write.mode("overwrite").parquet("resumen_stock.parquet")
leido = spark.read.parquet("resumen_stock.parquet")
leido.show()

resumen.explain()
spark.sql("""SELECT NombreMarca, SUM(Stock) AS Pares
             FROM stock GROUP BY NombreMarca""").explain()


# ##############################################################################
# MÓDULO 4: ESTADÍSTICA AVANZADA Y AUDITORÍA FINANCIERA
# Temas: describe, correlacion, cuantiles, margenes, crosstab, sample, perdidas
# ##############################################################################

# ------------------------------------------------------------------------------
# 4.1  describe, correlación y cuantiles con approxQuantile
# ------------------------------------------------------------------------------
df_ventas.select("TotalLinea", "Utilidad").describe().show()

corr = df_ventas.stat.corr("TotalLinea", "Utilidad")             # Pearson
print("Correlacion:", round(corr, 3))

q = df_ventas.stat.approxQuantile("Utilidad", [0.25, 0.5, 0.75], 0.01)
print("Q1, mediana, Q3:", q)

print("Lineas con utilidad negativa:", df_ventas.filter(F.col("Utilidad") < 0).count(),
      "de", df_ventas.count())

# ------------------------------------------------------------------------------
# 4.2  Márgenes por marca y tabla de contingencia (crosstab)
# ------------------------------------------------------------------------------
(df_ventas.groupBy("NombreMarca")
    .agg(F.round(F.sum("Utilidad") / F.sum("TotalLinea") * 100, 1).alias("MargenPct"))
    .orderBy(F.desc("MargenPct"))
    .show())

df_ventas.stat.crosstab("NombreMarca", "Canal").show()

# ------------------------------------------------------------------------------
# 4.3  Muestreo reproducible y detección de modelos con pérdida
# ------------------------------------------------------------------------------
muestra = df_ventas.sample(withReplacement=False, fraction=0.10, seed=42)
muestra.show(3)

(df_ventas.filter(F.col("Utilidad") < 0)
    .groupBy("NombreMarca", "NombreModelo")
    .agg(F.round(F.sum("Utilidad"), 2).alias("Perdida"))
    .orderBy("Perdida")
    .show())


# ##############################################################################
# CIERRE - CONCILIACIÓN DE MÉTRICAS CLAVE Y LIBERACIÓN DE MEMORIA
# ##############################################################################
inmovilizado = (
    df_stock.groupBy("NombreMarca")
    .agg(F.sum("ValorInventario").alias("v"))
    .join(df_ventas.select("NombreMarca").distinct(), "NombreMarca", "left_anti")
    .agg(F.sum("v")).collect()[0][0]
)
print("\n================ MÉTRICAS CLAVE CONSOLIDADAS ================")
print(f"Ventas netas sin IGV      : S/ {round(ventas_sin_igv, 2)}")
print(f"Utilidad neta total       : S/ {round(utilidad_total, 2)}")
print(f"Lineas con perdida        : {con_perdida.count()} de {rdd_ventas.count()}")
print(f"Inventario sin rotacion   : S/ {round(inmovilizado or 0.0, 2)}")

rdd_ventas.unpersist()
df_stock.unpersist()
print("\nFin del analisis.")`,
  },
];

