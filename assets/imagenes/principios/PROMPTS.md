# Prompts — fotografías de los 4 principios (sección "Qué es ColombIA")

Generar en ChatGPT / DALL·E. Guardar cada resultado en esta misma carpeta con el
nombre exacto indicado. El HTML ya las está buscando: si el archivo no existe, la
tarjeta muestra el degradado azul de marca; en cuanto aparece el `.jpg`, se rellena sola.

**Reglas comunes (aplican a las 4):**
- Formato **4:3 horizontal**, mínimo **1600×1200 px**, exportar como **.jpg** (calidad ~80).
- **Sin texto, letras, carteles, logos ni marcas de agua** dentro de la imagen — el texto
  va superpuesto en HTML.
- Serie coherente: misma luz natural cálida, mismo tratamiento documental, paleta
  institucional (azul profundo, blanco hueso, ocre/dorado, acentos rojo tenue).
- Composición con **aire en la parte superior** y sujeto hacia el tercio superior/central:
  el tercio inferior queda cubierto por el degradado con el título.
- Personas latinoamericanas/colombianas reales, diversas en edad y región. Nada de
  estética "stock corporativo" ni sonrisas forzadas.

---

## 1. `publica.jpg` — Pública
> *El interés colectivo va antes que el comercial.*

```
Documentary editorial photograph, no text or signage anywhere in frame: a community
assembly inside a modest Colombian municipal hall. Diverse Latin American citizens and
public servants seated in a semicircle; a woman in her fifties stands mid-sentence,
others listen attentively, one takes notes by hand. Warm natural light pouring from tall
windows, dust in the air. Muted institutional palette: deep navy blue, bone white, soft
ochre. Shot on 35mm film, f/2.8, shallow depth of field, candid reportage, generous
empty space in the upper third of the frame. No logos, no watermarks, no letters.
```

## 2. `responsable.jpg` — Responsable
> *IA verificable, auditable y con supervisión humana.*

```
Documentary editorial photograph, no text or readable interface labels: a Colombian data
analyst in her thirties reviewing information on two screens while a colleague points at
the screen and questions a result. Human oversight of an automated system. Clean modern
public office, natural side light, cool blue screen glow balanced against warm daylight.
Palette of deep navy, bone white and electric blue. Shot on 35mm, f/2, shallow depth of
field, candid, serious and focused mood, empty space in the upper third. No logos, no
watermarks, no legible text on the monitors.
```

## 3. `territorial.jpg` — Territorial
> *Equidad entre regiones, no solo entre ciudades capitales.*

```
Documentary landscape photograph, no text: a small Andean town in rural Colombia seen
from a hillside at golden hour. Whitewashed houses with clay-tile roofs scattered across
green mountains, a winding dirt road, low clouds hugging distant peaks, a lone
telecommunications antenna on a ridge suggesting connectivity reaching the countryside.
Warm late-afternoon light, ochre and deep green tones under a wide navy-blue sky. Shot on
35mm, deep focus, wide angle, expansive sky occupying the upper third. No logos, no
watermarks, no signage.
```

## 4. `inteligente.jpg` — Inteligente
> *La evidencia va antes que la narrativa.*

```
Documentary editorial photograph, no text or readable charts: an overhead-angled view of
a working table where three Colombian researchers compare printed data visualizations,
maps and handwritten notes spread across the surface; hands pointing and annotating, a
pencil mid-gesture, coffee cups at the edge. Warm natural window light, bone-white paper
against a dark wood table, accents of yellow and blue in the printed graphics. Shot on
35mm, f/2.8, shallow depth of field, candid, analytical mood, breathing room in the upper
third. No logos, no watermarks, no legible text or numbers.
```

---

**Después de generarlas:** basta con copiar los 4 `.jpg` a
`sitio-web/assets/imagenes/principios/` con esos nombres exactos. No hay que tocar HTML ni CSS.
