// SVG track outline paths for F1 circuits
// viewBox: "0 0 200 140" for all, paths are simplified outlines
const CIRCUIT_SVG = {
  albert_park: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M60,20 L140,20 Q155,20 158,30 L160,55 Q162,65 155,72 L145,80 Q138,86 130,84 L115,80 Q108,78 105,85 L103,100 Q101,110 92,114 L75,116 Q62,116 56,108 L50,95 Q46,85 52,78 L58,70 Q64,63 60,55 L55,40 Q52,28 60,20 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  </svg>`,

  americas: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M40,110 L40,60 Q40,45 52,38 L65,32 Q75,28 75,18 L75,15 Q75,10 80,10 L90,10 Q96,10 96,16 L96,30 Q96,38 105,40 L130,42 Q145,43 150,52 L155,65 Q158,75 150,82 L138,88 Q128,92 125,102 L122,115 Q120,122 112,124 L80,124 Q68,124 62,116 L55,108 Q48,116 40,110 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  </svg>`,

  bahrain: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M35,70 L35,40 Q35,28 46,24 L80,18 Q92,16 98,24 L102,34 Q106,42 116,42 L145,42 Q158,42 162,52 L164,68 Q165,80 156,86 L140,90 Q128,92 124,102 L120,115 Q116,124 105,124 L75,124 Q62,124 56,114 L50,100 Q46,90 35,88 L35,70 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  </svg>`,

  baku: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M30,120 L30,80 Q30,70 38,66 L55,60 Q65,56 65,46 L65,20 Q65,12 72,12 L130,12 Q138,12 140,20 L140,30 Q140,38 132,40 L115,42 Q105,44 105,54 L105,70 Q105,80 115,82 L150,86 Q162,88 165,98 L165,115 Q165,125 155,128 L45,128 Q32,128 30,120 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  </svg>`,

  catalunya: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M30,90 L30,50 Q30,35 44,28 L90,18 Q105,15 112,24 L118,36 Q122,46 135,46 L158,46 Q168,46 168,58 L168,75 Q168,86 158,90 L140,94 Q128,96 124,108 L120,120 Q116,128 104,128 L60,128 Q46,128 40,118 L34,106 Q30,98 30,90 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  </svg>`,

  hungaroring: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M50,115 L40,80 Q36,65 44,55 L58,44 Q68,36 68,24 L68,18 Q68,12 75,12 L125,12 Q132,12 134,20 L136,35 Q138,46 150,50 L165,55 Q172,58 170,68 L165,90 Q162,102 150,106 L120,112 Q108,114 105,124 L80,124 Q65,124 58,118 L50,115 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  </svg>`,

  interlagos: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M55,115 L42,85 Q36,70 44,58 L60,44 Q72,34 72,20 L72,14 Q72,8 80,8 L120,8 Q128,8 130,16 L132,30 Q134,42 148,46 L165,50 Q174,54 172,65 L165,90 Q160,105 145,110 L115,118 Q100,120 96,128 L75,128 Q60,128 55,115 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  </svg>`,

  jeddah: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M28,125 L28,15 Q28,8 35,8 L55,8 Q62,8 64,15 L66,30 Q68,40 78,42 L100,44 Q112,44 115,54 L116,65 Q116,75 108,78 L95,80 Q85,82 85,92 L85,105 Q85,115 95,118 L155,120 Q165,120 168,128 L45,128 Q32,128 28,125 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  </svg>`,

  losail: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M40,105 L35,70 Q32,52 44,42 L65,30 Q78,22 78,10 L122,10 Q132,10 136,20 L140,35 Q144,48 158,52 L170,56 Q178,60 176,72 L168,95 Q162,110 148,114 L110,120 Q95,122 90,130 L75,130 Q58,130 50,120 L40,105 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  </svg>`,

  marina_bay: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M25,120 L25,80 Q25,68 34,62 L50,55 Q60,50 60,38 L60,18 Q60,10 68,10 L95,10 Q103,10 105,18 L106,30 Q107,40 118,42 L145,44 Q158,45 162,56 L164,72 Q165,84 155,90 L138,96 Q126,100 124,112 L122,122 Q120,130 110,130 L40,130 Q28,130 25,120 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  </svg>`,

  miami: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M35,100 L32,65 Q30,50 40,42 L60,32 Q72,26 72,14 L128,14 Q138,14 140,24 L142,38 Q144,50 158,54 L172,58 Q180,62 178,74 L170,98 Q164,112 150,116 L110,122 Q95,124 90,132 L75,132 Q58,132 50,120 L35,100 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  </svg>`,

  monaco: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M30,110 L28,75 Q26,58 36,48 L55,36 Q68,28 68,15 L132,15 Q142,15 145,25 L148,42 Q150,55 165,60 L175,65 Q180,70 178,80 L170,100 Q164,115 148,118 L80,122 Q62,122 52,112 L30,110 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  </svg>`,

  monza: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M100,15 L155,15 Q168,15 170,28 L170,55 Q170,65 160,68 L145,70 Q135,72 135,82 L135,110 Q135,122 122,124 L78,124 Q65,124 65,112 L65,82 Q65,72 55,70 L40,68 Q30,65 30,55 L30,28 Q30,15 44,15 L100,15 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
    <ellipse cx="100" cy="70" rx="22" ry="18" fill="none" stroke="currentColor" stroke-width="5"/>
  </svg>`,

  red_bull_ring: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M60,120 L45,85 Q38,68 48,55 L70,38 Q82,28 82,15 L118,15 Q128,15 132,25 L138,45 Q142,58 158,62 L172,66 Q180,70 178,82 L168,105 Q160,120 144,122 L80,125 Q65,125 60,120 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  </svg>`,

  silverstone: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M45,95 L30,70 Q26,55 35,44 L55,30 Q68,22 68,10 L132,10 Q145,10 150,22 L155,38 Q158,50 172,55 L178,58 Q185,62 182,74 L172,98 Q164,112 148,116 L110,122 Q92,124 88,132 L75,132 Q55,132 48,118 L45,95 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  </svg>`,

  spa: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M25,115 L22,75 Q20,55 32,44 L55,30 Q70,22 72,10 L128,10 Q140,10 145,22 L150,40 Q154,55 170,60 L180,64 Q188,68 185,82 L175,105 Q167,120 150,124 L80,128 Q60,128 50,116 L25,115 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  </svg>`,

  suzuka: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M55,120 L42,88 Q36,72 44,60 L60,46 Q72,36 72,22 L72,14 L128,14 L128,22 Q128,36 140,46 L156,60 Q164,72 158,88 L145,120 Q138,130 125,130 L100,130 Q88,130 82,122 Q76,130 64,130 L55,120 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
    <path d="M88,60 Q100,50 112,60 Q120,68 112,78 Q100,88 88,78 Q80,68 88,60 Z" fill="none" stroke="currentColor" stroke-width="4"/>
  </svg>`,

  villeneuve: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M40,105 L35,70 Q32,52 44,42 L65,28 Q78,20 78,8 L122,8 Q134,8 138,20 L142,36 Q146,50 162,54 L174,58 Q182,62 180,75 L170,100 Q162,115 146,118 L80,124 Q62,124 52,112 L40,105 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  </svg>`,

  yas_marina: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M30,115 L28,75 Q26,58 38,48 L60,36 Q74,28 74,15 L126,15 Q138,15 142,27 L146,44 Q150,58 166,62 L176,66 Q184,70 182,82 L172,105 Q164,120 148,122 L80,126 Q60,126 50,114 L30,115 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  </svg>`,

  zandvoort: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M55,118 L42,85 Q36,68 46,56 L65,42 Q78,32 78,18 L122,18 Q135,18 140,30 L145,48 Q150,62 165,66 L175,70 Q182,74 180,86 L170,108 Q162,122 146,124 L80,128 Q62,128 55,118 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  </svg>`,

  imola: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M50,112 L38,80 Q32,62 42,50 L62,36 Q76,26 76,12 L124,12 Q136,12 140,24 L144,42 Q148,56 164,60 L176,64 Q184,68 182,80 L172,104 Q164,118 148,122 L80,126 Q62,126 50,112 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  </svg>`,

  shanghai: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M30,118 L28,78 Q26,60 38,50 L62,36 Q76,28 76,14 L124,14 Q136,14 140,26 L144,44 Q148,58 165,62 L176,66 Q184,70 182,82 L172,106 Q164,120 148,124 L80,128 Q60,128 48,116 L30,118 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  </svg>`,

  las_vegas: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M30,120 L30,20 Q30,12 38,12 L60,12 Q68,12 68,20 L68,55 Q68,65 78,65 L122,65 Q132,65 132,55 L132,20 Q132,12 140,12 L162,12 Q170,12 170,20 L170,120 Q170,128 162,128 L38,128 Q30,128 30,120 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  </svg>`,

  mexico_city: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M40,108 L35,72 Q32,54 44,44 L66,30 Q80,22 80,10 L120,10 Q132,10 136,22 L140,38 Q144,52 160,56 L172,60 Q180,64 178,76 L168,100 Q160,115 144,118 L80,124 Q62,124 52,114 L40,108 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
    <ellipse cx="100" cy="70" rx="18" ry="14" fill="none" stroke="currentColor" stroke-width="4"/>
  </svg>`,

  // Fallback for unknown circuits
  _default: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M50,110 L38,78 Q32,60 44,48 L68,32 Q82,22 82,10 L118,10 Q130,10 134,22 L138,40 Q142,54 158,58 L172,62 Q180,66 178,78 L168,102 Q160,116 144,120 L80,126 Q60,126 50,110 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  </svg>`,
};

function getCircuitSVG(id) {
  return CIRCUIT_SVG[id] || CIRCUIT_SVG._default;
}
