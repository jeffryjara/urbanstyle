/* =====================================================================
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
GO

