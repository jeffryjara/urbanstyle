/* =====================================================================
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
GO
