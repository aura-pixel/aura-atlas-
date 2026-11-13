"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, BookOpen, ImagePlus, Compass } from "lucide-react";
import type { AtlasUnit } from "./atlas-types";
import styles from "./learning-atlas.module.css";
import map from "./unit-constellation.module.css";
export function Landscape({
  kind = "mountain",
}: {
  kind?: "mountain" | "lake" | "hills";
}) {
  return (
    <svg
      viewBox="0 0 300 200"
      fill="none"
      aria-hidden="true"
      className={styles.landscape}
    >
      {kind === "lake" ? (
        <>
          <path
            d="M32 105C56 45 203 29 259 95S180 185 95 173 8 160 32 105Z"
            fill="var(--lake)"
          />
          <path
            d="M63 109C99 77 202 66 231 112M91 137C130 116 176 118 200 136"
            stroke="var(--surface)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity=".7"
          />
        </>
      ) : (
        <>
          <path
            d="M11 160 103 37Q112 25 121 42L215 160Z"
            fill="var(--mountain)"
          />
          <path
            d="m108 34-24 39 27-9 19 15 15-7Z"
            fill="var(--surface)"
            opacity=".7"
          />
          <path d="m138 162 62-103q10-14 20 2l77 101Z" fill="var(--hill)" />
          <path d="M0 162Q65 137 143 163T300 159V190H0Z" fill="var(--meadow)" />
        </>
      )}
    </svg>
  );
}
export function LearningJourney({
  units,
  onOpen,
  onImage,
}: {
  units: AtlasUnit[];
  onOpen: (unit: AtlasUnit) => void;
  onImage?: (unit: AtlasUnit) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(3);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setColumns(entry.contentRect.width < 580 ? 2 : 3);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const rows = Math.max(2, Math.ceil(units.length / columns));
  const height = rows * 230 + 110;
  const stops = units.map((unit, index) => {
    const row = Math.floor(index / columns);
    const column = row % 2 ? columns - 1 - (index % columns) : index % columns;
    return { unit, x: ((column + 0.5) * 1000) / columns, y: 105 + row * 230 };
  });
  const route = stops
    .map((stop, index) => {
      if (!index) return `M${stop.x} ${stop.y}`;
      const previous = stops[index - 1];
      const middle = (stop.y + previous.y) / 2;
      return `C${previous.x} ${middle} ${stop.x} ${middle} ${stop.x} ${stop.y}`;
    })
    .join(" ");
  return (
    <div className={map.atlas} ref={container}>
      {units.length > 0 ? (
        <>
          <div className={map.map} style={{ height }}>
            <svg
              className={map.paper}
              viewBox={`0 0 1000 ${height}`}
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
            >
              <path
                className={map.shadow}
                d={`M16 40 250 10 500 42 750 10 984 40 984 ${height - 20} 750 ${height - 50} 500 ${height - 20} 250 ${height - 50} 16 ${height - 20}Z`}
              />
              <path
                fill="var(--map-paper)"
                stroke="var(--map-edge)"
                strokeWidth="2"
                strokeLinejoin="round"
                d={`M12 30 250 0 500 32 750 0 988 30 988 ${height - 38} 750 ${height - 68} 500 ${height - 38} 250 ${height - 68} 12 ${height - 38}Z`}
              />
              <path
                fill="var(--map-grass)"
                d={`M30 46 250 18 500 50 750 18 970 46 970 ${height - 58} 750 ${height - 86} 500 ${height - 56} 250 ${height - 86} 30 ${height - 58}Z`}
              />
              <path
                fill="var(--map-fold)"
                opacity=".4"
                d={`M250 18 500 50 500 ${height - 56} 250 ${height - 86}Z M750 18 970 46 970 ${height - 58} 750 ${height - 86}Z`}
              />
              <path
                d={`M250 0V${height - 68}M500 32V${height - 38}M750 0V${height - 68}`}
                stroke="var(--map-edge)"
                strokeWidth="1"
                opacity=".24"
              />
              {Array.from({ length: rows }, (_, row) => (
                <g key={row} transform={`translate(0 ${row * 230})`}>
                  <g transform="translate(620 162)" strokeLinejoin="round">
                    <path
                      d="M-65 44-18-25Q-14-31-10-25L40 44Z"
                      fill="var(--map-mountain)"
                      stroke="var(--map-tree-ink)"
                      strokeWidth="1.3"
                    />
                    <path
                      d="m-14-30-17 26 17-6 12 9 9-5Z"
                      fill="var(--map-paper)"
                    />
                    <path
                      d="M-10 44 28-9Q32-15 36-9L76 44Z"
                      fill="var(--map-tree)"
                      stroke="var(--map-tree-ink)"
                      strokeWidth="1.3"
                    />
                    <path
                      d="m32-14-12 18 12-4 10 7 7-3Z"
                      fill="var(--map-paper)"
                    />
                  </g>
                  {[
                    { x: 100, y: 58 },
                    { x: 395, y: 202 },
                    { x: 890, y: 42 },
                  ].map((flower, index) => (
                    <g
                      key={index}
                      transform={`translate(${flower.x} ${flower.y})`}
                    >
                      <path
                        d="M0 0V21M0 16Q-14 7-12 16Q-6 22 0 19M0 12Q12 4 11 12Q6 17 0 16"
                        stroke="var(--map-tree-ink)"
                        strokeWidth="1.5"
                        fill="var(--map-tree)"
                        strokeLinecap="round"
                      />
                      <path
                        d="M0-3C-16-20-22 1-7 3C-23 14-2 24 0 9C9 25 24 8 9 3C25-5 8-22 0-3Z"
                        fill={
                          index % 2
                            ? "var(--map-flower-gold)"
                            : "var(--map-flower-pink)"
                        }
                      />
                      <circle cy="3" r="4" fill="var(--map-paper)" />
                    </g>
                  ))}
                  <path
                    d="M355 48C320 28 288 62 305 83S365 97 385 76 382 38 355 48Z"
                    fill="var(--map-water)"
                  />
                  <path
                    d="M322 64Q345 54 362 65"
                    stroke="var(--map-paper)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity=".7"
                  />
                  <path
                    d="M828 168C803 132 770 154 779 183S821 220 851 195 852 157 828 168Z"
                    fill="var(--map-water)"
                    opacity=".8"
                  />
                  {[
                    { x: 76, y: 150 },
                    { x: 440, y: 164 },
                    { x: 570, y: 30 },
                    { x: 912, y: 70 },
                  ].map((tree, i) => (
                    <g key={i} transform={`translate(${tree.x} ${tree.y})`}>
                      <path
                        d="M0 30V52"
                        stroke="var(--map-tree-ink)"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <path
                        d="M0 0-14 22H-8L-20 39Q0 48 20 39L8 22H14Z"
                        fill="var(--map-tree)"
                        stroke="var(--map-tree-ink)"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                      />
                    </g>
                  ))}
                  <path
                    d="m674 180 4-8m6 9 2-5m-548-124 3-6m5 9 2-5"
                    stroke="var(--map-tree-ink)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity=".5"
                  />
                </g>
              ))}
              <path
                d={route}
                stroke="var(--map-paper)"
                strokeWidth="24"
                strokeLinecap="round"
              />
              <path
                d={route}
                stroke="var(--map-road)"
                strokeWidth="2"
                strokeDasharray="5 9"
                strokeLinecap="round"
              />
            </svg>
            <ol className={map.stops}>
              {stops.map(({ unit, x, y }) => (
                <li
                  className={map.stop}
                  key={unit.id}
                  style={{ left: `${x / 10}%`, top: y }}
                >
                  <button
                    type="button"
                    className={map.open}
                    onClick={() => onOpen(unit)}
                    aria-label={`Abrir unidad ${unit.number}: ${unit.title}`}
                    title={unit.title}
                  >
                    <span className={map.pin}>
                      <svg viewBox="0 0 60 78" fill="none" aria-hidden="true">
                        <path
                          d="M30 74S4 44 4 29a26 26 0 1 1 52 0C56 44 30 74 30 74Z"
                          fill="var(--map-pin)"
                          stroke="var(--map-pin-edge)"
                          strokeWidth="2.5"
                        />
                        <circle
                          cx="30"
                          cy="29"
                          r="13"
                          fill="var(--map-paper)"
                          stroke="var(--map-pin-edge)"
                          strokeWidth="2"
                        />
                      </svg>
                    </span>
                    <span className={map.label}>
                      {unit.imageUrl && (
                        <img
                          src={unit.imageUrl}
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      <span className={map.text}>
                        <small>Unidad {unit.number}</small>
                        <strong>{unit.title}</strong>
                      </span>
                      <ArrowUpRight
                        size={14}
                        className={map.arrow}
                        aria-hidden="true"
                      />
                    </span>
                  </button>
                  {onImage && (
                    <button
                      type="button"
                      className={map.changeImage}
                      onClick={() => onImage(unit)}
                      aria-label={`Cambiar imagen de la unidad ${unit.number}`}
                      title="Cambiar imagen"
                    >
                      <ImagePlus size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ol>
            <span className={map.compass} aria-hidden="true">
              <Compass size={35} strokeWidth={1} />
            </span>
          </div>
        </>
      ) : (
        <div className={styles.empty}>
          <BookOpen size={32} />
          <h3>Tu atlas está tomando forma.</h3>
          <p>
            Las unidades aparecerán aquí cuando tengan materiales para explorar.
          </p>
        </div>
      )}
    </div>
  );
}
