"""Build the two coursework slides with movable icons and editable labels."""
import json
from pathlib import Path
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

root = Path(__file__).resolve().parents[1]
folder = root / 'deliver' / '第三部分_功能图标'
labels = json.loads((folder / '图标清单.json').read_text(encoding='utf-8'))['labels']
deck = Presentation()
deck.slide_width, deck.slide_height = Inches(13.333333), Inches(7.5)
deck.core_properties.title = '节气食单：16种功能图标与双状态'
deck.core_properties.subject = '课程作业第三部分'

def pos(px):
    return Inches(px / 144)

def text(slide, x, y, w, h, copy, size, color='304F41'):
    box = slide.shapes.add_textbox(pos(x), pos(y), pos(w), pos(h))
    box.text_frame.word_wrap = True
    box.text_frame.margin_left = box.text_frame.margin_right = 0
    box.text_frame.margin_top = box.text_frame.margin_bottom = 0
    paragraph = box.text_frame.paragraphs[0]
    paragraph.text = copy
    paragraph.font.name = 'Microsoft YaHei'
    paragraph.font.size = Pt(size / 2)
    paragraph.font.bold = True
    paragraph.font.color.rgb = RGBColor.from_string(color)

entries = list(labels.items())
for page in range(2):
    slide = deck.slides.add_slide(deck.slide_layouts[6])
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = RGBColor.from_string('F8F6F0')
    text(slide, 72, 43, 1700, 38, '节气食单  /  第三部分：功能图标', 24)
    text(slide, 72, 91, 1700, 65, f'瓷玉四时 · 功能图标 {page + 1}/2', 48)
    text(slide, 72, 159, 1760, 36, '16 种功能图标，32 个状态。未选中保持中性色，选中恢复瓷玉配色并增加朱砂标记。', 24, '777D73')
    for i, (icon_id, label) in enumerate(entries[page * 8:page * 8 + 8]):
        x, y = 72 + i % 4 * 450, 205 + i // 4 * 386
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, pos(x), pos(y), pos(426), pos(360))
        card.adjustments[0] = .06
        card.fill.solid()
        card.fill.fore_color.rgb = RGBColor.from_string('FFFEFA')
        card.line.color.rgb = RGBColor.from_string('E1E3D8')
        text(slide, x + 26, y + 20, 380, 45, f'{page * 8 + i + 1:02d}  {label}', 28)
        for active, dx in [(False, 34), (True, 236)]:
            state = '选中' if active else '未选中'
            slide.shapes.add_picture(str(folder / '单个图标' / f'{icon_id}_{state}.png'), pos(x + dx), pos(y + 78), pos(156), pos(156))
            text(slide, x + dx + 22, y + 257, 140, 35, state, 26, '355E50' if active else '777D73')
        text(slide, x + 26, y + 310, 360, 26, icon_id, 19, '8A8C7E')
    text(slide, 72, 1006, 1776, 40, '青瓷釉色、瓷白与细铜边，连接食器文化和时令食养。动作按钮的“选中”用于按下或激活反馈。', 22, '777D73')
    slide.notes_slide.notes_text_frame.text = ('本页属于老师作业第三部分。全套16种功能图标，每种2种状态，共32个状态。'
        '图标主体由内置image_gen生成，工具未披露模型版本。双状态采用同一主体图配合确定性UI状态制作，避免重复生成产生形状漂移。'
        '图标为独立可移动的位图，标题、标签、卡片可编辑。图标主体不属于可逐路径编辑的矢量。'
        '搜索、分享、编辑在实际产品中采用瞬时按下/激活状态。24节气图标不计入16种功能图标。')

output = folder / '节气食单_第三部分_16种功能图标_双状态.pptx'
deck.save(output)
print(output)
