import React from 'react';

interface CrestProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showTitle?: boolean;
  className?: string;
}

export const Crest: React.FC<CrestProps> = ({ size = 'md', showTitle = true, className = '' }) => {
  const dimensions = {
    sm: { width: 50, height: 60, text: 'text-xs' },
    md: { width: 90, height: 110, text: 'text-sm' },
    lg: { width: 140, height: 170, text: 'text-base' },
    xl: { width: 200, height: 240, text: 'text-xl' },
    hero: { width: 280, height: 340, text: 'text-2xl' }
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 280 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-md transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="shieldGrad" x1="140" y1="10" x2="140" y2="330" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0B5D34" />
            <stop offset="0.6" stopColor="#064E28" />
            <stop offset="1" stopColor="#03351A" />
          </linearGradient>
          <linearGradient id="goldBorder" x1="20" y1="10" x2="260" y2="330" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FCD34D" />
            <stop offset="0.4" stopColor="#F59E0B" />
            <stop offset="0.8" stopColor="#D97706" />
            <stop offset="1" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="creamField" x1="140" y1="30" x2="140" y2="240" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFDF0" />
            <stop offset="1" stopColor="#FEF3C7" />
          </linearGradient>
          <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Outer Shield with Traditional Shoulders and Pointed Base */}
        <path
          d="M 140 12 
             C 195 12, 252 24, 258 56 
             C 264 125, 260 185, 218 245 
             C 186 290, 155 318, 140 330 
             C 125 318, 94 290, 62 245 
             C 20 185, 16 125, 22 56 
             C 28 24, 85 12, 140 12 Z"
          fill="url(#goldBorder)"
          stroke="#78350F"
          strokeWidth="3"
        />

        {/* Inner Shield Body */}
        <path
          d="M 140 20 
             C 190 20, 240 31, 246 59 
             C 251 120, 247 175, 209 232 
             C 180 273, 152 300, 140 310 
             C 128 300, 100 273, 71 232 
             C 33 175, 29 120, 34 59 
             C 40 31, 90 20, 140 20 Z"
          fill="url(#shieldGrad)"
          stroke="#FDE68A"
          strokeWidth="2"
        />

        {/* Upper Decorative Crest Panel / Cream Background for Mascot */}
        <path
          d="M 140 32
             C 180 32, 224 42, 228 64
             C 231 110, 224 150, 196 186
             C 174 214, 150 226, 140 230
             C 130 226, 106 214, 84 186
             C 56 150, 49 110, 52 64
             C 56 42, 100 32, 140 32 Z"
          fill="url(#creamField)"
          stroke="#D97706"
          strokeWidth="2"
        />

        {/* Laurel Wreath Accents inside shield */}
        <g opacity="0.6">
          <path d="M 68 150 C 62 130, 65 105, 78 88" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 212 150 C 218 130, 215 105, 202 88" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="70" cy="115" r="3" fill="#D97706" />
          <circle cx="76" cy="138" r="3" fill="#D97706" />
          <circle cx="210" cy="115" r="3" fill="#D97706" />
          <circle cx="204" cy="138" r="3" fill="#D97706" />
        </g>

        {/* ----------------- MASCOT: CARTOON GRADUATE WITH MOUSTACHE ----------------- */}
        <g id="mascot-graduate">
          {/* Academic Gown Robe Shoulders */}
          <path
            d="M 94 180 
               C 94 152, 114 142, 140 142 
               C 166 142, 186 152, 186 180 
               L 182 208 
               C 165 214, 115 214, 98 208 Z"
            fill="#1E293B"
            stroke="#0F172A"
            strokeWidth="2"
          />

          {/* Gown Gold Stole / Sash */}
          <path d="M 124 142 L 128 204 L 138 205 L 134 142 Z" fill="#F59E0B" />
          <path d="M 156 142 L 152 204 L 142 205 L 146 142 Z" fill="#F59E0B" />

          {/* White Shirt Collar & Red Bowtie */}
          <path d="M 132 142 L 140 152 L 148 142 Z" fill="#FFFFFF" />
          <polygon points="135,150 145,150 148,157 140,153 132,157" fill="#DC2626" />

          {/* Cheerful Stylized Cartoon Head */}
          <ellipse cx="140" cy="112" rx="30" ry="32" fill="#E2A774" stroke="#8D5B34" strokeWidth="2" />
          
          {/* Friendly Rosy Cheeks */}
          <ellipse cx="120" cy="118" rx="5" ry="3.5" fill="#DC7D68" opacity="0.5" />
          <ellipse cx="160" cy="118" rx="5" ry="3.5" fill="#DC7D68" opacity="0.5" />

          {/* Friendly Cartoon Eyes */}
          <ellipse cx="127" cy="106" rx="4.5" ry="6" fill="#1E293B" />
          <ellipse cx="153" cy="106" rx="4.5" ry="6" fill="#1E293B" />
          {/* Eye Sparkles */}
          <circle cx="128.5" cy="104" r="1.5" fill="#FFFFFF" />
          <circle cx="154.5" cy="104" r="1.5" fill="#FFFFFF" />

          {/* Cheerful Eyebrows */}
          <path d="M 120 97 Q 128 92 135 96" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 145 96 Q 152 92 160 97" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Button Nose */}
          <circle cx="140" cy="114" r="3.5" fill="#B45309" opacity="0.7" />

          {/* MAGNIFICENT DISTINCTIVE WHITE/CREAM HANDLEBAR MOUSTACHE */}
          <path
            d="M 140 119
               C 134 115, 120 114, 110 120
               C 99 126, 96 136, 102 138
               C 108 140, 116 132, 126 128
               C 133 125, 137 127, 140 131
               C 143 127, 147 125, 154 128
               C 164 132, 172 140, 178 138
               C 184 136, 181 126, 170 120
               C 160 114, 146 115, 140 119 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.8"
            filter="url(#shadow)"
          />

          {/* GRADUATION CAP (MORTARBOARD) */}
          {/* Skull cap part */}
          <path d="M 120 86 Q 140 80 160 86 L 163 94 Q 140 98 117 94 Z" fill="#0F172A" />
          {/* Diamond Mortarboard Top */}
          <polygon
            points="140,55 194,72 140,88 86,72"
            fill="#1E293B"
            stroke="#F59E0B"
            strokeWidth="2.5"
          />
          {/* Cap Button */}
          <circle cx="140" cy="72" r="4.5" fill="#FCD34D" stroke="#D97706" strokeWidth="1" />
          {/* Gold Tassel Swinging to the side */}
          <path
            d="M 140 72 
               C 148 76, 172 82, 176 95 
               C 178 103, 178 116, 177 124"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Tassel Fringe */}
          <polygon points="174,124 180,124 182,135 172,135" fill="#D97706" />
        </g>

        {/* ----------------- LOWER UNIVERSITY BANNER SCROLL ----------------- */}
        <g id="university-scroll">
          {/* Banner Shadow */}
          <path
            d="M 38 238 L 242 238 L 234 278 L 46 278 Z"
            fill="#78350F"
            opacity="0.3"
          />
          {/* Main Gold Banner */}
          <path
            d="M 34 235 
               C 85 240, 195 240, 246 235 
               L 238 274 
               C 192 280, 88 280, 42 274 Z"
            fill="url(#goldBorder)"
            stroke="#78350F"
            strokeWidth="2"
          />
          {/* Ribbon Ends */}
          <polygon points="34,235 20,250 38,266 38,252" fill="#B45309" stroke="#78350F" />
          <polygon points="246,235 260,250 242,266 242,252" fill="#B45309" stroke="#78350F" />

          {/* University Name Text */}
          <text
            x="140"
            y="254"
            fontFamily="'Cabinet Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif"
            fontWeight="900"
            fontSize="12.5"
            letterSpacing="0.8"
            fill="#1E293B"
            textAnchor="middle"
          >
            FEDERAL UNIVERSITY OF OMO
          </text>
          <text
            x="140"
            y="269"
            fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
            fontWeight="700"
            fontSize="8.5"
            letterSpacing="1.8"
            fill="#78350F"
            textAnchor="middle"
          >
            CENTRAL ABUJA • FCT
          </text>
        </g>

        {/* Latin / National Motto at Base of Shield */}
        <text
          x="140"
          y="298"
          fontFamily="'Plus Jakarta Sans', serif"
          fontWeight="800"
          fontSize="9"
          letterSpacing="1.2"
          fill="#FDE68A"
          textAnchor="middle"
        >
          EXCELLENCE & DIGNITY
        </text>
      </svg>

      {showTitle && (
        <div className="text-center mt-2">
          <h1 className="font-black tracking-wider text-emerald-950 font-serif leading-none drop-shadow-sm flex items-center justify-center gap-1.5">
            <span className="text-amber-500">★</span>
            <span className="text-2xl sm:text-3xl tracking-tight uppercase bg-gradient-to-r from-emerald-900 via-green-700 to-emerald-950 bg-clip-text text-transparent">
              UNDERGRAD
            </span>
            <span className="text-amber-500">★</span>
          </h1>
          <p className="text-[11px] font-semibold tracking-widest text-emerald-800 uppercase mt-0.5">
            Federal University of Omo
          </p>
        </div>
      )}
    </div>
  );
};
