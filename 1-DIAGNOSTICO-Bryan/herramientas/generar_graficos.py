"""Genera las curvas emocionales a partir de recorrido-emocional.csv.

Uso (desde la carpeta APE4-integral):
    python herramientas/generar_graficos.py

Produce:
    recorrido-emocional.png          curva inicial (diagnóstico) con momentos de verdad
    iteracion/curva-v1-v2.png        original estimada vs. v1 observada vs. v2 (predicha u observada)

Después de las pruebas, llenen en el CSV las columnas valor_v1_observado_P01 y
valor_v1_observado_P02 (escala -2 a +2) y vuelvan a ejecutar: la línea observada
aparece sola. Si prueban también la v2, escriban sus valores en valor_v2_predicho y
cambien tipo_dato_v2 a "Observado": la leyenda cambia a "v2 observada".
Requiere: pip install matplotlib
"""
import csv
import os
import sys
import textwrap

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV = os.path.join(RAIZ, "recorrido-emocional.csv")

# Paleta validada (CVD y contraste) para 3 series; además cada serie usa trazo y marcador distintos.
C_ORIGINAL = "#C2410C"
C_V2 = "#0B7FAB"
C_OBS = "#7C3AED"
TINTA = "#1C2740"
TINTA2 = "#4A5468"
REJILLA = "#E3E7ED"


def num(v):
    v = (v or "").strip().replace("+", "")
    try:
        return float(v)
    except ValueError:
        return None


def leer():
    with open(CSV, encoding="utf-8") as f:
        return list(csv.DictReader(f))


def base(ax, filas, titulo):
    ids = [f["id"] for f in filas]
    etiquetas = [f"{f['id']}\n" + textwrap.fill(f["touchpoint"], 15) for f in filas]
    ax.set_title(titulo, loc="left", fontsize=15, fontweight="bold", color=TINTA, pad=14)
    ax.set_ylim(-2.6, 2.6)
    ax.set_yticks([-2, -1, 0, 1, 2])
    ax.set_yticklabels(["−2 Frustración", "−1 Incomodidad", "0 Neutral", "+1 Confianza", "+2 Satisfacción"], color=TINTA2, fontsize=10)
    ax.set_xticks(range(len(ids)))
    ax.set_xticklabels(etiquetas, fontsize=8.6, color=TINTA2)
    ax.set_xlim(-0.5, len(ids) - 0.1)
    ax.axhline(0, color="#9AA3B2", lw=1)
    ax.grid(axis="y", color=REJILLA, lw=1)
    for s in ("top", "right"):
        ax.spines[s].set_visible(False)
    for s in ("left", "bottom"):
        ax.spines[s].set_color("#C7CDD6")
    ax.tick_params(length=0)
    # Momentos de verdad: banda vertical + rótulo
    for i, f in enumerate(filas):
        if f["momento_verdad"].lower().startswith("s"):
            ax.axvspan(i - 0.38, i + 0.38, color="#F3EEFB", zorder=0)
            ax.text(i, 2.42, f["momento_verdad"].replace("Sí ", "").strip("()"), ha="center", va="center",
                    fontsize=10, fontweight="bold", color="#5B21B6")


def curva_inicial(filas):
    fig, ax = plt.subplots(figsize=(13, 5.9), dpi=160)
    base(ax, filas, "Curva emocional inicial · interfaz actual de registro (estimación del equipo)")
    y = [num(f["valor_original"]) for f in filas]
    x = list(range(len(filas)))
    ax.plot(x, y, color=C_ORIGINAL, lw=2.2, marker="o", ms=9, mec="white", mew=2, zorder=3)
    for i, f in enumerate(filas):
        dy = 0.32 if y[i] >= 0 else -0.36
        ax.text(i, y[i] + dy, f["emocion_original"], ha="center", fontsize=9, color=TINTA)
    fig.text(0.01, 0.01, "Escala explícita de −2 a +2. Valores estimados por recorrido cognitivo del equipo, no medidos con usuarios. "
             "MV = momento de verdad.", fontsize=8.5, color=TINTA2)
    fig.tight_layout(rect=(0, 0.03, 1, 1))
    salida = os.path.join(RAIZ, "recorrido-emocional.png")
    fig.savefig(salida, facecolor="white")
    print("OK", salida)


def curva_comparada(filas):
    fig, ax = plt.subplots(figsize=(13, 6.4), dpi=160)
    base(ax, filas, "Curva emocional: interfaz original vs. propuesta")
    x = list(range(len(filas)))
    y0 = [num(f["valor_original"]) for f in filas]
    ax.plot(x, y0, color=C_ORIGINAL, lw=2, marker="o", ms=8, mec="white", mew=2, label="Original (estimada)", zorder=3)

    obs = []
    for f in filas:
        vals = [v for v in (num(f.get("valor_v1_observado_P01")), num(f.get("valor_v1_observado_P02"))) if v is not None]
        obs.append(sum(vals) / len(vals) if vals else None)
    if any(v is not None for v in obs):
        xs = [i for i, v in enumerate(obs) if v is not None]
        ax.plot(xs, [obs[i] for i in xs], color=C_OBS, lw=2, marker="^", ms=9, mec="white", mew=1.5,
                label="v1 observada (promedio P01–P02)", zorder=4)

    observada_v2 = any(f.get("tipo_dato_v2", "").lower().startswith("observ") for f in filas)
    y2 = [num(f["valor_v2_predicho"]) for f in filas]
    ax.plot(x, y2, color=C_V2, lw=2, ls="-" if observada_v2 else (0, (5, 3)), marker="s", ms=7.5, mec="white", mew=1.5,
            label="v2 observada" if observada_v2 else "v2 (predicción, no medida)", zorder=3)

    # Etiquetas directas al final de cada línea (la identidad no depende solo del color)
    for linea in ax.get_lines():
        if linea.get_label().startswith("_"):
            continue
        xd, yd = linea.get_xdata(), linea.get_ydata()
        ax.annotate(linea.get_label().split(" (")[0], (xd[-1], yd[-1]), xytext=(10, 0), textcoords="offset points",
                    va="center", fontsize=9, color=TINTA, fontweight="bold")
    ax.legend(loc="upper left", frameon=False, fontsize=9.5, ncol=3, bbox_to_anchor=(0, -0.2))
    nota = ("Predicción ≠ dato: la línea v2 punteada es una hipótesis del equipo. "
            "Solo las líneas marcadas como observadas provienen de las pruebas con P01 y P02.")
    fig.text(0.01, 0.01, nota, fontsize=8.5, color=TINTA2)
    fig.tight_layout(rect=(0, 0.04, 0.96, 1))
    os.makedirs(os.path.join(RAIZ, "iteracion"), exist_ok=True)
    salida = os.path.join(RAIZ, "iteracion", "curva-v1-v2.png")
    fig.savefig(salida, facecolor="white")
    print("OK", salida)


if __name__ == "__main__":
    if not os.path.exists(CSV):
        sys.exit("No encuentro recorrido-emocional.csv")
    datos = leer()
    curva_inicial(datos)
    curva_comparada(datos)
