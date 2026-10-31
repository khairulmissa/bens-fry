# Ben's Fry

Landing page for Ben's Fry, a fried chicken shop in Taman Kota Masai, Pasir Gudang, Johor.

Built with plain HTML, CSS and JavaScript. No frameworks, no build step.

## Features

- Responsive layout (mobile first)
- Menu with category filters, best sellers and a full menu board preview
- Opening hours with a live "Open now / Closed" status (Malaysia time)
- Google Maps and Waze directions
- WhatsApp, call and social media links
- Photo gallery with lightbox (shows up once photos are added)

## Running locally

Open `index.html` in a browser, or use the Live Server / Five Server extension in VS Code
(right click `index.html` → Open with Live Server).

## Project structure

```
index.html
css/style.css
js/config.js       shop details (phone, address, hours, socials)
js/menu-data.js    menu items and prices
js/script.js
images/
  brand/           logo, mascot, favicon
  menu/            menu photos (<item-id>.jpg)
  about/           about-1.jpg
  gallery/         gallery-1.jpg ... gallery-8.jpg
  hero/            hero-bg.jpg (optional)
```

## Updating content

**Shop details** – edit `js/config.js`. Leave a social link as `""` to hide it.

**Prices / menu** – edit `js/menu-data.js`.

```js
{
  id: "crispy-burger-set",
  name: "Crispy Chicken Burger Set",
  category: "burgers",
  group: "Single Set",
  includes: "Crispy Chicken Burger + Fries + Coke",
  price: 13.9,
  bestSeller: true,
}
```

Set `available: false` to hide an item without deleting it.

**Menu photos** – each item uses `images/menu/<id>.jpg`, so to change a photo just replace
the file with the same name. Cards use 480×360, sides and drinks use 200×200
(white background works best). If a photo is missing, an illustration is shown instead.

**Gallery / about / hero** – drop photos into the matching folder using the filenames above.
The gallery stays hidden until at least one photo is added.

## To do

- [ ] Real story for the About section
- [ ] Exact Google Maps link in `config.js`
- [ ] Gallery and shop photos