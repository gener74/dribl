from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor as PPTXColor
from pptx.enum.text import PP_ALIGN
import os

# ─────────────────────────────────────────────
# WORD
# ─────────────────────────────────────────────

doc = Document()

def heading(text, level=1):
    p = doc.add_heading(text, level=level)
    run = p.runs[0] if p.runs else p.add_run(text)
    run.font.color.rgb = RGBColor(0x16, 0xa3, 0x4a)
    return p

def body(text):
    p = doc.add_paragraph(text)
    p.runs[0].font.size = Pt(11)
    return p

def bullet(text):
    p = doc.add_paragraph(text, style='List Bullet')
    return p

def code(text):
    p = doc.add_paragraph(text)
    for run in p.runs:
        run.font.name = 'Courier New'
        run.font.size = Pt(9)
        run.font.color.rgb = RGBColor(0x16, 0x58, 0x1a)
    return p

# Títol
title = doc.add_heading('Documentació Tècnica — Dribl', 0)
title.alignment = WD_ALIGN_PARAGRAPH.CENTER

doc.add_paragraph('')

# 1. Visió general
heading('1. Visió General')
body('Dribl és una Progressive Web App (PWA) de tecnificació futbolística. Funciona com un joc per nivells: l\'usuari veu un vídeo demostratiu d\'un exercici tècnic i després l\'ha de repetir davant la càmera. La intel·ligència artificial valida en temps real si l\'exercici es fa correctament.')

# 2. Tecnologies
heading('2. Tecnologies')
techs = [
    ('Next.js 16', 'Framework web principal. Gestiona enrutament, servidor i optimitzacions.'),
    ('React 18', 'Llibreria d\'UI. La interfície es construeix amb components reutilitzables.'),
    ('TypeScript', 'JavaScript amb tipat estàtic. Evita errors de tipus en temps de compilació.'),
    ('Tailwind CSS', 'Framework d\'estils basat en classes utilitàries.'),
    ('Framer Motion', 'Animacions declaratives per a React.'),
    ('TensorFlow.js', 'Executa models d\'IA directament al navegador, sense servidor.'),
    ('COCO-SSD', 'Model d\'IA per detectar objectes a la imatge (pilota de futbol).'),
    ('MoveNet', 'Model d\'IA per detectar la postura humana i els keypoints del cos.'),
    ('Vercel', 'Plataforma de desplegament. Deploy automàtic en cada push a GitHub.'),
]
for name, desc in techs:
    p = doc.add_paragraph()
    p.add_run(f'{name}: ').bold = True
    run2 = p.add_run(desc)
    run2.font.size = Pt(11)
    p.style = 'List Bullet'

# 3. Estructura
heading('3. Estructura del Projecte')
structure = [
    'src/app/layout.tsx — Plantilla global de l\'app (capçalera HTML, metadata)',
    'src/app/page.tsx — Pàgina d\'inici: menú de nivells',
    'src/app/level/[id]/page.tsx — Pàgina dinàmica de cada nivell',
    'src/components/ExerciseCamera.tsx — Component de la càmera i joc',
    'src/components/VideoDemo.tsx — Component del vídeo demostratiu',
    'src/hooks/useBallTouchDetector.ts — Lògica d\'IA (detecció pilota i tocs)',
    'src/data/levels.ts — Definició de tots els nivells',
    'public/manifest.json — Configuració PWA (icones, nom, colors)',
    'public/sw.js — Service Worker per instal·lació i funcionament offline',
]
for s in structure:
    bullet(s)

# 4. Flux
heading('4. Flux de l\'Aplicació')
body('L\'usuari segueix aquest recorregut dins l\'app:')
flow = [
    'Menú principal ("/") — Llista els nivells disponibles i bloquejats.',
    'Pàgina de nivell ("/level/1") — Stage DEMO: vídeo explicatiu de l\'exercici.',
    'Stage EXERCICI — La càmera s\'activa i comença el joc.',
    'Loading: es carreguen els models d\'IA (uns 3-5 segons).',
    'Countdown: compte enrere 3, 2, 1, Va!',
    'Playing: bucle de detecció en temps real fins a completar tocs o esgotar el temps.',
    'Success / Timeout: pantalla de resultat.',
]
for f in flow:
    bullet(f)

# 5. Algorisme detecció
heading('5. Algorisme de Detecció de Tocs')
body('En cada frame del vídeo (fins a 60 vegades per segon) es realitza el procés següent:')
steps = [
    '1. COCO-SSD analitza la imatge i cerca una "sports ball" amb confiança > 40%.',
    '2. Si no la detecta, s\'usa l\'última posició coneguda fins a 300ms (persistència).',
    '3. MoveNet detecta els keypoints del cos i extreu les posicions dels 4 punts dels peus.',
    '4. Es calcula la distància euclidiana normalitzada (0.0 a 1.0) entre la pilota i cada peu.',
    '5. Si la distància és menor a 0.18, s\'incrementa el comptador de "frames prop del peu".',
    '6. Quan la pilota s\'allunya (havent estat ≥2 frames a prop), es registra un TOC.',
    '7. S\'aplica un cooldown de 500ms per evitar dobles comptatges del mateix toc.',
]
for s in steps:
    bullet(s)

# 6. PWA
heading('6. Progressive Web App (PWA)')
body('L\'app és instal·lable al mòbil com si fos una app nativa:')
pwa = [
    'Android (Chrome): banner automàtic "Afegir a la pantalla d\'inici".',
    'iOS (Safari): manual via botó Compartir → "Afegir a la pantalla d\'inici".',
    'Un cop instal·lada, s\'obre en mode pantalla completa sense barra del navegador.',
    'El Service Worker permet que funcioni offline per a les pàgines ja visitades.',
]
for p in pwa:
    bullet(p)

# 7. Afegir nivells
heading('7. Com Afegir un Nou Nivell')
body('Afegir un nivell nou és molt senzill. Només cal editar dos fitxers:')
bullet('src/data/levels.ts — Afegir un objecte nou a l\'array LEVELS amb id, title, targetCount, timeLimit, difficulty, icon...')
bullet('src/app/page.tsx — Afegir el nou id a la variable unlockedLevels per desbloquejarlo.')
bullet('(Opcional) public/videos/level-X.mp4 — Afegir el vídeo demostratiu.')

# 8. Desplegament
heading('8. Desplegament')
body('El flux de treball és:')
bullet('Editar codi en local → npm run dev per provar-ho.')
bullet('git add . && git commit -m "descripció" && git push')
bullet('Vercel detecta el push i redesplega automàticament.')
bullet('URL pública: https://dribl.vercel.app')

output_docx = r'C:\Projects\dribl\documentació\Dribl_Documentacio.docx'
doc.save(output_docx)
print(f'DOCX generat: {output_docx}')


# ─────────────────────────────────────────────
# POWERPOINT
# ─────────────────────────────────────────────

prs = Presentation()
prs.slide_width  = Inches(13.33)
prs.slide_height = Inches(7.5)

BG    = PPTXColor(0x0f, 0x1a, 0x0a)   # verd fosc
GREEN = PPTXColor(0x16, 0xa3, 0x4a)   # verd marca
WHITE = PPTXColor(0xFF, 0xFF, 0xFF)
LGREY = PPTXColor(0xcc, 0xcc, 0xcc)

def set_bg(slide):
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = BG

def add_title_box(slide, text, top=Inches(0.4)):
    txBox = slide.shapes.add_textbox(Inches(0.5), top, Inches(12.3), Inches(0.8))
    tf = txBox.text_frame
    tf.word_wrap = False
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.LEFT
    run = p.add_run()
    run.text = text
    run.font.size = Pt(32)
    run.font.bold = True
    run.font.color.rgb = GREEN

def add_body_box(slide, lines, top=Inches(1.4), font_size=18):
    txBox = slide.shapes.add_textbox(Inches(0.6), top, Inches(12.1), Inches(5.5))
    tf = txBox.text_frame
    tf.word_wrap = True
    first = True
    for line in lines:
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.alignment = PP_ALIGN.LEFT
        run = p.add_run()
        run.text = line
        run.font.size = Pt(font_size)
        run.font.color.rgb = WHITE if not line.startswith('  ') else LGREY

def add_two_col(slide, left_lines, right_lines, top=Inches(1.4)):
    for lines, left_pos in [(left_lines, 0.5), (right_lines, 6.8)]:
        txBox = slide.shapes.add_textbox(Inches(left_pos), top, Inches(5.8), Inches(5.5))
        tf = txBox.text_frame
        tf.word_wrap = True
        first = True
        for line in lines:
            p = tf.paragraphs[0] if first else tf.add_paragraph()
            first = False
            run = p.add_run()
            run.text = line
            run.font.size = Pt(16)
            run.font.color.rgb = WHITE if not line.startswith(' ') else LGREY

blank = prs.slide_layouts[6]

# Slide 1 — Portada
s = prs.slides.add_slide(blank)
set_bg(s)
txBox = s.shapes.add_textbox(Inches(1), Inches(2.2), Inches(11), Inches(1.5))
tf = txBox.text_frame
p = tf.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
run = p.add_run()
run.text = '⚽  DRIBL'
run.font.size = Pt(60)
run.font.bold = True
run.font.color.rgb = GREEN

txBox2 = s.shapes.add_textbox(Inches(1), Inches(3.9), Inches(11), Inches(0.8))
tf2 = txBox2.text_frame
p2 = tf2.paragraphs[0]
p2.alignment = PP_ALIGN.CENTER
run2 = p2.add_run()
run2.text = 'Documentació Tècnica del Projecte'
run2.font.size = Pt(22)
run2.font.color.rgb = LGREY

txBox3 = s.shapes.add_textbox(Inches(1), Inches(4.9), Inches(11), Inches(0.6))
tf3 = txBox3.text_frame
p3 = tf3.paragraphs[0]
p3.alignment = PP_ALIGN.CENTER
run3 = p3.add_run()
run3.text = 'App de tecnificació futbolística amb IA'
run3.font.size = Pt(16)
run3.font.color.rgb = PPTXColor(0x4a, 0xde, 0x80)

# Slide 2 — Visió General
s = prs.slides.add_slide(blank)
set_bg(s)
add_title_box(s, 'Visió General')
add_body_box(s, [
    '🎯  Objectiu',
    '  Ajudar futbolistes a millorar la seva tecnificació a través d\'un joc per nivells.',
    '',
    '📱  Com funciona',
    '  1. L\'usuari veu un vídeo demostratiu d\'un exercici tècnic.',
    '  2. Es grava amb la càmera del mòbil o ordinador fent l\'exercici.',
    '  3. La IA detecta i compta els tocs en temps real.',
    '  4. Si completa l\'objectiu, passa al nivell següent.',
    '',
    '🌐  Accessible des de qualsevol dispositiu — mòbil, tablet, ordinador',
], font_size=17)

# Slide 3 — Tecnologies
s = prs.slides.add_slide(blank)
set_bg(s)
add_title_box(s, 'Tecnologies')
add_two_col(s,
    [
        '⚙️  Frontend',
        '',
        ' Next.js 16 — Framework web principal',
        ' React 18 — Components d\'interfície',
        ' TypeScript — JavaScript amb tipat',
        ' Tailwind CSS — Estils',
        ' Framer Motion — Animacions',
    ],
    [
        '🤖  Intel·ligència Artificial',
        '',
        ' TensorFlow.js — IA al navegador',
        ' COCO-SSD — Detecció de la pilota',
        ' MoveNet — Detecció de postura/peus',
        '',
        '☁️  Infraestructura',
        '',
        ' GitHub — Control de versions',
        ' Vercel — Desplegament automàtic',
    ]
)

# Slide 4 — Arquitectura
s = prs.slides.add_slide(blank)
set_bg(s)
add_title_box(s, 'Arquitectura del Projecte')
add_body_box(s, [
    'src/app/page.tsx              →   Menú principal (llista de nivells)',
    'src/app/level/[id]/page.tsx  →   Pàgina de cada nivell (demo + exercici)',
    'src/components/ExerciseCamera.tsx  →   Càmera + bucle de joc',
    'src/components/VideoDemo.tsx       →   Reproductor del vídeo demostratiu',
    'src/hooks/useBallTouchDetector.ts  →   Motor d\'IA (detecció pilota i tocs)',
    'src/data/levels.ts                 →   Definició de tots els nivells',
    'public/manifest.json + sw.js       →   Fitxers PWA (instal·lació mòbil)',
], font_size=16)

# Slide 5 — Flux
s = prs.slides.add_slide(blank)
set_bg(s)
add_title_box(s, 'Flux de l\'Aplicació')
add_body_box(s, [
    'Menú  →  Demo vídeo  →  Loading IA  →  Countdown  →  Playing  →  Resultat',
    '',
    '1️⃣   Menú principal — L\'usuari veu els nivells disponibles i bloquejats.',
    '2️⃣   Demo — Es reprodueix un vídeo explicatiu de l\'exercici.',
    '3️⃣   Loading — Es carreguen els dos models d\'IA (~3-5 segons).',
    '4️⃣   Countdown — Compte enrere 3, 2, 1, Va!',
    '5️⃣   Playing — Bucle de detecció en temps real. Es compten els tocs.',
    '6️⃣   Resultat — Success si completa l\'objectiu, Timeout si s\'acaba el temps.',
], font_size=17)

# Slide 6 — Algorisme IA
s = prs.slides.add_slide(blank)
set_bg(s)
add_title_box(s, 'Algorisme de Detecció de Tocs')
add_body_box(s, [
    'Per cada frame de vídeo (~60 vegades/segon):',
    '',
    '  🔵  COCO-SSD detecta la pilota → posició normalitzada (0.0 – 1.0)',
    '  🔵  Si no la detecta, s\'usa l\'última posició fins a 300ms (persistència)',
    '  🔵  MoveNet detecta els 4 keypoints dels peus',
    '  🔵  Es calcula la distància euclidiana pilota ↔ peu',
    '  🔵  Si distància < 0.18 durant ≥2 frames → possible toc',
    '  🔵  Quan la pilota s\'allunya → TOC registrat',
    '  🔵  Cooldown 500ms entre tocs per evitar dobles comptatges',
], font_size=17)

# Slide 7 — PWA
s = prs.slides.add_slide(blank)
set_bg(s)
add_title_box(s, 'PWA — Instal·lació com a App Nativa')
add_body_box(s, [
    'L\'app es pot instal·lar al mòbil sense passar per cap App Store.',
    '',
    '🤖  Android (Chrome)',
    '  El navegador mostra automàticament "Afegir a la pantalla d\'inici".',
    '',
    '🍎  iOS (Safari)',
    '  Botó Compartir → "Afegir a la pantalla d\'inici".',
    '',
    '✅  Un cop instal·lada: icona pròpia, pantalla completa, funciona offline.',
], font_size=17)

# Slide 8 — Desplegament
s = prs.slides.add_slide(blank)
set_bg(s)
add_title_box(s, 'Desplegament')
add_body_box(s, [
    '🔁  Flux de treball continu',
    '',
    '  Editar codi  →  git push  →  Vercel redesplega automàticament',
    '',
    '🌍  URL pública:  https://dribl.vercel.app',
    '',
    '📦  Repositori:  github.com/gener74/dribl',
    '',
    '💰  Cost actual: 0€  (pla gratuït de Vercel)',
], font_size=18)

# Slide 9 — Roadmap
s = prs.slides.add_slide(blank)
set_bg(s)
add_title_box(s, 'Pròxims Passos')
add_two_col(s,
    [
        '✅  Fet',
        '',
        ' Detecció de tocs amb IA',
        ' 3 nivells de dificultat',
        ' PWA instal·lable al mòbil',
        ' Desplegament a Vercel',
        ' Documentació tècnica',
    ],
    [
        '🔜  Pendent',
        '',
        ' Vídeos demostratius reals',
        ' Sistema de desbloqueig de nivells',
        ' Perfils d\'usuari i progrés',
        ' Nous tipus d\'exercici',
        ' Domini propi',
    ]
)

output_pptx = r'C:\Projects\dribl\documentació\Dribl_Presentacio.pptx'
prs.save(output_pptx)
print(f'PPTX generat: {output_pptx}')
