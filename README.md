# NAZIFE PRO 🏀

**NBA Oyuncu Prop Bahis Analiz Sistemi**

> Versiyon 3.0 · 24 Mart 2026

---

## Ne Bu?

Nazife Pro, NBA oyuncu prop bahislerinde yapısal karar vermeye yarayan bir analiz sistemidir.
"Bu oyuncu bugün bu baremi geçer mi?" sorusunu sistematik olarak yanıtlar.

Sıradan tahmin değil — **rol, matchup, bağlam ve veto kurallarına dayalı** bir karar motoru.

---

## Dosya Yapısı

```
nazife-pro/
├── Nazife_Kurallar_3_0.docx   # Sistem kuralları (nadiren değişir)
├── players.json               # Oyuncu profilleri + barem kalibrasyonu
├── teams.json                 # Takım savunma profilleri
├── tests.json                 # Tüm tarihsel test sonuçları
├── stats.json                 # Kümülatif istatistikler
└── nazife_dashboard.jsx       # React dashboard (görselleştirme)
```

---

## Mimari

| Dosya | Güncelleme sıklığı | İçerik |
|-------|-------------------|--------|
| `Nazife_Kurallar_3_0.docx` | Kural değişikliğinde | 16 adım, veto kuralları, skor kartı |
| `players.json` | Her test bloğu sonunda | Oyuncu profilleri, barem, test geçmişi |
| `teams.json` | Gerektiğinde | Takım savunma profilleri |
| `tests.json` | Her test bloğu sonunda | Tüm tahminler ve sonuçlar |
| `stats.json` | Her test bloğu sonunda | Başarı oranları |

---

## Temel Kurallar (Özet)

### Veto Hiyerarşisi
- **Spread 12+ puan favori** → Over tekli verilmez, kupona iner
- **Spread 18+ puan favori** → Over uzak dur
- **Spread 25+ puan favori** → Hiç over verilmez
- **Ribaund 10.5+** → Büyük ceza, çoğu zaman no-bet
- **Blowout** → Dakika modeli uygula (kural 19.8)

### Puan Aralıkları
| Puan | Karar |
|------|-------|
| 78-100 | Tekli oynanır |
| 68-77 | Kupona uygun |
| 60-67 | Sınırda |
| <60 | Uzak dur |

---

## Test Sonuçları (Mart 2026)

| Metric | Değer |
|--------|-------|
| Toplam tahmin | 24 |
| Genel başarı | %75 |
| Blowout hariç | %91 |
| Sayı marketi | %83 |
| Ribaund marketi | %83 |
| Blok marketi | %100 |
| Asist marketi | %50 |

### Oyuncu Bazında
| Oyuncu | Başarı |
|--------|--------|
| Wembanyama | %100 (8/8) |
| SGA | %100 (3/3) |
| Doncic | %100 (2/2) |
| Brown | %100 (1/1) |
| Jokic | %67 (2/3) |
| Banchero | %50 (1/2) |
| Cunningham | %50 (1/2) |

---

## Çalışma Yöntemi (Claude ile)

1. **Test bloğu seç** (örn: 15-21 Mart)
2. Claude'a dosyaları yükle (`players.json` + `tests.json`)
3. Her maç için Nazife 2.9 kuralları uygulanır
4. Gerçek sonuçlar çekilir, karşılaştırılır
5. Blok sonunda JSON'lar güncellenir → commit

### Prompt Şablonu
```
Nazife Pro 3.0 ile [TARİH] maçlarını analiz et.
[players.json] ve [tests.json] yüklüyorum.
Sadece 78+ puan alan tahminleri ver.
Marketler: sayı, asist, ribaund, steal, blok.
```

---

## Versiyon Geçmişi

| Versiyon | Tarih | Değişiklik |
|----------|-------|------------|
| 1.0 | Ocak 2026 | Temel sistem |
| 2.7 | Mart 2026 | Mecburi usage kuralı (19.5, 19.6) |
| 2.8 | Mart 2026 | Blowout veto güçlendirildi (19.7, 19.8) |
| 2.9 | Mart 2026 | Oyuncu + takım profil veritabanı eklendi |
| 3.0 | Mart 2026 | JSON mimari — modüler yapı |

---

*Test verisiyle kalibrasyon devam ediyor. Her blok sonunda profiller güncellenir.*
