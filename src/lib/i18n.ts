export type Lang = 'ru' | 'en' | 'kz'

export interface LangOption {
  id: Lang
  name: string
  flag: string
}

export const LANGS: LangOption[] = [
  { id: 'ru', name: 'Русский', flag: '🇷🇺' },
  { id: 'en', name: 'English', flag: '🇬🇧' },
  { id: 'kz', name: 'Қазақша', flag: '🇰🇿' },
]

const ru = {
  // Sidebar
  'sidebar.newChat': 'Новый чат',
  'sidebar.empty': 'Здесь появятся ваши чаты',
  'sidebar.delete': 'Удалить',
  'sidebar.settings': 'Настройки',
  'sidebar.signOut': 'Выйти',
  'sidebar.justNow': 'только что',
  'sidebar.minsAgo': 'мин. назад',
  'sidebar.hoursAgo': 'ч. назад',
  'sidebar.daysAgo': 'дн. назад',

  // Legal / SuperWizard
  'legal.jurisdiction': 'Юрисдикция',
  'legal.webSearch': 'Веб-анализ',
  'legal.webSearchHint':
    'Включить поиск в интернете для актуальных текстов законов и официальных источников (Google Search)',

  // Welcome
  'welcome.subtitle':
    'Юридический ИИ-агент: анализ документов, конституций и норм права выбранных стран. Не заменяет консультацию адвоката.',

  // Input
  'input.uploadMenu': 'Загрузить: файл или веб-анализ',
  'input.menuAttachFile': 'Прикрепить файл',
  'input.placeholderFiles': 'Добавьте описание или отправьте...',
  'input.placeholder': 'Вопрос или комментарий к документу SuperWizard...',
  'input.processing': 'Обработка...',
  'input.hint':
    'SuperWizard может ошибаться. Проверяйте ответы по официальным источникам; для споров обратитесь к юристу.',
  'input.attach': 'Прикрепить файл',
  'input.camera': 'Сделать фото',
  'input.stop': 'Остановить',
  'input.send': 'Отправить',
  'input.retryFile': 'Повторить',

  // Chat
  'chat.empty': 'Сообщения не найдены',
  'chat.emptyHint': 'Начните диалог, отправив сообщение ниже',

  // Message
  'message.you': 'Вы',
  'message.export': 'Экспорт',
  'message.retry': 'Повторить',
  'message.confidenceHigh':
    'Несколько сходящихся источников; всё равно сверьте с официальным текстом',
  'message.confidenceMedium':
    'Ответ основан на косвенной практике или доктрине; рекомендуем проверить у юриста',
  'message.confidenceLow':
    'Предварительная оценка; обязательна проверка по официальным текстам',

  // Auth
  'auth.subtitle': 'Юридический ИИ-ассистент для работы с документами и нормами права',
  'auth.verifyTitle': 'Подтвердите вашу почту',
  'auth.login': 'Вход',
  'auth.register': 'Регистрация',
  'auth.emailPlaceholder': 'Email',
  'auth.passwordPlaceholder': 'Пароль',
  'auth.passwordMinPlaceholder': 'Пароль (мин. 6 символов)',
  'auth.signIn': 'Войти',
  'auth.createAccount': 'Создать аккаунт',
  'auth.passwordMin': 'Пароль должен содержать минимум 6 символов',
  'auth.otpSent': 'Мы отправили код подтверждения на',
  'auth.otpPlaceholder': 'Код подтверждения',
  'auth.confirm': 'Подтвердить',
  'auth.alreadyConfirmed': 'Уже подтвердили? Войти',

  // Settings
  'settings.title': 'Настройки',
  'settings.theme': 'Тема оформления',
  'settings.dark': 'Тёмная',
  'settings.light': 'Светлая',
  'settings.language': 'Язык интерфейса',
  'settings.email': 'Email',
  'settings.currentEmail': 'Текущий:',
  'settings.newEmail': 'Новый email',
  'settings.emailSent': 'Ссылка подтверждения отправлена на новый email',
  'settings.updateEmail': 'Обновить email',
  'settings.password': 'Пароль',
  'settings.min6': 'Минимум 6 символов',
  'settings.noMatch': 'Пароли не совпадают',
  'settings.newPassword': 'Новый пароль (мин. 6)',
  'settings.confirmPassword': 'Подтвердите пароль',
  'settings.updatePassword': 'Обновить пароль',
  'settings.passwordUpdated': 'Пароль успешно обновлён',
  'settings.clearChats': 'Очистить все чаты',
  'settings.clearChatsConfirm': 'Вы уверены? Все чаты будут удалены безвозвратно.',
  'settings.clearChatsBtn': 'Удалить все чаты',
  'settings.clearChatsDone': 'Все чаты удалены',

  // Export
  'export.title': 'Экспорт документа',
  'export.preview': 'Превью',
  'export.editor': 'Редактор',
  'export.hint': 'Markdown: **жирный**, *курсив*, # Заголовок, - список, | таблица |',
  'export.chars': 'символов',
  'export.lines': 'строк',
  'export.cancel': 'Отмена',
  'export.creating': 'Создание...',
  'export.downloadPdf': 'Скачать PDF',
  'export.downloadDocx': 'Скачать DOCX',
  'export.quickLegalReport': 'Готовый юр-отчёт (2 колонки)',
  'export.document': 'Документ',
  'export.lawyerMode': 'Экспорт для юриста (два столбца)',
  'export.lawyerColAnswer': 'Ответ',
  'export.lawyerColSources': 'Источники и метки',
  'export.lawyerSubtitle': 'Экспорт для юриста',
  'export.lawyerHint':
    'Разделите блок командой «## Источники» или «## Источники и метки» (или после «---»).',

  // Citation modal
  'citation.openOfficial': 'Открыть на официальном портале',
  'citation.noFullText': 'Полный текст статьи не приложен к ответу.',

  // App
  'app.loadError': 'Не удалось загрузить чаты. Проверьте подключение.',
  'app.loadErrorShort': 'Не удалось загрузить чаты.',
  'app.retry': 'Повторить',
  'app.newChat': 'Новый чат',
  'app.toggleTheme': 'Переключить тему',
  'app.toggleSidebar': 'Боковая панель',

  // Bots
  'bots.title': 'Мои боты',
  'bots.none': 'Без бота',
  'bots.noneDesc': 'Обычный режим чата без системного промпта',
  'bots.manage': 'Управление ботами',
  'bots.create': 'Создать бота',
  'bots.edit': 'Редактировать бота',
  'bots.save': 'Сохранить бота',
  'bots.empty': 'Вы еще не создали ни одного бота',
  'bots.name': 'Название бота',
  'bots.username': 'username (только маленькие латинские буквы, цифры и _)',
  'bots.usernameFormat': 'Username: 3-24 символа, только a-z 0-9 и _',
  'bots.usernameForbidden': 'Этот username запрещен',
  'bots.description': 'Краткое описание (необязательно)',
  'bots.systemPrompt': 'Системный промпт бота',
  'bots.authorName': 'Имя автора (для маркетплейса)',
  'bots.publish': 'Опубликовать в маркетплейсе',
  'bots.avatarUrl': 'Ссылка на аватар (необязательно)',
  'bots.uploadAvatar': 'Загрузить аватар с устройства',
  'bots.mediaLinks': 'Ссылки на соцсети/медиа',
  'bots.mediaLinkPlaceholder': 'https://...',
  'bots.shareLink': 'Уникальная ссылка',
  'bots.copyLink': 'Копировать ссылку',
  'bots.marketplace': 'Маркетплейс ботов',
  'bots.search': 'Поиск ботов, авторов, username...',
  'bots.trending': 'Тренды',
  'bots.marketplaceEmpty': 'Пока нет публичных ботов',
  'bots.use': 'Использовать',
  'bots.uses': 'использований',
  'bots.copySuffix': 'копия',
  'bots.unknownAuthor': 'Неизвестный автор',
  'bots.validation': 'Укажите название и системный промпт',
  'bots.saveError': 'Не удалось сохранить бота',
  'bots.deleteError': 'Не удалось удалить бота',
  'bots.deleteConfirm': 'Удалить этого бота?',
  'bots.modelLocked': 'Модель задается выбранным ботом',

  // Voice Chat
  'voice.title': 'Голосовой чат',
  'voice.listening': 'Слушаю...',
  'voice.thinking': 'Думаю...',
  'voice.speaking': 'Говорю...',
  'voice.tapToSpeak': 'Нажмите, чтобы говорить',
  'voice.end': 'Завершить',
  'voice.you': 'Вы',
  'voice.noMic': 'Нет доступа к микрофону',
  'voice.noSpeech': 'Речь не распознана. Попробуйте ещё раз.',
  'voice.error': 'Ошибка голосового чата',

  // Files
  'file.tooLarge': 'Файл слишком большой (макс. {size}МБ)',
  'file.unsupported': 'Неподдерживаемый формат. Используйте PDF, JPG, PNG, GIF или WebP',
  'file.noText': 'Не удалось извлечь текст из PDF (ни текстовый слой, ни OCR)',
  'file.extracting': 'Извлечение текста из PDF...',
  'file.scanOcr': 'Скан-копия. Запуск OCR...',
  'file.ocrLoading': 'OCR: загрузка модели...',
  'file.ocrPage': 'OCR: страница {current}/{total}...',
  'file.ocrRecognizing': 'OCR: распознавание текста...',
  'file.error': 'Ошибка обработки файла',
} as const

const en: Record<keyof typeof ru, string> = {
  'sidebar.newChat': 'New Chat',
  'sidebar.empty': 'Your chats will appear here',
  'sidebar.delete': 'Delete',
  'sidebar.settings': 'Settings',
  'sidebar.signOut': 'Sign Out',
  'sidebar.justNow': 'just now',
  'sidebar.minsAgo': 'min ago',
  'sidebar.hoursAgo': 'h ago',
  'sidebar.daysAgo': 'd ago',

  'legal.jurisdiction': 'Jurisdiction',
  'legal.webSearch': 'Web analysis',
  'legal.webSearchHint':
    'Search the web for up-to-date statutes and official sources (Google Search)',

  'welcome.subtitle':
    'Legal AI agent: document analysis and law across selected countries. Not a substitute for a lawyer.',

  'input.uploadMenu': 'Upload: file or web analysis',
  'input.menuAttachFile': 'Attach file',
  'input.placeholderFiles': 'Add a description or send...',
  'input.placeholder': 'Question or comment on a document (SuperWizard)...',
  'input.processing': 'Processing...',
  'input.hint':
    'SuperWizard may err. Verify against official sources; for disputes consult a qualified lawyer.',
  'input.attach': 'Attach file',
  'input.camera': 'Take photo',
  'input.stop': 'Stop',
  'input.send': 'Send',
  'input.retryFile': 'Retry',

  'chat.empty': 'No messages found',
  'chat.emptyHint': 'Start a conversation by sending a message below',

  'message.you': 'You',
  'message.export': 'Export',
  'message.retry': 'Retry',
  'message.confidenceHigh':
    'Several converging sources; still verify against the official text',
  'message.confidenceMedium':
    'Based on indirect practice or doctrine; consider checking with a lawyer',
  'message.confidenceLow':
    'Preliminary assessment; verification against official sources is required',

  'auth.subtitle': 'Legal AI assistant for documents and legal research',
  'auth.verifyTitle': 'Verify your email',
  'auth.login': 'Sign In',
  'auth.register': 'Sign Up',
  'auth.emailPlaceholder': 'Email',
  'auth.passwordPlaceholder': 'Password',
  'auth.passwordMinPlaceholder': 'Password (min. 6 characters)',
  'auth.signIn': 'Sign In',
  'auth.createAccount': 'Create Account',
  'auth.passwordMin': 'Password must be at least 6 characters',
  'auth.otpSent': 'We sent a confirmation code to',
  'auth.otpPlaceholder': 'Confirmation code',
  'auth.confirm': 'Confirm',
  'auth.alreadyConfirmed': 'Already confirmed? Sign in',

  'settings.title': 'Settings',
  'settings.theme': 'Appearance',
  'settings.dark': 'Dark',
  'settings.light': 'Light',
  'settings.language': 'Interface language',
  'settings.email': 'Email',
  'settings.currentEmail': 'Current:',
  'settings.newEmail': 'New email',
  'settings.emailSent': 'Confirmation link sent to the new email',
  'settings.updateEmail': 'Update email',
  'settings.password': 'Password',
  'settings.min6': 'Minimum 6 characters',
  'settings.noMatch': 'Passwords do not match',
  'settings.newPassword': 'New password (min. 6)',
  'settings.confirmPassword': 'Confirm password',
  'settings.updatePassword': 'Update password',
  'settings.passwordUpdated': 'Password updated successfully',
  'settings.clearChats': 'Clear all chats',
  'settings.clearChatsConfirm': 'Are you sure? All chats will be permanently deleted.',
  'settings.clearChatsBtn': 'Delete all chats',
  'settings.clearChatsDone': 'All chats deleted',

  'export.title': 'Export Document',
  'export.preview': 'Preview',
  'export.editor': 'Editor',
  'export.hint': 'Markdown: **bold**, *italic*, # Heading, - list, | table |',
  'export.chars': 'characters',
  'export.lines': 'lines',
  'export.cancel': 'Cancel',
  'export.creating': 'Creating...',
  'export.downloadPdf': 'Download PDF',
  'export.downloadDocx': 'Download DOCX',
  'export.quickLegalReport': 'Ready legal report (2 columns)',
  'export.document': 'Document',
  'export.lawyerMode': 'Lawyer export (two columns)',
  'export.lawyerColAnswer': 'Answer',
  'export.lawyerColSources': 'Sources and labels',
  'export.lawyerSubtitle': 'Lawyer export',
  'export.lawyerHint':
    'Add a section with «## Sources» or «## Источники» (or after a «---» line).',

  'citation.openOfficial': 'Open on the official portal',
  'citation.noFullText': 'Full article text was not included in the reply.',

  'app.loadError': 'Failed to load chats. Check your connection.',
  'app.loadErrorShort': 'Failed to load chats.',
  'app.retry': 'Retry',
  'app.newChat': 'New Chat',
  'app.toggleTheme': 'Toggle theme',
  'app.toggleSidebar': 'Sidebar',

  'bots.title': 'My Bots',
  'bots.none': 'No bot',
  'bots.noneDesc': 'Regular chat mode without system prompt',
  'bots.manage': 'Manage bots',
  'bots.create': 'Create bot',
  'bots.edit': 'Edit bot',
  'bots.save': 'Save bot',
  'bots.empty': 'You have not created any bots yet',
  'bots.name': 'Bot name',
  'bots.username': 'username (lowercase letters, numbers and _ only)',
  'bots.usernameFormat': 'Username: 3-24 chars, only a-z 0-9 and _',
  'bots.usernameForbidden': 'This username is forbidden',
  'bots.description': 'Short description (optional)',
  'bots.systemPrompt': 'System prompt',
  'bots.authorName': 'Author name (for marketplace)',
  'bots.publish': 'Publish to marketplace',
  'bots.avatarUrl': 'Avatar URL (optional)',
  'bots.uploadAvatar': 'Upload avatar from device',
  'bots.mediaLinks': 'Social/media links',
  'bots.mediaLinkPlaceholder': 'https://...',
  'bots.shareLink': 'Unique link',
  'bots.copyLink': 'Copy link',
  'bots.marketplace': 'Bot marketplace',
  'bots.search': 'Search bots, authors, username...',
  'bots.trending': 'Trending',
  'bots.marketplaceEmpty': 'No public bots yet',
  'bots.use': 'Use',
  'bots.uses': 'uses',
  'bots.copySuffix': 'copy',
  'bots.unknownAuthor': 'Unknown author',
  'bots.validation': 'Please provide bot name and system prompt',
  'bots.saveError': 'Failed to save bot',
  'bots.deleteError': 'Failed to delete bot',
  'bots.deleteConfirm': 'Delete this bot?',
  'bots.modelLocked': 'Model is controlled by selected bot',

  'voice.title': 'Voice Chat',
  'voice.listening': 'Listening...',
  'voice.thinking': 'Thinking...',
  'voice.speaking': 'Speaking...',
  'voice.tapToSpeak': 'Tap to speak',
  'voice.end': 'End call',
  'voice.you': 'You',
  'voice.noMic': 'Microphone access denied',
  'voice.noSpeech': 'No speech detected. Try again.',
  'voice.error': 'Voice chat error',

  'file.tooLarge': 'File is too large (max {size}MB)',
  'file.unsupported': 'Unsupported format. Use PDF, JPG, PNG, GIF or WebP',
  'file.noText': 'Could not extract text from PDF (no text layer or OCR)',
  'file.extracting': 'Extracting text from PDF...',
  'file.scanOcr': 'Scanned PDF. Starting OCR...',
  'file.ocrLoading': 'OCR: loading model...',
  'file.ocrPage': 'OCR: page {current}/{total}...',
  'file.ocrRecognizing': 'OCR: recognizing text...',
  'file.error': 'File processing error',
}

const kz: Record<keyof typeof ru, string> = {
  'sidebar.newChat': 'Жаңа чат',
  'sidebar.empty': 'Сіздің чаттарыңыз осында пайда болады',
  'sidebar.delete': 'Жою',
  'sidebar.settings': 'Баптаулар',
  'sidebar.signOut': 'Шығу',
  'sidebar.justNow': 'жаңа ғана',
  'sidebar.minsAgo': 'мин. бұрын',
  'sidebar.hoursAgo': 'сағ. бұрын',
  'sidebar.daysAgo': 'күн бұрын',

  'legal.jurisdiction': 'Юрисдикция',
  'legal.webSearch': 'Веб-талдау',
  'legal.webSearchHint':
    'Заңдардың өзекті мәтіндері мен ресми дереккөздерді интернеттен іздеу (Google Search)',

  'welcome.subtitle':
    'Заңгерлік ЖИ: құжаттар мен таңдалған елдердің нормаларын талдау. Адвокаттың орнын баспайды.',

  'input.uploadMenu': 'Жүктеу: файл немесе веб-талдау',
  'input.menuAttachFile': 'Файл тіркеу',
  'input.placeholderFiles': 'Сипаттама қосыңыз немесе жіберіңіз...',
  'input.placeholder': 'SuperWizard-қа сұрақ немесе құжатқа пікір...',
  'input.processing': 'Өңдеу...',
  'input.hint':
    'SuperWizard қателесуі мүмкін. Ресми дереккөздермен тексеріңіз; даулар үшін заңгерге жүгініңіз.',
  'input.attach': 'Файл тіркеу',
  'input.camera': 'Фото түсіру',
  'input.stop': 'Тоқтату',
  'input.send': 'Жіберу',
  'input.retryFile': 'Қайталау',

  'chat.empty': 'Хабарламалар табылмады',
  'chat.emptyHint': 'Төменде хабарлама жіберіп, диалог бастаңыз',

  'message.you': 'Сіз',
  'message.export': 'Экспорт',
  'message.retry': 'Қайталау',
  'message.confidenceHigh':
    'Бірнеше сәйкес келетін дереккөз; ресми мәтінмен салыстырыңыз',
  'message.confidenceMedium':
    'Жауап жанама тәжірибеге немесе доктринаға негізделген; заңгерге көрсету ұсынылады',
  'message.confidenceLow':
    'Алдын ала баға; ресми мәтіндермен тексеру міндетті',

  'auth.subtitle': 'Құжаттар және заң нормаларымен жұмыс істеуге арналған заңгерлік ЖИ-көмекші',
  'auth.verifyTitle': 'Электрондық поштаңызды растаңыз',
  'auth.login': 'Кіру',
  'auth.register': 'Тіркелу',
  'auth.emailPlaceholder': 'Email',
  'auth.passwordPlaceholder': 'Құпия сөз',
  'auth.passwordMinPlaceholder': 'Құпия сөз (кем. 6 таңба)',
  'auth.signIn': 'Кіру',
  'auth.createAccount': 'Тіркелу',
  'auth.passwordMin': 'Құпия сөз кемінде 6 таңбадан тұруы керек',
  'auth.otpSent': 'Растау коды жіберілді:',
  'auth.otpPlaceholder': 'Растау коды',
  'auth.confirm': 'Растау',
  'auth.alreadyConfirmed': 'Растадыңыз ба? Кіру',

  'settings.title': 'Баптаулар',
  'settings.theme': 'Тақырып',
  'settings.dark': 'Қараңғы',
  'settings.light': 'Жарық',
  'settings.language': 'Интерфейс тілі',
  'settings.email': 'Email',
  'settings.currentEmail': 'Ағымдағы:',
  'settings.newEmail': 'Жаңа email',
  'settings.emailSent': 'Растау сілтемесі жаңа email-ге жіберілді',
  'settings.updateEmail': 'Email жаңарту',
  'settings.password': 'Құпия сөз',
  'settings.min6': 'Кемінде 6 таңба',
  'settings.noMatch': 'Құпия сөздер сәйкес келмейді',
  'settings.newPassword': 'Жаңа құпия сөз (кем. 6)',
  'settings.confirmPassword': 'Құпия сөзді растаңыз',
  'settings.updatePassword': 'Құпия сөзді жаңарту',
  'settings.passwordUpdated': 'Құпия сөз сәтті жаңартылды',
  'settings.clearChats': 'Барлық чаттарды тазалау',
  'settings.clearChatsConfirm': 'Сенімдісіз бе? Барлық чаттар біржола жойылады.',
  'settings.clearChatsBtn': 'Барлық чаттарды жою',
  'settings.clearChatsDone': 'Барлық чаттар жойылды',

  'export.title': 'Құжатты экспорттау',
  'export.preview': 'Алдын ала қарау',
  'export.editor': 'Редактор',
  'export.hint': 'Markdown: **қалың**, *көлбеу*, # Тақырып, - тізім, | кесте |',
  'export.chars': 'таңба',
  'export.lines': 'жол',
  'export.cancel': 'Болдырмау',
  'export.creating': 'Жасалуда...',
  'export.downloadPdf': 'PDF жүктеу',
  'export.downloadDocx': 'DOCX жүктеу',
  'export.quickLegalReport': 'Дайын заңгерлік есеп (2 баған)',
  'export.document': 'Құжат',
  'export.lawyerMode': 'Заңгерге экспорт (екі баған)',
  'export.lawyerColAnswer': 'Жауап',
  'export.lawyerColSources': 'Дереккөздер және белгілер',
  'export.lawyerSubtitle': 'Заңгерге экспорт',
  'export.lawyerHint':
    '«## Дереккөздер» немесе «---» кейінгі бөліммен бөліңіз.',

  'citation.openOfficial': 'Ресми порталда ашу',
  'citation.noFullText': 'Мақаланың толық мәтіні жауапқа қосылмаған.',

  'app.loadError': 'Чаттарды жүктеу мүмкін болмады. Қосылымды тексеріңіз.',
  'app.loadErrorShort': 'Чаттарды жүктеу мүмкін болмады.',
  'app.retry': 'Қайталау',
  'app.newChat': 'Жаңа чат',
  'app.toggleTheme': 'Тақырыпты ауыстыру',
  'app.toggleSidebar': 'Бүйір панелі',

  'bots.title': 'Менің боттарым',
  'bots.none': 'Ботсыз',
  'bots.noneDesc': 'Жүйелік промптсыз қарапайым чат режимі',
  'bots.manage': 'Боттарды басқару',
  'bots.create': 'Бот құру',
  'bots.edit': 'Ботты өңдеу',
  'bots.save': 'Ботты сақтау',
  'bots.empty': 'Әзірге ешбір бот жасалмады',
  'bots.name': 'Бот атауы',
  'bots.username': 'username (тек кіші латын әріптері, сандар және _)',
  'bots.usernameFormat': 'Username: 3-24 таңба, тек a-z 0-9 және _',
  'bots.usernameForbidden': 'Бұл username-ді қолдануға болмайды',
  'bots.description': 'Қысқаша сипаттама (міндетті емес)',
  'bots.systemPrompt': 'Боттың жүйелік промпты',
  'bots.authorName': 'Автор аты (маркетплейс үшін)',
  'bots.publish': 'Маркетплейсте жариялау',
  'bots.avatarUrl': 'Аватар сілтемесі (міндетті емес)',
  'bots.uploadAvatar': 'Құрылғыдан аватар жүктеу',
  'bots.mediaLinks': 'Әлеуметтік/медиа сілтемелері',
  'bots.mediaLinkPlaceholder': 'https://...',
  'bots.shareLink': 'Бірегей сілтеме',
  'bots.copyLink': 'Сілтемені көшіру',
  'bots.marketplace': 'Бот маркетплейсі',
  'bots.search': 'Бот, автор, username іздеу...',
  'bots.trending': 'Трендтер',
  'bots.marketplaceEmpty': 'Әзірге жария боттар жоқ',
  'bots.use': 'Пайдалану',
  'bots.uses': 'қолдану',
  'bots.copySuffix': 'көшірме',
  'bots.unknownAuthor': 'Белгісіз автор',
  'bots.validation': 'Бот атауын және жүйелік промптты енгізіңіз',
  'bots.saveError': 'Ботты сақтау мүмкін болмады',
  'bots.deleteError': 'Ботты жою мүмкін болмады',
  'bots.deleteConfirm': 'Осы ботты жоясыз ба?',
  'bots.modelLocked': 'Модель таңдалған бот арқылы басқарылады',

  'voice.title': 'Дауыстық чат',
  'voice.listening': 'Тыңдап жатырмын...',
  'voice.thinking': 'Ойланып жатырмын...',
  'voice.speaking': 'Сөйлеп жатырмын...',
  'voice.tapToSpeak': 'Сөйлеу үшін басыңыз',
  'voice.end': 'Аяқтау',
  'voice.you': 'Сіз',
  'voice.noMic': 'Микрофонға рұқсат жоқ',
  'voice.noSpeech': 'Сөз танылмады. Қайталап көріңіз.',
  'voice.error': 'Дауыстық чат қатесі',

  'file.tooLarge': 'Файл тым үлкен (макс. {size}МБ)',
  'file.unsupported': 'Қолдау көрсетілмейтін формат. PDF, JPG, PNG, GIF немесе WebP пайдаланыңыз',
  'file.noText': 'PDF-тен мәтін алу мүмкін болмады (мәтіндік қабат та, OCR де жоқ)',
  'file.extracting': 'PDF-тен мәтін алынуда...',
  'file.scanOcr': 'Сканерленген көшірме. OCR іске қосылуда...',
  'file.ocrLoading': 'OCR: модель жүктелуде...',
  'file.ocrPage': 'OCR: бет {current}/{total}...',
  'file.ocrRecognizing': 'OCR: мәтін танылуда...',
  'file.error': 'Файлды өңдеу қатесі',
}

export type TranslationKey = keyof typeof ru
type Translations = Record<TranslationKey, string>

const translations: Record<Lang, Translations> = { ru, en, kz }

export function getTranslations(lang: Lang): Translations {
  return translations[lang]
}

export function t(lang: Lang, key: TranslationKey, vars?: Record<string, string | number>): string {
  let str = translations[lang][key] || translations.ru[key] || key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, String(v))
    }
  }
  return str
}
