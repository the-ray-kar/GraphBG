window.initBackgroundGraph = function(configOverride = {}) {
  const config = Object.assign({
    pointCount:    5000,
    kNeighbors:    3,
    pointSize:     2,
    edgeWidth:     1,
    baseOpacity:   0.2,
    hoverRadius:   60,
    cursorConnect: 5,
    pointColor:    '#888',
    edgeColor:     '#888',
    highlightColor:'#fff',
    cursorColor:   '#0f8',
  }, configOverride);

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.zIndex = -1;
  canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let W, H, qt, points = [], edges = [], mouse = { x: -1, y: -1 };

  class Quadtree {
    constructor(boundary, capacity = 4) {
      this.boundary = boundary;
      this.capacity = capacity;
      this.points = [];
      this.divided = false;
    }
    subdivide() {
      const {x,y,w,h} = this.boundary;
      const hw = w/2, hh = h/2;
      this.northeast = new Quadtree({x:x+hw, y:y,   w:hw, h:hh}, this.capacity);
      this.northwest = new Quadtree({x:x,    y:y,   w:hw, h:hh}, this.capacity);
      this.southeast = new Quadtree({x:x+hw, y:y+hh,w:hw, h:hh}, this.capacity);
      this.southwest = new Quadtree({x:x,    y:y+hh,w:hw, h:hh}, this.capacity);
      this.divided = true;
    }
    insert(point) {
      const {x,y} = point;
      const b = this.boundary;
      if (!(x >= b.x && x < b.x+b.w && y >= b.y && y < b.y+b.h)) return false;
      if (this.points.length < this.capacity) {
        this.points.push(point);
        return true;
      } else {
        if (!this.divided) this.subdivide();
        return (
          this.northeast.insert(point) ||
          this.northwest.insert(point) ||
          this.southeast.insert(point) ||
          this.southwest.insert(point)
        );
      }
    }
    query(range, found) {
      const b = this.boundary;
      if (!this.intersects(range, b)) return found;
      for (let p of this.points) {
        if (this.contains(range, p)) found.push(p);
      }
      if (this.divided) {
        this.northeast.query(range, found);
        this.northwest.query(range, found);
        this.southeast.query(range, found);
        this.southwest.query(range, found);
      }
      return found;
    }
    contains(rect, p) {
      return (
        p.x >= rect.x &&
        p.x <= rect.x + rect.w &&
        p.y >= rect.y &&
        p.y <= rect.y + rect.h
      );
    }
    intersects(a, b) {
      return !(
        b.x > a.x + a.w ||
        b.x + b.w < a.x ||
        b.y > a.y + a.h ||
        b.y + b.h < a.y
      );
    }
  }

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    generateGraph();
  }

  function generateGraph() {
    points = [];
    qt = new Quadtree({x:0,y:0,w:W,h:H}, 4);
    for (let i = 0; i < config.pointCount; i++) {
      const p = { x: Math.random()*W, y: Math.random()*H, index: i };
      points.push(p);
      qt.insert(p);
    }
    edges = [];
    for (let p of points) {
      let nearby = qt.query({x: p.x-100, y: p.y-100, w:200, h:200}, []);
      nearby = nearby.filter(o => o.index !== p.index);
      nearby.sort((a,b) => dist2(p,a) - dist2(p,b));
      for (let i = 0; i < Math.min(config.kNeighbors, nearby.length); i++) {
        const q = nearby[i];
        if (q.index > p.index) edges.push([p.index, q.index]);
      }
    }
  }

  function dist2(a,b) {
    const dx = a.x-b.x, dy = a.y-b.y;
    return dx*dx + dy*dy;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = config.edgeWidth;
    ctx.strokeStyle = config.edgeColor;
    ctx.globalAlpha = config.baseOpacity;

    for (let [i,j] of edges) {
      const a = points[i], b = points[j];
      ctx.beginPath();
      ctx.moveTo(a.x,a.y);
      ctx.lineTo(b.x,b.y);
      ctx.stroke();
    }

    ctx.fillStyle = config.pointColor;
    for (let p of points) {
      ctx.beginPath();
      ctx.arc(p.x,p.y,config.pointSize,0,Math.PI*2);
      ctx.fill();
    }

    highlightEdges();
    drawCursorEdges();

    requestAnimationFrame(draw);
  }

  function highlightEdges() {
    if (mouse.x === -1) return;
    ctx.lineWidth = config.edgeWidth;
    ctx.strokeStyle = config.highlightColor;
    ctx.globalAlpha = config.baseOpacity * 1.5;
    const r2 = config.hoverRadius * config.hoverRadius;

    for (let [i,j] of edges) {
      const a = points[i], b = points[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const t = ((mouse.x - a.x)*dx + (mouse.y - a.y)*dy) / (dx*dx + dy*dy);
      const tc = Math.max(0, Math.min(1, t));
      const cx = a.x + tc * dx;
      const cy = a.y + tc * dy;
      const d2 = (mouse.x - cx)**2 + (mouse.y - cy)**2;
      if (d2 <= r2) {
        ctx.beginPath();
        ctx.moveTo(a.x,a.y);
        ctx.lineTo(b.x,b.y);
        ctx.stroke();
      }
    }
  }

  function drawCursorEdges() {
    if (mouse.x === -1) return;
    const nearby = qt.query({x: mouse.x-100, y: mouse.y-100, w:200, h:200}, []);
    nearby.sort((a,b) => dist2(mouse,a) - dist2(mouse,b));
    ctx.lineWidth = config.edgeWidth+1;
    ctx.strokeStyle = config.cursorColor;
    ctx.globalAlpha = config.baseOpacity * 3;
    for (let i = 0; i < Math.min(config.cursorConnect, nearby.length); i++) {
      const p = nearby[i];
      ctx.beginPath();
      ctx.moveTo(mouse.x, mouse.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw); // Start animation loop

  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    mouse.x = mouse.y = -1;
  });
}
