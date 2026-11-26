# Hilo Rojo · sitio web

Estrategia y creatividad que conectan.

Sitio estático (HTML, CSS y JavaScript, sin compilación). La página principal es `index.html`; los estilos están en `css/`, el código de animación en `js/` y las imágenes en `img/`.

Para publicarlo en Vercel: importar este repositorio, dejar el Framework Preset en **Other** y tocar **Deploy**.

## Blog

- Portada del blog: `blog/index.html` (lista de artículos, el más nuevo primero).
- Cada artículo vive en su carpeta: `blog/<nombre-del-articulo>/index.html` y se ve en `/blog/<nombre-del-articulo>/`.
- Para publicar uno nuevo: copiar la carpeta de un artículo existente, cambiar título, fecha, categoría y el texto entre `TEXTO DEL ARTÍCULO` y `FIN DEL TEXTO`; luego copiar un bloque `<li>` en `blog/index.html` y ponerlo arriba de la lista.
- Los estilos del blog están al final de `css/estilos.css` (sección «blog»).
