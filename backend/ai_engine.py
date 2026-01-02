import random
import os
import difflib
import re

KEYWORDS_MAP = {
    # == TEKNOLOGI, REKAYASA & IT ==
    "coding": {
        "id": [
            "melakukan implementasi logika pemrograman tingkat lanjut serta pengembangan modul fungsional sistem secara komprehensif",
            "bertanggung jawab dalam proses pengembangan struktur kode program yang efisien serta melakukan integrasi modul inti sistem",
            "melakukan optimasi kueri dan algoritma pemrograman untuk meningkatkan performa operasional aplikasi secara signifikan",
            "menyusun arsitektur kode yang bersih (clean code) serta melakukan refaktorisasi pada komponen sistem yang kompleks"
        ],
        "en": [
            "implementing advanced programming logic and developing comprehensive functional system modules",
            "responsible for developing efficient code structures and integrating core system modules",
            "optimizing queries and programming algorithms to significantly enhance application operational performance",
            "designing clean code architecture and performing refactoring on complex system components"
        ]
    },
    "backend": {
        "id": [
            "melakukan perancangan dan optimasi logika sisi server (server-side) untuk memastikan stabilitas dan skalabilitas sistem",
            "mengembangkan arsitektur API yang aman dan efisien serta melakukan manajemen aliran data pada lapisan backend",
            "melakukan konfigurasi database server dan optimasi kueri kompleks untuk mendukung operasional data tingkat tinggi",
            "integrasi sistem pihak ketiga dan pengembangan modul autentikasi pada infrastruktur teknologi informasi"
        ],
        "en": [
            "designing and optimizing server-side logic to ensure system stability and scalability",
            "developing secure and efficient API architectures and managing data flow at the backend layer",
            "configuring database servers and optimizing complex queries to support high-level data operations",
            "integrating third-party systems and developing authentication modules on IT infrastructure"
        ]
    },
    "database": {
        "id": [
            "melakukan perancangan skema basis data serta optimasi struktur tabel guna menjamin integritas data operasional",
            "pengelolaan sistem manajemen basis data (DBMS) dan penyusunan kueri SQL kompleks untuk keperluan analisis informasi",
            "monitoring performa database server serta melakukan tuning indeks untuk mempercepat akses aliran data sistem",
            "bertanggung jawab dalam proses backup dan pemulihan data (recovery) pada infrastruktur penyimpanan digital"
        ],
        "en": [
            "designing database schemas and optimizing table structures to ensure operational data integrity",
            "managing Database Management Systems (DBMS) and composing complex SQL queries for information analysis",
            "monitoring database server performance and performing index tuning to accelerate system data access",
            "responsible for data backup and recovery processes on digital storage infrastructure"
        ]
    },
    "it": {
        "id": [
            "melakukan pemeliharaan infrastruktur teknologi informasi serta memberikan dukungan teknis operasional secara berkala",
            "monitoring jaringan sistem dan instalasi perangkat lunak pendukung guna menunjang produktivitas kerja instansi",
            "troubleshooting perangkat keras dan optimasi konfigurasi sistem informasi pada lingkungan kerja profesional"
        ],
        "en": [
            "maintaining information technology infrastructure and providing periodic operational technical support",
            "monitoring system networks and installing supporting software to enhance institutional productivity",
            "troubleshooting hardware and optimizing information system configurations in a professional environment"
        ]
    },
    "ui": {
        "id": [
            "melakukan perancangan mock-up antarmuka pengguna serta memastikan konsistensi elemen visual pada aplikasi",
            "pengembangan prototipe desain yang interaktif guna meningkatkan aspek usability dan daya tarik visual produk"
        ],
        "en": [
            "designing user interface mock-ups and ensuring visual element consistency across the application",
            "developing interactive design prototypes to enhance product usability and visual appeal"
        ]
    },
    "frontend": {
        "id": [
            "melakukan penyusunan antarmuka pengguna (user interface) yang intuitif dengan mengedepankan aspek responsivitas dan estetika visual",
            "mengembangkan komponen UI yang dinamis serta melakukan integrasi desain mockup ke dalam implementasi teknis sisi klien",
            "melakukan optimasi interaksi fungsional pada sisi browser untuk memastikan pengalaman pengguna (UX) yang optimal",
            "menyusun struktur styling dan animasi antarmuka yang modern serta memastikan kompatibilitas lintas platform browser"
        ],
        "en": [
            "crafting intuitive user interfaces with a focus on responsiveness and visual aesthetics",
            "developing dynamic UI components and integrating design mockups into client-side technical implementation",
            "optimizing functional interactions on the browser side to ensure optimal user experience (UX)",
            "building modern styling structures and interface animations while ensuring cross-platform browser compatibility"
        ]
    },
    "bug": {
        "id": [
            "melakukan investigasi mendalam terhadap kendala fungsional sistem serta menyusun strategi penyelesaian issue teknis yang kritis",
            "menganalisis akar permasalahan (root cause) pada kegagalan sistem operasional dan melakukan perbaikan bug secara menyeluruh",
            "melakukan debugging sistematis pada lingkungan pengembangan untuk memitigasi risiko kegagalan fungsionalitas",
            "resolusi issue teknis operasional dengan melakukan penelusuran log sistem dan pengujian validasi pasca perbaikan"
        ],
        "en": [
            "conducting in-depth investigations into functional system constraints and devising critical technical issue resolution strategies",
            "analyzing root causes of operational system failures and performing comprehensive bug fixes",
            "performing systematic debugging in the development environment to mitigate functional risks",
            "resolving operational technical issues by tracing system logs and performing post-fix validation testing"
        ]
    },
    "data": {
        "id": [
            "melakukan analisis integritas data secara berkala serta menyusun dataset operasional untuk keperluan pengambilan keputusan",
            "bertanggung jawab dalam proses validasi akurasi informasi digital serta melakukan transformasi data pada sistem database",
            "menyusun laporan statistik data yang mendetail serta melakukan visualisasi tren informasi untuk keperluan manajerial",
            "melakukan pembersihan data (data cleaning) serta penyelarasan struktur informasi pada lingkungan basis data"
        ],
        "en": [
            "conducting periodic data integrity analysis and compiling operational datasets for decision-making purposes",
            "responsible for validating digital information accuracy and performing data transformations in database systems",
            "composing detailed data statistical reports and visualizing information trends for managerial needs",
            "performing data cleaning and aligning information structures within the database environment"
        ]
    },
    "cyber": {
        "id": [
            "melakukan audit keamanan siber sistem secara periodik untuk mengidentifikasi potensi kerentanan dan celah keamanan",
            "implementasi protokol enkripsi data tingkat lanjut serta penguatan sistem pertahanan jaringan dari ancaman eksternal",
            "analisis forensik digital pada log aktivitas sistem untuk mendeteksi indikasi percobaan intrusi yang mencurigakan",
            "penyusunan kebijakan keamanan informasi (ISMS) serta melakukan simulasi penetrasi (pentest) pada infrastruktur IT"
        ],
        "en": [
            "conducting periodic cyber security audits to identify potential vulnerabilities and security gaps",
            "implementing advanced data encryption protocols and strengthening network defense systems against external threats",
            "performing digital forensic analysis on system activity logs to detect suspicious intrusion attempts",
            "drafting Information Security Management Systems (ISMS) policies and conducting penetration testing on IT infrastructure"
        ]
    },
    "iot": {
        "id": [
            "melakukan integrasi perangkat cerdas (IoT) ke dalam jaringan sistem serta konfigurasi transmisi data nirkabel",
            "monitoring konektivitas perangkat sensor secara real-time serta analisis konsumsi energi pada modul hardware",
            "pengembangan dashboard monitoring IoT serta optimasi pengolahan data edge computing pada level perangkat"
        ],
        "en": [
            "integrating smart devices (IoT) into system networks and configuring wireless data transmissions",
            "monitoring sensor device connectivity in real-time and analyzing energy consumption on hardware modules",
            "developing IoT monitoring dashboards and optimizing edge computing data processing at the device level"
        ]
    },

    # == PERTANIAN, ALAM & LINGKUNGAN ==
    "tanam": {
        "id": [
            "melakukan proses penyemaian bibit varietas unggul serta melakukan monitoring intensif terhadap fase pertumbuhan vegetatif tanaman",
            "bertanggung jawab dalam pemeliharaan area budidaya tanaman melalui penerapan teknik agronomi yang modern dan presisi",
            "melakukan analisis mendalam terhadap kondisi media tanam serta memastikan ketersediaan unsur hara yang optimal",
            "menyusun strategi penanaman yang sistematis untuk meningkatkan produktivitas hasil tani pada lahan konservasi"
        ],
        "en": [
            "conducting superior variety seed sowing and intensive monitoring of vegetative growth phases",
            "responsible for maintaining cultivation areas through the application of modern and precision agronomic techniques",
            "conducting in-depth analysis of planting medium conditions and ensuring optimal nutrient availability",
            "devising systematic planting strategies to enhance agricultural productivity on conservation lands"
        ]
    },
    "nanam": {
        "id": [
            "melakukan aktivitas penanaman bibit serta monitoring fase pertumbuhan vegetatif pada area budidaya tanaman",
            "bertanggung jawab dalam proses pemeliharaan lahan pertanian serta optimalisasi media tanam secara berkala"
        ],
        "en": [
            "conducting seed planting activities and monitoring vegetative growth phases in cultivation areas",
            "responsible for agricultural land maintenance and periodic optimization of planting media"
        ]
    },
    "pupuk": {
        "id": [
            "melakukan pemberian nutrisi tanah secara terjadwal berdasarkan hasil analisis laboratorium terhadap kebutuhan hara tanaman",
            "manajemen dosis pemupukan yang presisi serta melakukan evaluasi terhadap efektivitas jenis nutrisi yang diaplikasikan",
            "analisis komposisi makro serta mikro hara lahan untuk menentukan strategi pemupukan berimbang yang paling optimal",
            "optimasi perawatan lahan melalui aplikasi teknik pemupukan guna menjaga kesuburan tanah jangka panjang"
        ],
        "en": [
            "performing scheduled soil nutrient application based on laboratory analysis of plant nutrient requirements",
            "managing precision fertilization dosages and evaluating the effectiveness of applied nutrients",
            "analyzing macro and micro-nutrient compositions of the land to determine optimal balanced fertilization strategies",
            "optimizing land care through fertilization techniques to maintain long-term soil fertility"
        ]
    },
    "hama": {
        "id": [
            "melakukan pengendalian organisme pengganggu tanaman (OPT) melalui pendekatan manajemen hama terpadu yang ramah lingkungan",
            "monitoring kesehatan tanaman secara berkala untuk mendeteksi indikasi serangan hama maupun penyakit secara dini",
            "implementasi teknik biokontrol serta penggunaan pestisida organik untuk menjaga keseimbangan ekosistem pertanian",
            "analisis pola serangan patogen pada lahan serta menyusun rekomendasi teknis perbaikan sanitasi lingkungan"
        ],
        "en": [
            "controlling plant-disrupting organisms through environmentally friendly integrated pest management approaches",
            "monitoring plant health periodically to detect early signs of pest or disease infestations",
            "implementing biocontrol techniques and using organic pesticides to maintain agricultural ecosystem balance",
            "analyzing pathogen attack patterns on the field and drafting technical recommendations for environmental sanitation"
        ]
    },
    "hewan": {
        "id": [
            "monitoring kesehatan ternak secara rutin serta melakukan pemberian nutrisi harian berdasarkan standar kebutuhan gizi",
            "evaluasi kondisi fisik hewan serta melakukan prosedur sanitasi kandang guna mencegah penyebaran wabah penyakit",
            "observasi perilaku subjek hewan dalam rangka penelitian serta pencatatan data pertumbuhan pada database peternakan",
            "manajemen perkembangbiakan ternak serta optimasi kualitas hasil produksi hewani secara berkelanjutan"
        ],
        "en": [
            "monitoring livestock health routinely and providing daily nutrition based on nutritional requirement standards",
            "evaluating animal physical conditions and performing stable sanitation procedures to prevent disease outbreaks",
            "observing animal behavior for research purposes and recording growth data in the livestock database",
            "managing livestock breeding and optimizing animal production quality sustainably"
        ]
    },
    "limbah": {
        "id": [
            "manajemen pengolahan limbah industri secara sistematis guna memastikan kepatuhan terhadap standar baku mutu lingkungan",
            "analisis dampak lingkungan (AMDAL) serta pengembangan prosedur daur ulang material sisa produksi secara efisien",
            "monitoring emisi operasional serta pengawasan sistem infiltrasi air limbah untuk memitigasi risiko pencemaran",
            "implementasi teknologi hijau dalam pengelolaan sampah organik serta non-organik pada lingkungan operasional"
        ],
        "en": [
            "managing industrial waste treatment systematically to ensure compliance with environmental quality standards",
            "conducting Environmental Impact Assessments (EIA) and developing efficient production residue recycling procedures",
            "monitoring operational emissions and overseeing wastewater infiltration systems to mitigate pollution risks",
            "implementing green technology in organic and non-organic waste management in the operational environment"
        ]
    },

    # == KESEHATAN & MEDIS ==
    "pasien": {
        "id": [
            "melakukan observasi kondisi tanda-tanda vital pasien secara rutin serta melakukan pencatatan rekam medis yang mendetail",
            "bertanggung jawab dalam pemberian asuhan keperawatan serta jasa layanan klinis kepada pasien sesuai instruksi medis",
            "melakukan edukasi kesehatan kepada pasien terkait prosedur perawatan serta manajemen pemulihan kondisi fisik",
            "monitoring perkembangan harian kondisi kesehatan pasien serta koordinasi dengan tenaga medis spesialis terkait"
        ],
        "en": [
            "observing patient vital signs routinely and maintaining detailed medical records",
            "responsible for providing nursing care and clinical services to patients as per medical instructions",
            "conducting health education for patients regarding care procedures and physical recovery management",
            "monitoring daily progress of patient health and coordinating with relevant medical specialists"
        ]
    },
    "obat": {
        "id": [
            "manajemen sediaan farmasi secara sistematis serta menjamin ketersediaan stok obat-obatan esensial pada unit pelayanan",
            "verifikasi dosis, jenis, serta tanggal kadaluwarsa produk medis secara teliti sebelum dilakukan distribusi kepada subjek",
            "penyusunan inventaris medika serta pelaporan mutasi stok pada sistem informasi manajemen kesehatan yang terintegrasi",
            "konsultasi farmasi terkait interaksi obat serta monitoring efek samping penggunaan medikasi pada pasien"
        ],
        "en": [
            "managing pharmaceutical supplies systematically and ensuring essential drug stock availability at the service unit",
            "verifying dosages, types, and expiration dates of medical products meticulously before distribution",
            "compiling medical inventories and reporting stock mutations in the integrated health management information system",
            "providing pharmacy consultation regarding drug interactions and monitoring medication side effects in patients"
        ]
    },
    "laboratorium": {
        "id": [
            "melakukan manajemen peralatan laboratorium secara berkala serta memastikan seluruh instrumen dalam kondisi terkalibrasi",
            "preparasi bahan uji coba serta reagen kimia untuk keperluan praktikum ilmiah maupun pengujian spesimen medis",
            "dokumentasi hasil pengamatan laboratorium secara akurat serta menyusun laporan analisis data yang sistematis",
            "sterilisasi area kerja serta peralatan laboratorium menggunakan prosedur aseptik untuk menjamin keamanan riset"
        ],
        "en": [
            "managing laboratory equipment periodically and ensuring all instruments are in a calibrated state",
            "preparing test materials and chemical reagents for scientific practicums or medical specimen testing",
            "documenting laboratory observation results accurately and compiling systematic data analysis reports",
            "sterilizing work areas and laboratory equipment using aseptic procedures to ensure research safety"
        ]
    },

    # == EKONOMI, HUKUM & BISNIS ==
    "keuangan": {
        "id": [
            "melakukan rekapitulasi transaksi operasional harian serta menyusun draf laporan arus kas (cash flow) yang akurat",
            "analisis kinerja keuangan melalui pengkajian laporan laba rugi serta neraca saldo secara periodik",
            "verifikasi dokumen pendukung transaksi serta memastikan kepatuhan terhadap standar akuntansi yang berlaku",
            "penyusunan anggaran tahunan departemen serta monitoring realisasi penggunaan dana operasional"
        ],
        "en": [
            "recapitulating daily operational transactions and drafting accurate cash flow reports",
            "analyzing financial performance through periodic review of profit and loss statements and balance sheets",
            "verifying transaction support documents and ensuring compliance with applicable accounting standards",
            "preparing annual departmental budgets and monitoring the realization of operational funds"
        ]
    },
    "hukum": {
        "id": [
            "melakukan tinjauan (review) dokumen legal serta analisis regulasi guna memastikan kepatuhan terhadap hukum yang berlaku",
            "penyusunan draf kontrak kerja sama serta dokumen legalitas perusahaan dengan memperhatikan aspek perlindungan hukum",
            "riset yurisprudensi serta studi kasus hukum untuk mendukung penyelesaian sengketa atau pemberian opini legal",
            "audit kepatuhan hukum (legal audit) pada prosedur operasional instansi serta pemantauan pembaruan kebijakan pemerintah"
        ],
        "en": [
            "reviewing legal documents and analyzing regulations to ensure compliance with applicable laws",
            "drafting cooperation contracts and company legal documents while considering legal protection aspects",
            "researching jurisprudence and legal case studies to support dispute resolution or legal opinions",
            "conducting legal audits on institutional operational procedures and monitoring government policy updates"
        ]
    },
    "bank": {
        "id": [
            "melakukan pelayanan transaksi perbankan kepada nasabah serta verifikasi kelengkapan dokumen sesuai prosedur KYC",
            "analisis risiko kredit serta kelayakan pembiayaan bagi nasabah berdasarkan kriteria penilaian perbankan yang ketat",
            "manajemen administrasi produk perbankan serta monitoring portofolio aset dana nasabah secara berkala",
            "audit internal terhadap kepatuhan prosedur operasional bank guna memitigasi risiko kegagalan sistem"
        ],
        "en": [
            "providing banking transaction services to customers and verifying document completeness per KYC procedures",
            "analyzing credit risks and financing eligibility for customers based on strict banking evaluation criteria",
            "managing banking product administration and monitoring customer asset portfolios periodically",
            "conducting internal audits on bank operational procedure compliance to mitigate system failure risks"
        ]
    },
    "pajak": {
        "id": [
            "penghitungan kewajiban pajak badan maupun perorangan serta penyusunan dokumen SPT tahunan secara akurat",
            "analisis regulasi perpajakan terbaru guna memberikan rekomendasi perencanaan pajak yang efisien serta legal",
            "pendampingan dalam proses pemeriksaan pajak serta verifikasi bukti potong transaksi pada sistem perpajakan"
        ],
        "en": [
            "calculating corporate or individual tax liabilities and accurately preparing annual tax return documents",
            "analyzing latest tax regulations to provide efficient and legal tax planning recommendations",
            "assisting in tax audit processes and verifying transaction tax deduction evidence in the tax system"
        ]
    },

    # == PENDIDIKAN & SOSIAL ==
    "mengajar": {
        "id": [
            "melakukan instruksi kelas secara interaktif serta penyusunan materi ajar yang sesuai dengan kurikulum pendidikan",
            "memberikan bimbingan akademik serta motivasi belajar kepada siswa guna meningkatkan pencapaian kompetensi",
            "evaluasi pemahaman siswa melalui pemberian tes serta tugas serta melakukan analisis terhadap hasil belajar individu",
            "pengembangan metode pengajaran kreatif (active learning) untuk menciptakan suasana belajar yang kondusif"
        ],
        "en": [
            "conducting interactive class instruction and preparing teaching materials aligned with the educational curriculum",
            "providing academic guidance and learning motivation to students to enhance competency achievement",
            "evaluating student understanding through tests and assignments and analyzing individual learning outcomes",
            "developing creative teaching methods (active learning) to create a conducive learning atmosphere"
        ]
    },
    "ngajar": {
        "id": [
            "melakukan instruksi kelas secara interaktif serta memberikan bimbingan kurikuler kepada peserta didik secara komprehensif",
            "bertanggung jawab dalam penyampaian materi ajar serta melakukan evaluasi capaian kompetensi harian siswa"
        ],
        "en": [
            "conducting interactive class instruction and providing comprehensive curricular guidance to learners",
            "responsible for teaching material delivery and performing daily student competency evaluations"
        ]
    },
    "kurikulum": {
        "id": [
            "perancangan modul ajar serta silabus pendidikan yang komprehensif serta penyesuaian materi dengan standar nasional",
            "analisis efektivitas kurikulum yang berjalan serta melakukan pengembangan inovasi instruksional berbasis teknologi",
            "penyusunan kriteria ketuntasan minimal (KKM) serta pemetaan kompetensi dasar untuk tiap jenjang pendidikan",
            "koordinasi antar tenaga pendidik dalam rangka sinkronisasi materi ajar pada tingkat satuan pendidikan"
        ],
        "en": [
            "designing comprehensive teaching modules and educational syllabi and aligning materials with national standards",
            "analyzing the effectiveness of ongoing curricula and developing technology-based instructional innovations",
            "compiling minimum mastery criteria (KKM) and mapping basic competencies for each educational level",
            "coordinating among educators to synchronize teaching materials at the educational unit level"
        ]
    },
    "psikologi": {
        "id": [
            "asistensi observasi kondisi mental subjek serta melakukan scoring alat tes psikologi sesuai standar operasional",
            "evaluasi perilaku subjek melalui sesi wawancara serta observasi lapangan guna penyusunan profil psikogram",
            "pemberian dukungan psikososial serta layanan konseling awal dalam rangka peningkatan kesejahteraan mental komunitas",
            "analisis dinamika kelompok serta perilaku organisasi untuk keperluan pengembangan sumber daya manusia di instansi"
        ],
        "en": [
            "assisting in subject mental condition observations and scoring psychological test tools per standard procedures",
            "evaluating subject behavior through interviews and field observations for psychogram profile compilation",
            "providing psychosocial support and initial counseling services to enhance community mental well-being",
            "analyzing group dynamics and organizational behavior for human resource development in the institution"
        ]
    },
    "sosial": {
        "id": [
            "pemberdayaan masyarakat melalui program asistensi sosial serta survey fenomena komunitas pada area perkotaan/pedesaan",
            "analisis kebutuhan warga serta penyelarasan program bantuan sosial agar tepat sasaran serta berkelanjutan",
            "monitoring dampak program pembangunan sosial terhadap kesejahteraan ekonomi masyarakat lokal",
            "koordinasi dengan lintas sektor dalam rangka penanganan masalah sosial serta peningkatan partisipasi publik"
        ],
        "en": [
            "community empowerment through social assistance programs and surveying community phenomena in urban/rural areas",
            "analyzing citizen needs and aligning social aid programs for effective targeting and sustainability",
            "monitoring the impact of social development programs on local community economic welfare",
            "coordinating across sectors for social problem handling and enhancing public participation"
        ]
    },

    # == KULINER, PARIWISATA & FASHION ==
    "masak": {
        "id": [
            "eksperimen teknik kuliner tingkat lanjut serta manajemen stok bahan dapur guna menjaga kualitas rasa masakan",
            "penyusunan menu masakan yang inovatif serta melakukan quality control terhadap standar plating serta presentasi makanan",
            "monitoring sanitasi area kitchen serta pengawasan prosedur keamanan pangan (HACCP) selama proses produksi",
            "edukasi pengenalan rempah serta bahan baku pangan kepada staf dapur guna meningkatkan kompetensi kuliner"
        ],
        "en": [
            "experimenting with advanced culinary techniques and managing kitchen stock to maintain food quality",
            "composing innovative menus and performing quality control for plating and food presentation standards",
            "monitoring kitchen area sanitation and overseeing food safety procedures (HACCP) during production",
            "educating kitchen staff on spices and food raw materials to enhance culinary competency"
        ]
    },
    "kopi": {
        "id": [
            "optimasi teknik ekstraksi biji kopi serta profiling rasa (cupping) untuk menentukan standar kualitas seduhan terbaik",
            "manajemen operasional bar serta pemeliharaan peralatan espresso secara rutin guna menjaga konsistensi rasa",
            "edukasi teknik brewing manual serta latte art kepada pelanggan dalam rangka meningkatkan pengalaman minum kopi",
            "manajemen stok bahan baku kopi dari supplier serta analisis tren konsumsi kopi pada pasar lokal"
        ],
        "en": [
            "optimizing coffee bean extraction techniques and flavor profiling (cupping) to determine best brew standards",
            "managing bar operations and periodic maintenance of espresso equipment to ensure flavor consistency",
            "educating customers on manual brewing techniques and latte art to enhance the coffee drinking experience",
            "managing coffee raw material stock from suppliers and analyzing coffee consumption trends in the local market"
        ]
    },
    "hotel": {
        "id": [
            "manajemen operasional layanan tamu (front office) serta monitoring kualitas pelayanan pada departemen housekeeping",
            "penyusunan jadwal reservasi serta koordinasi ketersediaan kamar guna mengoptimalkan tingkat okupansi hotel",
            "audit standar kebersihan serta kenyamanan fasilitas hotel sesuai dengan protokol sertifikasi bintang",
            "penanganan keluhan tamu secara profesional serta pemberian solusi layanan prima guna meningkatkan loyalitas pelanggan"
        ],
        "en": [
            "managing guest service operations (front office) and monitoring service quality in the housekeeping department",
            "preparing reservation schedules and coordinating room availability to optimize hotel occupancy rates",
            "auditing cleanliness and comfort standards of hotel facilities per star certification protocols",
            "handling guest complaints professionally and providing excellent service solutions to enhance customer loyalty"
        ]
    },
    "wisata": {
        "id": [
            "pemanduan rute perjalanan wisata secara edukatif serta promosi destinasi wisata lokal kepada wisatawan mancanegara",
            "manajemen paket liburan serta perjalanan dinas dengan mengedepankan aspek keselamatan serta kenyamanan perjalanan",
            "analisis kepuasan turis serta riset potensi pengembangan objek wisata baru untuk meningkatkan gairah pariwisata",
            "koordinasi dengan pelaku industri pariwisata terkait pengelolaan akomodasi serta transportasi bagi rombongan wisatawan"
        ],
        "en": [
            "guiding tourist routes educationally and promoting local destinations to international travelers",
            "managing holiday packages and business travel focusing on safety and journey comfort",
            "analyzing tourist satisfaction and researching new tourist destination development potential",
            "coordinating with tourism industry players regarding accommodation and transportation management for groups"
        ]
    },
    "fashion": {
        "id": [
            "merancang pola busana yang mengikuti tren mode terkini serta pemilihan material tekstil yang berkualitas tinggi",
            "produksi sampel pakaian tingkat lanjut serta melakukan analisis tren warna serta tekstur pada industri fashion harian",
            "fitting ukuran model serta penyesuaian detail jahitan guna memastikan estetika serta kenyamanan produk busana",
            "manajemen koleksi pakaian pada area workshop serta persiapan aset visual untuk keperluan lookbook fashion"
        ],
        "en": [
            "designing clothing patterns following current mode trends and selecting high-quality textile materials",
            "producing advanced clothing samples and analyzing color and texture trends in the daily fashion industry",
            "fitting model sizes and adjusting stitching details to ensure busana aesthetics and comfort",
            "managing clothing collections in the workshop area and preparing visual assets for fashion lookbooks"
        ]
    },

    # == MARITIM, LOGISTIK & TRANSPORTASI ==
    "kapal": {
        "id": [
            "monitoring operasional kapal secara mendetail serta melakukan navigasi rute pelayaran dengan standar keselamatan tinggi",
            "maintenance rutin pada mesin kapal serta melakukan manajemen kargo maritim guna optimalisasi logistik laut",
            "audit keamanan dek serta ruang mesin sesuai regulasi pelayaran internasional (IMO) untuk menjamin kelayakan layar",
            "administrasi log kepal serta pemantauan kondisi cuaca laut guna menentukan strategi pelayaran yang paling aman"
        ],
        "en": [
            "monitoring ship operations in detail and navigating sailing routes with high safety standards",
            "routine maintenance on ship engines and managing maritime cargo focused on sea logistics optimization",
            "auditing deck and engine room security per International Maritime Organization (IMO) regulations",
            "administering ship logs and monitoring sea weather conditions to determine the safest sailing strategies"
        ]
    },
    "logistik": {
        "id": [
            "optimasi rantai pasok (supply chain) serta melakukan manajemen pergudangan untuk memastikan efisiensi distribusi barang",
            "monitoring pengiriman barang secara real-time serta melakukan audit stok inventaris guna menjaga akurasi data logistik",
            "evaluasi performa mitra kurir serta vendor logistik dalam rangka penghematan biaya operasional pengiriman",
            "penyusunan rencana alokasi barang pada pusat distribusi (DC) untuk mempercepat proses fulfillment order"
        ],
        "en": [
            "optimizing supply chains and managing warehousing to ensure efficient goods distribution",
            "monitoring real-time shipments and auditing inventory stock to maintain logistics data accuracy",
            "evaluating courier partner and logistics vendor performance to save on operational shipping costs",
            "drafting goods allocation plans at Distribution Centers (DC) to accelerate the order fulfillment process"
        ]
    },

    # == SENI, MUSIK & DESAIN ==
    "gambar": {
        "id": [
            "eksplorasi teknik visualisasi ilustrasi manual maupun digital guna menghasilkan karya seni yang memiliki nilai estetika",
            "penyusunan konsep gambar sketsa awal (storyboard) untuk kebutuhan proyek komunikasi visual serta media kreatif",
            "analisis proporsi serta komposisi warna pada karya seni visual untuk mencapai harmoni desain yang diinginkan",
            "finalisasi aset gambar ilustrasi dengan memperhatikan detail tekstur serta pencahayaan pada objek seni"
        ],
        "en": [
            "exploring manual and digital illustration visualization techniques to produce aesthetic art works",
            "composing initial sketch concepts (storyboards) for visual communication and creative media projects",
            "analyzing proportions and color compositions in visual art to achieve desired design harmony",
            "finalizing illustration image assets with attention to texture details and artistic lighting"
        ]
    },
    "musik": {
        "id": [
            "produksi komposisi musik serta aransemen audio menggunakan perangkat lunak (DAW) maupun instrumen musik akustik",
            "monitoring kualitas rekaman vokal serta instrumen secara teknis guna menghasilkan output audio yang jernih serta profesional",
            "eksplorasi harmoni serta dinamika musik dalam rangka penyelesaian proyek seni pertunjukan atau media digital",
            "manajemen peralatan audio serta instrumen musik serta melakukan riset tren genre musik populer saat ini"
        ],
        "en": [
            "producing music compositions and audio arrangements using software (DAW) and acoustic instruments",
            "monitoring vocal and instrument recording quality technically to produce clear, professional audio output",
            "exploring music harmony and dynamics for the completion of performing arts or digital media projects",
            "managing audio equipment and musical instruments and researching current popular music genre trends"
        ]
    },

    # == UMUM & PROFESIONAL ==
    "rapat": {
        "id": [
            "mengikuti koordinasi internal tim untuk membahas progres pengerjaan proyek serta melakukan penyelarasan target operasional",
            "berpartisipasi aktif dalam diskusi progres mingguan serta menyusun notulensi keputusan penting hasil rapat koordinasi",
            "penyelarasan teknis harian antar departemen guna memastikan kelancaran alur kerja serta komunikasi tim terintegrasi",
            "evaluasi hasil aktivitas harian bersama pimpinan untuk menentukan langkah strategis pengerjaan tugas berikutnya"
        ],
        "en": [
            "participating in internal team coordination to discuss project progress and aligning operational targets",
            "actively participating in weekly progress discussions and drafting minutes of key coordination meeting decisions",
            "daily technical alignment between departments to ensure smooth workflow and integrated team communication",
            "evaluating daily activity results with leadership to determine strategic steps for subsequent tasks"
        ]
    },
    "riset": {
        "id": [
            "melakukan studi literatur mendalam melalui berbagai sumber referensi ilmiah guna mendukung validitas data penelitian",
            "analisis data pendukung serta investigasi metode penelitian yang relevan dengan topik aktivitas profesional harian",
            "pengumpulan informasi riset dari lapangan maupun literatur digital untuk keperluan penyusunan laporan teknis",
            "pengolahan data hasil penelitian menggunakan perangkat lunak statistik guna menarik kesimpulan yang valid"
        ],
        "en": [
            "conducting in-depth literature studies via various scientific references to support research data validity",
            "analyzing supporting data and investigating research methods relevant to daily professional activity topics",
            "collecting research information from the field and digital literature for technical report preparation",
            "processing research findings using statistical software to draw valid conclusions"
        ]
    },
    "belajar": {
        "id": [
            "pendalaman materi kompetensi teknis melalui riset mandiri pada modul teknologi serta prosedur operasional instansi",
            "mempelajari dokumentasi teknis serta standar operasional prosedur (SOP) perusahaan guna meningkatkan kapasitas kerja",
            "mengikuti sesi bimbingan teknis (transfer of knowledge) dari senior untuk memperluas pemahaman alur kerja",
            "riset mandiri terkait metodologi kerja terbaru yang relevan dengan tugas harian untuk efisiensi operasional"
        ],
        "en": [
            "deepening technical competency material through self-research on technology modules and institutional SOPs",
            "studying technical documentation and company Standard Operating Procedures (SOP) to enhance work capacity",
            "participating in technical mentoring sessions (knowledge transfer) from seniors to broaden workflow understanding",
            "self-researching current work methodologies relevant to daily tasks for operational efficiency"
        ]
    },
    "dokumentasi": {
        "id": [
            "menyusun laporan aktivitas harian yang komprehensif serta mendokumentasikan setiap progres pengerjaan secara akurat",
            "bertanggung jawab dalam penyusunan panduan operasional (user guide) maupun update dokumentasi teknis sistem",
            "melakukan pengumpulan bukti dukung aktivitas (foto/berkas) serta pengarsipan data ke dalam sistem record instansi",
            "audit dokumentasi administratif guna memastikan kelengkapan syarat pelaporan progres aktivitas kepada pimpinan"
        ],
        "en": [
            "composing comprehensive daily activity reports and accurately documenting every work progress",
            "responsible for drafting operational guides (user guides) and updating system technical documentation",
            "collecting activity support evidence (photos/files) and archiving data into the institutional record system",
            "auditing administrative documentation to ensure completeness of progress reporting requirements to leadership"
        ]
    },
    "admin": {
        "id": [
            "menyelenggarakan administrasi perkantoran harian mulai dari korespondensi hingga manajemen record dokumen penting",
            "input data operasional ke dalam sistem informasi internal perusahaan serta melakukan validasi terhadap entri data",
            "penyusunan draf surat formal serta pengelolaan agenda pimpinan guna memastikan kelancaran jadwal aktivitas kantor",
            "arsip serta kategorisasi dokumen fisik maupun digital untuk mempermudah temu balik informasi di masa mendatang"
        ],
        "en": [
            "conducting daily office administration ranging from correspondence to key document record management",
            "entering operational data into internal company information systems and validating data entries",
            "preparing formal letter drafts and managing leadership agendas to ensure smooth office activity schedules",
            "archiving and categorizing physical and digital documents to facilitate future information retrieval"
        ]
    },
    "tugas": {
        "id": [
            "penyelesaian target kerja harian secara sistematis guna mencapai milestone yang telah ditetapkan oleh departemen",
            "monitoring progres tugas rutin serta melakukan evaluasi mandiri terhadap kualitas output pengerjaan harian",
            "finalisasi draf operasional serta penyiapan berkas pendukung tugas sesuai dengan petunjuk teknis yang diberikan pimpinan"
        ],
        "en": [
            "completing daily work targets systematically to achieve milestones set by the department",
            "monitoring routine task progress and performing self-evaluations on daily output quality",
            "finalizing operational drafts and preparing support files for tasks per technical instructions from leadership"
        ]
    },
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

# Common noise words
STOPWORDS = {"dan", "ke", "di", "dari", "pada", "untuk", "dengan", "ini", "itu", "atau", "adalah", "serta", "dalam", "yang", "the", "and", "to", "in", "is", "of", "with"}

def strip_indonesian_prefixes(word: str) -> str:
    """Helper to strip common Indonesian prefixes including informal versions."""
    if len(word) <= 3: return word
    prefixes = ['meng', 'meny', 'men', 'mem', 'me', 'peng', 'pen', 'pem', 'pe', 'di', 'ter', 'ke', 'ng', 'ny', 'n', 'm']
    for p in prefixes:
        if word.startswith(p) and len(word) > len(p) + 2:
            return word[len(p):]
    return word

def refine_description(prompt: str, lang: str = "id") -> str:
    """
    RAG+ v3.1: Token-Based High-Precision Scoring System with Multi-Language Support.
    """
    prompt_clean = prompt.lower().strip()
    if not prompt_clean: return ""

    tokens = re.findall(r'\w+', prompt_clean)
    important_tokens = [t for t in tokens if t not in STOPWORDS]
    
    unique_tokens = list(dict.fromkeys(important_tokens))
    # We only strip Indonesian prefixes if the prompt is presumably Indonesian or mixed
    # For English-only prompts, stripping 'meng-' might be harmless but not needed.
    root_tokens = [strip_indonesian_prefixes(t) for t in unique_tokens]
    search_tokens = list(set(unique_tokens + root_tokens))

    scores = {}
    for category in KEYWORDS_MAP.keys():
        score = 0
        cat_tokens = category.split()
        
        for p_token in search_tokens:
            for c_token in cat_tokens:
                # Rule A: Exact match (High Priority)
                if p_token == c_token:
                    score += 2.0
                
                # Rule B: Fuzzy Match with Dynamic Threshold
                elif len(p_token) >= 2 and len(c_token) >= 2:
                    ratio = difflib.SequenceMatcher(None, p_token, c_token).ratio()
                    threshold = 0.85 if len(c_token) <= 4 else 0.7
                    if ratio >= threshold:
                        # Ensure it's not a common false positive (like 'anak' vs 'bank')
                        if not (p_token == 'anak' and c_token == 'bank'):
                            score += 1.2
            
            # Rule C: Substring boost
            if len(p_token) > 3 and p_token in category:
                score += 0.8
        
        if score > 0:
            scores[category] = score

    sorted_categories = sorted(scores.items(), key=lambda x: (x[1], len(x[0])), reverse=True)
    matched_keys = [cat for cat, score in sorted_categories]

    if matched_keys:
        selected_keys = matched_keys[:2]
        # Language selection logic based on the 'lang' parameter
        target_lang = lang if lang in ['id', 'en'] else 'id'
        
        phrases = []
        for key in selected_keys:
            category_data = KEYWORDS_MAP[key]
            # Handle cases where a category might not have translations (safety)
            available_phrases = category_data.get(target_lang, category_data.get('id', []))
            if available_phrases:
                phrases.append(random.choice(available_phrases))
        
        if len(phrases) > 1:
            conn = random.choice(ID_CONNECTORS if target_lang == 'id' else EN_CONNECTORS)
            main_desc = f"{phrases[0]} {conn} {phrases[1]}"
        elif phrases:
            main_desc = phrases[0]
        else:
            main_desc = ""

        if main_desc:
            main_desc = main_desc.capitalize()
            connector = "terkait dengan" if target_lang == 'id' else "in relation to"
            return f"{main_desc} {connector} '{prompt}'"

    fallback_id = "Melakukan koordinasi operasional serta aktivitas profesional dalam rangka "
    fallback_en = "Performing operational coordination and professional activities for "
    fallback = fallback_en if lang == 'en' else fallback_id
    return f"{fallback}'{prompt}'"

def get_ai_refinement(prompt: str, lang: str = "id"):
    """
    Primary API for the backend to request AI refinement.
    """
    return refine_description(prompt, lang)
