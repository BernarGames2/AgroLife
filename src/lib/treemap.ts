export interface TreemapItem {
  id: string;
  value: number;
}

export interface TreemapRect {
  id: string;
  /** Posição e tamanho em frações do contêiner (0–1). */
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Divide um retângulo em blocos com área proporcional ao valor de cada item,
 * separando a lista em duas metades de área parecida e alternando o corte
 * pelo lado mais longo. `aspect` é a proporção largura/altura do contêiner.
 */
export function treemap(items: TreemapItem[], aspect = 1): TreemapRect[] {
  const valid = items.filter((i) => i.value > 0).sort((a, b) => b.value - a.value);
  const rects: TreemapRect[] = [];

  function split(list: TreemapItem[], x: number, y: number, w: number, h: number) {
    if (list.length === 0) return;
    if (list.length === 1) {
      rects.push({ id: list[0].id, x, y, w, h });
      return;
    }
    const total = list.reduce((s, i) => s + i.value, 0);
    let acc = 0;
    let cut = 1;
    // Ponto de corte que deixa as duas metades com área mais próxima.
    for (let i = 0; i < list.length - 1; i++) {
      acc += list[i].value;
      cut = i + 1;
      if (acc >= total / 2) break;
    }
    const first = list.slice(0, cut);
    const ratio = first.reduce((s, i) => s + i.value, 0) / total;
    if (w * aspect >= h) {
      split(first, x, y, w * ratio, h);
      split(list.slice(cut), x + w * ratio, y, w * (1 - ratio), h);
    } else {
      split(first, x, y, w, h * ratio);
      split(list.slice(cut), x, y + h * ratio, w, h * (1 - ratio));
    }
  }

  split(valid, 0, 0, 1, 1);
  return rects;
}
