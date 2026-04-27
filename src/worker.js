addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const p = url.searchParams;

  const d = p.get('d') || '2026.05.04';
  const t = p.get('t') || '23:47';
  const l = p.get('l') || '███시 ███구';
  const s = p.get('s') || 'h';
  const c = p.get('c') || '';

  // 캐릭터 파싱 (최대 5명, 형식: 이름_이모지.이름_이모지)
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

  const humanFill   = isCryptid ? '#1a1816' : '#6a9a6a';
  const humanStatus = isCryptid ? 'DORMANT' : 'ACTIVE';
  const humanBar    = isCryptid ? '#252220' : '#4a7a4a';
  const humanBdr    = isCryptid ? '#252220' : '#4a7a4a';
  const humanBox    = isCryptid ? 'rgba(255,255,255,0.01)' : 'rgba(74,122,74,0.07)';
  const humanDot    = isCryptid ? '#1a1816' : '#4a7a4a';
  const cryptFill   = isCryptid ? '#c83c3c' : '#1a1816';
  const cryptStatus = isCryptid ? 'ACTIVE'  : 'DORMANT';
  const cryptBar    = isCryptid ? '#c83c3c' : '#252220';
  const cryptBdr    = isCryptid ? '#c83c3c' : '#252220';
  const cryptBox    = isCryptid ? 'rgba(200,60,60,0.07)' : 'rgba(255,255,255,0.01)';
  const cryptDot    = isCryptid ? '#c83c3c' : '#1a1816';
  const warnFill    = isCryptid ? 'rgba(200,60,60,0.1)' : 'rgba(200,60,60,0.04)';
  const warnText    = isCryptid ? '#c83c3c' : '#6a3030';

  const esc = str => String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  // 높이 계산
  const hasChars   = chars.length > 0;
  const charSecH   = hasChars ? 16 + (chars.length * 22) + 8 : 0;
  const totalH     = 250 + (hasChars ? charSecH + 2 : 0);
  const cornerY    = totalH - 10;
  const bottomBarY = totalH - 23;

  // 캐릭터 카드들
  let charCards = '';
  if (hasChars) {
    const cardW = Math.min(78, Math.floor(390 / chars.length) - 4);
    chars.forEach((ch, i) => {
      const cx = 16 + i * (cardW + 5);
      const cy = 252 + 16;
      charCards += `
    <rect x="${cx}" y="${cy - 15}" width="${cardW}" height="19" fill="rgba(255,255,255,0.02)" rx="1"/>
    <rect x="${cx}" y="${cy - 15}" width="${cardW}" height="19" fill="none" stroke="#252220" stroke-width="0.5" rx="1"/>
    <text x="${cx + 4}" y="${cy - 2}" font-family="Courier New,monospace" font-size="10" fill="#e8e4d8">${esc(ch.emoji)}</text>
    <text x="${cx + 20}" y="${cy - 3}" font-family="Courier New,monospace" font-size="7.5" fill="#9a9488">${esc(ch.name)}</text>`;
    });
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="${totalH}" viewBox="0 0 420 ${totalH}">
  <defs>
    <filter id="gr">
      <feGaussianBlur stdDeviation="1.5" result="b"/>
      <feComposite in="SourceGraphic" in2="b" operator="over"/>
    </filter>
    <linearGradient id="rl" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#c83c3c" stop-opacity="0"/>
      <stop offset="20%"  stop-color="#c83c3c" stop-opacity="1"/>
      <stop offset="80%"  stop-color="#c83c3c" stop-opacity="1"/>
      <stop offset="100%" stop-color="#c83c3c" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="cp">
      <rect x="0" y="0" width="420" height="${totalH}" rx="2"/>
    </clipPath>
  </defs>
  <g clip-path="url(#cp)">

    <!-- 배경 -->
    <rect width="420" height="${totalH}" fill="#0a0a0a"/>
    <rect x="1" y="1" width="418" height="${totalH - 2}" fill="none" stroke="#2a2824" stroke-width="1"/>

    <!-- 헤더 -->
    <rect x="1" y="1" width="418" height="32" fill="#0d0c0c"/>
    <rect x="1" y="33" width="418" height="1" fill="url(#rl)"/>
    <rect x="12" y="10" width="3" height="13" fill="#c83c3c" filter="url(#gr)"/>
    <rect x="18" y="13" width="2" height="7"  fill="#c83c3c" opacity="0.4"/>
    <text x="27" y="22" font-family="Courier New,monospace" font-size="10" font-weight="700" fill="#c83c3c" letter-spacing="3" filter="url(#gr)">JRB</text>
    <text x="60" y="22" font-family="Courier New,monospace" font-size="8.5" fill="#3a3530" letter-spacing="2">FIELD STATUS REPORT</text>
    <circle cx="392" cy="17" r="4" fill="#150e0e"/>
    <circle cx="392" cy="17" r="2" fill="#c83c3c" filter="url(#gr)"/>
    <text x="399" y="20" font-family="Courier New,monospace" font-size="7" fill="#5a3030">REC</text>

    <!-- 날짜 섹션 (Ω / Ψ) -->
    <rect x="1" y="34" width="418" height="36" fill="#0c0b0b"/>
    <rect x="1" y="70" width="418" height="1" fill="#222020"/>
    <rect x="1"   y="34" width="208" height="36" fill="rgba(212,160,86,0.04)"/>
    <text x="14"  y="47" font-family="Courier New,monospace" font-size="7" fill="#d4a056" letter-spacing="2">&#937; OMEGA</text>
    <text x="14"  y="63" font-family="Courier New,monospace" font-size="13" font-weight="700" fill="#e8e4d8" letter-spacing="0.5">${esc(d)}</text>
    <line x1="209" y1="34" x2="209" y2="70" stroke="#2a2824" stroke-width="1"/>
    <rect x="210" y="34" width="209" height="36" fill="rgba(90,140,212,0.04)"/>
    <text x="222" y="47" font-family="Courier New,monospace" font-size="7" fill="#5a8cd4" letter-spacing="2">&#936; PSI</text>
    <text x="222" y="63" font-family="Courier New,monospace" font-size="13" font-weight="700" fill="#e8e4d8" letter-spacing="0.5">${esc(mayaDate)}</text>

    <!-- 본문 수직 구분선 -->
    <line x1="210" y1="71" x2="210" y2="216" stroke="#222020" stroke-width="1"/>

    <!-- 좌측: 시간 -->
    <text x="16" y="84" font-family="Courier New,monospace" font-size="7" fill="#3a3530" letter-spacing="2">TIME / LOCATION</text>
    <line x1="16" y1="87" x2="194" y2="87" stroke="#222020" stroke-width="0.5"/>
    <text x="16" y="103" font-family="Courier New,monospace" font-size="16" font-weight="700" fill="#e8e4d8" letter-spacing="1">${esc(t)} KST</text>

    <!-- 좌측: 위치 그리드 -->
    <text x="16" y="125" font-family="Courier New,monospace" font-size="7" fill="#3a3530" letter-spacing="2">LOCATION</text>
    <line x1="16" y1="128" x2="194" y2="128" stroke="#222020" stroke-width="0.5"/>
    <rect x="16" y="134" width="178" height="44" fill="rgba(255,255,255,0.01)" rx="1"/>
    <line x1="16"  y1="145" x2="194" y2="145" stroke="#161412" stroke-width="0.5" stroke-dasharray="4,4"/>
    <line x1="16"  y1="156" x2="194" y2="156" stroke="#161412" stroke-width="0.5" stroke-dasharray="4,4"/>
    <line x1="16"  y1="167" x2="194" y2="167" stroke="#161412" stroke-width="0.5" stroke-dasharray="4,4"/>
    <line x1="60"  y1="134" x2="60"  y2="178" stroke="#161412" stroke-width="0.5" stroke-dasharray="4,4"/>
    <line x1="105" y1="134" x2="105" y2="178" stroke="#161412" stroke-width="0.5" stroke-dasharray="4,4"/>
    <line x1="150" y1="134" x2="150" y2="178" stroke="#161412" stroke-width="0.5" stroke-dasharray="4,4"/>
    <circle cx="105" cy="156" r="1.5" fill="#c83c3c" filter="url(#gr)"/>
    <line x1="105" y1="134" x2="105" y2="178" stroke="#c83c3c" stroke-width="0.4" opacity="0.2"/>
    <line x1="16"  y1="156" x2="194" y2="156" stroke="#c83c3c" stroke-width="0.4" opacity="0.2"/>
    <text x="16" y="196" font-family="Courier New,monospace" font-size="10" font-weight="700" fill="#e8e4d8">${esc(l)}</text>

    <!-- 우측: 크리쳐 상태 -->
    <text x="222" y="84" font-family="Courier New,monospace" font-size="7" fill="#3a3530" letter-spacing="2">CRYPTID STATUS</text>
    <line x1="222" y1="87" x2="406" y2="87" stroke="#222020" stroke-width="0.5"/>
    <rect x="222" y="94"  width="84" height="48" fill="${humanBox}" rx="1"/>
    <rect x="222" y="94"  width="84" height="48" fill="none" stroke="${humanBdr}" stroke-width="0.8" rx="1"/>
    <rect x="222" y="94"  width="3"  height="48" fill="${humanBar}" rx="1"/>
    <text x="264" y="112" font-family="Courier New,monospace" font-size="8" font-weight="700" fill="${humanFill}" letter-spacing="1" text-anchor="middle">HUMAN</text>
    <text x="264" y="126" font-family="Courier New,monospace" font-size="7" fill="${humanFill}" letter-spacing="1" text-anchor="middle">${humanStatus}</text>
    <circle cx="264" cy="135" r="2" fill="${humanDot}"/>
    <rect x="314" y="94"  width="92" height="48" fill="${cryptBox}" rx="1"/>
    <rect x="314" y="94"  width="92" height="48" fill="none" stroke="${cryptBdr}" stroke-width="0.8" rx="1"/>
    <rect x="314" y="94"  width="3"  height="48" fill="${cryptBar}" rx="1"/>
    <text x="360" y="112" font-family="Courier New,monospace" font-size="8" font-weight="700" fill="${cryptFill}" letter-spacing="1" text-anchor="middle">CRYPTID</text>
    <text x="360" y="126" font-family="Courier New,monospace" font-size="7" fill="${cryptFill}" letter-spacing="1" text-anchor="middle">${cryptStatus}</text>
    <circle cx="360" cy="135" r="2" fill="${cryptDot}"/>

    <!-- 경고 -->
    <rect x="222" y="150" width="184" height="16" fill="${warnFill}" rx="1"/>
    <rect x="222" y="150" width="184" height="16" fill="none" stroke="rgba(200,60,60,0.1)" stroke-width="0.5" rx="1"/>
    <rect x="222" y="150" width="3"   height="16" fill="#c83c3c" opacity="0.35" rx="1"/>
    <text x="231" y="161" font-family="Courier New,monospace" font-size="6.5" fill="${warnText}">&#x203B; MONITOR SUBJECT &#x2014; DO NOT ENGAGE</text>

    <!-- 정보 -->
    <text x="222" y="182" font-family="Courier New,monospace" font-size="7" fill="#3a3530" letter-spacing="2">SUBJECT INFO</text>
    <line x1="222" y1="185" x2="406" y2="185" stroke="#222020" stroke-width="0.5"/>
    <text x="222" y="198" font-family="Courier New,monospace" font-size="7.5" fill="#3a3530">AUTH</text>
    <text x="258" y="198" font-family="Courier New,monospace" font-size="7.5" fill="#4a7a4a">GRANTED</text>
    <text x="222" y="210" font-family="Courier New,monospace" font-size="7.5" fill="#3a3530">DOC</text>
    <text x="258" y="210" font-family="Courier New,monospace" font-size="7.5" fill="#3a3530">JRB-CSF-REALTIME</text>

    <!-- 캐릭터 섹션 -->
    ${hasChars ? `
    <rect x="1" y="220" width="418" height="1" fill="#1e1c1a"/>
    <rect x="1" y="221" width="418" height="${charSecH}" fill="#0b0a0a"/>
    <text x="16" y="235" font-family="Courier New,monospace" font-size="7" fill="#3a3530" letter-spacing="2">WITH SUBJECT</text>
    <line x1="16" y1="238" x2="404" y2="238" stroke="#222020" stroke-width="0.5"/>
    ${charCards}
    ` : `
    <rect x="1" y="220" width="418" height="1"  fill="#1e1c1a"/>
    <rect x="1" y="221" width="418" height="28" fill="#090808"/>
    <text x="16" y="233" font-family="Courier New,monospace" font-size="6.5" fill="#1e1c1a">JRB-CSF-REALTIME</text>
    <text x="16" y="243" font-family="Courier New,monospace" font-size="6.5" fill="#161412">&#937; &#8745; &#936;  JOINT RESPONSE BUREAU</text>
    <circle cx="346" cy="233" r="2.5" fill="#3a6a3a"/>
    <text x="352" y="236" font-family="Courier New,monospace" font-size="6.5" fill="#2a4a2a">ONLINE</text>
    `}

    <!-- 캐릭터 있을 때 하단 바 -->
    ${hasChars ? `
    <rect x="1" y="${bottomBarY - 1}" width="418" height="1"  fill="#1e1c1a"/>
    <rect x="1" y="${bottomBarY}"     width="418" height="22" fill="#090808"/>
    <text x="16" y="${bottomBarY + 12}" font-family="Courier New,monospace" font-size="6.5" fill="#1e1c1a">JRB-CSF-REALTIME</text>
    <circle cx="346" cy="${bottomBarY + 10}" r="2.5" fill="#3a6a3a"/>
    <text x="352"  y="${bottomBarY + 13}" font-family="Courier New,monospace" font-size="6.5" fill="#2a4a2a">ONLINE</text>
    ` : ''}

    <!-- 코너 -->
    <polyline points="1,10 1,1 10,1"       fill="none" stroke="#c83c3c" stroke-width="1.2" opacity="0.5"/>
    <polyline points="419,10 419,1 410,1"   fill="none" stroke="#c83c3c" stroke-width="1.2" opacity="0.5"/>
    <polyline points="1,${cornerY} 1,${totalH - 1} 10,${totalH - 1}"        fill="none" stroke="#222020" stroke-width="1.2"/>
    <polyline points="419,${cornerY} 419,${totalH - 1} 410,${totalH - 1}"   fill="none" stroke="#222020" stroke-width="1.2"/>

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
