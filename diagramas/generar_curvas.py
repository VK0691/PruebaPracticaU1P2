"""Genera curva-antes.png y curva-despues.png a partir de curvas.csv.

Uso (desde la carpeta diagramas/):
    pip install matplotlib
    python generar_curvas.py

curvas.csv tiene una fila por touchpoint:
    touchpoint, antes, despues, momento_verdad (si/no), tipo_despues (estimacion/medicion)
Después de la prueba con usuarios, cambien los valores de "despues" por lo observado
y pongan tipo_despues = medicion. El título de la gráfica cambia solo.
Escala: -2 muy negativa · -1 negativa · 0 neutra · +1 positiva · +2 muy positiva
"""
import csv
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

AQUI = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(AQUI, "curvas.csv"), encoding="utf-8") as f:
    filas = list(csv.DictReader(f))
with open(os.path.join(AQUI, "curvas_titulo.txt"), encoding="utf-8") as f:
    CASO = f.read().strip()

etiquetas = [r["touchpoint"].replace("\\n", "\n") for r in filas]
antes = [float(r["antes"]) for r in filas]
despues = [float(r["despues"]) for r in filas]
mv = [i for i, r in enumerate(filas) if r["momento_verdad"].strip().lower() == "si"]
medido = all(r["tipo_despues"].strip().lower() == "medicion" for r in filas)


def base(titulo):
    fig, ax = plt.subplots(figsize=(13, 6.2), dpi=150)
    ax.axhspan(-2.5, 0, color="#fcf1f0")
    ax.axhspan(0, 2.5, color="#f1f7ef")
    ax.axhline(0, color="#777", lw=1.2, ls="--")
    ax.set_ylim(-2.5, 2.5)
    ax.set_xlim(-0.5, len(etiquetas) - 0.5)
    ax.set_xticks(range(len(etiquetas)))
    ax.set_xticklabels(etiquetas, fontsize=10)
    ax.set_yticks([2, 1, 0, -1, -2])
    ax.set_yticklabels(["+2 Muy positiva", "+1 Positiva", "0 Neutra", "−1 Negativa", "−2 Muy negativa"], fontsize=10)
    ax.set_xlabel("Touchpoints del recorrido", fontsize=11)
    ax.set_title(titulo, fontsize=14, weight="bold")
    for s in ("top", "right"):
        ax.spines[s].set_visible(False)
    return fig, ax


def serie(ax, valores, color, estilo, nombre):
    ax.plot(range(len(valores)), valores, estilo, color=color, lw=3.2, label=nombre, zorder=3)
    for i, y in enumerate(valores):
        if i in mv:
            ax.plot(i, y, marker="*", ms=22, color="#f5a623", mec="black", mew=1.1, zorder=4)
        else:
            ax.plot(i, y, marker="o", ms=9, color=color, mec="black", mew=0.8, zorder=4)


# Curva inicial
fig, ax = base(CASO + " · Curva emocional inicial (estimación del equipo)")
serie(ax, antes, "#a3001b", "-", "Antes (sistema actual)")
ax.plot([], [], marker="*", ms=16, color="#f5a623", mec="black", ls="none", label="Momento de verdad")
ax.legend(loc="lower left", fontsize=10, framealpha=1)
fig.tight_layout()
fig.savefig(os.path.join(AQUI, "curva-antes.png"))

# Comparación antes / después
tipo = "medición en la prueba" if medido else "estimación: actualizar con la sesión de prueba"
fig, ax = base(CASO + " · Curva antes y después (" + tipo + ")")
serie(ax, antes, "#a3001b", "-", "Antes (sistema actual)")
serie(ax, despues, "#0a5c27", "--" if not medido else "-", "Después (prototipo v2)")
ax.plot([], [], marker="*", ms=16, color="#f5a623", mec="black", ls="none", label="Momento de verdad")
ax.legend(loc="lower left", fontsize=10, framealpha=1)
fig.tight_layout()
fig.savefig(os.path.join(AQUI, "curva-despues.png"))
print("Listo: curva-antes.png y curva-despues.png")
