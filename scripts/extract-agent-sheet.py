"""Extrai a definição da ficha fornecida, sem executar JavaScript do PDF.

Uso: python3 scripts/extract-agent-sheet.py /caminho/Ficha_Monstrao_Automatica_Editavel.pdf
Dependência apenas para regeneração: pypdf.
"""
import hashlib
import json
import re
import sys
from pathlib import Path
from pypdf import PdfReader

source = Path(sys.argv[1])
root = Path(__file__).resolve().parent.parent
reader = PdfReader(source)
pdf_fields = reader.get_fields()
specs = {}
calculations = {}
validations = {}
for name, field in pdf_fields.items():
    spec = {
        "label": str(field.get('/TU', name)),
        "defaultValue": str(field.get('/DV', '')),
        "readOnly": bool(int(field.get('/Ff', 0)) & 1),
        "type": 'choice' if field.get('/FT') == '/Ch' else 'graphic' if field.get('/FT') == '/Btn' else 'text',
    }
    if spec['type'] == 'graphic':
        spec['defaultValue'] = spec['defaultValue'].removeprefix('/')
    if '/Opt' in field:
        spec['options'] = [str(value) for value in field['/Opt']]
    if int(field.get('/Ff', 0)) & 4096:
        spec['multiline'] = True
    actions = field.get('/AA', {})
    if '/V' in actions:
        script = str(actions['/V'].get_object()['/JS'])
        validations[name] = script
        match = re.search(r'\)\(event,([^;]+)\);', script)
        minimum, maximum, integer, blank = json.loads('[' + match.group(1) + ']')
        spec['numeric'] = {"min": minimum, "max": maximum, "integer": integer, "allowBlank": blank}
    if '/C' in actions:
        calculations[name] = str(actions['/C'].get_object()['/JS'])
    specs[name] = spec

order = [str(ref.get_object()['/T']) for ref in reader.trailer['/Root']['/AcroForm']['/CO']]
skills = []
for name, spec in specs.items():
    if re.fullmatch(r'per_[bg]\d+_base', name):
        prefix = name.removesuffix('_base')
        match = re.search(r'event.value=n\("(attr_\w+)"\)', calculations.get(name, ''))
        skills.append({"id": prefix, "label": spec['label'].removesuffix(' - Base'), "attribute": match.group(1) if match else None})

metadata = {"sourceFilename": source.name, "sha256": hashlib.sha256(source.read_bytes()).hexdigest(), "pageCount": len(reader.pages), "abilityRows": 11, "attackRows": 11, "inventoryRows": 26}
js = '// Gerado a partir dos campos AcroForm do PDF fornecido. Regeneração: scripts/extract-agent-sheet.py.\n'
for name, value in [('agentSheetSource', metadata), ('agentSheetFields', specs), ('agentSheetSkills', skills)]:
    js += f'export const {name} = ' + json.dumps(value, ensure_ascii=False, indent=2) + ';\n\n'
(root / 'src/agent-sheet-schema.js').write_text(js.rstrip() + '\n')
fixture = root / 'tests/fixtures/agent-sheet-pdf.json'
fixture.parent.mkdir(exist_ok=True)
fixture.write_text(json.dumps({"source": metadata, "fields": specs, "calculationOrder": order, "calculations": calculations, "validations": validations}, ensure_ascii=False, indent=2))
print(f'{len(specs)} campos; {sum(not value["readOnly"] for value in specs.values())} editáveis; {len(calculations)} cálculos; {len(skills)} perícias.')
