// import { ImageResponse } from 'next/og'

// export const runtime = 'nodejs';
// // export const runtime = 'edge'
// export const alt = 'IRONMAN Laundry'
// export const size = { width: 32, height: 32 }
// export const contentType = 'image/png'

// export default async function Icon() {
//   // 1. Fetch your logo from your public folder
//   // We use a try/catch and a fallback to ensure it doesn't break
//   const logoData = await fetch(
//     new URL('../public/Ironman-logo.png', import.meta.url)
//   ).then((res) => res.arrayBuffer())

//   return new ImageResponse(
//     (
//       <div
//         style={{
//           width: '100%',
//           height: '100%',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           background: 'white', // FORCES WHITE BACKGROUND
//           borderRadius: '20%', // PREMIUM ROUNDED LOOK
//           position: 'relative',
//         }}
//       >
//         {/* We place the logo on top of the white background */}
//         <img
//           src={logoData as any}
//           style={{
//             width: '80%',
//             height: '80%',
//             objectFit: 'contain',
//           }}
//         />
//       </div>
//     ),
//     { ...size }
//   )
// }