import os
from PIL import Image, ImageDraw

os.makedirs('E:/AI-Agent/Workspace/anna-clip-studio/screenshots', exist_ok=True)

def draw_panel(draw, rect, fill, outline, radius=8):
    draw.rounded_rectangle(rect, radius=radius, fill=fill, outline=outline, width=1)

# Screenshot 1: Studio Console Overview
W, H = 1280, 800
im1 = Image.new('RGB', (W, H), (8, 9, 13))
d1 = ImageDraw.Draw(im1)

# Header
draw_panel(d1, [40, 30, W - 40, 90], (17, 19, 26), (35, 39, 54), 10)
d1.rectangle([60, 48, 84, 72], fill=(245, 158, 11))
d1.text((100, 48), 'CLIPSTUDIO AI', fill=(241, 245, 249))
d1.text((100, 64), 'AI VIRAL & RETENTION ENGINE', fill=(132, 146, 166))
draw_panel(d1, [W - 140, 46, W - 60, 74], (16, 185, 129), (16, 185, 129), 6)
d1.text((W - 124, 52), 'READY', fill=(8, 9, 13))

# Input Panel
draw_panel(d1, [40, 110, W - 40, 240], (17, 19, 26), (35, 39, 54), 10)
d1.text((60, 126), '▶ YouTube URL', fill=(245, 158, 11))
d1.text((190, 126), 'Subtitles / Transcript', fill=(132, 146, 166))
draw_panel(d1, [60, 156, W - 220, 196], (8, 9, 13), (35, 39, 54), 6)
d1.text((76, 168), 'https://www.youtube.com/watch?v=griZI_8FmcA (Raymond Chin - Ancaman MSCI)', fill=(241, 245, 249))
draw_panel(d1, [W - 200, 156, W - 60, 196], (245, 158, 11), (217, 119, 6), 6)
d1.text((W - 170, 168), 'Analyze Clips', fill=(8, 9, 13))

d1.text((60, 212), 'Target Duration:', fill=(132, 146, 166))
draw_panel(d1, [160, 206, 230, 230], (8, 9, 13), (35, 39, 54), 4)
d1.text((170, 212), '15s Hook', fill=(132, 146, 166))
draw_panel(d1, [240, 206, 310, 230], (245, 158, 11), (245, 158, 11), 4)
d1.text((250, 212), '30s Viral', fill=(8, 9, 13))
draw_panel(d1, [320, 206, 390, 230], (8, 9, 13), (35, 39, 54), 4)
d1.text((330, 212), '60s Deep', fill=(132, 146, 166))

# Video Meta
draw_panel(d1, [40, 260, W - 40, 360], (17, 19, 26), (35, 39, 54), 10)
d1.rectangle([60, 276, 200, 344], fill=(0, 0, 0), outline=(35, 39, 54))
d1.text((220, 280), 'Ancaman MSCI, Gw Jujur Bingung...', fill=(241, 245, 249))
d1.text((220, 306), 'Creator: Raymond Chin  *  Target: 30S  *  5 Viral Moments Detected', fill=(16, 185, 129))
draw_panel(d1, [W - 180, 290, W - 60, 330], (34, 39, 54), (59, 66, 89), 6)
d1.text((W - 160, 302), 'Export Dossier', fill=(241, 245, 249))

# Timeline Heatmap
draw_panel(d1, [40, 380, W - 40, 460], (17, 19, 26), (35, 39, 54), 8)
d1.text((60, 392), 'VIRAL RETENTION TIMELINE HEATMAP', fill=(84, 96, 117))
d1.text((W - 160, 392), '00:00 - 08:21', fill=(132, 146, 166))
draw_panel(d1, [60, 416, W - 60, 444], (8, 9, 13), (35, 39, 54), 4)
d1.rounded_rectangle([120, 420, 220, 440], radius=3, fill=(245, 158, 11))
d1.text((155, 424), '#1', fill=(0, 0, 0))
d1.rounded_rectangle([320, 420, 420, 440], radius=3, fill=(16, 185, 129))
d1.text((355, 424), '#4', fill=(0, 0, 0))
d1.rounded_rectangle([520, 420, 620, 440], radius=3, fill=(16, 185, 129))
d1.text((555, 424), '#5', fill=(0, 0, 0))
d1.rounded_rectangle([720, 420, 820, 440], radius=3, fill=(245, 158, 11))
d1.text((755, 424), '#3', fill=(0, 0, 0))
d1.rounded_rectangle([980, 420, 1080, 440], radius=3, fill=(245, 158, 11))
d1.text((1015, 424), '#2', fill=(0, 0, 0))

# Clip card preview
draw_panel(d1, [40, 480, W - 40, 760], (17, 19, 26), (35, 39, 54), 10)
d1.text((60, 500), '#1  87% VIRALITY (25.2s)  * 00:41 - 01:06', fill=(245, 158, 11))
d1.text((60, 530), 'Paling Penting Kita Udah Diancam Berkali-kali Sama MSCI', fill=(241, 245, 249))
draw_panel(d1, [60, 560, W - 60, 610], (8, 9, 13), (245, 158, 11), 4)
d1.text((76, 576), 'Hook: Paling penting? Kita udah diancam berkali-kali sama MSCI. IHSG kita anjlok...', fill=(226, 232, 240))

draw_panel(d1, [60, 630, W - 60, 740], (8, 9, 13), (35, 39, 54), 6)
d1.text((80, 646), '[HOOK - 0s-3s]  paling penting? Kita udah diancam berkali-kali sama MSCI!', fill=(245, 158, 11))
d1.text((80, 672), '[BODY - 3s-22s] IHSG anjlok sampai 4.900 terparah sejak 6 tahun lalu. Tapi apa iya gara-gara bursa kita?', fill=(241, 245, 249))
d1.text((80, 698), '[CTA - Final 3s] Save this clip and share your thoughts below!', fill=(16, 185, 129))

im1.save('E:/AI-Agent/Workspace/anna-clip-studio/screenshots/1-studio-console.png')
print('Screenshot 1 done!')

# Screenshot 2: AI Rewriter & Retention Psychology
im2 = Image.new('RGB', (W, H), (8, 9, 13))
d2 = ImageDraw.Draw(im2)
draw_panel(d2, [40, 30, W - 40, 90], (17, 19, 26), (35, 39, 54), 10)
d2.text((60, 52), 'CLIPSTUDIO AI // AI REASONING & PSYCHOLOGY SUITE', fill=(245, 158, 11))

draw_panel(d2, [40, 110, W - 40, 420], (22, 25, 34), (245, 158, 11), 12)
d2.text((60, 130), '#1 VIRAL CLIP CANDIDATE  *  RETENTION SCORE: 93% (AI EVALUATED)', fill=(16, 185, 129))
d2.text((60, 160), 'Title: Kenapa Keputusan MSCI Sangat Berbahaya Bagi Investor', fill=(241, 245, 249))

draw_panel(d2, [60, 196, W - 60, 246], (17, 19, 26), (245, 158, 11), 6)
d2.text((76, 212), 'AI Script Rewriter:', fill=(245, 158, 11))
draw_panel(d2, [230, 206, 360, 236], (8, 9, 13), (35, 39, 54), 4)
d2.text((244, 212), 'Provocative', fill=(241, 245, 249))
draw_panel(d2, [370, 206, 500, 236], (8, 9, 13), (35, 39, 54), 4)
d2.text((384, 212), 'High Energy', fill=(241, 245, 249))
draw_panel(d2, [510, 206, 640, 236], (8, 9, 13), (35, 39, 54), 4)
d2.text((524, 212), 'Storytelling', fill=(241, 245, 249))
draw_panel(d2, [650, 206, 800, 236], (8, 9, 13), (35, 39, 54), 4)
d2.text((664, 212), 'Direct Takeaway', fill=(241, 245, 249))

draw_panel(d2, [60, 260, W - 60, 390], (8, 9, 13), (16, 185, 129), 8)
d2.text((80, 280), 'AI VIEWER RETENTION PSYCHOLOGY BREAKDOWN:', fill=(16, 185, 129))
d2.text((80, 310), 'Pattern Interrupt: Challenges viewer complacency by opening with an existential financial threat.', fill=(241, 245, 249))
d2.text((80, 335), 'Curiosity Gap: Poses an unresolved controversy/global narrative mystery that prevents swiping in 0-5s.', fill=(241, 245, 249))
d2.text((80, 360), 'Recommended Visual: Rapid zoom-in cut at second 2, kinetic bold subtitles, red warning overlay.', fill=(132, 146, 166))

draw_panel(d2, [40, 440, W - 40, 750], (17, 19, 26), (35, 39, 54), 10)
d2.text((60, 460), '#2 VIRAL CLIP CANDIDATE  *  RETENTION SCORE: 88%  *  07:25 - 07:51', fill=(245, 158, 11))
d2.text((60, 490), 'Title: Teori Konspirasi Asing di Balik Ancaman Pasar Modal', fill=(241, 245, 249))
draw_panel(d2, [60, 526, W - 60, 576], (8, 9, 13), (35, 39, 54), 4)
d2.text((76, 542), 'Kenapa perspektif ini penting? Karena di kacamata mereka ada level subjektivitas...', fill=(226, 232, 240))
draw_panel(d2, [60, 596, W - 60, 720], (8, 9, 13), (35, 39, 54), 6)
d2.text((80, 616), 'Social Media Caption & Hashtags:', fill=(245, 158, 11))
d2.text((80, 646), 'Teori asing di balik ancaman MSCI ke bursa saham kita. Wajib tonton sampai habis!', fill=(241, 245, 249))
d2.text((80, 676), '#saham #investasi #raymondchin #shorts #viral #edukasikeuangan', fill=(6, 182, 212))

im2.save('E:/AI-Agent/Workspace/anna-clip-studio/screenshots/2-ai-clips-deck.png')
print('Screenshot 2 done!')

# Screenshot 3: Mobile View
im3 = Image.new('RGB', (800, 1000), (8, 9, 13))
d3 = ImageDraw.Draw(im3)

draw_panel(d3, [160, 40, 640, 960], (17, 19, 26), (245, 158, 11), 32)
d3.rounded_rectangle([320, 52, 480, 72], radius=10, fill=(8, 9, 13))

d3.text((190, 90), 'CLIPSTUDIO MOBILE', fill=(245, 158, 11))
draw_panel(d3, [180, 120, 620, 200], (8, 9, 13), (35, 39, 54), 8)
d3.text((194, 135), 'Paste YouTube URL...', fill=(132, 146, 166))
draw_panel(d3, [194, 160, 606, 190], (245, 158, 11), (217, 119, 6), 4)
d3.text((350, 168), 'Analyze Clips', fill=(0, 0, 0))

d3.text((190, 215), 'Quick Preset: Raymond Chin', fill=(16, 185, 129))

draw_panel(d3, [180, 245, 620, 360], (22, 25, 34), (35, 39, 54), 8)
d3.rectangle([194, 255, 310, 320], fill=(0, 0, 0))
d3.text((324, 260), 'Ancaman MSCI...', fill=(241, 245, 249))
d3.text((324, 280), 'Raymond Chin', fill=(132, 146, 166))
d3.text((324, 300), '5 Viral Clips', fill=(16, 185, 129))

draw_panel(d3, [180, 380, 620, 680], (22, 25, 34), (35, 39, 54), 10)
d3.text((194, 395), '#1  93% VIRAL  *  00:41-01:06', fill=(245, 158, 11))
d3.text((194, 420), 'Paling Penting Kita Udah Diancam', fill=(241, 245, 249))
draw_panel(d3, [194, 450, 606, 510], (8, 9, 13), (245, 158, 11), 4)
d3.text((204, 465), 'paling penting? Kita udah diancam...', fill=(226, 232, 240))

draw_panel(d3, [194, 530, 606, 610], (8, 9, 13), (35, 39, 54), 4)
d3.text((204, 545), '[HOOK] Kita udah diancam berkali-kali...', fill=(245, 158, 11))
d3.text((204, 570), '[BODY] IHSG anjlok ke 4.900...', fill=(241, 245, 249))

draw_panel(d3, [194, 630, 390, 665], (34, 39, 54), (59, 66, 89), 4)
d3.text((230, 642), 'Copy Script', fill=(241, 245, 249))
draw_panel(d3, [410, 630, 606, 665], (34, 39, 54), (59, 66, 89), 4)
d3.text((450, 642), 'Copy Caption', fill=(241, 245, 249))

draw_panel(d3, [180, 700, 620, 940], (22, 25, 34), (35, 39, 54), 10)
d3.text((194, 715), '#2  88% VIRAL  *  07:25-07:51', fill=(245, 158, 11))
d3.text((194, 740), 'Teori Konspirasi Asing di Pasar Modal', fill=(241, 245, 249))

im3.save('E:/AI-Agent/Workspace/anna-clip-studio/screenshots/3-mobile-view.png')
print('Screenshot 3 done!')
