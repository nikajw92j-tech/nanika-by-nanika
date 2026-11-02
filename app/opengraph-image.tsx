import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Nanika by Nanika — Made in Georgia';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Facebook / Messenger გაზიარების preview — ბრენდის ბირკის სტილში */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F8F4EF',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '70px 120px',
            background: '#1E1A17',
            color: '#F8F4EF',
            border: '2px dashed #B8956A',
          }}
        >
          <div style={{ fontSize: 130, letterSpacing: 26, lineHeight: 1 }}>NANIKA</div>
          <div style={{ marginTop: 28, fontSize: 26, letterSpacing: 12, color: '#C9A29B' }}>MADE IN GEORGIA</div>
        </div>
        <div style={{ marginTop: 40, fontSize: 30, color: '#1E1A17', letterSpacing: 2 }}>
          Custom tailoring · Your style · Your size · Your design
        </div>
      </div>
    ),
    size,
  );
}
