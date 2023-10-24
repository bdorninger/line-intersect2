// Import stylesheets
import './style.css';

// Write TypeScript code!
const canv: HTMLCanvasElement = document.getElementById(
  'canvas'
) as HTMLCanvasElement;

const context = canv.getContext('2d');

interface DrawOptions {
  factor?: number;
  color?: string;
}

interface Point {
  x: number;
  y: number;
}

const K: Point[] = [
  {
    x: 2,
    y: 0,
  },
  { x: 6, y: 2 },
  {
    x: 14,
    y: 5,
  },
  {
    x: 19,
    y: 3,
  },
];

const L: Point[] = [
  {
    x: 0,
    y: 3,
  },
  {
    x: 8,
    y: 3,
  },
  {
    x: 8,
    y: 6,
  },
  {
    x: 17,
    y: 6,
  },
  {
    x: 20,
    y: 6,
  },
];

const ind = getLimitIndices(K[1], K[2], L);
console.log(`indices `, K[1].x, K[2].x, ind);

console.log(`kd K`, computeKD(K[1], K[2]));
console.log(`kd L`, computeKD(L[1], L[2]));

const intersecting = intersect(
  K[1],
  K[2],
  L.filter((_l, i) => i >= ind.l0 && i <= ind.ln)
);

console.log(
  `${intersecting ? 'INTERSECTING!' : 'NOT intersecting'}`,
  K[1],
  K[2],
  L
);

drawLine(K[1], K[2], {
  factor: 10,
  color: '#ff0000',
});

function drawLine(from: Point, to: Point, options: DrawOptions) {
  const f = options.factor ?? 1;
  context.strokeStyle = options.color;
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(from.x * f, 100 - from.y * f);
  context.lineTo(to.x * f, 100 - to.y * f);
  context.stroke();
}

function intersect(k0: Point, k1: Point, limitSegs: Point[], accuracy = 1e-10) {
  const fk = computeKD(k0, k1);
  if (limitSegs.length === 0) {
    return false;
  }

  if (limitSegs.length === 1) {
    return Math.abs(fk.k * limitSegs[0].x + fk.d - limitSegs[0].y) < accuracy;
  }

  let onInterval = false;
  let xsect = null;
  for (let i = 0; i < limitSegs.length - 1 && !onInterval; i++) {
    const lseg = [limitSegs[i], limitSegs[i + 1]];
    const fl = computeKD(lseg[0], lseg[1]);

    if (
      fl.k === Number.NEGATIVE_INFINITY ||
      fl.k === Number.POSITIVE_INFINITY
    ) {
      const xl = lseg[0].x;
      const y = fk.k * xl + fk.d;
      onInterval = y <= lseg[1].y && y >= lseg[0].y;
      xsect = xl;
    } else {
      xsect = (fl.d - fk.d) / (fk.k - fl.k);
      onInterval =
        xsect >= lseg[0].x &&
        xsect <= lseg[1].x &&
        xsect >= k0.x &&
        xsect <= k1.x;
    }

    drawLine(lseg[0], lseg[1], {
      factor: 10,
      color: '#00ff00',
    });
    console.log(`checking segment`, lseg[0], lseg[1], fl, xsect, onInterval);
  }

  return onInterval;
}

/**
 * computes the x and y where the line k0-k1 intersects the curve defined by limit
 */
function getLimitIndices(
  k0: Point,
  k1: Point,
  limit: Point[]
): { l0: number; ln: number } {
  if (limit.length <= 0) {
    return {
      l0: -1,
      ln: -1,
    };
  }

  // determine l0 and ln the index points lying neighboured to k0 and k1
  let l0: number = 0;
  for (let i = 0; limit[i].x < k0.x && i < limit.length; i++) {
    l0 = i;
  }

  let l1: number = limit[limit.length - 1].x;
  for (let i = limit.length - 1; limit[i].x > k1.x && i >= 0; i--) {
    l1 = i;
  }

  return {
    l0: l0,
    ln: l1,
  };
}

function computeKD(p0: Point, p1: Point): { k: number; d: number } {
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;

  if (dy === 0 || dy === dx) {
    return {
      k: 0,
      d: p0.y,
    };
  }

  if (dx === 0) {
    return {
      k: dy < 0 ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      d: NaN,
    };
  }

  const k = dy / dx;
  const d = p0.y - k * p0.x;

  return {
    k: k,
    d: d,
  };
}
