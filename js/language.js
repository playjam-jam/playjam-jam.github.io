'use strict';

(() => {
  const storageKey = 'playjam.ui-language';
  const root = document.documentElement;
  const pickers = [...document.querySelectorAll('[data-language-picker]')];
  const attributes = ['aria-label', 'title', 'placeholder', 'alt'];
  const textRecords = new WeakMap();
  const attributeRecords = new WeakMap();
  const containsKorean = /[가-힣]/;
  const english = {
    'PLAY JAM 시작': 'Start PLAY JAM',
    'PLAY JAM 홈': 'PLAY JAM home',
    '처음이라면 추천해요!': 'New here? Try the tutorial!',
    'PLAY JAM 체험 조사': 'PLAY JAM usability study',
    '편하게 연주하고, 체험 후 설문에 답해 주세요.': 'Try PLAY JAM and answer the survey when you finish.',
    '체험 기록과 설문 응답은 코드로 연결해 수업과 사이트 개선에 활용합니다.': 'A code links your visit and survey answers for class research and site improvements.',
    '체험 시작': 'Start session',
    '체험 마치고 설문하기': 'Finish and take the survey',
    '체험 마치고': 'Finish and',
    '설문하기': 'Take the survey',
    '체험이 끝나면 여기서 설문에 답해 주세요.': 'Take the survey here when you finish.',
    '도움말': 'Help',
    'PLAY JAM 사용법': 'PLAY JAM Help',
    '도움말 닫기': 'Close help',
    '사용법 다시 보기': 'Open help',
    '기기별 사용법': 'Instructions by device',
    '튜토리얼 다시 보기': 'Replay tutorial',
    '처음이라면 3가지만': 'Start with three steps',
    '타이핑으로 입력': 'Type to add symbols',
    'Type·Draw 입력': 'Use Type or Draw',
    '도움말 주제': 'Help topics',
    '기호 입력': 'Add symbols',
    '마우스': 'Mouse',
    '커서 이동': 'Move cursor',
    '편집': 'Edit',
    '감상': 'Listen',
    '재생·감상': 'Play & listen',
    '공유·저장': 'Share & save',
    '공유 및 저장': 'Share and save',
    '악기·테마': 'Instruments & themes',
    '악기 선택': 'Select an instrument',
    '소리 테마 선택 · 밴드, 캐롤, 비트박스': 'Choose a sound theme: Band, Carol, or Beatbox',
    '음높이': 'Pitch',
    '자유 연주 – 높은 음': 'Free play – high notes',
    '자유 연주 – 가운데 음': 'Free play – middle notes',
    '자유 연주 – 낮은 음': 'Free play – low notes',
    '건반 연주 – 낮은 음부터 높은 음까지': 'Keys – low to high notes',
    '쉼표·기호': 'Rests & symbols',
    '쉼표 · 한 칸 넘기기': 'Rest · skip one space',
    '하이햇 · 킥': 'Hi-hat · kick',
    '기호 강조': 'Accent a symbol',
    '클릭': 'Click',
    '기호 배치': 'Place a symbol',
    '드래그': 'Drag',
    '기호 연속 배치': 'Place a series of symbols',
    '+클릭': '+ click',
    '기호 없이 커서 이동': 'Move the cursor without placing a symbol',
    '한 칸 이동': 'Move one space',
    '윗줄 · 아랫줄 이동': 'Move up or down a row',
    '줄의 처음 · 끝': 'Start or end of the row',
    '악보의 처음 · 마지막 기호 뒤': 'Start of the score or after the last symbol',
    '다음 줄 처음': 'Start of the next row',
    '최근 기호 삭제': 'Delete the last symbol',
    '켜고 클릭': 'Turn on and click',
    '클릭으로 한 개, 드래그로 여러 개 삭제': 'Click to delete one, or drag to delete several',
    '삭제 모드 종료': 'Exit delete mode',
    '(단축키:': '(Shortcut:',
    '되돌리기': 'Undo',
    '다시 실행': 'Redo',
    '실행 취소': 'Undo',
    '실행 취소 및 다시 실행': 'Undo and redo',
    '초기화': 'Reset',
    '전체 초기화': 'Reset score',
    '악보 전체 초기화': 'Reset the entire score',
    '악보 축소 · 확대': 'Zoom out or in',
    '편집 화면에서 재생·일시정지': 'Play or pause while editing',
    '처음부터 재생': 'Play from the start',
    '줄 왼쪽 ▶': '▶ to the left of a row',
    '선택한 줄부터 재생': 'Play from the selected row',
    '악보를 크게 보며 감상': 'Listen in full-screen view',
    '편집으로 돌아가기': 'Return to editing',
    '편집으로 돌아가기 (Esc)': 'Return to editing (Esc)',
    '편집 화면으로 돌아가기 (Esc)': 'Return to editing (Esc)',
    '감상 화면에서 반복 재생': 'Loop playback in listening view',
    '악보 링크 복사': 'Copy the score link',
    '악보 저장 · PNG 또는 PDF': 'Save the score as PNG or PDF',
    '❄ 타이핑 연주 중 겨울 단어를 발견해보세요': '❄ Discover winter words as you type to play.',
    'Windows 단축키 · ⌘ →': 'Windows shortcuts · ⌘ →',
    '터치 제스처': 'Touch gestures',
    '입력 방법': 'Input methods',
    '키보드를 열고 글자로 입력 · 다시 탭해 닫기': 'Open the keyboard and type · tap again to close it',
    '악보를 탭하거나 끌어 기호 배치': 'Tap or drag across the score to place symbols',
    '악기·기호': 'Instruments & symbols',
    '악기': 'Instrument',
    '악기 아이콘을 탭해 선택 · Type에서는 숫자 1–6': 'Tap an instrument, or use 1–6 in Type',
    '기호': 'Symbol',
    '기호 선택 · 악기, 음표, 원, 혼합': 'Choose instrument icons, notes, circles, or mixed symbols',
    '소리 테마': 'Sound theme',
    '자유 연주': 'Free play',
    '누른 글자나 악보 위치에 따라 음높이 변화': 'Pitch varies with the key or position on the score',
    '건반 연주': 'Keys',
    '건반처럼 정해진 음높이로 연주': 'Play fixed pitches like piano keys',
    '한 손가락으로 밀어 이동': 'Swipe with one finger to scroll',
    '두 손가락으로 밀어 이동': 'Swipe with two fingers to scroll',
    '두 손가락': 'Two fingers',
    '오므리기 · 벌리기로 축소 · 확대': 'Pinch in or out to zoom',
    '탭으로 한 개, 드래그로 여러 개 삭제': 'Tap to delete one, or drag to delete several',
    '화면 모드': 'Screen mode',
    '재생 제어': 'Playback controls',
    '재생': 'Play',
    '일시정지': 'Pause',
    '감상 화면 열기': 'Open listening view',
    '반복 재생': 'Loop playback',
    '편집 도구를 숨기고 재생에 집중': 'Hide editing tools and focus on playback',
    '링크 공유': 'Share link',
    '링크 공유 — 링크 복사': 'Share link — copy link',
    '악보 저장': 'Save score',
    '악보 저장 — 미리보기, PNG·PDF': 'Save score — preview, PNG or PDF',
    '악기 랜덤': 'Random instrument',
    '시각 테마': 'Visual theme',
    '악기 입력 패드': 'Instrument pad',
    '악기 종류': 'Instrument types',
    '선택한 악기의 기호': 'Symbols for the selected instrument',
    '장식 밀도': 'Effect density',
    '공유된 합주': 'Shared jam',
    '▶를 눌러 감상해 보세요': 'Press ▶ to listen',
    '사이드바 접기 / 펼치기': 'Collapse or expand the sidebar',
    '사이드바 접기': 'Collapse sidebar',
    '삭제 모드': 'Delete mode',
    '켜고 아이콘을 누르면 삭제': 'Turn on and select symbols to delete them',
    '제목·아이콘·설정 전체 초기화': 'Reset the title, symbols, and settings',
    '축소': 'Zoom out',
    '기본 크기': 'Default zoom',
    '확대': 'Zoom in',
    '악보 크기를 화면에 맞추기': 'Fit the score to the screen',
    '그래픽 악보 편집': 'Edit graphic score',
    '악보 감상': 'Listen to the score',
    '공유 링크': 'Share link',
    '닫기': 'Close',
    '미리보기': 'Preview',
    '이전 페이지': 'Previous page',
    '다음 페이지': 'Next page',
    '형식': 'Format',
    '발견한 겨울': 'Winter finds',
    '발견한 겨울과 함께 저장': 'Include winter finds',
    '음표 아래': 'Below the notes',
    '페이지 아래': 'At the bottom of the page',
    '이 악보에서 발견한 겨울이 아직 없어요.': 'There are no winter finds in this score yet.',
    '연주하다가 겨울 단어를 찾아보세요.': 'Look for winter words as you play.',
    '저장': 'Save',
    'PDF 저장': 'Save PDF',
    'PNG 저장': 'Save PNG',
    'PDF로 저장했어요.': 'Saved as PDF.',
    '저장하지 못했어요.': 'Could not save the score.',
    '이미지를 저장하지 못했어요.': 'Could not save the image.',
    '먼저 악보에 기호를 놓아 보세요.': 'Place a symbol on the score first.',
    '붐': 'Boom',
    '밥': 'Bap',
    '둡': 'Doop',
    '밴드': 'Band',
    '캐롤': 'Carol',
    '비트박스': 'Beatbox',
    '터치·드래그': 'Tap or drag',
    '한 손가락으로 누르거나 끌어 보세요': 'Tap or drag with one finger',
    '스크롤': 'Scroll',
    '두 손가락을 같은 방향으로 밀어 보세요': 'Swipe two fingers in the same direction',
    '오므리기·벌리기': 'Pinch to zoom',
    '두 손가락을 오므리거나 벌려 보세요': 'Pinch in or out with two fingers',
    '악보를 저장해 보세요': 'Try saving the score',
    '편집으로 돌아가 보세요': 'Return to editing',
    'Type을 눌러 키보드를 열어 보세요': 'Tap Type to open the keyboard',
    'Draw를 눌러 보세요': 'Tap Draw',
    '글자를 입력해 반투명 기호를 채워 보세요': 'Type to fill in the faded symbols',
    '첫 오선의 빈 곳을 클릭하거나 드래그해 기호를 놓아 보세요': 'Click or drag on the first staff to place a symbol',
    '로 재생': ' to play',
    '로 감상': ' to listen',
    '타이핑 연주 중 겨울 단어를 발견해보세요': 'Discover winter words as you type to play.',
    '소리 시작이 차단됐어요. PLAY를 다시 눌러 주세요.': 'Audio was blocked. Press PLAY again.',
    '오디오가 중단됐어요. PLAY를 다시 눌러 주세요.': 'Audio was interrupted. Press PLAY again.',
    '음원이 준비되지 않았어요. PLAY를 다시 눌러 주세요.': 'Audio is not ready. Press PLAY again.',
    '지원하지 않는 작품 데이터예요.': 'This score format is not supported.',
    '크리스마스': 'Christmas', '트리': 'Tree', '눈사람': 'Snowman', '산타': 'Santa',
    '루돌프': 'Rudolph', '붕어빵': 'Bungeoppang', '선물': 'Gift',
    '눈송이': 'Snowflake', '스노우볼': 'Snow globe', '이글루': 'Igloo',
    '저장하면 악보와 함께 그려져요': 'Save it as part of the score.',
    '재생할 때 줄마다 나타나요': 'It appears along the staff as you play.',
    '작품 데이터를 읽지 못했어요.': 'Could not load the score.',
    '음원을 불러오지 못했어요.': 'Could not load the sound.',
    '악기 테마': 'Instrument theme',
    '음표 테마': 'Note theme',
    '원형 테마': 'Circle theme',
    '혼합 테마': 'Mixed theme',
    '작품 제목': 'Score title',
    '작가 이름': 'Artist name',
    '이 줄부터 재생': 'Play from this row',
    '이 줄 이후에 기호를 놓아 주세요.': 'Place a symbol on this row or a later one first.',
    '이 작품의 아이콘 한도에 도달했어요.': 'This score has reached its symbol limit.',
    '실제 악기 음원이 아직 연결되지 않았어요.': 'Some instrument sounds are not available yet.',
    '오디오를 시작할 수 없어요.': 'Could not start playback.',
    '소리가 중단됐어요. 재생 버튼을 다시 눌러 보세요.': 'Audio was interrupted. Press Play again.',
    '초기화했어요.': 'Score reset.',
    '악기 패널 펼치기': 'Expand instruments',
    '악기 패널 접기': 'Collapse instruments',
    '링크를 복사하여, 공유해주세요!': 'Copy the link to share your score!',
    '아래 링크를 직접 복사해 공유해 주세요.': 'Copy the link below to share your score.',
    '소리 테마 고르기': 'Choose a sound theme',
    '도': 'Do', '레': 'Re', '미': 'Mi', '파': 'Fa', '솔': 'Sol', '라': 'La', '시': 'Ti',
    '모바일 입력 패드': 'Mobile input pad',
    '연주 방식 바꾸기': 'Change play mode',
    '패드 접기': 'Collapse pad',
    '패드 펼치기': 'Expand pad',
    '랜덤 악기': 'Random instrument',
    '휴대폰 키보드로 연주': 'Play using your phone keyboard',
    '입력 방식': 'Input mode',
    '건반': 'Keys',
    '자유': 'Free',
    '랜덤 악기 켜기 또는 끄기': 'Toggle random instrument',
    '랜덤': 'Random',
    '키별 음 보기': 'Show notes by key',
    '베이스는 한 옥타브 낮게 · 드럼은 타격음 유지': 'Bass plays an octave lower · drums keep their percussion sounds',
    '악보를 초기화할까요?': 'Reset the score?',
    '제목과 악보에 놓은 기호가 지워져요.': 'The title and all symbols will be cleared.',
    '선택한 음높이 모드는 그대로예요.': 'Your pitch mode stays the same.',
    '아니오': 'No',
    '예': 'Yes',
    '저장했어요.': 'Saved.'
  };

  const instrumentLabels = {
    '드럼': 'Drums', '신디사이저': 'Synth', '베이스 기타': 'Bass guitar',
    '어쿠스틱 기타': 'Acoustic guitar', '클린 일렉트릭 기타': 'Clean electric guitar',
    '디스토션 일렉트릭 기타': 'Distorted electric guitar'
  };
  const formatted = [
    [/^(\d+)페이지$/, ([, n]) => 'Page ' + n],
    [/^(\d+) \/ (\d+)페이지$/, ([, page, total]) => `Page ${page} of ${total}`],
    [/^PNG (\d+)장 저장$/, ([, n]) => `Save ${n} PNGs`],
    [/^PDF 한 파일\((\d+)페이지\)로 저장했어요\.$/, ([, n]) => `Saved one PDF (${n} pages).`],
    [/^악보 이미지 (\d+)장을 저장했어요\.$/, ([, n]) => `Saved ${n} score images.`],
    [/^🎉 겨울을 모두 찾았어요! \((\d+\/\d+)\)$/, ([, count]) => `🎉 You found every winter surprise! (${count})`],
    [/^❄ 겨울을 하나 발견했어요! — (.+) \((\d+\/\d+)\)$/, ([, word, count]) => `❄ Winter find: ${english[word]} (${count})`],
    [/^❄ (.+) — 이 악보에도 담겼어요$/, ([, word]) => `❄ ${english[word]} was added to this score.`],
    [/^❄ 친구가 발견한 겨울 (\d+)개가 숨어 있어요$/, ([, n]) => `❄ Winter finds hidden in this shared score: ${n}`],
    [/^(.+) 악기 선택$/, ([, name]) => `Select ${name}`],
    [/^(.+) 입력 (\d+)$/, ([, name, key]) => `Play ${name} (${key})`],
    [/^소리 (\d+)$/, ([, n]) => `Sound ${n}`],
    [/^높이 (\d+)$/, ([, n]) => `Pitch ${n}`],
    [/^([도레미파솔라시]) ([A-Z])$/, ([, note, key]) => `${english[note]} ${key}`],
    [/^(.+) (기본|그래픽 \d+)(?: · 킥)?$/, ([full, name, variant]) => instrumentLabels[name] &&
      `${instrumentLabels[name]} ${variant === '기본' ? 'default' : 'symbol ' + variant.split(' ')[1]}${full.endsWith('킥') ? ' · kick' : ''}`]
  ];

  function translated(source) {
    const key = source.trim();
    let output = english[key];
    if (output === undefined) {
      for (const [pattern, format] of formatted) {
        const match = pattern.exec(key);
        if (match && (output = format(match))) break;
      }
    }
    if (!output) return source;
    return source.replace(key, () => output);
  }

  function localize(current, record, write) {
    const source = record?.output === current ? record.source : current;
    if (!containsKorean.test(source)) return;
    const output = root.lang === 'en' ? translated(source) : source;
    if (output !== current) write(output);
    return { source, output };
  }

  const excluded = '[data-language-picker], [contenteditable], script, style, svg';
  function localizeText(node) {
    if (node.parentElement?.closest(excluded + ', textarea')) return;
    const record = localize(node.data, textRecords.get(node), output => { node.data = output; });
    if (record) textRecords.set(node, record);
  }

  function localizeAttributes(element, keys = attributes) {
    if (element.closest(excluded)) return;
    let records = attributeRecords.get(element);
    for (const key of keys) {
      const current = element.getAttribute(key);
      if (current === null) {
        records?.delete(key);
        continue;
      }
      const record = localize(current, records?.get(key), output => element.setAttribute(key, output));
      if (record) {
        if (!records) attributeRecords.set(element, records = new Map());
        records.set(key, record);
      }
    }
  }

  function localizeTree(element) {
    if (element.nodeType === Node.TEXT_NODE) return localizeText(element);
    if (element.nodeType !== Node.ELEMENT_NODE || element.closest(excluded)) return;
    localizeAttributes(element);
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, node =>
      node.nodeType === Node.ELEMENT_NODE && node.matches(excluded) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.nodeType === Node.TEXT_NODE) localizeText(node);
      else localizeAttributes(node);
    }
  }

  function applyLanguage(language) {
    root.lang = language;
    for (const picker of pickers) {
      for (const button of picker.querySelectorAll('[data-language]')) {
        button.setAttribute('aria-pressed', String(button.dataset.language === language));
      }
    }
    localizeTree(document.body);
  }

  let savedLanguage;
  try { savedLanguage = localStorage.getItem(storageKey); } catch {}
  applyLanguage(savedLanguage === 'en' ? 'en' : 'ko');

  for (const picker of pickers) {
    picker.addEventListener('click', event => {
      const button = event.target.closest('[data-language]');
      if (!button || button.dataset.language === root.lang) return;
      const language = button.dataset.language;
      applyLanguage(language);
      try { localStorage.setItem(storageKey, language); } catch {}
    });
  }

  new MutationObserver(records => {
    if (root.lang !== 'en') return;
    for (const record of records) {
      if (record.type === 'attributes') localizeAttributes(record.target, [record.attributeName]);
      else if (record.type === 'characterData') localizeText(record.target);
      else for (const node of record.addedNodes) localizeTree(node);
    }
  }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: attributes });
})();
