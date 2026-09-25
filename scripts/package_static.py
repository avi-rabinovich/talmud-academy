"""Package only public site assets; exclude tools, tests, source notes, and credentials."""
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parents[1]
files = ['index.html','styles.css','study.css','parsing.css','roadmap.css',
         'questions.js','app.js','study.js','parsing-next.js','parsing-third.js',
         'parsing.js','roadmap.js','vocabulary-rest.js','word-quizzes.js','assets/berachot-26a.jpg']
output = root / 'release'
output.mkdir(exist_ok=True)
with zipfile.ZipFile(output / 'talmud-academy.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    for name in files:
        source = root / name
        assert source.is_file(), name
        archive.write(source, name)
with zipfile.ZipFile(output / 'talmud-academy.zip') as archive:
    assert archive.testzip() is None
    assert set(archive.namelist()) == set(files)
print(f'Packaged and validated {len(files)} public assets.')
