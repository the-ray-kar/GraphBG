# Scroll-Independent Interactive Canvas Background

This project renders an animated and interactive canvas-based background graph that remains fixed behind scrollable page content. Nodes are randomly placed and connected to nearby neighbors, and cursor movement highlights nearby edges and draws connecting lines in real time.

---

## Features

- Scroll-independent, full-screen canvas background
- Responsive to window resize
- Quadtree-accelerated neighbor queries
- Mouse hover highlights nearby edges
- Cursor draws connecting lines to nearby nodes
- Highly configurable visuals via parameters

---

## Getting Started

### 1. Clone or Download

```bash
git clone https://github.com/your-username/interactive-background-graph.git
cd interactive-background-graph
```

### 2. Include in Your HTML

```html
<!-- Include the script -->
<script src="bgGraph.js"></script>

<!-- Initialize -->
<script>
  initBackgroundGraph();
</script>
```

### 3. Example HTML Page

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Background Animation</title>
  <style>
    body {
      margin: 0;
      font-family: sans-serif;
      background: #000;
      color: white;
    }
    main {
      padding: 2rem;
      position: relative;
      z-index: 1;
    }
  </style>
</head>
<body>
  <main>
    <h1>Scroll-Independent Canvas Background</h1>
    <p>This text scrolls, while the animated background stays fixed.</p>
    <div style="height: 1500px;"></div>
  </main>

  <script src="bgGraph.js"></script>
  <script>
    initBackgroundGraph(); // Start the background animation
  </script>
</body>
</html>
```

---

## Configuration Options

You can pass a config object to `initBackgroundGraph({...})` to customize behavior:

| Option           | Default | Description |
|------------------|---------|-------------|
| `pointCount`     | 5000    | Number of graph nodes |
| `kNeighbors`     | 3       | Max connections per point |
| `pointSize`      | 2       | Radius of each node |
| `edgeWidth`      | 1       | Line width for edges |
| `baseOpacity`    | 0.2     | Opacity for all drawing |
| `hoverRadius`    | 60      | Max distance for hover highlighting |
| `cursorConnect`  | 5       | Max points connected to cursor |
| `pointColor`     | `#888`  | Color of the nodes |
| `edgeColor`      | `#888`  | Color of the edges |
| `highlightColor` | `#fff`  | Highlight color on hover |
| `cursorColor`    | `#0f8`  | Line color connecting to cursor |

Example:

```js
initBackgroundGraph({
  pointCount: 3000,
  cursorColor: '#ff0',
  pointColor: '#444'
});
```



