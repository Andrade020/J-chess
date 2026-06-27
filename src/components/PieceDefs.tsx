export default function PieceDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        {/* gradients & shadow */}
        <linearGradient id="fillL" gradientUnits="userSpaceOnUse" x1="0" y1="26" x2="0" y2="98">
          <stop offset="0" stopColor="#fcf7ee" />
          <stop offset="1" stopColor="#e7dcc7" />
        </linearGradient>
        <linearGradient id="fillD" gradientUnits="userSpaceOnUse" x1="0" y1="26" x2="0" y2="98">
          <stop offset="0" stopColor="#9c9384" />
          <stop offset="1" stopColor="#6d6456" />
        </linearGradient>
        <linearGradient id="neoL" gradientUnits="userSpaceOnUse" x1="0" y1="26" x2="0" y2="98">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d8d2c4" />
        </linearGradient>
        <linearGradient id="neoD" gradientUnits="userSpaceOnUse" x1="0" y1="26" x2="0" y2="98">
          <stop offset="0" stopColor="#888070" />
          <stop offset="1" stopColor="#48403a" />
        </linearGradient>
        <radialGradient id="dropsh">
          <stop offset="0" stopColor="#000" stopOpacity="0.26" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>

        {/* star — shared marker */}
        <symbol id="star" viewBox="0 0 24 24">
          <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
        </symbol>

        {/* ===================== CLASSIC SET ===================== */}

        <symbol id="c-pawn" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="23" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="cbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,79 40,75 40,70 H50 C50,75 58,79 56,89 Z" />
            <rect x="37" y="66" width="16" height="5" rx="2.5" />
            <circle cx="45" cy="55" r="10" />
          </g>
          <path className="det" d="M37,68.5 Q45,71 53,68.5" />
        </symbol>

        <symbol id="c-rook" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="cbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C33,80 37,77 37,72 H53 C53,77 57,80 56,89 Z" />
            <rect x="33" y="57" width="24" height="16" rx="1.5" />
            <rect x="30" y="49" width="30" height="9" rx="1.5" />
            <rect x="30" y="36" width="6.5" height="14" rx="1" />
            <rect x="41.75" y="36" width="6.5" height="14" rx="1" />
            <rect x="53.5" y="36" width="6.5" height="14" rx="1" />
          </g>
          <path className="det" d="M34,58.5 H56 M34,86 Q45,88 56,86" />
        </symbol>

        <symbol id="c-bishop" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="23" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="cbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,80 39,76 41,71 H49 C51,76 58,80 56,89 Z" />
            <rect x="38" y="67" width="14" height="5" rx="2.5" />
            <path d="M45,37 C54,44 55,58 45,68 C35,58 36,44 45,37 Z" />
            <circle cx="45" cy="33" r="3.6" />
          </g>
          <path className="det" d="M41,50 Q45,45 49,53" />
          <path className="det" d="M39,69 Q45,71.5 51,69" />
        </symbol>

        <symbol id="c-king" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="cbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M32,89 C30,80 37,76 39,71 H51 C53,76 60,80 58,89 Z" />
            <rect x="37" y="66" width="16" height="6" rx="2" />
            <path d="M38,67 L52,67 L50,54 C48,57 42,57 40,54 Z" />
            <rect x="43" y="38" width="4" height="15" rx="1" />
            <rect x="39" y="42" width="12" height="4" rx="1" />
          </g>
          <path className="det" d="M37,69 Q45,72 53,69 M41,61 Q45,63 49,61" />
        </symbol>

        <symbol id="c-marshal" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="cbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,80 36,74 36,72 C36,66 32,64 33,61 C35,57 40,56 41,54 H49 C50,56 55,57 57,61 C58,64 54,66 54,72 C54,74 58,80 56,89 Z" />
            <rect x="42" y="50" width="6" height="6" />
            <g transform="translate(34.5,32.5) scale(0.875)">
              <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
            </g>
          </g>
          <path className="det" d="M35,63 Q45,66 55,63" />
        </symbol>

        <symbol id="c-vanguard" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="cbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,80 36,74 36,72 C36,66 32,64 33,61 C35,57 40,56 41,54 H49 C50,56 55,57 57,61 C58,64 54,66 54,72 C54,74 58,80 56,89 Z" />
            <path d="M32,56 L45,34 L58,56 L49,56 L45,48 L41,56 Z" />
          </g>
          <path className="det" d="M35,63 Q45,66 55,63" />
        </symbol>

        <symbol id="c-knight" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="cbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M33,89 C32,82 35,80 36,76 H56 C57,82 58,84 57,89 Z" />
            <path d="M36,76 C34,66 36,58 44,52 C42,50 40,49 38,49 C40,46 43,44 47,43 C46,40 47,37 49,35 C51,38 52,41 53,44 C58,47 62,53 62,62 C62,68 60,73 57,76 Z" />
          </g>
          <circle className="det eye" cx="50" cy="49" r="1.2" />
          <path className="det" d="M41,55 Q45,52 49,55" />
        </symbol>

        <symbol id="c-lancer" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="22" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="cbody">
            <path d="M29,96 H61 L56,89 H34 Z" />
            <path d="M36,89 C35,82 41,79 41,75 H49 C49,79 55,82 54,89 Z" />
            <rect x="41" y="42" width="8" height="34" rx="2" />
            <path d="M45,26 L53,44 H37 Z" />
          </g>
          <path className="det" d="M40,77 Q45,79 50,77" />
        </symbol>

        {/* classic promoted */}
        <symbol id="c-pawn-plus" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="23" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="cbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,79 40,75 40,70 H50 C50,75 58,79 56,89 Z" />
            <rect x="37" y="66" width="16" height="5" rx="2.5" />
            <circle cx="45" cy="55" r="10" />
          </g>
          <path className="det" d="M37,68.5 Q45,71 53,68.5" />
          <g className="mark" transform="translate(38.50,48.50) scale(0.5417)">
            <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
          </g>
        </symbol>

        <symbol id="c-lancer-plus" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="22" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="cbody">
            <path d="M29,96 H61 L56,89 H34 Z" />
            <path d="M36,89 C35,82 41,79 41,75 H49 C49,79 55,82 54,89 Z" />
            <rect x="41" y="42" width="8" height="34" rx="2" />
            <path d="M45,26 L53,44 H37 Z" />
          </g>
          <path className="det" d="M40,77 Q45,79 50,77" />
          <g className="mark" transform="translate(39.00,29.00) scale(0.5000)">
            <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
          </g>
        </symbol>

        <symbol id="c-knight-plus" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="cbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M33,89 C32,82 35,80 36,76 H56 C57,82 58,84 57,89 Z" />
            <path d="M36,76 C34,66 36,58 44,52 C42,50 40,49 38,49 C40,46 43,44 47,43 C46,40 47,37 49,35 C51,38 52,41 53,44 C58,47 62,53 62,62 C62,68 60,73 57,76 Z" />
          </g>
          <circle className="det eye" cx="50" cy="49" r="1.2" />
          <path className="det" d="M41,55 Q45,52 49,55" />
          <g className="mark" transform="translate(39.00,60.00) scale(0.5000)">
            <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
          </g>
        </symbol>

        <symbol id="c-vanguard-plus" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="cbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,80 36,74 36,72 C36,66 32,64 33,61 C35,57 40,56 41,54 H49 C50,56 55,57 57,61 C58,64 54,66 54,72 C54,74 58,80 56,89 Z" />
            <path d="M32,56 L45,34 L58,56 L49,56 L45,48 L41,56 Z" />
          </g>
          <path className="det" d="M35,63 Q45,66 55,63" />
          <g className="mark" transform="translate(39.00,62.00) scale(0.5000)">
            <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
          </g>
        </symbol>

        <symbol id="c-dragonking" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="26" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="cbody">
            <path d="M37,67 C26,64 16,55 13,41 C20,47 28,50 33,54 C31,57 33,60 32,63 C35,62 37,63 39,64 Z" />
            <path d="M53,67 C64,64 74,55 77,41 C70,47 62,50 57,54 C59,57 57,60 58,63 C55,62 53,63 51,64 Z" />
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M33,89 C32,80 36,78 36,73 H54 C54,78 58,80 57,89 Z" />
            <rect x="32" y="63" width="26" height="9" rx="1.5" />
            <rect x="32" y="55" width="5.5" height="9" />
            <rect x="42.25" y="55" width="5.5" height="9" />
            <rect x="52.5" y="55" width="5.5" height="9" />
          </g>
          <path className="det" d="M34,64.5 H56 M34,86 Q45,88 56,86" />
          <g className="mark" transform="translate(39.00,75.00) scale(0.5000)">
            <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
          </g>
        </symbol>

        <symbol id="c-dragonhorse" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="26" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="cbody">
            <path d="M38,68 C27,65 17,56 14,42 C21,48 29,51 34,55 C32,58 34,61 33,64 C36,63 38,64 40,65 Z" />
            <path d="M52,68 C63,65 73,56 76,42 C69,48 61,51 56,55 C58,58 56,61 57,64 C54,63 52,64 50,65 Z" />
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,80 39,76 41,71 H49 C51,76 58,80 56,89 Z" />
            <rect x="38" y="67" width="14" height="5" rx="2.5" />
            <path d="M45,37 C54,44 55,58 45,68 C35,58 36,44 45,37 Z" />
            <circle cx="45" cy="33" r="3.6" />
          </g>
          <path className="det" d="M41,50 Q45,45 49,53" />
          <path className="det" d="M39,69 Q45,71.5 51,69" />
        </symbol>

        {/* ===================== MINIMAL SET ===================== */}

        <symbol id="p-pawn" viewBox="10 24 70 76">
          <path className="body" d="M27,96 H63 L58,89 H32 Z" />
          <path className="body" d="M34,89 C32,79 40,75 40,70 H50 C50,75 58,79 56,89 Z" />
          <rect className="body" x="37" y="66" width="16" height="5" rx="2.5" />
          <circle className="body" cx="45" cy="55" r="10" />
        </symbol>

        <symbol id="p-rook" viewBox="10 24 70 76">
          <path className="body" d="M27,96 H63 L58,89 H32 Z" />
          <path className="body" d="M34,89 C33,80 37,77 37,72 H53 C53,77 57,80 56,89 Z" />
          <rect className="body" x="33" y="57" width="24" height="16" rx="1.5" />
          <rect className="body" x="30" y="49" width="30" height="9" rx="1.5" />
          <rect className="body" x="30" y="36" width="6.5" height="14" rx="1" />
          <rect className="body" x="41.75" y="36" width="6.5" height="14" rx="1" />
          <rect className="body" x="53.5" y="36" width="6.5" height="14" rx="1" />
        </symbol>

        <symbol id="p-bishop" viewBox="10 24 70 76">
          <path className="body" d="M27,96 H63 L58,89 H32 Z" />
          <path className="body" d="M34,89 C32,80 39,76 41,71 H49 C51,76 58,80 56,89 Z" />
          <rect className="body" x="38" y="67" width="14" height="5" rx="2.5" />
          <path className="body" d="M45,37 C54,44 55,58 45,68 C35,58 36,44 45,37 Z" />
          <circle className="body" cx="45" cy="33" r="3.6" />
          <rect className="cut" x="44" y="44" width="2.4" height="13" rx="1.2" transform="rotate(32 45 50)" />
        </symbol>

        <symbol id="p-king" viewBox="10 24 70 76">
          <path className="body" d="M27,96 H63 L58,89 H32 Z" />
          <path className="body" d="M32,89 C30,80 37,76 39,71 H51 C53,76 60,80 58,89 Z" />
          <rect className="body" x="37" y="66" width="16" height="6" rx="2" />
          <path className="body" d="M38,67 L52,67 L50,54 C48,57 42,57 40,54 Z" />
          <rect className="body" x="43" y="38" width="4" height="15" rx="1" />
          <rect className="body" x="39" y="42" width="12" height="4" rx="1" />
        </symbol>

        <symbol id="p-marshal" viewBox="10 24 70 76">
          <path className="body" d="M27,96 H63 L58,89 H32 Z" />
          <path className="body" d="M34,89 C32,80 36,74 36,72 C36,66 32,64 33,61 C35,57 40,56 41,54 H49 C50,56 55,57 57,61 C58,64 54,66 54,72 C54,74 58,80 56,89 Z" />
          <rect className="body" x="42" y="50" width="6" height="6" />
          <use href="#star" x="34.5" y="33" width="21" height="21" className="body" />
        </symbol>

        <symbol id="p-vanguard" viewBox="10 24 70 76">
          <path className="body" d="M27,96 H63 L58,89 H32 Z" />
          <path className="body" d="M34,89 C32,80 36,74 36,72 C36,66 32,64 33,61 C35,57 40,56 41,54 H49 C50,56 55,57 57,61 C58,64 54,66 54,72 C54,74 58,80 56,89 Z" />
          <path className="body" d="M32,56 L45,34 L58,56 L49,56 L45,48 L41,56 Z" />
        </symbol>

        <symbol id="p-knight" viewBox="10 24 70 76">
          <path className="body" d="M27,96 H63 L58,89 H32 Z" />
          <path className="body" d="M33,89 C32,82 35,80 36,76 H56 C57,82 58,84 57,89 Z" />
          <path className="body" d="M36,76 C34,66 36,58 44,52 C42,50 40,49 38,49 C40,46 43,44 47,43 C46,40 47,37 49,35 C51,38 52,41 53,44 C58,47 62,53 62,62 C62,68 60,73 57,76 Z" />
          <circle className="cut" cx="50" cy="49" r="1.7" />
        </symbol>

        <symbol id="p-lancer" viewBox="10 24 70 76">
          <path className="body" d="M30,96 H60 L55,89 H35 Z" />
          <path className="body" d="M37,89 C36,83 41,80 41,76 H49 C49,80 54,83 53,89 Z" />
          <rect className="body" x="43" y="40" width="4" height="36" rx="1" />
          <path className="body" d="M45,28 L49.5,42 H40.5 Z" />
        </symbol>

        {/* minimal promoted */}
        <symbol id="p-pawn-plus" viewBox="10 24 70 76">
          <use href="#p-pawn" x="10" y="24" width="70" height="76" />
          <use href="#star" x="38.5" y="48.5" width="13" height="13" className="mark" />
        </symbol>
        <symbol id="p-lancer-plus" viewBox="10 24 70 76">
          <use href="#p-lancer" x="10" y="24" width="70" height="76" />
          <use href="#star" x="39" y="25" width="12" height="12" className="mark" />
        </symbol>
        <symbol id="p-knight-plus" viewBox="10 24 70 76">
          <use href="#p-knight" x="10" y="24" width="70" height="76" />
          <use href="#star" x="39" y="60" width="12" height="12" className="mark" />
        </symbol>
        <symbol id="p-vanguard-plus" viewBox="10 24 70 76">
          <use href="#p-vanguard" x="10" y="24" width="70" height="76" />
          <use href="#star" x="39" y="62" width="12" height="12" className="mark" />
        </symbol>

        <symbol id="p-dragonking" viewBox="10 24 70 76">
          <path className="body" d="M37,67 C26,64 16,55 13,41 C20,47 28,50 33,54 C31,57 33,60 32,63 C35,62 37,63 39,64 Z" />
          <path className="body" d="M53,67 C64,64 74,55 77,41 C70,47 62,50 57,54 C59,57 57,60 58,63 C55,62 53,63 51,64 Z" />
          <path className="body" d="M27,96 H63 L58,89 H32 Z" />
          <path className="body" d="M33,89 C32,80 36,78 36,73 H54 C54,78 58,80 57,89 Z" />
          <rect className="body" x="32" y="63" width="26" height="9" rx="1.5" />
          <rect className="body" x="32" y="55" width="5.5" height="9" />
          <rect className="body" x="42.25" y="55" width="5.5" height="9" />
          <rect className="body" x="52.5" y="55" width="5.5" height="9" />
          <use href="#star" x="38.5" y="75" width="13" height="13" className="mark" />
        </symbol>

        <symbol id="p-dragonhorse" viewBox="10 24 70 76">
          <path className="body" d="M38,68 C27,65 17,56 14,42 C21,48 29,51 34,55 C32,58 34,61 33,64 C36,63 38,64 40,65 Z" />
          <path className="body" d="M52,68 C63,65 73,56 76,42 C69,48 61,51 56,55 C58,58 56,61 57,64 C54,63 52,64 50,65 Z" />
          <path className="body" d="M27,96 H63 L58,89 H32 Z" />
          <path className="body" d="M34,89 C32,80 39,76 41,72 H49 C51,76 58,80 56,89 Z" />
          <rect className="body" x="38" y="68" width="14" height="5" rx="2.5" />
          <path className="body" d="M45,40 C53,46 54,58 45,67 C36,58 37,46 45,40 Z" />
          <circle className="body" cx="45" cy="36" r="3.4" />
          <rect className="cut" x="44" y="46" width="2.2" height="12" rx="1.1" transform="rotate(32 45 52)" />
        </symbol>

        {/* ===================== KANJI SET ===================== */}
        {/* Body path inherits fill/stroke from outer <svg> via CSS inheritance.
            Text: fill:currentColor picks up the `color` CSS prop (dark/light per owner).
            Promoted text: fill:#c0392b (red), always. */}

        <symbol id="k-pawn" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98.5" rx="24" ry="4" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.2, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <text x="45" y="72" textAnchor="middle" dominantBaseline="middle" style={{ fill: 'currentColor', stroke: 'none', fontSize: '34px', fontWeight: 700, fontFamily: '"Noto Serif JP","Yu Mincho","MS Mincho",serif' }}>歩</text>
        </symbol>

        <symbol id="k-rook" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98.5" rx="24" ry="4" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.2, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <text x="45" y="72" textAnchor="middle" dominantBaseline="middle" style={{ fill: 'currentColor', stroke: 'none', fontSize: '34px', fontWeight: 700, fontFamily: '"Noto Serif JP","Yu Mincho","MS Mincho",serif' }}>飛</text>
        </symbol>

        <symbol id="k-bishop" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98.5" rx="24" ry="4" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.2, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <text x="45" y="72" textAnchor="middle" dominantBaseline="middle" style={{ fill: 'currentColor', stroke: 'none', fontSize: '34px', fontWeight: 700, fontFamily: '"Noto Serif JP","Yu Mincho","MS Mincho",serif' }}>角</text>
        </symbol>

        <symbol id="k-king" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98.5" rx="24" ry="4" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.2, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <text x="45" y="72" textAnchor="middle" dominantBaseline="middle" style={{ fill: 'currentColor', stroke: 'none', fontSize: '34px', fontWeight: 700, fontFamily: '"Noto Serif JP","Yu Mincho","MS Mincho",serif' }}>王</text>
        </symbol>

        <symbol id="k-marshal" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98.5" rx="24" ry="4" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.2, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <text x="45" y="72" textAnchor="middle" dominantBaseline="middle" style={{ fill: 'currentColor', stroke: 'none', fontSize: '34px', fontWeight: 700, fontFamily: '"Noto Serif JP","Yu Mincho","MS Mincho",serif' }}>金</text>
        </symbol>

        <symbol id="k-vanguard" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98.5" rx="24" ry="4" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.2, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <text x="45" y="72" textAnchor="middle" dominantBaseline="middle" style={{ fill: 'currentColor', stroke: 'none', fontSize: '34px', fontWeight: 700, fontFamily: '"Noto Serif JP","Yu Mincho","MS Mincho",serif' }}>銀</text>
        </symbol>

        <symbol id="k-knight" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98.5" rx="24" ry="4" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.2, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <text x="45" y="72" textAnchor="middle" dominantBaseline="middle" style={{ fill: 'currentColor', stroke: 'none', fontSize: '34px', fontWeight: 700, fontFamily: '"Noto Serif JP","Yu Mincho","MS Mincho",serif' }}>桂</text>
        </symbol>

        <symbol id="k-lancer" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98.5" rx="24" ry="4" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.2, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <text x="45" y="72" textAnchor="middle" dominantBaseline="middle" style={{ fill: 'currentColor', stroke: 'none', fontSize: '34px', fontWeight: 700, fontFamily: '"Noto Serif JP","Yu Mincho","MS Mincho",serif' }}>香</text>
        </symbol>

        {/* kanji promoted */}
        <symbol id="k-pawn-plus" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98.5" rx="24" ry="4" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.2, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <text x="45" y="72" textAnchor="middle" dominantBaseline="middle" style={{ fill: '#c0392b', stroke: 'none', fontSize: '34px', fontWeight: 700, fontFamily: '"Noto Serif JP","Yu Mincho","MS Mincho",serif' }}>と</text>
        </symbol>

        <symbol id="k-lancer-plus" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98.5" rx="24" ry="4" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.2, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <text x="45" y="72" textAnchor="middle" dominantBaseline="middle" style={{ fill: '#c0392b', stroke: 'none', fontSize: '34px', fontWeight: 700, fontFamily: '"Noto Serif JP","Yu Mincho","MS Mincho",serif' }}>杏</text>
        </symbol>

        <symbol id="k-knight-plus" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98.5" rx="24" ry="4" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.2, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <text x="45" y="72" textAnchor="middle" dominantBaseline="middle" style={{ fill: '#c0392b', stroke: 'none', fontSize: '34px', fontWeight: 700, fontFamily: '"Noto Serif JP","Yu Mincho","MS Mincho",serif' }}>今</text>
        </symbol>

        <symbol id="k-vanguard-plus" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98.5" rx="24" ry="4" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.2, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <text x="45" y="72" textAnchor="middle" dominantBaseline="middle" style={{ fill: '#c0392b', stroke: 'none', fontSize: '34px', fontWeight: 700, fontFamily: '"Noto Serif JP","Yu Mincho","MS Mincho",serif' }}>全</text>
        </symbol>

        <symbol id="k-dragonking" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98.5" rx="24" ry="4" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.2, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <text x="45" y="72" textAnchor="middle" dominantBaseline="middle" style={{ fill: '#c0392b', stroke: 'none', fontSize: '34px', fontWeight: 700, fontFamily: '"Noto Serif JP","Yu Mincho","MS Mincho",serif' }}>龍</text>
        </symbol>

        <symbol id="k-dragonhorse" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98.5" rx="24" ry="4" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.2, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <text x="45" y="72" textAnchor="middle" dominantBaseline="middle" style={{ fill: '#c0392b', stroke: 'none', fontSize: '34px', fontWeight: 700, fontFamily: '"Noto Serif JP","Yu Mincho","MS Mincho",serif' }}>馬</text>
        </symbol>
        {/* ════════════════════════════════════════════════════════
            FLAT SET — same Staunton shapes as cls, flat fill, no detail lines.
            fbody: body group. fmark: promotion star (currentColor).
            ════════════════════════════════════════════════════════ */}

        <symbol id="f-pawn" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="23" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="fbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,79 40,75 40,70 H50 C50,75 58,79 56,89 Z" />
            <rect x="37" y="66" width="16" height="5" rx="2.5" />
            <circle cx="45" cy="55" r="10" />
          </g>
        </symbol>

        <symbol id="f-rook" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="fbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C33,80 37,77 37,72 H53 C53,77 57,80 56,89 Z" />
            <rect x="33" y="57" width="24" height="16" rx="1.5" />
            <rect x="30" y="49" width="30" height="9" rx="1.5" />
            <rect x="30" y="36" width="6.5" height="14" rx="1" />
            <rect x="41.75" y="36" width="6.5" height="14" rx="1" />
            <rect x="53.5" y="36" width="6.5" height="14" rx="1" />
          </g>
        </symbol>

        <symbol id="f-bishop" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="23" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="fbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,80 39,76 41,71 H49 C51,76 58,80 56,89 Z" />
            <rect x="38" y="67" width="14" height="5" rx="2.5" />
            <path d="M45,37 C54,44 55,58 45,68 C35,58 36,44 45,37 Z" />
            <circle cx="45" cy="33" r="3.6" />
          </g>
        </symbol>

        <symbol id="f-king" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="fbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M32,89 C30,80 37,76 39,71 H51 C53,76 60,80 58,89 Z" />
            <rect x="37" y="66" width="16" height="6" rx="2" />
            <path d="M38,67 L52,67 L50,54 C48,57 42,57 40,54 Z" />
            <rect x="43" y="38" width="4" height="15" rx="1" />
            <rect x="39" y="42" width="12" height="4" rx="1" />
          </g>
        </symbol>

        <symbol id="f-marshal" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="fbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,80 36,74 36,72 C36,66 32,64 33,61 C35,57 40,56 41,54 H49 C50,56 55,57 57,61 C58,64 54,66 54,72 C54,74 58,80 56,89 Z" />
            <rect x="42" y="50" width="6" height="6" />
            <g transform="translate(34.5,32.5) scale(0.875)">
              <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
            </g>
          </g>
        </symbol>

        <symbol id="f-vanguard" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="fbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,80 36,74 36,72 C36,66 32,64 33,61 C35,57 40,56 41,54 H49 C50,56 55,57 57,61 C58,64 54,66 54,72 C54,74 58,80 56,89 Z" />
            <path d="M32,56 L45,34 L58,56 L49,56 L45,48 L41,56 Z" />
          </g>
        </symbol>

        <symbol id="f-knight" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="fbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M33,89 C32,82 35,80 36,76 H56 C57,82 58,84 57,89 Z" />
            <path d="M36,76 C34,66 36,58 44,52 C42,50 40,49 38,49 C40,46 43,44 47,43 C46,40 47,37 49,35 C51,38 52,41 53,44 C58,47 62,53 62,62 C62,68 60,73 57,76 Z" />
          </g>
        </symbol>

        <symbol id="f-lancer" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="22" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="fbody">
            <path d="M29,96 H61 L56,89 H34 Z" />
            <path d="M36,89 C35,82 41,79 41,75 H49 C49,79 55,82 54,89 Z" />
            <rect x="41" y="42" width="8" height="34" rx="2" />
            <path d="M45,26 L53,44 H37 Z" />
          </g>
        </symbol>

        {/* flat promoted */}
        <symbol id="f-pawn-plus" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="23" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="fbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,79 40,75 40,70 H50 C50,75 58,79 56,89 Z" />
            <rect x="37" y="66" width="16" height="5" rx="2.5" />
            <circle cx="45" cy="55" r="10" />
          </g>
          <g className="fmark" transform="translate(38.50,48.50) scale(0.5417)">
            <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
          </g>
        </symbol>

        <symbol id="f-lancer-plus" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="22" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="fbody">
            <path d="M29,96 H61 L56,89 H34 Z" />
            <path d="M36,89 C35,82 41,79 41,75 H49 C49,79 55,82 54,89 Z" />
            <rect x="41" y="42" width="8" height="34" rx="2" />
            <path d="M45,26 L53,44 H37 Z" />
          </g>
          <g className="fmark" transform="translate(39.00,29.00) scale(0.5000)">
            <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
          </g>
        </symbol>

        <symbol id="f-knight-plus" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="fbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M33,89 C32,82 35,80 36,76 H56 C57,82 58,84 57,89 Z" />
            <path d="M36,76 C34,66 36,58 44,52 C42,50 40,49 38,49 C40,46 43,44 47,43 C46,40 47,37 49,35 C51,38 52,41 53,44 C58,47 62,53 62,62 C62,68 60,73 57,76 Z" />
          </g>
          <g className="fmark" transform="translate(39.00,60.00) scale(0.5000)">
            <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
          </g>
        </symbol>

        <symbol id="f-vanguard-plus" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="fbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,80 36,74 36,72 C36,66 32,64 33,61 C35,57 40,56 41,54 H49 C50,56 55,57 57,61 C58,64 54,66 54,72 C54,74 58,80 56,89 Z" />
            <path d="M32,56 L45,34 L58,56 L49,56 L45,48 L41,56 Z" />
          </g>
          <g className="fmark" transform="translate(39.00,62.00) scale(0.5000)">
            <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
          </g>
        </symbol>

        <symbol id="f-dragonking" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="26" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="fbody">
            <path d="M37,67 C26,64 16,55 13,41 C20,47 28,50 33,54 C31,57 33,60 32,63 C35,62 37,63 39,64 Z" />
            <path d="M53,67 C64,64 74,55 77,41 C70,47 62,50 57,54 C59,57 57,60 58,63 C55,62 53,63 51,64 Z" />
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M33,89 C32,80 36,78 36,73 H54 C54,78 58,80 57,89 Z" />
            <rect x="32" y="63" width="26" height="9" rx="1.5" />
            <rect x="32" y="55" width="5.5" height="9" />
            <rect x="42.25" y="55" width="5.5" height="9" />
            <rect x="52.5" y="55" width="5.5" height="9" />
          </g>
          <g className="fmark" transform="translate(39.00,75.00) scale(0.5000)">
            <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
          </g>
        </symbol>

        <symbol id="f-dragonhorse" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="26" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="fbody">
            <path d="M38,68 C27,65 17,56 14,42 C21,48 29,51 34,55 C32,58 34,61 33,64 C36,63 38,64 40,65 Z" />
            <path d="M52,68 C63,65 73,56 76,42 C69,48 61,51 56,55 C58,58 56,61 57,64 C54,63 52,64 50,65 Z" />
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,80 39,76 41,71 H49 C51,76 58,80 56,89 Z" />
            <rect x="38" y="67" width="14" height="5" rx="2.5" />
            <path d="M45,37 C54,44 55,58 45,68 C35,58 36,44 45,37 Z" />
            <circle cx="45" cy="33" r="3.6" />
          </g>
          <g className="fmark" transform="translate(39.00,75.00) scale(0.5000)">
            <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
          </g>
        </symbol>

        {/* ════════════════════════════════════════════════════════
            NEO SET — same Staunton shapes, thicker stroke (4.5px),
            soft gradient. nbody / nmark (promotion star).
            ════════════════════════════════════════════════════════ */}

        <symbol id="n-pawn" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="23" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="nbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,79 40,75 40,70 H50 C50,75 58,79 56,89 Z" />
            <rect x="37" y="66" width="16" height="5" rx="2.5" />
            <circle cx="45" cy="55" r="10" />
          </g>
        </symbol>

        <symbol id="n-rook" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="nbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C33,80 37,77 37,72 H53 C53,77 57,80 56,89 Z" />
            <rect x="33" y="57" width="24" height="16" rx="2" />
            <rect x="30" y="49" width="30" height="9" rx="2" />
            <rect x="30" y="36" width="6.5" height="14" rx="2" />
            <rect x="41.75" y="36" width="6.5" height="14" rx="2" />
            <rect x="53.5" y="36" width="6.5" height="14" rx="2" />
          </g>
        </symbol>

        <symbol id="n-bishop" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="23" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="nbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,80 39,76 41,71 H49 C51,76 58,80 56,89 Z" />
            <rect x="38" y="67" width="14" height="5" rx="2.5" />
            <path d="M45,37 C54,44 55,58 45,68 C35,58 36,44 45,37 Z" />
            <circle cx="45" cy="33" r="4" />
          </g>
        </symbol>

        <symbol id="n-king" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="nbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M32,89 C30,80 37,76 39,71 H51 C53,76 60,80 58,89 Z" />
            <rect x="37" y="66" width="16" height="6" rx="2" />
            <path d="M38,67 L52,67 L50,54 C48,57 42,57 40,54 Z" />
            <rect x="43" y="38" width="4" height="15" rx="2" />
            <rect x="39" y="42" width="12" height="4" rx="2" />
          </g>
        </symbol>

        <symbol id="n-marshal" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="nbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,80 36,74 36,72 C36,66 32,64 33,61 C35,57 40,56 41,54 H49 C50,56 55,57 57,61 C58,64 54,66 54,72 C54,74 58,80 56,89 Z" />
            <rect x="42" y="50" width="6" height="6" rx="1" />
            <g transform="translate(34.5,32.5) scale(0.875)">
              <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
            </g>
          </g>
        </symbol>

        <symbol id="n-vanguard" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="nbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,80 36,74 36,72 C36,66 32,64 33,61 C35,57 40,56 41,54 H49 C50,56 55,57 57,61 C58,64 54,66 54,72 C54,74 58,80 56,89 Z" />
            <path d="M32,56 L45,34 L58,56 L49,56 L45,48 L41,56 Z" />
          </g>
        </symbol>

        <symbol id="n-knight" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="nbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M33,89 C32,82 35,80 36,76 H56 C57,82 58,84 57,89 Z" />
            <path d="M36,76 C34,66 36,58 44,52 C42,50 40,49 38,49 C40,46 43,44 47,43 C46,40 47,37 49,35 C51,38 52,41 53,44 C58,47 62,53 62,62 C62,68 60,73 57,76 Z" />
          </g>
        </symbol>

        <symbol id="n-lancer" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="22" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="nbody">
            <path d="M29,96 H61 L56,89 H34 Z" />
            <path d="M36,89 C35,82 41,79 41,75 H49 C49,79 55,82 54,89 Z" />
            <rect x="41" y="42" width="8" height="34" rx="3" />
            <path d="M45,26 L53,44 H37 Z" />
          </g>
        </symbol>

        {/* neo promoted */}
        <symbol id="n-pawn-plus" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="23" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="nbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,79 40,75 40,70 H50 C50,75 58,79 56,89 Z" />
            <rect x="37" y="66" width="16" height="5" rx="2.5" />
            <circle cx="45" cy="55" r="10" />
          </g>
          <g className="nmark" transform="translate(38.50,48.50) scale(0.5417)">
            <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
          </g>
        </symbol>

        <symbol id="n-lancer-plus" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="22" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="nbody">
            <path d="M29,96 H61 L56,89 H34 Z" />
            <path d="M36,89 C35,82 41,79 41,75 H49 C49,79 55,82 54,89 Z" />
            <rect x="41" y="42" width="8" height="34" rx="3" />
            <path d="M45,26 L53,44 H37 Z" />
          </g>
          <g className="nmark" transform="translate(39.00,29.00) scale(0.5000)">
            <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
          </g>
        </symbol>

        <symbol id="n-knight-plus" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="nbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M33,89 C32,82 35,80 36,76 H56 C57,82 58,84 57,89 Z" />
            <path d="M36,76 C34,66 36,58 44,52 C42,50 40,49 38,49 C40,46 43,44 47,43 C46,40 47,37 49,35 C51,38 52,41 53,44 C58,47 62,53 62,62 C62,68 60,73 57,76 Z" />
          </g>
          <g className="nmark" transform="translate(39.00,60.00) scale(0.5000)">
            <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
          </g>
        </symbol>

        <symbol id="n-vanguard-plus" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="nbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,80 36,74 36,72 C36,66 32,64 33,61 C35,57 40,56 41,54 H49 C50,56 55,57 57,61 C58,64 54,66 54,72 C54,74 58,80 56,89 Z" />
            <path d="M32,56 L45,34 L58,56 L49,56 L45,48 L41,56 Z" />
          </g>
          <g className="nmark" transform="translate(39.00,62.00) scale(0.5000)">
            <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
          </g>
        </symbol>

        <symbol id="n-dragonking" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="26" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="nbody">
            <path d="M37,67 C26,64 16,55 13,41 C20,47 28,50 33,54 C31,57 33,60 32,63 C35,62 37,63 39,64 Z" />
            <path d="M53,67 C64,64 74,55 77,41 C70,47 62,50 57,54 C59,57 57,60 58,63 C55,62 53,63 51,64 Z" />
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M33,89 C32,80 36,78 36,73 H54 C54,78 58,80 57,89 Z" />
            <rect x="32" y="63" width="26" height="9" rx="2" />
            <rect x="32" y="55" width="5.5" height="9" rx="1" />
            <rect x="42.25" y="55" width="5.5" height="9" rx="1" />
            <rect x="52.5" y="55" width="5.5" height="9" rx="1" />
          </g>
          <g className="nmark" transform="translate(39.00,75.00) scale(0.5000)">
            <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
          </g>
        </symbol>

        <symbol id="n-dragonhorse" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="26" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="nbody">
            <path d="M38,68 C27,65 17,56 14,42 C21,48 29,51 34,55 C32,58 34,61 33,64 C36,63 38,64 40,65 Z" />
            <path d="M52,68 C63,65 73,56 76,42 C69,48 61,51 56,55 C58,58 56,61 57,64 C54,63 52,64 50,65 Z" />
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,80 39,76 41,71 H49 C51,76 58,80 56,89 Z" />
            <rect x="38" y="67" width="14" height="5" rx="2.5" />
            <path d="M45,37 C54,44 55,58 45,68 C35,58 36,44 45,37 Z" />
            <circle cx="45" cy="33" r="4" />
          </g>
          <g className="nmark" transform="translate(39.00,75.00) scale(0.5000)">
            <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
          </g>
        </symbol>

        {/* ════════════════════════════════════════════════════════
            GOTHIC SET — Staunton shapes + diamond lattice ornament.
            gbody: body. gdiam: diamond overlay on base (opacity 0.4).
            gmark: promotion star (currentColor).
            ════════════════════════════════════════════════════════ */}

        <symbol id="o-pawn" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="23" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="gbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,79 40,75 40,70 H50 C50,75 58,79 56,89 Z" />
            <rect x="37" y="66" width="16" height="5" rx="2.5" />
            <circle cx="45" cy="55" r="10" />
          </g>
          <g className="gdiam">
            <path d="M35,89 L39,92 L35,95 L31,92 Z" />
            <path d="M45,89 L49,92 L45,95 L41,92 Z" />
            <path d="M55,89 L59,92 L55,95 L51,92 Z" />
          </g>
        </symbol>

        <symbol id="o-rook" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="gbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C33,80 37,77 37,72 H53 C53,77 57,80 56,89 Z" />
            <rect x="33" y="57" width="24" height="16" rx="1.5" />
            <rect x="30" y="49" width="30" height="9" rx="1.5" />
            <rect x="30" y="36" width="6.5" height="14" rx="1" />
            <rect x="41.75" y="36" width="6.5" height="14" rx="1" />
            <rect x="53.5" y="36" width="6.5" height="14" rx="1" />
          </g>
          <g className="gdiam">
            <path d="M35,89 L39,92 L35,95 L31,92 Z" />
            <path d="M45,89 L49,92 L45,95 L41,92 Z" />
            <path d="M55,89 L59,92 L55,95 L51,92 Z" />
            <path d="M35,57 L39,61 L35,65 L31,61 Z" />
            <path d="M55,57 L59,61 L55,65 L51,61 Z" />
          </g>
        </symbol>

        <symbol id="o-bishop" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="23" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="gbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,80 39,76 41,71 H49 C51,76 58,80 56,89 Z" />
            <rect x="38" y="67" width="14" height="5" rx="2.5" />
            <path d="M45,37 C54,44 55,58 45,68 C35,58 36,44 45,37 Z" />
            <circle cx="45" cy="33" r="3.6" />
          </g>
          <g className="gdiam">
            <path d="M35,89 L39,92 L35,95 L31,92 Z" />
            <path d="M45,89 L49,92 L45,95 L41,92 Z" />
            <path d="M55,89 L59,92 L55,95 L51,92 Z" />
            <path d="M45,47 L49,52 L45,57 L41,52 Z" />
          </g>
        </symbol>

        <symbol id="o-king" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="gbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M32,89 C30,80 37,76 39,71 H51 C53,76 60,80 58,89 Z" />
            <rect x="37" y="66" width="16" height="6" rx="2" />
            <path d="M38,67 L52,67 L50,54 C48,57 42,57 40,54 Z" />
            <rect x="43" y="38" width="4" height="15" rx="1" />
            <rect x="39" y="42" width="12" height="4" rx="1" />
          </g>
          <g className="gdiam">
            <path d="M35,89 L39,92 L35,95 L31,92 Z" />
            <path d="M45,89 L49,92 L45,95 L41,92 Z" />
            <path d="M55,89 L59,92 L55,95 L51,92 Z" />
            <path d="M45,55 L49,60 L45,65 L41,60 Z" />
            <path d="M37,71 L41,75 L37,79 L33,75 Z" />
            <path d="M53,71 L57,75 L53,79 L49,75 Z" />
          </g>
        </symbol>

        <symbol id="o-marshal" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="gbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,80 36,74 36,72 C36,66 32,64 33,61 C35,57 40,56 41,54 H49 C50,56 55,57 57,61 C58,64 54,66 54,72 C54,74 58,80 56,89 Z" />
            <rect x="42" y="50" width="6" height="6" />
            <g transform="translate(34.5,32.5) scale(0.875)">
              <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
            </g>
          </g>
          <g className="gdiam">
            <path d="M35,89 L39,92 L35,95 L31,92 Z" />
            <path d="M45,89 L49,92 L45,95 L41,92 Z" />
            <path d="M55,89 L59,92 L55,95 L51,92 Z" />
            <path d="M37,63 L41,67 L37,71 L33,67 Z" />
            <path d="M53,63 L57,67 L53,71 L49,67 Z" />
          </g>
        </symbol>

        <symbol id="o-vanguard" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="gbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,80 36,74 36,72 C36,66 32,64 33,61 C35,57 40,56 41,54 H49 C50,56 55,57 57,61 C58,64 54,66 54,72 C54,74 58,80 56,89 Z" />
            <path d="M32,56 L45,34 L58,56 L49,56 L45,48 L41,56 Z" />
          </g>
          <g className="gdiam">
            <path d="M35,89 L39,92 L35,95 L31,92 Z" />
            <path d="M45,89 L49,92 L45,95 L41,92 Z" />
            <path d="M55,89 L59,92 L55,95 L51,92 Z" />
            <path d="M37,63 L41,67 L37,71 L33,67 Z" />
            <path d="M53,63 L57,67 L53,71 L49,67 Z" />
          </g>
        </symbol>

        <symbol id="o-knight" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="gbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M33,89 C32,82 35,80 36,76 H56 C57,82 58,84 57,89 Z" />
            <path d="M36,76 C34,66 36,58 44,52 C42,50 40,49 38,49 C40,46 43,44 47,43 C46,40 47,37 49,35 C51,38 52,41 53,44 C58,47 62,53 62,62 C62,68 60,73 57,76 Z" />
          </g>
          <g className="gdiam">
            <path d="M35,89 L39,92 L35,95 L31,92 Z" />
            <path d="M45,89 L49,92 L45,95 L41,92 Z" />
            <path d="M55,89 L59,92 L55,95 L51,92 Z" />
          </g>
        </symbol>

        <symbol id="o-lancer" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="22" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="gbody">
            <path d="M29,96 H61 L56,89 H34 Z" />
            <path d="M36,89 C35,82 41,79 41,75 H49 C49,79 55,82 54,89 Z" />
            <rect x="41" y="42" width="8" height="34" rx="2" />
            <path d="M45,26 L53,44 H37 Z" />
          </g>
          <g className="gdiam">
            <path d="M35,89 L39,92 L35,95 L31,92 Z" />
            <path d="M45,89 L49,92 L45,95 L41,92 Z" />
            <path d="M55,89 L59,92 L55,95 L51,92 Z" />
            <path d="M45,60 L49,65 L45,70 L41,65 Z" />
          </g>
        </symbol>

        {/* gothic promoted */}
        <symbol id="o-pawn-plus" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="23" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="gbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,79 40,75 40,70 H50 C50,75 58,79 56,89 Z" />
            <rect x="37" y="66" width="16" height="5" rx="2.5" />
            <circle cx="45" cy="55" r="10" />
          </g>
          <g className="gdiam">
            <path d="M35,89 L39,92 L35,95 L31,92 Z" />
            <path d="M45,89 L49,92 L45,95 L41,92 Z" />
            <path d="M55,89 L59,92 L55,95 L51,92 Z" />
          </g>
          <g className="gmark" transform="translate(38.50,48.50) scale(0.5417)">
            <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
          </g>
        </symbol>

        <symbol id="o-lancer-plus" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="22" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="gbody">
            <path d="M29,96 H61 L56,89 H34 Z" />
            <path d="M36,89 C35,82 41,79 41,75 H49 C49,79 55,82 54,89 Z" />
            <rect x="41" y="42" width="8" height="34" rx="2" />
            <path d="M45,26 L53,44 H37 Z" />
          </g>
          <g className="gdiam">
            <path d="M35,89 L39,92 L35,95 L31,92 Z" />
            <path d="M45,89 L49,92 L45,95 L41,92 Z" />
            <path d="M55,89 L59,92 L55,95 L51,92 Z" />
          </g>
          <g className="gmark" transform="translate(39.00,29.00) scale(0.5000)">
            <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
          </g>
        </symbol>

        <symbol id="o-knight-plus" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="gbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M33,89 C32,82 35,80 36,76 H56 C57,82 58,84 57,89 Z" />
            <path d="M36,76 C34,66 36,58 44,52 C42,50 40,49 38,49 C40,46 43,44 47,43 C46,40 47,37 49,35 C51,38 52,41 53,44 C58,47 62,53 62,62 C62,68 60,73 57,76 Z" />
          </g>
          <g className="gdiam">
            <path d="M35,89 L39,92 L35,95 L31,92 Z" />
            <path d="M45,89 L49,92 L45,95 L41,92 Z" />
            <path d="M55,89 L59,92 L55,95 L51,92 Z" />
          </g>
          <g className="gmark" transform="translate(39.00,60.00) scale(0.5000)">
            <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
          </g>
        </symbol>

        <symbol id="o-vanguard-plus" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="24" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="gbody">
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,80 36,74 36,72 C36,66 32,64 33,61 C35,57 40,56 41,54 H49 C50,56 55,57 57,61 C58,64 54,66 54,72 C54,74 58,80 56,89 Z" />
            <path d="M32,56 L45,34 L58,56 L49,56 L45,48 L41,56 Z" />
          </g>
          <g className="gdiam">
            <path d="M35,89 L39,92 L35,95 L31,92 Z" />
            <path d="M45,89 L49,92 L45,95 L41,92 Z" />
            <path d="M55,89 L59,92 L55,95 L51,92 Z" />
          </g>
          <g className="gmark" transform="translate(39.00,62.00) scale(0.5000)">
            <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
          </g>
        </symbol>

        <symbol id="o-dragonking" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="26" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="gbody">
            <path d="M37,67 C26,64 16,55 13,41 C20,47 28,50 33,54 C31,57 33,60 32,63 C35,62 37,63 39,64 Z" />
            <path d="M53,67 C64,64 74,55 77,41 C70,47 62,50 57,54 C59,57 57,60 58,63 C55,62 53,63 51,64 Z" />
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M33,89 C32,80 36,78 36,73 H54 C54,78 58,80 57,89 Z" />
            <rect x="32" y="63" width="26" height="9" rx="1.5" />
            <rect x="32" y="55" width="5.5" height="9" />
            <rect x="42.25" y="55" width="5.5" height="9" />
            <rect x="52.5" y="55" width="5.5" height="9" />
          </g>
          <g className="gdiam">
            <path d="M35,89 L39,92 L35,95 L31,92 Z" />
            <path d="M45,89 L49,92 L45,95 L41,92 Z" />
            <path d="M55,89 L59,92 L55,95 L51,92 Z" />
          </g>
          <g className="gmark" transform="translate(39.00,75.00) scale(0.5000)">
            <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
          </g>
        </symbol>

        <symbol id="o-dragonhorse" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="26" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <g className="gbody">
            <path d="M38,68 C27,65 17,56 14,42 C21,48 29,51 34,55 C32,58 34,61 33,64 C36,63 38,64 40,65 Z" />
            <path d="M52,68 C63,65 73,56 76,42 C69,48 61,51 56,55 C58,58 56,61 57,64 C54,63 52,64 50,65 Z" />
            <path d="M27,96 H63 L58,89 H32 Z" />
            <path d="M34,89 C32,80 39,76 41,71 H49 C51,76 58,80 56,89 Z" />
            <rect x="38" y="67" width="14" height="5" rx="2.5" />
            <path d="M45,37 C54,44 55,58 45,68 C35,58 36,44 45,37 Z" />
            <circle cx="45" cy="33" r="3.6" />
          </g>
          <g className="gdiam">
            <path d="M35,89 L39,92 L35,95 L31,92 Z" />
            <path d="M45,89 L49,92 L45,95 L41,92 Z" />
            <path d="M55,89 L59,92 L55,95 L51,92 Z" />
          </g>
          <g className="gmark" transform="translate(39.00,75.00) scale(0.5000)">
            <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.1 L18.6 21.5 L12 17.4 L5.4 21.5 L7.3 14.1 L1.5 9.2 L9.1 8.6 Z" />
          </g>
        </symbol>

        {/* ════════════════════════════════════════════════════════
            MÁSCARAS SET — Commedia dell'Arte em P&B puro.
            Corpo / rosto herdam fill/stroke do CSS.
            Figurino (chapéu, barba, máscara) usa fill="currentColor".
            Pupilas = fill="currentColor" stroke="none".
            ════════════════════════════════════════════════════════ */}

        {/* ── Pierrot (Soldado) ── */}
        <symbol id="m-pawn" viewBox="0 0 90 104">
          <ellipse cx="45" cy="99" rx="23" ry="3.6" fill="url(#dropsh)" stroke="none" />
          <g strokeLinejoin="round" strokeLinecap="round" style={{ paintOrder: 'stroke' }}>
            <rect x="40.5" y="62" width="9" height="22" rx="2" strokeWidth="2.6" />
            <path d="M24,86 Q28,75 33,84 Q37,75 41,84 Q45,76 49,84 Q53,75 57,84 Q62,75 66,86 Q56,94 45,95 Q34,94 24,86 Z" strokeWidth="2.6" />
            <path d="M30,37 L45,11 L60,37 Z" fill="currentColor" strokeWidth="2.4" />
            <circle cx="45" cy="11" r="4" fill="currentColor" stroke="none" />
            <circle cx="45" cy="49" r="16" strokeWidth="3" />
            <circle cx="40" cy="48" r="3" fill="currentColor" stroke="none" />
            <circle cx="50" cy="48" r="3" fill="currentColor" stroke="none" />
            <path d="M39,59 Q45,63 51,59" fill="none" strokeWidth="2" />
          </g>
        </symbol>

        {/* ── Pulcinella (Lanceiro) ── */}
        <symbol id="m-lancer" viewBox="0 0 90 104">
          <ellipse cx="45" cy="99" rx="23" ry="3.6" fill="url(#dropsh)" stroke="none" />
          <g strokeLinejoin="round" strokeLinecap="round" style={{ paintOrder: 'stroke' }}>
            <rect x="40.5" y="62" width="9" height="22" rx="2" strokeWidth="2.6" />
            <path d="M24,86 Q28,75 33,84 Q37,75 41,84 Q45,76 49,84 Q53,75 57,84 Q62,75 66,86 Q56,94 45,95 Q34,94 24,86 Z" strokeWidth="2.6" />
            <path d="M37,38 L45,7 L53,38 Z" fill="currentColor" strokeWidth="2.4" />
            <circle cx="45" cy="7" r="3.5" fill="currentColor" stroke="none" />
            <ellipse cx="45" cy="48" rx="14" ry="17" strokeWidth="3" />
            <path d="M44,47 Q51,53 44,57" fill="none" strokeWidth="2.4" />
            <circle cx="39" cy="44" r="2.5" fill="currentColor" stroke="none" />
            <circle cx="51" cy="44" r="2.5" fill="currentColor" stroke="none" />
            <path d="M39,61 Q45,56 51,61" fill="none" strokeWidth="2" />
          </g>
        </symbol>

        {/* ── Arlecchino (Cavaleiro) — chapéu bicolor + máscara ocular ── */}
        <symbol id="m-knight" viewBox="0 0 90 104">
          <ellipse cx="45" cy="99" rx="23" ry="3.6" fill="url(#dropsh)" stroke="none" />
          <g strokeLinejoin="round" strokeLinecap="round" style={{ paintOrder: 'stroke' }}>
            <rect x="40.5" y="62" width="9" height="22" rx="2" strokeWidth="2.6" />
            <path d="M24,86 Q28,75 33,84 Q37,75 41,84 Q45,76 49,84 Q53,75 57,84 Q62,75 66,86 Q56,94 45,95 Q34,94 24,86 Z" strokeWidth="2.6" />
            <path d="M27,38 L40,14 L53,38 Z" fill="currentColor" strokeWidth="2.4" />
            <path d="M37,38 L50,14 L63,38 Z" fill="none" strokeWidth="2.4" />
            <path d="M27,40 Q45,36 63,40" fill="none" strokeWidth="1.6" />
            <circle cx="45" cy="49" r="15" strokeWidth="3" />
            <path d="M30,44 Q45,39 60,44 L60,52 Q45,49 30,52 Z" fill="currentColor" strokeWidth="0" />
            <ellipse cx="40" cy="47" rx="3.5" ry="4" strokeWidth="0" />
            <ellipse cx="50" cy="47" rx="3.5" ry="4" strokeWidth="0" />
            <circle cx="40" cy="47" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="50" cy="47" r="1.5" fill="currentColor" stroke="none" />
            <path d="M40,59 Q45,63 50,59" fill="none" strokeWidth="2" />
          </g>
        </symbol>

        {/* ── Brighella (Vanguarda) — chapéu em W, olhar ardiloso ── */}
        <symbol id="m-vanguard" viewBox="0 0 90 104">
          <ellipse cx="45" cy="99" rx="23" ry="3.6" fill="url(#dropsh)" stroke="none" />
          <g strokeLinejoin="round" strokeLinecap="round" style={{ paintOrder: 'stroke' }}>
            <rect x="40.5" y="62" width="9" height="22" rx="2" strokeWidth="2.6" />
            <path d="M24,86 Q28,75 33,84 Q37,75 41,84 Q45,76 49,84 Q53,75 57,84 Q62,75 66,86 Q56,94 45,95 Q34,94 24,86 Z" strokeWidth="2.6" />
            <path d="M27,38 L37,19 L45,31 L53,19 L63,38 Z" fill="currentColor" strokeWidth="2.4" />
            <ellipse cx="45" cy="49" rx="13" ry="16" strokeWidth="3" />
            <path d="M36,42 Q40,39 44,42" fill="none" strokeWidth="2" />
            <circle cx="40" cy="47" r="2.5" fill="currentColor" stroke="none" />
            <circle cx="50" cy="47" r="2.5" fill="currentColor" stroke="none" />
            <path d="M39,59 Q46,64 53,57" fill="none" strokeWidth="2" />
          </g>
        </symbol>

        {/* ── Il Dottore (Bispo) — beca + óculos ── */}
        <symbol id="m-bishop" viewBox="0 0 90 104">
          <ellipse cx="45" cy="99" rx="23" ry="3.6" fill="url(#dropsh)" stroke="none" />
          <g strokeLinejoin="round" strokeLinecap="round" style={{ paintOrder: 'stroke' }}>
            <rect x="40.5" y="62" width="9" height="22" rx="2" strokeWidth="2.6" />
            <path d="M24,86 Q28,75 33,84 Q37,75 41,84 Q45,76 49,84 Q53,75 57,84 Q62,75 66,86 Q56,94 45,95 Q34,94 24,86 Z" strokeWidth="2.6" />
            <path d="M33,40 C33,27 57,27 57,40 Z" fill="currentColor" strokeWidth="2.8" />
            <rect x="24" y="38" width="42" height="4" rx="1" fill="currentColor" strokeWidth="0" />
            <path d="M57,39 Q65,40 62,50" fill="none" strokeWidth="2" />
            <circle cx="45" cy="52" r="18" strokeWidth="3" />
            <circle cx="38" cy="52" r="4.5" fill="none" strokeWidth="1.8" />
            <circle cx="52" cy="52" r="4.5" fill="none" strokeWidth="1.8" />
            <line x1="42.5" y1="52" x2="47.5" y2="52" strokeWidth="1.6" />
            <line x1="32" y1="52" x2="33.5" y2="52" strokeWidth="1.6" />
            <line x1="56.5" y1="52" x2="58" y2="52" strokeWidth="1.6" />
            <circle cx="38" cy="52" r="1.8" fill="currentColor" stroke="none" />
            <circle cx="52" cy="52" r="1.8" fill="currentColor" stroke="none" />
            <path d="M39,63 Q45,68 51,63" fill="none" strokeWidth="2.2" />
          </g>
        </symbol>

        {/* ── Il Capitano (Torre) — aba larga + bigode enrolado ── */}
        <symbol id="m-rook" viewBox="0 0 90 104">
          <ellipse cx="45" cy="99" rx="23" ry="3.6" fill="url(#dropsh)" stroke="none" />
          <g strokeLinejoin="round" strokeLinecap="round" style={{ paintOrder: 'stroke' }}>
            <rect x="40.5" y="62" width="9" height="22" rx="2" strokeWidth="2.6" />
            <path d="M24,86 Q28,75 33,84 Q37,75 41,84 Q45,76 49,84 Q53,75 57,84 Q62,75 66,86 Q56,94 45,95 Q34,94 24,86 Z" strokeWidth="2.6" />
            <rect x="33" y="20" width="24" height="15" rx="3" fill="currentColor" strokeWidth="2" />
            <path d="M17,35 Q45,28 73,35 Q45,42 17,35 Z" fill="currentColor" strokeWidth="2.4" />
            <path d="M55,20 C62,14 70,19 64,28" fill="none" strokeWidth="2.2" />
            <ellipse cx="45" cy="49" rx="14" ry="15" strokeWidth="3" />
            <path d="M37,42 L43,41" fill="none" strokeWidth="2" strokeLinecap="round" />
            <path d="M47,41 L53,42" fill="none" strokeWidth="2" strokeLinecap="round" />
            <circle cx="40" cy="47" r="2.5" fill="currentColor" stroke="none" />
            <circle cx="50" cy="47" r="2.5" fill="currentColor" stroke="none" />
            <path d="M32,57 C37,52 42,61 45,58 C48,61 53,52 58,57" fill="currentColor" strokeWidth="2" />
            <path d="M39,65 Q45,69 51,65" fill="none" strokeWidth="1.8" />
          </g>
        </symbol>

        {/* ── Colombina (Marechal) — coque com caracóis, boca rosada ── */}
        <symbol id="m-marshal" viewBox="0 0 90 104">
          <ellipse cx="45" cy="99" rx="23" ry="3.6" fill="url(#dropsh)" stroke="none" />
          <g strokeLinejoin="round" strokeLinecap="round" style={{ paintOrder: 'stroke' }}>
            <rect x="40.5" y="62" width="9" height="22" rx="2" strokeWidth="2.6" />
            <path d="M24,86 Q28,75 33,84 Q37,75 41,84 Q45,76 49,84 Q53,75 57,84 Q62,75 66,86 Q56,94 45,95 Q34,94 24,86 Z" strokeWidth="2.6" />
            <path d="M30,39 C28,21 62,21 60,39 Z" fill="currentColor" strokeWidth="2.8" />
            <path d="M30,39 C26,32 29,24 33,26" fill="none" strokeWidth="2" />
            <path d="M60,39 C64,32 61,24 57,26" fill="none" strokeWidth="2" />
            <path d="M40,27 C38,22 40,18 45,19 C50,18 52,22 50,27" fill="none" strokeWidth="1.8" />
            <ellipse cx="45" cy="48" rx="12.5" ry="15" strokeWidth="3" />
            <path d="M37,40 Q40,38 43,40" fill="none" strokeWidth="1.6" />
            <path d="M47,40 Q50,38 53,40" fill="none" strokeWidth="1.6" />
            <circle cx="40" cy="46" r="2.2" fill="currentColor" stroke="none" />
            <circle cx="50" cy="46" r="2.2" fill="currentColor" stroke="none" />
            <path d="M41,57 Q45,61 49,57 Q45,59 41,57 Z" fill="currentColor" strokeWidth="1.6" />
          </g>
        </symbol>

        {/* ── Pantalone (Rei) — barrete ducal, barba pontuda ── */}
        <symbol id="m-king" viewBox="0 0 90 104">
          <ellipse cx="45" cy="99" rx="23" ry="3.6" fill="url(#dropsh)" stroke="none" />
          <g strokeLinejoin="round" strokeLinecap="round" style={{ paintOrder: 'stroke' }}>
            <rect x="40.5" y="62" width="9" height="22" rx="2" strokeWidth="2.6" />
            <path d="M24,86 Q28,75 33,84 Q37,75 41,84 Q45,76 49,84 Q53,75 57,84 Q62,75 66,86 Q56,94 45,95 Q34,94 24,86 Z" strokeWidth="2.6" />
            <path d="M33,39 C33,27 46,11 48,9 C52,13 57,27 57,39 Z" fill="currentColor" strokeWidth="2.6" />
            <circle cx="48" cy="9" r="3.5" fill="currentColor" stroke="none" />
            <ellipse cx="45" cy="46" rx="12" ry="14" strokeWidth="3" />
            <path d="M36,40 Q39,37 42,40" fill="none" strokeWidth="1.8" />
            <path d="M48,40 Q51,37 54,40" fill="none" strokeWidth="1.8" />
            <circle cx="40" cy="45" r="2.2" fill="currentColor" stroke="none" />
            <circle cx="50" cy="45" r="2.2" fill="currentColor" stroke="none" />
            <path d="M40,53 Q45,56 50,53" fill="none" strokeWidth="1.6" />
            <path d="M37,56 C35,63 37,70 45,72 C53,70 55,63 53,56 Z" fill="currentColor" strokeWidth="2" />
          </g>
        </symbol>

        {/* ── Pierrot+ (Soldado promovido) ── */}
        <symbol id="m-pawn-plus" viewBox="0 0 90 104">
          <ellipse cx="45" cy="99" rx="23" ry="3.6" fill="url(#dropsh)" stroke="none" />
          <g strokeLinejoin="round" strokeLinecap="round" style={{ paintOrder: 'stroke' }}>
            <rect x="40.5" y="62" width="9" height="22" rx="2" strokeWidth="2.6" />
            <path d="M24,86 Q28,75 33,84 Q37,75 41,84 Q45,76 49,84 Q53,75 57,84 Q62,75 66,86 Q56,94 45,95 Q34,94 24,86 Z" strokeWidth="2.6" />
            <path d="M30,37 L45,11 L60,37 Z" fill="currentColor" strokeWidth="2.4" />
            <path d="M38,12 L40,5 L43,12 L45,3 L47,12 L50,5 L52,12 Z" fill="currentColor" stroke="none" />
            <circle cx="45" cy="49" r="16" strokeWidth="3" />
            <circle cx="40" cy="48" r="3" fill="currentColor" stroke="none" />
            <circle cx="50" cy="48" r="3" fill="currentColor" stroke="none" />
            <path d="M39,59 Q45,63 51,59" fill="none" strokeWidth="2" />
          </g>
        </symbol>

        {/* ── Pulcinella+ (Lanceiro promovido) ── */}
        <symbol id="m-lancer-plus" viewBox="0 0 90 104">
          <ellipse cx="45" cy="99" rx="23" ry="3.6" fill="url(#dropsh)" stroke="none" />
          <g strokeLinejoin="round" strokeLinecap="round" style={{ paintOrder: 'stroke' }}>
            <rect x="40.5" y="62" width="9" height="22" rx="2" strokeWidth="2.6" />
            <path d="M24,86 Q28,75 33,84 Q37,75 41,84 Q45,76 49,84 Q53,75 57,84 Q62,75 66,86 Q56,94 45,95 Q34,94 24,86 Z" strokeWidth="2.6" />
            <path d="M37,38 L45,7 L53,38 Z" fill="currentColor" strokeWidth="2.4" />
            <path d="M38,8 L40,1 L43,8 L45,0 L47,8 L50,1 L52,8 Z" fill="currentColor" stroke="none" />
            <ellipse cx="45" cy="48" rx="14" ry="17" strokeWidth="3" />
            <path d="M44,47 Q51,53 44,57" fill="none" strokeWidth="2.4" />
            <circle cx="39" cy="44" r="2.5" fill="currentColor" stroke="none" />
            <circle cx="51" cy="44" r="2.5" fill="currentColor" stroke="none" />
            <path d="M39,61 Q45,56 51,61" fill="none" strokeWidth="2" />
          </g>
        </symbol>

        {/* ── Arlecchino+ (Cavaleiro promovido) ── */}
        <symbol id="m-knight-plus" viewBox="0 0 90 104">
          <ellipse cx="45" cy="99" rx="23" ry="3.6" fill="url(#dropsh)" stroke="none" />
          <g strokeLinejoin="round" strokeLinecap="round" style={{ paintOrder: 'stroke' }}>
            <rect x="40.5" y="62" width="9" height="22" rx="2" strokeWidth="2.6" />
            <path d="M24,86 Q28,75 33,84 Q37,75 41,84 Q45,76 49,84 Q53,75 57,84 Q62,75 66,86 Q56,94 45,95 Q34,94 24,86 Z" strokeWidth="2.6" />
            <path d="M27,38 L40,14 L53,38 Z" fill="currentColor" strokeWidth="2.4" />
            <path d="M37,38 L50,14 L63,38 Z" fill="none" strokeWidth="2.4" />
            <path d="M38,15 L40,8 L43,15 L45,6 L47,15 L50,8 L52,15 Z" fill="currentColor" stroke="none" />
            <path d="M27,40 Q45,36 63,40" fill="none" strokeWidth="1.6" />
            <circle cx="45" cy="49" r="15" strokeWidth="3" />
            <path d="M30,44 Q45,39 60,44 L60,52 Q45,49 30,52 Z" fill="currentColor" strokeWidth="0" />
            <ellipse cx="40" cy="47" rx="3.5" ry="4" strokeWidth="0" />
            <ellipse cx="50" cy="47" rx="3.5" ry="4" strokeWidth="0" />
            <circle cx="40" cy="47" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="50" cy="47" r="1.5" fill="currentColor" stroke="none" />
            <path d="M40,59 Q45,63 50,59" fill="none" strokeWidth="2" />
          </g>
        </symbol>

        {/* ── Brighella+ (Vanguarda promovida) ── */}
        <symbol id="m-vanguard-plus" viewBox="0 0 90 104">
          <ellipse cx="45" cy="99" rx="23" ry="3.6" fill="url(#dropsh)" stroke="none" />
          <g strokeLinejoin="round" strokeLinecap="round" style={{ paintOrder: 'stroke' }}>
            <rect x="40.5" y="62" width="9" height="22" rx="2" strokeWidth="2.6" />
            <path d="M24,86 Q28,75 33,84 Q37,75 41,84 Q45,76 49,84 Q53,75 57,84 Q62,75 66,86 Q56,94 45,95 Q34,94 24,86 Z" strokeWidth="2.6" />
            <path d="M27,38 L37,19 L45,31 L53,19 L63,38 Z" fill="currentColor" strokeWidth="2.4" />
            <path d="M38,20 L40,13 L43,20 L45,11 L47,20 L50,13 L52,20 Z" fill="currentColor" stroke="none" />
            <ellipse cx="45" cy="49" rx="13" ry="16" strokeWidth="3" />
            <path d="M36,42 Q40,39 44,42" fill="none" strokeWidth="2" />
            <circle cx="40" cy="47" r="2.5" fill="currentColor" stroke="none" />
            <circle cx="50" cy="47" r="2.5" fill="currentColor" stroke="none" />
            <path d="M39,59 Q46,64 53,57" fill="none" strokeWidth="2" />
          </g>
        </symbol>

        {/* ── Scaramuccia (Dragão-Rei) — máscara de vilão, aba enorme ── */}
        <symbol id="m-dragonking" viewBox="0 0 90 104">
          <ellipse cx="45" cy="99" rx="23" ry="3.6" fill="url(#dropsh)" stroke="none" />
          <g strokeLinejoin="round" strokeLinecap="round" style={{ paintOrder: 'stroke' }}>
            <rect x="40.5" y="62" width="9" height="22" rx="2" strokeWidth="2.6" />
            <path d="M24,86 Q28,75 33,84 Q37,75 41,84 Q45,76 49,84 Q53,75 57,84 Q62,75 66,86 Q56,94 45,95 Q34,94 24,86 Z" strokeWidth="2.6" />
            <rect x="33" y="19" width="24" height="15" rx="3" fill="currentColor" strokeWidth="2" />
            <path d="M15,34 Q45,27 75,34 Q45,41 15,34 Z" fill="currentColor" strokeWidth="2.4" />
            <path d="M57,19 C65,12 72,18 65,28" fill="none" strokeWidth="2.2" />
            <circle cx="45" cy="49" r="16" strokeWidth="3" />
            <path d="M29,44 Q32,36 45,35 Q58,36 61,44 L61,54 Q57,58 50,57 L40,57 Q33,58 29,54 Z" fill="currentColor" strokeWidth="0" />
            <ellipse cx="40" cy="47" rx="4.5" ry="2.8" strokeWidth="0" />
            <ellipse cx="50" cy="47" rx="4.5" ry="2.8" strokeWidth="0" />
            <circle cx="40" cy="47" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="50" cy="47" r="1.5" fill="currentColor" stroke="none" />
            <path d="M37,64 Q41,60 45,63 Q49,60 53,64" fill="none" strokeWidth="2" />
          </g>
        </symbol>

        {/* ── Tartaglia (Dragão-Cavalo) — beca dupla + óculos grossos ── */}
        <symbol id="m-dragonhorse" viewBox="0 0 90 104">
          <ellipse cx="45" cy="99" rx="23" ry="3.6" fill="url(#dropsh)" stroke="none" />
          <g strokeLinejoin="round" strokeLinecap="round" style={{ paintOrder: 'stroke' }}>
            <rect x="40.5" y="62" width="9" height="22" rx="2" strokeWidth="2.6" />
            <path d="M24,86 Q28,75 33,84 Q37,75 41,84 Q45,76 49,84 Q53,75 57,84 Q62,75 66,86 Q56,94 45,95 Q34,94 24,86 Z" strokeWidth="2.6" />
            <path d="M35,42 C35,30 55,30 55,42 Z" fill="currentColor" strokeWidth="2.8" />
            <rect x="27" y="40" width="36" height="4" rx="1" fill="currentColor" strokeWidth="0" />
            <rect x="30" y="34" width="30" height="4" rx="1" fill="currentColor" strokeWidth="0" />
            <path d="M61,34 Q68,36 64,46" fill="none" strokeWidth="2" />
            <circle cx="45" cy="52" r="17" strokeWidth="3" />
            <path d="M38,45 Q45,41 52,45" fill="none" strokeWidth="1.8" />
            <circle cx="38" cy="53" r="5" fill="none" strokeWidth="2.4" />
            <circle cx="52" cy="53" r="5" fill="none" strokeWidth="2.4" />
            <line x1="43" y1="53" x2="47" y2="53" strokeWidth="2.2" />
            <line x1="32" y1="53" x2="33" y2="53" strokeWidth="2" />
            <line x1="57" y1="53" x2="58" y2="53" strokeWidth="2" />
            <circle cx="38" cy="53" r="2" fill="currentColor" stroke="none" />
            <circle cx="52" cy="53" r="2" fill="currentColor" stroke="none" />
            <path d="M40,64 Q45,68 50,64" fill="none" strokeWidth="2.2" />
          </g>
        </symbol>

        {/* ════════════════════════════════════════════════════════
            GEO SET — geometric inner-frame + shape marks
            Body inherits fill/stroke. Frame + marks use currentColor.
            Promoted marks in #c0392b (crimson).
            ════════════════════════════════════════════════════════ */}

        {/* ── SOLDADO (Pawn) — ring ── */}
        <symbol id="g-pawn" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="23" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.5, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <path d="M45,34 Q64,43 66,57 L66,91 L24,91 L24,57 Q26,43 45,34 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="45" cy="63" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </symbol>

        {/* ── TORRE (Rook) — plus cross ── */}
        <symbol id="g-rook" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="23" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.5, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <path d="M45,34 Q64,43 66,57 L66,91 L24,91 L24,57 Q26,43 45,34 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <line x1="45" y1="49" x2="45" y2="77" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="31" y1="63" x2="59" y2="63" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </symbol>

        {/* ── BISPO (Bishop) — diagonal X ── */}
        <symbol id="g-bishop" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="23" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.5, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <path d="M45,34 Q64,43 66,57 L66,91 L24,91 L24,57 Q26,43 45,34 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <line x1="33" y1="50" x2="57" y2="76" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="57" y1="50" x2="33" y2="76" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </symbol>

        {/* ── REI (King) — diamond ── */}
        <symbol id="g-king" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="23" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.5, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <path d="M45,34 Q64,43 66,57 L66,91 L24,91 L24,57 Q26,43 45,34 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M45,47 L61,63 L45,79 L29,63 Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </symbol>

        {/* ── MARECHAL (Marshal/Gold) — bullseye (ring + dot) ── */}
        <symbol id="g-marshal" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="23" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.5, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <path d="M45,34 Q64,43 66,57 L66,91 L24,91 L24,57 Q26,43 45,34 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="45" cy="63" r="11" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="45" cy="63" r="3.5" fill="currentColor" stroke="none" />
        </symbol>

        {/* ── VANGUARDA (Vanguard/Silver) — downward triangle ── */}
        <symbol id="g-vanguard" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="23" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.5, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <path d="M45,34 Q64,43 66,57 L66,91 L24,91 L24,57 Q26,43 45,34 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M33,51 L57,51 L45,74 Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </symbol>

        {/* ── CAVALEIRO (Knight) — L bracket ── */}
        <symbol id="g-knight" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="23" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.5, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <path d="M45,34 Q64,43 66,57 L66,91 L24,91 L24,57 Q26,43 45,34 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M35,49 L35,69 L55,69" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>

        {/* ── LANCEIRO (Lancer) — upward arrow ── */}
        <symbol id="g-lancer" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="23" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.5, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <path d="M45,34 Q64,43 66,57 L66,91 L24,91 L24,57 Q26,43 45,34 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <line x1="45" y1="77" x2="45" y2="49" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M37,57 L45,49 L53,57" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>

        {/* ── SOLDADO+ (Promoted Pawn) — ring in crimson ── */}
        <symbol id="g-pawn-plus" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="23" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.5, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <path d="M45,34 Q64,43 66,57 L66,91 L24,91 L24,57 Q26,43 45,34 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="45" cy="63" r="9" fill="none" stroke="#c0392b" strokeWidth="1.8" />
        </symbol>

        {/* ── LANCEIRO+ (Promoted Lancer) — arrow in crimson ── */}
        <symbol id="g-lancer-plus" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="23" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.5, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <path d="M45,34 Q64,43 66,57 L66,91 L24,91 L24,57 Q26,43 45,34 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <line x1="45" y1="77" x2="45" y2="49" stroke="#c0392b" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M37,57 L45,49 L53,57" fill="none" stroke="#c0392b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>

        {/* ── CAVALEIRO+ (Promoted Knight) — L bracket in crimson ── */}
        <symbol id="g-knight-plus" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="23" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.5, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <path d="M45,34 Q64,43 66,57 L66,91 L24,91 L24,57 Q26,43 45,34 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M35,49 L35,69 L55,69" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>

        {/* ── VANGUARDA+ (Promoted Vanguard) — triangle in crimson ── */}
        <symbol id="g-vanguard-plus" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="23" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.5, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <path d="M45,34 Q64,43 66,57 L66,91 L24,91 L24,57 Q26,43 45,34 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M33,51 L57,51 L45,74 Z" fill="none" stroke="#c0392b" strokeWidth="1.8" strokeLinejoin="round" />
        </symbol>

        {/* ── DRAGÃO (Dragon King / promoted Rook) — large + in crimson ── */}
        <symbol id="g-dragonking" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="23" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.5, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <path d="M45,34 Q64,43 66,57 L66,91 L24,91 L24,57 Q26,43 45,34 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <line x1="45" y1="37" x2="45" y2="88" stroke="#c0392b" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="26" y1="63" x2="64" y2="63" stroke="#c0392b" strokeWidth="2.2" strokeLinecap="round" />
        </symbol>

        {/* ── CAVALO DRAGÃO (Dragon Horse / promoted Bishop) — large × in crimson ── */}
        <symbol id="g-dragonhorse" viewBox="10 24 70 76">
          <ellipse cx="45" cy="98" rx="23" ry="4.5" fill="url(#dropsh)" stroke="none" />
          <path d="M45,27 Q70,39 72,54 L72,96 L18,96 L18,54 Q20,39 45,27 Z" style={{ strokeWidth: 2.5, strokeLinejoin: 'round', paintOrder: 'stroke' }} />
          <path d="M45,34 Q64,43 66,57 L66,91 L24,91 L24,57 Q26,43 45,34 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <line x1="28" y1="40" x2="62" y2="86" stroke="#c0392b" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="62" y1="40" x2="28" y2="86" stroke="#c0392b" strokeWidth="2.2" strokeLinecap="round" />
        </symbol>

      </defs>
    </svg>
  )
}
