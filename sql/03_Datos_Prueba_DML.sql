/* =====================================================================
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
GO
