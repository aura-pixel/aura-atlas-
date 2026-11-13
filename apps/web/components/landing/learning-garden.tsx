import styles from "./landing.module.css";

function Flower({
  x,
  y,
  scale = 1,
  pink = false,
}: {
  x: number;
  y: number;
  scale?: number;
  pink?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className={styles.sway}>
        <path
          d="M0 0Q-12-54 0-108"
          fill="none"
          stroke="#687d77"
          strokeWidth="3"
        />
        <path
          d="M-3-34Q-49-75-41-39Q-24-12-3-19M-4-64Q36-102 32-66Q18-47-4-48"
          fill="#8b9aaa"
        />
        <g
          transform="translate(0 -110)"
          fill={pink ? "#e8afc0" : "#fffdf8"}
          stroke="#4a1115"
          strokeWidth="1.3"
        >
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <ellipse
              key={angle}
              cx="0"
              cy="-17"
              rx="10"
              ry="19"
              transform={`rotate(${angle})`}
            />
          ))}
          <circle r="8" fill="#4a1115" />
        </g>
      </g>
    </g>
  );
}

export function Butterfly({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 65"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <g className={styles.wings}>
        <path
          d="M39 35C-8-16 3 56 36 40C2 66 32 69 40 41"
          fill="#e8afc0"
          stroke="#4a1115"
          strokeWidth="1.3"
        />
        <path
          d="M41 35C88-16 77 56 44 40C78 66 48 69 40 41"
          fill="#8b9aaa"
          stroke="#4a1115"
          strokeWidth="1.3"
        />
      </g>
      <path
        d="M40 29V47M40 31Q32 15 30 22M40 31Q48 15 50 22"
        stroke="#4a1115"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LearningGarden() {
  return (
    <div className={styles.gardenArt}>
      <svg
        className={styles.gardenSvg}
        viewBox="0 0 640 600"
        fill="none"
        role="img"
        aria-label="Un libro abierto del que nacen flores, hojas y conexiones entre ideas"
      >
        <path
          d="M94 183C142 87 254 78 337 96C438 26 564 116 562 240C638 328 544 438 464 466C352 556 230 524 169 462C42 445 10 286 94 183Z"
          fill="#e8afc0"
          fillOpacity=".34"
        />
        <path
          d="M115 393C221 336 445 347 550 411C604 446 501 489 335 493C163 498 52 449 115 393Z"
          fill="#8b9aaa"
          fillOpacity=".24"
        />
        <circle
          cx="338"
          cy="254"
          r="165"
          stroke="#4a1115"
          strokeOpacity=".15"
          strokeDasharray="3 9"
        />
        <path
          className={styles.drawPath}
          d="M104 272C151 138 397 110 490 209S450 359 334 297S161 296 159 381"
          stroke="#4a1115"
          strokeOpacity=".28"
          strokeWidth="1.5"
          strokeDasharray="5 7"
        />
        <g className={styles.plantBack}>
          <path
            d="M348 380C414 308 400 211 459 147M398 284C456 286 494 246 504 211C451 210 417 241 398 284Z"
            stroke="#687d77"
            strokeWidth="3"
            fill="#8b9aaa"
          />
          <path
            d="M410 249C359 230 362 185 363 162C403 177 422 212 410 249ZM429 197C428 150 458 121 485 111C486 153 465 186 429 197Z"
            fill="#8b9aaa"
            stroke="#687d77"
            strokeWidth="2"
          />
        </g>
        <Flower x={261} y={366} scale={1.35} pink />
        <Flower x={184} y={393} scale={0.85} />
        <Flower x={450} y={414} scale={0.75} pink />
        <g className={styles.bookFloat}>
          <path
            d="M157 352L319 385L479 348L487 430L321 478L150 432Z"
            fill="#4a1115"
          />
          <path
            d="M160 341C217 324 269 347 320 373C376 338 419 327 474 338L478 414C421 406 369 430 320 457C267 431 211 412 155 416Z"
            fill="#fffdf8"
            stroke="#4a1115"
            strokeWidth="2"
          />
          <path
            d="M320 373V457M164 426C215 423 267 440 320 465C371 437 426 418 478 425"
            stroke="#4a1115"
            strokeWidth="1.5"
          />
          <path
            d="M184 363C220 359 261 374 292 389M183 377C222 375 259 390 292 404M182 391C215 390 248 401 276 413M347 390C380 371 419 356 450 359M347 404C384 385 418 371 450 374M347 418C370 404 396 395 416 391"
            stroke="#8b9aaa"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M344 445V477L357 465L369 468V432"
            fill="#e8afc0"
            stroke="#4a1115"
            strokeWidth="1.3"
          />
        </g>
        <g stroke="#687d77" strokeWidth="2" strokeLinecap="round">
          <path d="M98 435Q101 406 90 390M98 435Q85 415 76 417M112 441Q109 404 121 392M500 442Q503 402 523 386M501 439Q492 416 480 414M518 437Q529 415 543 414M134 454L129 435M475 461L487 444" />
        </g>
        <g fill="#4a1115">
          <circle cx="153" cy="221" r="4" />
          <circle cx="492" cy="303" r="5" />
          <circle cx="326" cy="135" r="3" />
        </g>
        <g stroke="#4a1115" strokeWidth="1.5">
          <path d="M119 309v17m-8-8h16M493 164v20m-10-10h20M298 80v12m-6-6h12" />
        </g>
        <g transform="translate(310 219)">
          <circle r="31" fill="#fffdf8" stroke="#4a1115" strokeWidth="1.5" />
          <path
            d="M-11 0L-3 8L13-9"
            stroke="#4a1115"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
      <Butterfly className={styles.butterflyOne} />
      <Butterfly className={styles.butterflyTwo} />
    </div>
  );
}
