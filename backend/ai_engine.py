import random
import os
import difflib

# Deskripsi elaboratif, formal, dan mendetail yang siap disintesis.
# Cakupan: Seluruh disiplin ilmu akademik dan industri profesional.

KEYWORDS_MAP = {
    # == TEKNOLOGI, REKAYASA & IT ==
    "coding": [
        "melakukan implementasi logika pemrograman tingkat lanjut serta pengembangan modul fungsional sistem secara komprehensif",
        "bertanggung jawab dalam proses pengembangan struktur kode program yang efisien serta melakukan integrasi modul inti sistem",
        "melakukan optimasi kueri dan algoritma pemrograman untuk meningkatkan performa operasional aplikasi secara signifikan",
        "menyusun arsitektur kode yang bersih (clean code) serta melakukan refaktorisasi pada komponen sistem yang kompleks"
    ],
    "backend": [
        "melakukan perancangan dan optimasi logika sisi server (server-side) untuk memastikan stabilitas dan skalabilitas sistem",
        "mengembangkan arsitektur API yang aman dan efisien serta melakukan manajemen aliran data pada lapisan backend",
        "melakukan konfigurasi database server dan optimasi kueri kompleks untuk mendukung operasional data tingkat tinggi",
        "integrasi sistem pihak ketiga dan pengembangan modul autentikasi pada infrastruktur teknologi informasi"
    ],
    "frontend": [
        "melakukan penyusunan antarmuka pengguna (user interface) yang intuitif dengan mengedepankan aspek responsivitas dan estetika visual",
        "mengembangkan komponen UI yang dinamis serta melakukan integrasi desain mockup ke dalam implementasi teknis sisi klien",
        "melakukan optimasi interaksi fungsional pada sisi browser untuk memastikan pengalaman pengguna (UX) yang optimal",
        "menyusun struktur styling dan animasi antarmuka yang modern serta memastikan kompatibilitas lintas platform browser"
    ],
    "bug": [
        "melakukan investigasi mendalam terhadap kendala fungsional sistem serta menyusun strategi penyelesaian issue teknis yang kritis",
        "menganalisis akar permasalahan (root cause) pada kegagalan sistem operasional dan melakukan perbaikan bug secara menyeluruh",
        "melakukan debugging sistematis pada lingkungan pengembangan untuk memitigasi risiko kegagalan fungsionalitas",
        "resolusi issue teknis operasional dengan melakukan penelusuran log sistem dan pengujian validasi pasca perbaikan"
    ],
    "data": [
        "melakukan analisis integritas data secara berkala dan menyusun dataset operasional untuk keperluan pengambilan keputusan",
        "bertanggung jawab dalam proses validasi akurasi informasi digital serta melakukan transformasi data pada sistem database",
        "menyusun laporan statistik data yang mendetail serta melakukan visualisasi tren informasi untuk keperluan manajerial",
        "melakukan pembersihan data (data cleaning) dan penyelarasan struktur informasi pada lingkungan basis data"
    ],
    "cyber": [
        "melakukan audit keamanan siber sistem secara periodik untuk mengidentifikasi potensi kerentanan dan celah keamanan",
        "implementasi protokol enkripsi data tingkat lanjut serta penguatan sistem pertahanan jaringan dari ancaman eksternal",
        "analisis forensik digital pada log aktivitas sistem untuk mendeteksi indikasi percobaan intrusi yang mencurigakan",
        "penyusunan kebijakan keamanan informasi (ISMS) dan melakukan simulasi penetrasi (pentest) pada infrastruktur IT"
    ],
    "iot": [
        "melakukan integrasi perangkat cerdas (IoT) ke dalam jaringan sistem serta konfigurasi transmisi data nirkabel",
        "monitoring konektivitas perangkat sensor secara real-time dan analisis konsumsi energi pada modul hardware",
        "pengembangan dashboard monitoring IoT serta optimasi pengolahan data edge computing pada level perangkat"
    ],

    # == PERTANIAN, ALAM & LINGKUNGAN ==
    "tanam": [
        "melakukan proses penyemaian bibit varietas unggul serta melakukan monitoring intensif terhadap fase pertumbuhan vegetatif tanaman",
        "bertanggung jawab dalam pemeliharaan area budidaya tanaman melalui penerapan teknik agronomi yang modern dan presisi",
        "melakukan analisis mendalam terhadap kondisi media tanam dan memastikan ketersediaan unsur hara yang optimal",
        "menyusun strategi penanaman yang sistematis untuk meningkatkan produktivitas hasil tani pada lahan konservasi"
    ],
    "pupuk": [
        "melakukan pemberian nutrisi tanah secara terjadwal berdasarkan hasil analisis laboratorium terhadap kebutuhan hara tanaman",
        "manajemen dosis pemupukan yang presisi serta melakukan evaluasi terhadap efektivitas jenis nutrisi yang diaplikasikan",
        "analisis komposisi makro dan mikro hara lahan untuk menentukan strategi pemupukan berimbang yang paling optimal",
        "optimasi perawatan lahan melalui aplikasi teknik pemupukan guna menjaga kesuburan tanah jangka panjang"
    ],
    "hama": [
        "melakukan pengendalian organisme pengganggu tanaman (OPT) melalui pendekatan manajemen hama terpadu yang ramah lingkungan",
        "monitoring kesehatan tanaman secara berkala untuk mendeteksi indikasi serangan hama maupun penyakit secara dini",
        "implementasi teknik biokontrol dan penggunaan pestisida organik untuk menjaga keseimbangan ekosistem pertanian",
        "analisis pola serangan patogen pada lahan dan menyusun rekomendasi teknis perbaikan sanitasi lingkungan"
    ],
    "hewan": [
        "monitoring kesehatan ternak secara rutin serta melakukan pemberian nutrisi harian berdasarkan standar kebutuhan gizi",
        "evaluasi kondisi fisik hewan dan melakukan prosedur sanitasi kandang guna mencegah penyebaran wabah penyakit",
        "observasi perilaku subjek hewan dalam rangka penelitian serta pencatatan data pertumbuhan pada database peternakan",
        "manajemen perkembangbiakan ternak serta optimasi kualitas hasil produksi hewani secara berkelanjutan"
    ],
    "limbah": [
        "manajemen pengolahan limbah industri secara sistematis guna memastikan kepatuhan terhadap standar baku mutu lingkungan",
        "analisis dampak lingkungan (AMDAL) serta pengembangan prosedur daur ulang material sisa produksi secara efisien",
        "monitoring emisi operasional dan pengawasan sistem infiltrasi air limbah untuk memitigasi risiko pencemaran",
        "implementasi teknologi hijau dalam pengelolaan sampah organik dan non-organik pada lingkungan operasional"
    ],

    # == KESEHATAN & MEDIS ==
    "pasien": [
        "melakukan observasi kondisi tanda-tanda vital pasien secara rutin serta melakukan pencatatan rekam medis yang mendetail",
        "bertanggung jawab dalam pemberian asuhan keperawatan dan jasa layanan klinis kepada pasien sesuai instruksi medis",
        "melakukan edukasi kesehatan kepada pasien terkait prosedur perawatan serta manajemen pemulihan kondisi fisik",
        "monitoring perkembangan harian kondisi kesehatan pasien dan koordinasi dengan tenaga medis spesialis terkait"
    ],
    "obat": [
        "manajemen sediaan farmasi secara sistematis serta menjamin ketersediaan stok obat-obatan esensial pada unit pelayanan",
        "verifikasi dosis, jenis, dan tanggal kadaluwarsa produk medis secara teliti sebelum dilakukan distribusi kepada subjek",
        "penyusunan inventaris medika dan pelaporan mutasi stok pada sistem informasi manajemen kesehatan yang terintegrasi",
        "konsultasi farmasi terkait interaksi obat serta monitoring efek samping penggunaan medikasi pada pasien"
    ],
    "laboratorium": [
        "melakukan manajemen peralatan laboratorium secara berkala serta memastikan seluruh instrumen dalam kondisi terkalibrasi",
        "preparasi bahan uji coba dan reagen kimia untuk keperluan praktikum ilmiah maupun pengujian spesimen medis",
        "dokumentasi hasil pengamatan laboratorium secara akurat dan menyusun laporan analisis data yang sistematis",
        "sterilisasi area kerja dan peralatan laboratorium menggunakan prosedur aseptik untuk menjamin keamanan riset"
    ],

    # == EKONOMI, HUKUM & BISNIS ==
    "keuangan": [
        "melakukan rekapitulasi transaksi operasional harian dan menyusun draf laporan arus kas (cash flow) yang akurat",
        "analisis kinerja keuangan melalui pengkajian laporan laba rugi serta neraca saldo secara periodik",
        "verifikasi dokumen pendukung transaksi dan memastikan kepatuhan terhadap standar akuntansi yang berlaku",
        "penyusunan anggaran tahunan departemen serta monitoring realisasi penggunaan dana operasional"
    ],
    "hukum": [
        "melakukan tinjauan (review) dokumen legal dan analisis regulasi guna memastikan kepatuhan terhadap hukum yang berlaku",
        "penyusunan draf kontrak kerja sama dan dokumen legalitas perusahaan dengan memperhatikan aspek perlindungan hukum",
        "riset yurisprudensi dan studi kasus hukum untuk mendukung penyelesaian sengketa atau pemberian opini legal",
        "audit kepatuhan hukum (legal audit) pada prosedur operasional instansi serta pemantauan pembaruan kebijakan pemerintah"
    ],
    "bank": [
        "melakukan pelayanan transaksi perbankan kepada nasabah serta verifikasi kelengkapan dokumen sesuai prosedur KYC",
        "analisis risiko kredit dan kelayakan pembiayaan bagi nasabah berdasarkan kriteria penilaian perbankan yang ketat",
        "manajemen administrasi produk perbankan serta monitoring portofolio aset dana nasabah secara berkala",
        "audit internal terhadap kepatuhan prosedur operasional bank guna memitigasi risiko kegagalan sistem"
    ],
    "pajak": [
        "penghitungan kewajiban pajak badan maupun perorangan serta penyusunan dokumen SPT tahunan secara akurat",
        "analisis regulasi perpajakan terbaru guna memberikan rekomendasi perencanaan pajak yang efisien dan legal",
        "pendampingan dalam proses pemeriksaan pajak serta verifikasi bukti potong transaksi pada sistem perpajakan"
    ],

    # == PENDIDIKAN & SOSIAL ==
    "mengajar": [
        "melakukan instruksi kelas secara interaktif serta penyusunan materi ajar yang sesuai dengan kurikulum pendidikan",
        "memberikan bimbingan akademik dan motivasi belajar kepada siswa guna meningkatkan pencapaian kompetensi",
        "evaluasi pemahaman siswa melalui pemberian tes dan tugas serta melakukan analisis terhadap hasil belajar individu",
        "pengembangan metode pengajaran kreatif (active learning) untuk menciptakan suasana belajar yang kondusif"
    ],
    "kurikulum": [
        "perancangan modul ajar dan silabus pendidikan yang komprehensif serta penyesuaian materi dengan standar nasional",
        "analisis efektivitas kurikulum yang berjalan serta melakukan pengembangan inovasi instruksional berbasis teknologi",
        "penyusunan kriteria ketuntasan minimal (KKM) dan pemetaan kompetensi dasar untuk tiap jenjang pendidikan",
        "koordinasi antar tenaga pendidik dalam rangka sinkronisasi materi ajar pada tingkat satuan pendidikan"
    ],
    "psikologi": [
        "asistensi observasi kondisi mental subjek serta melakukan scoring alat tes psikologi sesuai standar operasional",
        "evaluasi perilaku subjek melalui sesi wawancara dan observasi lapangan guna penyusunan profil psikogram",
        "pemberian dukungan psikososial dan layanan konseling awal dalam rangka peningkatan kesejahteraan mental komunitas",
        "analisis dinamika kelompok dan perilaku organisasi untuk keperluan pengembangan sumber daya manusia di instansi"
    ],
    "sosial": [
        "pemberdayaan masyarakat melalui program asistensi sosial dan survey fenomena komunitas pada area perkotaan/pedesaan",
        "analisis kebutuhan warga serta penyelarasan program bantuan sosial agar tepat sasaran dan berkelanjutan",
        "monitoring dampak program pembangunan sosial terhadap kesejahteraan ekonomi masyarakat lokal",
        "koordinasi dengan lintas sektor dalam rangka penanganan masalah sosial dan peningkatan partisipasi publik"
    ],

    # == KULINER, PARIWISATA & FASHION ==
    "masak": [
        "eksperimen teknik kuliner tingkat lanjut dan manajemen stok bahan dapur guna menjaga kualitas rasa masakan",
        "penyusunan menu masakan yang inovatif serta melakukan quality control terhadap standar plating dan presentasi makanan",
        "monitoring sanitasi area kitchen serta pengawasan prosedur keamanan pangan (HACCP) selama proses produksi",
        "edukasi pengenalan rempah dan bahan baku pangan kepada staf dapur guna meningkatkan kompetensi kuliner"
    ],
    "kopi": [
        "optimasi teknik ekstraksi biji kopi dan profiling rasa (cupping) untuk menentukan standar kualitas seduhan terbaik",
        "manajemen operasional bar serta pemeliharaan peralatan espresso secara rutin guna menjaga konsistensi rasa",
        "edukasi teknik brewing manual dan latte art kepada pelanggan dalam rangka meningkatkan pengalaman minum kopi",
        "manajemen stok bahan baku kopi dari supplier serta analisis tren konsumsi kopi pada pasar lokal"
    ],
    "hotel": [
        "manajemen operasional layanan tamu (front office) serta monitoring kualitas pelayanan pada departemen housekeeping",
        "penyusunan jadwal reservasi dan koordinasi ketersediaan kamar guna mengoptimalkan tingkat okupansi hotel",
        "audit standar kebersihan dan kenyamanan fasilitas hotel sesuai dengan protokol sertifikasi bintang",
        "penanganan keluhan tamu secara profesional serta pemberian solusi layanan prima guna meningkatkan loyalitas pelanggan"
    ],
    "wisata": [
        "pemanduan rute perjalanan wisata secara edukatif serta promosi destinasi wisata lokal kepada wisatawan mancanegara",
        "manajemen paket liburan dan perjalanan dinas dengan mengedepankan aspek keselamatan dan kenyamanan perjalanan",
        "analisis kepuasan turis serta riset potensi pengembangan objek wisata baru untuk meningkatkan gairah pariwisata",
        "koordinasi dengan pelaku industri pariwisata terkait pengelolaan akomodasi dan transportasi bagi rombongan wisatawan"
    ],
    "fashion": [
        "merancang pola busana yang mengikuti tren mode terkini serta pemilihan material tekstil yang berkualitas tinggi",
        "produksi sampel pakaian tingkat lanjut serta melakukan analisis tren warna dan tekstur pada industri fashion harian",
        "fitting ukuran model dan penyesuaian detail jahitan guna memastikan estetika dan kenyamanan produk busana",
        "manajemen koleksi pakaian pada area workshop serta persiapan aset visual untuk keperluan lookbook fashion"
    ],

    # == MARITIM, LOGISTIK & TRANSPORTASI ==
    "kapal": [
        "monitoring operasional kapal secara mendetail serta melakukan navigasi rute pelayaran dengan standar keselamatan tinggi",
        "maintenance rutin pada mesin kapal serta melakukan manajemen kargo maritim guna optimalisasi logistik laut",
        "audit keamanan dek dan ruang mesin sesuai regulasi pelayaran internasional (IMO) untuk menjamin kelayakan layar",
        "administrasi log kepal serta pemantauan kondisi cuaca laut guna menentukan strategi pelayaran yang paling aman"
    ],
    "logistik": [
        "optimasi rantai pasok (supply chain) serta melakukan manajemen pergudangan untuk memastikan efisiensi distribusi barang",
        "monitoring pengiriman barang secara real-time dan melakukan audit stok inventaris guna menjaga akurasi data logistik",
        "evaluasi performa mitra kurir dan vendor logistik dalam rangka penghematan biaya operasional pengiriman",
        "penyusunan rencana alokasi barang pada pusat distribusi (DC) untuk mempercepat proses fulfillment order"
    ],

    # == SENI, MUSIK & DESAIN ==
    "gambar": [
        "eksplorasi teknik visualisasi ilustrasi manual maupun digital guna menghasilkan karya seni yang memiliki nilai estetika",
        "penyusunan konsep gambar sketsa awal (storyboard) untuk kebutuhan proyek komunikasi visual dan media kreatif",
        "analisis proporsi dan komposisi warna pada karya seni visual untuk mencapai harmoni desain yang diinginkan",
        "finalisasi aset gambar ilustrasi dengan memperhatikan detail tekstur dan pencahayaan pada objek seni"
    ],
    "musik": [
        "produksi komposisi musik dan aransemen audio menggunakan perangkat lunak (DAW) maupun instrumen musik akustik",
        "monitoring kualitas rekaman vokal dan instrumen secara teknis guna menghasilkan output audio yang jernih dan profesional",
        "eksplorasi harmoni dan dinamika musik dalam rangka penyelesaian proyek seni pertunjukan atau media digital",
        "manajemen peralatan audio dan instrumen musik serta melakukan riset tren genre musik populer saat ini"
    ],

    # == UMUM & PROFESIONAL ==
    "rapat": [
        "mengikuti koordinasi internal tim untuk membahas progres pengerjaan proyek serta melakukan penyelarasan target operasional",
        "berpartisipasi aktif dalam diskusi progres mingguan dan menyusun notulensi keputusan penting hasil rapat koordinasi",
        "penyelarasan teknis harian antar departemen guna memastikan kelancaran alur kerja dan komunikasi tim terintegrasi",
        "evaluasi hasil aktivitas harian bersama pimpinan untuk menentukan langkah strategis pengerjaan tugas berikutnya"
    ],
    "riset": [
        "melakukan studi literatur mendalam melalui berbagai sumber referensi ilmiah guna mendukung validitas data penelitian",
        "analisis data pendukung serta investigasi metode penelitian yang relevan dengan topik aktivitas profesional harian",
        "pengumpulan informasi riset dari lapangan maupun literatur digital untuk keperluan penyusunan laporan teknis",
        "pengolahan data hasil penelitian menggunakan perangkat lunak statistik guna menarik kesimpulan yang valid"
    ],
    "belajar": [
        "pendalaman materi kompetensi teknis melalui riset mandiri pada modul teknologi dan prosedur operasional instansi",
        "mempelajari dokumentasi teknis dan standar operasional prosedur (SOP) perusahaan guna meningkatkan kapasitas kerja",
        "mengikuti sesi bimbingan teknis (transfer of knowledge) dari senior untuk memperluas pemahaman alur kerja",
        "riset mandiri terkait metodologi kerja terbaru yang relevan dengan tugas harian untuk efisiensi operasional"
    ],
    "dokumentasi": [
        "menyusun laporan aktivitas harian yang komprehensif serta mendokumentasikan setiap progres pengerjaan secara akurat",
        "bertanggung jawab dalam penyusunan panduan operasional (user guide) maupun update dokumentasi teknis sistem",
        "melakukan pengumpulan bukti dukung aktivitas (foto/berkas) serta pengarsipan data ke dalam sistem record instansi",
        "audit dokumentasi administratif guna memastikan kelengkapan syarat pelaporan progres aktivitas kepada pimpinan"
    ],
    "admin": [
        "menyelenggarakan administrasi perkantoran harian mulai dari korespondensi hingga manajemen record dokumen penting",
        "input data operasional ke dalam sistem informasi internal perusahaan serta melakukan validasi terhadap entri data",
        "penyusunan draf surat formal dan pengelolaan agenda pimpinan guna memastikan kelancaran jadwal aktivitas kantor",
        "arsip dan kategorisasi dokumen fisik maupun digital untuk mempermudah temu balik informasi di masa mendatang"
    ],
    "tugas": [
        "penyelesaian target kerja harian secara sistematis guna mencapai milestone yang telah ditetapkan oleh departemen",
        "monitoring progres tugas rutin dan melakukan evaluasi mandiri terhadap kualitas output pengerjaan harian",
        "finalisasi draf operasional dan penyiapan berkas pendukung tugas sesuai dengan petunjuk teknis yang diberikan pimpinan"
    ],
}

# Connectors for synthesis (Extended)
ID_CONNECTORS = [
    "yang sekaligus dibarengi dengan", 
    "serta melakukan", 
    "yang juga mencakup aspek", 
    "sekaligus melaksanakan",
    "dengan integrasi pada",
    "dan turut mengawasi"
]
EN_CONNECTORS = [
    "while also performing", 
    "and conducting", 
    "which also includes aspects of", 
    "simultaneously executing",
    "integrating with",
    "and overseeing"
]

def refine_description(prompt: str, lang: str = "id") -> str:
    """
    Advanced AI Refiner v3.0: High-Density Synthesis & RAG Similarity.
    """
    prompt_clean = prompt.lower().strip()
    if not prompt_clean:
        return ""

    matched_keys = []
    
    # 1. Exact/Substring Matching (Multi-match)
    # Sort keys by length descending (greedy matching)
    sorted_keys = sorted(KEYWORDS_MAP.keys(), key=len, reverse=True)
    temp_prompt = prompt_clean
    for key in sorted_keys:
        if key in temp_prompt:
            matched_keys.append(key)
            # Remove matched key from temp_prompt to avoid redundant matching
            # but keep it if it's a sub-word (complex) - for now, clear replacement is safer
            temp_prompt = temp_prompt.replace(key, " ") 
    
    # 2. RAG Similarity (Deep search if few matches)
    if len(matched_keys) < 1:
        # If no exact match, double the search breadth
        matched_keys = difflib.get_close_matches(prompt_clean, KEYWORDS_MAP.keys(), n=3, cutoff=0.4)

    # 3. Synthesis Layer (The "Brain")
    if matched_keys:
        # Select unique matches to avoid repetitive phrases
        unique_matches = list(dict.fromkeys(matched_keys))
        # Limit synthesis to 2-3 categories to keep sentences readable
        selected_keys = unique_matches[:2]
        
        phrases = []
        for key in selected_keys:
            # Randomly pick a professional phrase from the map
            phrases.append(random.choice(KEYWORDS_MAP[key]))
        
        # Merge phrases with professional connectors
        if len(phrases) > 1:
            conn = random.choice(ID_CONNECTORS if lang == 'id' else EN_CONNECTORS)
            main_description = f"{phrases[0]} {conn} {phrases[1]}"
        else:
            main_description = phrases[0]

        # Formatting
        main_description = main_description.capitalize()
        
        # Final weave with user context
        context_connector = "terkait dengan" if lang == 'id' else "in relation to"
        # If the generated description is already very long, keep the final weave short
        final_output = f"{main_description} {context_connector} '{prompt}'"
        
        if lang == 'en':
            final_output = final_output.replace("terkait dengan", "in relation to")
            
        return final_output

    # 4. Smart Fallback (Pattern-based)
    prefix = "Melakukan koordinasi operasional serta aktivitas profesional dalam rangka " if lang == 'id' else "Performing operational coordination and professional activities for "
    return f"{prefix}'{prompt}'"

def get_ai_refinement(prompt: str, lang: str = "id"):
    """
    Primary API for the backend to request AI refinement.
    """
    return refine_description(prompt, lang)
