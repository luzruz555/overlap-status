addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const p = url.searchParams;

  const d  = p.get('d')  || '2026.05.04';
  const t  = p.get('t')  || '23:47';
  const l  = p.get('l')  || '███시 ███구';
  const s  = p.get('s')  || 'h';
  const c  = p.get('c')  || '';
  const tn = p.get('tn') || '1';

  // 캐릭터 파싱 (최대 5명)
  const chars = c
    ? c.split('.').slice(0, 5).map(entry => {
        const parts = entry.split('_');
        return { name: parts[0] || '', emoji: parts[1] || '' };
      })
    : [];

  // 마야력 장기력 변환
  function toMaya(dateStr) {
    try {
      const parts = dateStr.split('.');
      const year  = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      const day   = parseInt(parts[2]);
      let y = year, m = month;
      if (m <= 2) { y -= 1; m += 12; }
      const A  = Math.floor(y / 100);
      const B  = 2 - A + Math.floor(A / 4);
      const JD = Math.floor(365.25 * (y + 4716))
               + Math.floor(30.6001 * (m + 1))
               + day + B - 1524.5;
      let days = Math.floor(JD) - 584283;
      const baktun = Math.floor(days / 144000); days %= 144000;
      const katun  = Math.floor(days / 7200);   days %= 7200;
      const tun    = Math.floor(days / 360);    days %= 360;
      const uinal  = Math.floor(days / 20);
      const kin    = days % 20;
      return `${baktun}.${katun}.${tun}.${uinal}.${kin}`;
    } catch(e) {
      return '??.??.??.??.??';
    }
  }

  const mayaDate  = toMaya(d);
  const isCryptid = s === 'c';

  // 상태별 색상
  const humanFill   = isCryptid ? '#2a2824' : '#6abf6a';
  const humanStatus = isCryptid ? 'DORMANT' : 'ACTIVE';
  const humanBar    = isCryptid ? '#2a2824' : '#4a9a4a';
  const humanBdr    = isCryptid ? '#2a2824' : '#4a9a4a';
  const humanBox    = isCryptid ? 'rgba(255,255,255,0.01)' : 'rgba(74,154,74,0.08)';
  const humanDot    = isCryptid ? '#2a2824' : '#4a9a4a';
  const cryptFill   = isCryptid ? '#e04040' : '#2a2824';
  const cryptStatus = isCryptid ? 'ACTIVE'  : 'DORMANT';
  const cryptBar    = isCryptid ? '#e04040' : '#2a2824';
  const cryptBdr    = isCryptid ? '#e04040' : '#2a2824';
  const cryptBox    = isCryptid ? 'rgba(220,60,60,0.09)' : 'rgba(255,255,255,0.01)';
  const cryptDot    = isCryptid ? '#e04040' : '#2a2824';
  const warnFill    = isCryptid ? 'rgba(220,60,60,0.12)' : 'rgba(220,60,60,0.04)';
  const warnText    = isCryptid ? '#e04040' : '#7a3a3a';
  const dotAnim     = isCryptid
    ? `<animate attributeName="opacity" values="1;0.1;1" dur="1.2s" repeatCount="indefinite"/>`
    : `<animate attributeName="opacity" values="1;0.3;1" dur="2.4s" repeatCount="indefinite"/>`;

  const esc = str => String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  // 높이 계산
  const hasChars = chars.length > 0;
  const charSecH = hasChars ? 18 + (chars.length * 24) + 8 : 0;
  const totalH   = 268 + (hasChars ? charSecH + 2 : 0);
  const cornerY  = totalH - 10;
  const bottomY  = totalH - 24;

  // 캐릭터 카드
  let charCards = '';
  if (hasChars) {
    const cardW = Math.min(78, Math.floor(390 / chars.length) - 4);
    chars.forEach((ch, i) => {
      const cx = 16 + i * (cardW + 5);
      const cy = 270;
      charCards += `
    <rect x="${cx}" y="${cy - 16}" width="${cardW}" height="21" fill="rgba(255,255,255,0.025)" rx="1"/>
    <rect x="${cx}" y="${cy - 16}" width="${cardW}" height="21" fill="none" stroke="#303030" stroke-width="0.6" rx="1"/>
    <text x="${cx + 4}" y="${cy - 1}" font-family="Courier New,monospace" font-size="11" fill="#e8e4d8">${esc(ch.emoji)}</text>
    <text x="${cx + 22}" y="${cy - 3}" font-family="Courier New,monospace" font-size="8.5" fill="#aaa49a">${esc(ch.name)}</text>`;
    });
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="460" height="${totalH}" viewBox="0 0 460 ${totalH}">
  <defs>
    <filter id="gr">
      <feGaussianBlur stdDeviation="2" result="b"/>
      <feComposite in="SourceGraphic" in2="b" operator="over"/>
    </filter>
    <filter id="gr2">
      <feGaussianBlur stdDeviation="1" result="b"/>
      <feComposite in="SourceGraphic" in2="b" operator="over"/>
    </filter>
    <linearGradient id="rl" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#c83c3c" stop-opacity="0"/>
      <stop offset="15%"  stop-color="#c83c3c" stop-opacity="1"/>
      <stop offset="85%"  stop-color="#c83c3c" stop-opacity="1"/>
      <stop offset="100%" stop-color="#c83c3c" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="og" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#d4a056" stop-opacity="0"/>
      <stop offset="20%"  stop-color="#d4a056" stop-opacity="0.6"/>
      <stop offset="80%"  stop-color="#d4a056" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#d4a056" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="pg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#5a8cd4" stop-opacity="0"/>
      <stop offset="20%"  stop-color="#5a8cd4" stop-opacity="0.6"/>
      <stop offset="80%"  stop-color="#5a8cd4" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#5a8cd4" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="cp">
      <rect x="0" y="0" width="460" height="${totalH}" rx="3"/>
    </clipPath>
  </defs>
  <g clip-path="url(#cp)">

    <!-- 배경 -->
    <rect width="460" height="${totalH}" fill="#080808"/>
    <rect x="1" y="1" width="458" height="${totalH - 2}" fill="none" stroke="#303028" stroke-width="1"/>
    <rect x="2" y="2" width="456" height="${totalH - 4}" fill="none" stroke="#1a1a18" stroke-width="0.5"/>

    <!-- 헤더 -->
    <rect x="1" y="1" width="458" height="36" fill="#0e0d0c"/>
    <rect x="1" y="37" width="458" height="1.5" fill="url(#rl)"/>

    <!-- 헤더 마킹 -->
    <rect x="14" y="11" width="3" height="15" fill="#e04040" filter="url(#gr)"/>
    <rect x="20" y="14" width="2" height="9"  fill="#e04040" opacity="0.5"/>

    <!-- 헤더 텍스트 -->
    <text x="30" y="25" font-family="Courier New,monospace" font-size="11" font-weight="700" fill="#e04040" letter-spacing="3" filter="url(#gr)">JRB</text>
    <text x="67" y="25" font-family="Courier New,monospace" font-size="9" fill="#4a4540" letter-spacing="2">FIELD STATUS REPORT</text>

    <!-- 헤더 우측 불빛들 -->
    <!-- REC 점 (빠른 깜빡) -->
    <circle cx="390" cy="19" r="4.5" fill="#1a0a0a"/>
    <circle cx="390" cy="19" r="2.5" fill="#e04040" filter="url(#gr)">
      <animate attributeName="opacity" values="1;0.15;1" dur="1.4s" repeatCount="indefinite"/>
    </circle>
    <text x="398" y="22" font-family="Courier New,monospace" font-size="7.5" fill="#6a3030" letter-spacing="1">REC</text>

    <!-- LIVE 점 (느린 깜빡) -->
    <circle cx="432" cy="19" r="4.5" fill="#0a1a0a"/>
    <circle cx="432" cy="19" r="2.5" fill="#4a9a4a" filter="url(#gr2)">
      <animate attributeName="opacity" values="0.9;0.2;0.9" dur="2.8s" repeatCount="indefinite"/>
    </circle>
    <text x="440" y="22" font-family="Courier New,monospace" font-size="7.5" fill="#2a5a2a">LVE</text>

    <!-- 날짜 섹션 (Ω / Ψ) -->
    <rect x="1" y="38" width="458" height="40" fill="#0b0a0a"/>
    <rect x="1" y="78" width="458" height="1" fill="#252320"/>

    <!-- Ω 좌측 -->
    <rect x="1" y="38" width="228" height="40" fill="rgba(212,160,86,0.05)"/>
    <rect x="1" y="79" width="228" height="1" fill="url(#og)"/>
    <text x="16" y="52" font-family="Courier New,monospace" font-size="7.5" fill="#d4a056" letter-spacing="2.5">&#937; OMEGA</text>
    <text x="16" y="70" font-family="Courier New,monospace" font-size="15" font-weight="700" fill="#f0ece0" letter-spacing="0.5">${esc(d)}</text>

    <!-- 날짜 구분선 -->
    <line x1="229" y1="38" x2="229" y2="78" stroke="#303028" stroke-width="1"/>

    <!-- Ψ 우측 -->
    <rect x="230" y="38" width="229" height="40" fill="rgba(90,140,212,0.05)"/>
    <rect x="230" y="79" width="229" height="1" fill="url(#pg)"/>
    <text x="244" y="52" font-family="Courier New,monospace" font-size="7.5" fill="#5a8cd4" letter-spacing="2.5">&#936; PSI</text>
    <text x="244" y="70" font-family="Courier New,monospace" font-size="15" font-weight="700" fill="#f0ece0" letter-spacing="0.5">${esc(mayaDate)}</text>

    <!-- 본문 수직 구분선 -->
    <line x1="230" y1="79" x2="230" y2="232" stroke="#252320" stroke-width="1"/>

    <!-- ===== 좌측: 시간 / 위치 ===== -->
    <text x="16" y="93" font-family="Courier New,monospace" font-size="7.5" fill="#4a4540" letter-spacing="2.5">TIME / LOCATION</text>
    <line x1="16" y1="96" x2="212" y2="96" stroke="#252320" stroke-width="0.6"/>

    <text x="16" y="116" font-family="Courier New,monospace" font-size="18" font-weight="700" fill="#f0ece0" letter-spacing="1">${esc(t)} KST</text>

    <!-- 위치 -->
    <text x="16" y="136" font-family="Courier New,monospace" font-size="7.5" fill="#4a4540" letter-spacing="2.5">LOCATION</text>
    <line x1="16" y1="139" x2="212" y2="139" stroke="#252320" stroke-width="0.6"/>

    <!-- 그리드 -->
    <rect x="16" y="145" width="196" height="48" fill="rgba(255,255,255,0.012)" rx="1"/>
    <line x1="16"  y1="157" x2="212" y2="157" stroke="#181614" stroke-width="0.5" stroke-dasharray="4,4"/>
    <line x1="16"  y1="169" x2="212" y2="169" stroke="#181614" stroke-width="0.5" stroke-dasharray="4,4"/>
    <line x1="16"  y1="181" x2="212" y2="181" stroke="#181614" stroke-width="0.5" stroke-dasharray="4,4"/>
    <line x1="62"  y1="145" x2="62"  y2="193" stroke="#181614" stroke-width="0.5" stroke-dasharray="4,4"/>
    <line x1="114" y1="145" x2="114" y2="193" stroke="#181614" stroke-width="0.5" stroke-dasharray="4,4"/>
    <line x1="164" y1="145" x2="164" y2="193" stroke="#181614" stroke-width="0.5" stroke-dasharray="4,4"/>

    <!-- 위치 마커 (깜빡이는 링) -->
    <circle cx="114" cy="169" r="8" fill="none" stroke="#e04040" stroke-width="0.6" opacity="0">
      <animate attributeName="r"       values="4;12;4"   dur="2.5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.5;0;0.5" dur="2.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="114" cy="169" r="2" fill="#e04040" filter="url(#gr)"/>
    <line x1="114" y1="145" x2="114" y2="193" stroke="#e04040" stroke-width="0.5" opacity="0.25"/>
    <line x1="16"  y1="169" x2="212" y2="169" stroke="#e04040" stroke-width="0.5" opacity="0.25"/>

    <!-- 위치 텍스트 -->
    <text x="16" y="212" font-family="Courier New,monospace" font-size="11" font-weight="700" fill="#f0ece0">${esc(l)}</text>

    <!-- ===== 우측: 크리쳐 상태 + 턴수 ===== -->
    <text x="244" y="93" font-family="Courier New,monospace" font-size="7.5" fill="#4a4540" letter-spacing="2.5">CRYPTID STATUS</text>
    <line x1="244" y1="96" x2="444" y2="96" stroke="#252320" stroke-width="0.6"/>

    <!-- HUMAN 박스 -->
    <rect x="244" y="103" width="90" height="52" fill="${humanBox}" rx="1"/>
    <rect x="244" y="103" width="90" height="52" fill="none" stroke="${humanBdr}" stroke-width="0.8" rx="1"/>
    <rect x="244" y="103" width="3"  height="52" fill="${humanBar}" rx="1"/>
    <text x="289" y="122" font-family="Courier New,monospace" font-size="8.5" font-weight="700" fill="${humanFill}" letter-spacing="1" text-anchor="middle">HUMAN</text>
    <text x="289" y="137" font-family="Courier New,monospace" font-size="7.5" fill="${humanFill}" letter-spacing="1" text-anchor="middle">${humanStatus}</text>
    <circle cx="289" cy="148" r="2.5" fill="${humanDot}">${isCryptid ? '' : dotAnim}</circle>

    <!-- CRYPTID 박스 -->
    <rect x="342" y="103" width="102" height="52" fill="${cryptBox}" rx="1"/>
    <rect x="342" y="103" width="102" height="52" fill="none" stroke="${cryptBdr}" stroke-width="0.8" rx="1"/>
    <rect x="342" y="103" width="3"   height="52" fill="${cryptBar}" rx="1"/>
    <text x="393" y="122" font-family="Courier New,monospace" font-size="8.5" font-weight="700" fill="${cryptFill}" letter-spacing="1" text-anchor="middle">CRYPTID</text>
    <text x="393" y="137" font-family="Courier New,monospace" font-size="7.5" fill="${cryptFill}" letter-spacing="1" text-anchor="middle">${cryptStatus}</text>
    <circle cx="393" cy="148" r="2.5" fill="${cryptDot}">${isCryptid ? dotAnim : ''}</circle>

    <!-- 경고 -->
    <rect x="244" y="163" width="200" height="18" fill="${warnFill}" rx="1"/>
    <rect x="244" y="163" width="200" height="18" fill="none" stroke="rgba(220,60,60,0.15)" stroke-width="0.6" rx="1"/>
    <rect x="244" y="163" width="3"   height="18" fill="#e04040" opacity="0.45" rx="1"/>
    <text x="253" y="175" font-family="Courier New,monospace" font-size="7" fill="${warnText}" letter-spacing="0.3">&#x203B; MONITOR SUBJECT &#x2014; DO NOT ENGAGE</text>

    <!-- 정보 -->
    <text x="244" y="198" font-family="Courier New,monospace" font-size="7.5" fill="#4a4540" letter-spacing="2.5">SUBJECT INFO</text>
    <line x1="244" y1="201" x2="444" y2="201" stroke="#252320" stroke-width="0.6"/>

    <text x="244" y="215" font-family="Courier New,monospace" font-size="8" fill="#4a4540">AUTH</text>
    <text x="284" y="215" font-family="Courier New,monospace" font-size="8" fill="#4a9a4a">GRANTED</text>

    <text x="244" y="228" font-family="Courier New,monospace" font-size="8" fill="#4a4540">DOC</text>
    <text x="284" y="228" font-family="Courier New,monospace" font-size="8" fill="#4a4540">JRB-CSF-REALTIME</text>

    <!-- ===== 턴수 섹션 ===== -->
    <rect x="1" y="232" width="458" height="1" fill="#252320"/>
    <rect x="1" y="233" width="458" height="30" fill="#0b0a0a"/>

    <!-- 턴 표시 좌측 -->
    <text x="16" y="244" font-family="Courier New,monospace" font-size="7.5" fill="#4a4540" letter-spacing="2.5">TURN</text>
    <line x1="16" y1="247" x2="80" y2="247" stroke="#252320" stroke-width="0.5"/>
    <text x="16" y="258" font-family="Courier New,monospace" font-size="14" font-weight="700" fill="#f0ece0" letter-spacing="1">T — ${esc(tn)}</text>

    <!-- 턴 구분선 -->
    <line x1="120" y1="234" x2="120" y2="262" stroke="#252320" stroke-width="0.8"/>

    <!-- 턴 우측: 불빛 인디케이터 바 -->
    <text x="132" y="244" font-family="Courier New,monospace" font-size="7" fill="#4a4540" letter-spacing="2">SYSTEM MONITOR</text>
    <!-- 인디케이터 점들 (깜빡이는 시간 차이) -->
    <circle cx="132" cy="255" r="3" fill="#4a9a4a">
      <animate attributeName="opacity" values="1;0.2;1" dur="1.1s" repeatCount="indefinite"/>
    </circle>
    <circle cx="143" cy="255" r="3" fill="#4a9a4a">
      <animate attributeName="opacity" values="1;0.2;1" dur="1.1s" begin="0.15s" repeatCount="indefinite"/>
    </circle>
    <circle cx="154" cy="255" r="3" fill="#4a9a4a">
      <animate attributeName="opacity" values="1;0.2;1" dur="1.1s" begin="0.3s" repeatCount="indefinite"/>
    </circle>
    <circle cx="165" cy="255" r="3" fill="#d4a056">
      <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2.2s" begin="0.1s" repeatCount="indefinite"/>
    </circle>
    <circle cx="176" cy="255" r="3" fill="#d4a056">
      <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2.2s" begin="0.4s" repeatCount="indefinite"/>
    </circle>
    <circle cx="187" cy="255" r="3" fill="#5a8cd4">
      <animate attributeName="opacity" values="0.7;0.1;0.7" dur="3.3s" begin="0.2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="198" cy="255" r="3" fill="#5a8cd4">
      <animate attributeName="opacity" values="0.7;0.1;0.7" dur="3.3s" begin="0.7s" repeatCount="indefinite"/>
    </circle>
    <circle cx="209" cy="255" r="3" fill="#e04040">
      <animate attributeName="opacity" values="1;0.1;1" dur="1.6s" begin="0.5s" repeatCount="indefinite"/>
    </circle>

    <!-- 캐릭터 섹션 -->
    ${hasChars ? `
    <rect x="1" y="263" width="458" height="1" fill="#1e1c1a"/>
    <rect x="1" y="264" width="458" height="${charSecH}" fill="#0a0909"/>
    <text x="16" y="278" font-family="Courier New,monospace" font-size="7.5" fill="#4a4540" letter-spacing="2.5">WITH SUBJECT</text>
    <line x1="16" y1="281" x2="444" y2="281" stroke="#252320" stroke-width="0.5"/>
    ${charCards}
    <rect x="1" y="${bottomY - 1}" width="458" height="1"  fill="#1e1c1a"/>
    <rect x="1" y="${bottomY}"     width="458" height="23" fill="#090808"/>
    <text x="16" y="${bottomY + 13}" font-family="Courier New,monospace" font-size="6.5" fill="#1e1c1a">JRB-CSF-REALTIME</text>
    <circle cx="380" cy="${bottomY + 10}" r="2.5" fill="#3a6a3a">
      <animate attributeName="opacity" values="0.8;0.2;0.8" dur="3s" repeatCount="indefinite"/>
    </circle>
    <text x="386" y="${bottomY + 13}" font-family="Courier New,monospace" font-size="6.5" fill="#2a4a2a">ONLINE</text>
    ` : `
    <rect x="1" y="263" width="458" height="1"  fill="#1e1c1a"/>
    <rect x="1" y="264" width="458" height="23" fill="#090808"/>
    <text x="16" y="277" font-family="Courier New,monospace" font-size="6.5" fill="#1e1c1a">JRB-CSF-REALTIME</text>
    <text x="16" y="280" font-family="Courier New,monospace" font-size="6" fill="#161412">&#937; &#8745; &#936;  JOINT RESPONSE BUREAU</text>
    <circle cx="380" cy="274" r="2.5" fill="#3a6a3a">
      <animate attributeName="opacity" values="0.8;0.2;0.8" dur="3s" repeatCount="indefinite"/>
    </circle>
    <text x="386" y="277" font-family="Courier New,monospace" font-size="6.5" fill="#2a4a2a">ONLINE</text>
    `}

    <!-- 코너 장식 -->
    <polyline points="1,12 1,1 12,1"        fill="none" stroke="#e04040" stroke-width="1.5" opacity="0.6"/>
    <polyline points="459,12 459,1 448,1"    fill="none" stroke="#e04040" stroke-width="1.5" opacity="0.6"/>
    <polyline points="1,${cornerY} 1,${totalH - 1} 12,${totalH - 1}"       fill="none" stroke="#252320" stroke-width="1.5"/>
    <polyline points="459,${cornerY} 459,${totalH - 1} 448,${totalH - 1}"  fill="none" stroke="#252320" stroke-width="1.5"/>

  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    }
  });
}
