# 1975.lol

Portofolio web **Fema Andara Haqi**. Dibangun dengan Next.js 14 (App Router) + React 18 + OGL (WebGL).

---

## 1. Peta Struktur File

```
app/
  layout.tsx              → metadata SEO, favicon, manifest (tidak ada styling visual)
  page.tsx                → halaman utama: susun lapisan (ripple, intro, konten)
  globals.css             → style dasar + .frame (container rounded) + .pill (tombol)
  RawSketchBackground.tsx → EFEK RIPPLE (WebGL/OGL shader). Fokus utama.
  PixelIntro.tsx          → animasi pixel "1975" saat pertama buka
public/
  audio/about-you.mp3     → musik (opsional, belum dipakai)
  icon-*.png, favicon.ico → favicon
  manifest.webmanifest    → PWA
```

---

## 2. Alur Elemen (urutan tumpukan / z-index)

Dari **belakang** ke **depan**:

```
main                      → warna latar LUAR frame (outerBg)
 └ .frame                 → container rounded, gap dari tepi (warna = frameFill)
    ├ RawSketchBackground  z-index 2   → EFEK RIPPLE (selalu hidup)
    ├ PixelIntro           z-index 3   → angka pixel 1975 (hanya saat intro)
    └ konten utama         z-index 10  → teks RAW/Sketch, header, footer
```

**Lapisan warna saat intro:**

| Lapisan            | Warna                      | Kenapa                         |
| ------------------ | -------------------------- | ------------------------------ |
| Luar frame         | putih `#f4f2ed`            | biar rounded corner kelihatan  |
| Isi frame          | hitam `#0a0a0c`            | biar pixel putih glow kontras  |
| Angka 1975         | pixel putih / RGB          | animasi intro                  |
| Ripple             | kertas **tembus** + garis  | angka tembus & kena garis ink  |

**Lapisan warna setelah intro:** `outerBg` mengikuti tema (light=hitam, dark=putih), kertas ripple jadi penuh.

---

## 3. Cara Mengubah Setting (Quick Reference)

### Warna & tema

| Yang diubah                        | File        | Baris / kunci                                            |
| ----------------------------------- | ----------- | -------------------------------------------------------- |
| Warna luar frame (rounded)          | `page.tsx`  | `const outerBg = ...`                                     |
| Warna isi frame saat intro          | `page.tsx`  | `const frameFill = ...`                                   |
| Palet kertas & ink ripple           | `RawSketchBackground.tsx` | fungsi `main()` → `paper`, `ink`, `hatchCol` |
| Gap & radius rounded frame          | `globals.css` | `.frame` → `inset`, `border-radius`                     |
| Tema light/dark (toggle)            | `page.tsx`  | `useState(dark)` + `toggle()`                             |

### Ukuran & posisi frame

Buka **`app/globals.css`**, pada `.frame`:

```css
.frame {
  top: calc(6px + env(safe-area-inset-top, 0px));    /* gap atas HP */
  right: calc(6px + env(safe-area-inset-right, 0px));
  bottom: max(calc(6px + env(safe-area-inset-bottom, 0px)), 18px);
  left: calc(6px + env(safe-area-inset-left, 0px));
  border-radius: 16px;                                /* sudut rounded HP */
}

@media (min-width: 768px) {
  .frame { inset/radius versi desktop -> 10px / 22px }
}
```

- Ganti angka `6px` (HP) dan `10px` (desktop) untuk mengatur ketebalan gap.
- Ganti `border-radius` untuk proporsi sudut.

---

## 4. FOKUS: Efek Ripple Background

File: **`app/RawSketchBackground.tsx`**. Terdiri dari shader GLSL (`FRAG`) + setup OGL.

### 4.1 Apa yang terjadi

Shader menghasilkan **tekstur ink/sketsa** dari noise (Domain Warping + FBM), lalu digambar sebagai lapisan transparan di dalam frame. Ada 3 jenis "gerakan":

1. **Kilau kursor** — distorsi lokal tempat mouse menyentuh.
2. **Ripple latar** — gelombang sinus pelan yang mengalun di seluruh layar.
3. **Aliran ink** — noise FBM yang bergerak seiring waktu.

### 4.2 Mengubah RIPPLE (gelombang latar)

Cari di dalam `FRAG`, bagian `warp()`:

```glsl
// Ripple gelombang global di background
float bgRipple = sin(length(st) * 0.28 - uTime * 0.12)
               + 0.35 * sin(dot(st, vec2(0.18, 0.12)) - uTime * 0.08);
q += bgRipple * 0.025;
```

| Mau apa       | Ubah angka                                                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Lebih ramai   | naikkan `0.28` (frekuensi) dan `0.025` (kekuatan)                                                                                           |
| Lebih kalem   | turunkan keduanya (mis. `0.18` & `0.015`)                                                                                                   |
| Lebih cepat   | naikkan `0.12` dan `0.08` (kecepatan waktu)                                                                                                 |
| Lebih lambat  | turunkan `0.12` & `0.08`                                                                                                                    |

> Catatan: `q += bgRipple * 0.025;` = seberapa besar ripple mengacak bentuk ink. `0` = tanpa ripple. `0.05` ke atas = mulai liar.

### 4.3 Mengubah KILAU KURSOR

```glsl
vec2 mouseDist = st - uMouse * 3.0;
float distFactor = smoothstep(0.18, 0.0, length(mouseDist));  // 0.18 = radius
q += distFactor * uVelocity * 0.5;                            // 0.5 = kekuatan
```

- `0.18` → radius lingkaran kursor (makin besar = makin luas).
- `0.5` → kekuatan distorsi.
- `uMouse * 3.0` harus cocok dengan `warp(st * 3.0)` di bawahnya — jangan diubah sendirian.

Interaksi mouse dihitung di JS (bukan shader). Cari:

```ts
velocity += 45 * d * (dt / 16.7);       // sensitivitas gerak mouse
velocity *= Math.pow(0.94, dt / 16.7);  // redaman (makin kecil = cepat berhenti)
```

### 4.4 Mengubah KERAPATAN & BENTUK GARIS INK

```glsl
float lines  = sin(pattern * 20.0 + uTime * 0.5);   // 20.0 = jumlah garis
float stroke = smoothstep(0.4, 0.5, lines) - smoothstep(0.5, 0.6, lines);
```

- `20.0` → makin besar = garis makin rapat.
- `0.5` (di `uTime * 0.5`) → kecepatan gelombang garis.

### 4.5 Palet warna kertas & ink

```glsl
vec3 paper = mix(vec3(0.96, 0.95, 0.93), vec3(0.05, 0.05, 0.06), uTheme);
vec3 ink   = mix(vec3(0.10, 0.10, 0.12), vec3(0.85, 0.86, 0.90), uTheme);
```

- Argumen pertama = warna **light mode**, argumen kedua = **dark mode**.
- `uTheme` = 0 (light) → 1 (dark), di-lerp halus otomatis.

### 4.6 Transparansi kertas (dipakai saat intro)

```glsl
float a = mix(uPaperAlpha, 1.0, stroke);
```

- `uPaperAlpha` = 0 → kertas tembus (angka di belakang kelihatan).
- `uPaperAlpha` = 1 → kertas penuh (normal).
- Diatur dari `page.tsx`: `<RawSketchBackground paperAlpha={intro ? 0 : 1} />`.

### 4.7 Performa (HP lambat)

Di `RawSketchBackground.tsx` (bukan shader):

```ts
const octaves = weak ? 3 : 5;      // jumlah lapis noise (kualitas vs performa)
const dprCap  = weak ? 1 : 2;      // resolusi render (1 = lebih ringan)
const frameMs = weak ? 1000/30 : 0; // cap 30fps di HP, 0 = tanpa cap
```

- `weak` = HP / GPU lemah (deteksi otomatis dari userAgent + deviceMemory).
- Turunkan `octaves` ke `2` kalau masih ngelag.

### 4.8 Uniform yang tersedia (ringkasan)

| Uniform        | Arti                                                    | Di-set dari              |
| -------------- | ------------------------------------------------------- | ------------------------ |
| `uTime`        | waktu berjalan (detik)                                  | loop render              |
| `uResolution`  | ukuran canvas                                           | resize                   |
| `uMouse`       | posisi kursor (0..1 × aspect)                           | `mousemove`/`touchmove`  |
| `uVelocity`    | kecepatan kursor (distorsi)                             | loop render              |
| `uTheme`       | 0 = terang, 1 = gelap                                   | prop `dark`              |
| `uPaperAlpha`  | 0 = kertas tembus, 1 = penuh                            | prop `paperAlpha`        |
| `uOctaves`     | jumlah octave FBM                                       | auto (device)            |

---

## 5. Alur Intro (Pixel 1975)

File: **`app/PixelIntro.tsx`**.

- Urutan fase: gelap → muncul kedip RGB → diam putih glow → padam merah → `onDone()`.
- Durasi diatur di konstanta:

```ts
const T_INITIAL_DELAY = 700;  // jeda awal
const T_APPEAR        = 1700; // animasi muncul RGB
const T_HOLD          = 1600; // diam putih glow
const T_VANISH        = 1500; // padam merah
```

Setelah `onDone()`, `page.tsx` meng-set `intro=false` → konten utama fade-in + ripple kertas kembali penuh.

---

## 6. Menjalankan & Deploy

```powershell
npm install       # sekali
npm run dev       # http://localhost:3000
npm run build     # produksi
```

Deploy: push ke GitHub → Vercel auto-deploy. Domain: `1975.lol` (via `public/CNAME`).

---

## 7. Tips Debug Cepat

- **Ripple terlalu gelap/terang** → ubah `paper` di `main()` shader.
- **Frame rounded tidak kelihatan** → pastikan `outerBg` (page) beda dari warna isi frame (ripple).
- **Angka intro tidak kelihatan** → cek `frameFill` (harus gelap saat intro) dan z-index `PixelIntro`.
- **HP ngelag** → turunkan `octaves`/`dprCap` di `RawSketchBackground.tsx`.
