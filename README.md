# ColombIA — Centro Institucional de Inteligencia Artificial de Colombia

Sitio web institucional de ColombIA: infraestructura pública de innovación y aprendizaje
territorial para el uso responsable de inteligencia artificial en los territorios.

## Ver el sitio

Publicado con GitHub Pages: **https://danielfer31.github.io/colombia-ia-web/**

## Estructura

```
index.html                 Página completa (SPA de 5 secciones: Inicio, Incidencia,
                           Investigaciones, Cursos, Soluciones)
css/style.css              Navegación, componentes, acordeón de cursos, tarjetas
css/hero.css               Hero: fondo, red de nodos, rotador de titulares
js/main.js                 Navegación, reveal on scroll, animación de la red
js/hero.js                 Secuencia de entrada del hero y preloader
js/hero-gl.js              Fondo animado del hero
assets/                    Logos, video de marca e imágenes
assets/imagenes/principios/  Iconografía de los principios (+ PROMPTS.md)
```

Sitio estático: sin build, sin dependencias, sin framework.

## Desarrollo local

Cualquier servidor estático sirve. Por ejemplo:

```bash
python -m http.server 4173
```

Luego abrir http://localhost:4173

## Despliegue

Cada push a `main` publica automáticamente vía GitHub Pages.
