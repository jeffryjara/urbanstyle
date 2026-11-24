# ==============================================================================
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
print("\\nProcesamiento Spark completado con éxito.")
