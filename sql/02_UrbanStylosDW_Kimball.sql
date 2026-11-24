/* =====================================================================
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
GO
