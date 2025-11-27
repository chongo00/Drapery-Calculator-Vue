import { reactive, computed } from 'vue';

export type Language = 'es' | 'en' | 'fr' | 'pt';

export interface Translations {
  // Common
  common: {
    yes: string;
    no: string;
    close: string;
    copy: string;
    settings: string;
    calculator: string;
    history: string;
  };
  // Calculator page
  calculator: {
    title: string;
    calculateFabricNeeds: string;
    width: string;
    widthFraction: string;
    height: string;
    heightFraction: string;
    productType: string;
    ripplefoldCurtain: string;
    pinchPleatedCurtain: string;
    fabricWidth: string;
    verticalRepeat: string;
    ripplefoldFullness: string;
    pinchPleatFullness: string;
    return: string;
    hem: string;
    opening: string;
    onWay: string;
    centerOpen: string;
    allowRailroad: string;
    select: string;
    oops: string;
    thereAreErrors: string;
    // Validation messages
    widthRequired: string;
    widthGreaterThanZero: string;
    widthMustBeInteger: string;
    heightRequired: string;
    heightGreaterThanZero: string;
    heightMustBeInteger: string;
    productRequired: string;
    fabricWidthRequired: string;
    verticalRepeatGreaterThanOrEqualZero: string;
    ripplefoldFullnessRequired: string;
    pinchPleatFullnessRequired: string;
    returnRequired: string;
    returnGreaterThanOrEqualZero: string;
    hemRequired: string;
    hemGreaterThanOrEqualZero: string;
    openingRequired: string;
    pleaseSelectOption: string;
  };
  // Results modal
  results: {
    title: string;
    resultsCopied: string;
    requiredFabric: string;
    yards: string;
    dimensions: string;
    productType: string;
    fullness: string;
    fabricWidths: string;
    fabricCuts: string;
    cutLength: string;
    orientation: string;
    snapsRequired: string;
    ripplefold: string;
    pinchPleated: string;
    railroad: string;
    regular: string;
  };
  // History page
  history: {
    title: string;
    noCalculationsYet: string;
    startCalculating: string;
    fabric: string;
    width: string;
    height: string;
    product: string;
    cuts: string;
    snaps: string;
  };
  // Settings page
  settings: {
    title: string;
    appPreferences: string;
    darkMode: string;
    language: string;
    measurementSystem: string;
    imperial: string;
    metric: string;
    advancedCalculationSettings: string;
    sideMarginPerPanel: string;
    easeAllowance: string;
    snapSeparation: string;
    railroadStrict: string;
    onlyIfPanelHeightLessThanFabricWidth: string;
    ripplefoldFullnessFactors: string;
    fabricWidthOptions: string;
    addWidth: string;
    clearLast: string;
    restoreDefaults: string;
    about: string;
    version: string;
    description: string;
    mustBeGreaterThanZero: string;
  };
  // Tabs
  tabs: {
    calculator: string;
    history: string;
    settings: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    common: {
      yes: 'Yes',
      no: 'No',
      close: 'Close',
      copy: 'Copy',
      settings: 'Settings',
      calculator: 'Calculator',
      history: 'History',
    },
    calculator: {
      title: 'Drapery Calculator',
      calculateFabricNeeds: 'Calculate Fabric Needs',
      width: 'Width',
      widthFraction: 'Width Fraction',
      height: 'Height',
      heightFraction: 'Height Fraction',
      productType: 'Product Type',
      ripplefoldCurtain: 'Ripplefold curtain',
      pinchPleatedCurtain: 'Pinch Pleated curtain',
      fabricWidth: 'Fabric Width',
      verticalRepeat: 'Vertical Repeat',
      ripplefoldFullness: 'Ripplefold Fullness',
      pinchPleatFullness: 'Pinch Pleat Fullness',
      return: 'Return',
      hem: 'Hem',
      opening: 'Opening',
      onWay: 'On way',
      centerOpen: 'Center open',
      allowRailroad: 'Allow Railroad',
      select: 'Select',
      oops: 'Oops!',
      thereAreErrors: 'There are errors...',
      widthRequired: 'Width is required',
      widthGreaterThanZero: 'Width has to be greater than 0',
      widthMustBeInteger: 'Width must be an integer value',
      heightRequired: 'Height is required',
      heightGreaterThanZero: 'Height has to be greater than 0',
      heightMustBeInteger: 'Height must be an integer value',
      productRequired: 'Product is required',
      fabricWidthRequired: 'Fabric width is required',
      verticalRepeatGreaterThanOrEqualZero: 'Vertical repeat has to be greater than or equal to 0',
      ripplefoldFullnessRequired: 'Ripplefold fullness is required',
      pinchPleatFullnessRequired: 'Pinch pleat fullness is required',
      returnRequired: 'Return is required',
      returnGreaterThanOrEqualZero: 'Return has to be greater than or equal to 0',
      hemRequired: 'Hem is required',
      hemGreaterThanOrEqualZero: 'Hem has to be greater than or equal to 0',
      openingRequired: 'Opening is required',
      pleaseSelectOption: 'Please select an option',
    },
    results: {
      title: '✨ Calculation Results',
      resultsCopied: '✅ Results copied to clipboard!',
      requiredFabric: 'Required Fabric',
      yards: 'yards',
      dimensions: '📏 Dimensions:',
      productType: '📦 Product Type:',
      fullness: '📊 Fullness:',
      fabricWidths: '↔️ Fabric Widths:',
      fabricCuts: '✂️ Fabric Cuts:',
      cutLength: '📐 Cut Length:',
      orientation: '🔄 Orientation:',
      snapsRequired: '📍 Snaps Required:',
      ripplefold: 'Ripplefold',
      pinchPleated: 'Pinch Pleated',
      railroad: 'Railroad',
      regular: 'Regular',
    },
    history: {
      title: 'Calculation History',
      noCalculationsYet: 'No calculations yet. Start calculating to see history.',
      startCalculating: 'Start calculating to see history.',
      fabric: 'Fabric',
      width: 'Width',
      height: 'Height',
      product: 'Product',
      cuts: 'Cuts',
      snaps: 'Snaps',
    },
    settings: {
      title: 'Settings',
      appPreferences: 'App Preferences',
      darkMode: 'Dark Mode',
      language: 'Language',
      measurementSystem: 'Measurement System',
      imperial: 'Imperial (inches)',
      metric: 'Metric (cm/mm)',
      advancedCalculationSettings: 'Advanced Calculation Settings',
      sideMarginPerPanel: 'Side margin per panel',
      easeAllowance: 'Ease allowance',
      snapSeparation: 'Snap separation',
      railroadStrict: 'Railroad strict',
      onlyIfPanelHeightLessThanFabricWidth: 'Only if panel height < fabric width',
      ripplefoldFullnessFactors: 'Ripplefold fullness factors',
      fabricWidthOptions: 'Fabric Width options',
      addWidth: 'Add width',
      clearLast: 'Clear last',
      restoreDefaults: 'Restore defaults',
      about: 'About',
      version: 'Drapery Calculator v1.1.0.5',
      description: 'Calculate fabric needs for curtains efficiently.',
      mustBeGreaterThanZero: 'Must be greater than 0',
    },
    tabs: {
      calculator: 'Calculator',
      history: 'History',
      settings: 'Settings',
    },
  },
  es: {
    common: {
      yes: 'Sí',
      no: 'No',
      close: 'Cerrar',
      copy: 'Copiar',
      settings: 'Configuración',
      calculator: 'Calculadora',
      history: 'Historial',
    },
    calculator: {
      title: 'Calculadora de Cortinas',
      calculateFabricNeeds: 'Calcular Necesidades de Tela',
      width: 'Ancho',
      widthFraction: 'Fracción de Ancho',
      height: 'Alto',
      heightFraction: 'Fracción de Alto',
      productType: 'Tipo de Producto',
      ripplefoldCurtain: 'Cortina Ripplefold',
      pinchPleatedCurtain: 'Cortina Pinch Pleated',
      fabricWidth: 'Ancho de Tela',
      verticalRepeat: 'Repetición Vertical',
      ripplefoldFullness: 'Plenitud Ripplefold',
      pinchPleatFullness: 'Plenitud Pinch Pleat',
      return: 'Retorno',
      hem: 'Dobladillo',
      opening: 'Apertura',
      onWay: 'Un sentido',
      centerOpen: 'Apertura central',
      allowRailroad: 'Permitir Railroad',
      select: 'Seleccionar',
      oops: '¡Ups!',
      thereAreErrors: 'Hay errores...',
      widthRequired: 'El ancho es requerido',
      widthGreaterThanZero: 'El ancho debe ser mayor que 0',
      widthMustBeInteger: 'El ancho debe ser un valor entero',
      heightRequired: 'La altura es requerida',
      heightGreaterThanZero: 'La altura debe ser mayor que 0',
      heightMustBeInteger: 'La altura debe ser un valor entero',
      productRequired: 'El producto es requerido',
      fabricWidthRequired: 'El ancho de tela es requerido',
      verticalRepeatGreaterThanOrEqualZero: 'La repetición vertical debe ser mayor o igual a 0',
      ripplefoldFullnessRequired: 'La plenitud Ripplefold es requerida',
      pinchPleatFullnessRequired: 'La plenitud Pinch Pleat es requerida',
      returnRequired: 'El retorno es requerido',
      returnGreaterThanOrEqualZero: 'El retorno debe ser mayor o igual a 0',
      hemRequired: 'El dobladillo es requerido',
      hemGreaterThanOrEqualZero: 'El dobladillo debe ser mayor o igual a 0',
      openingRequired: 'La apertura es requerida',
      pleaseSelectOption: 'Por favor seleccione una opción',
    },
    results: {
      title: '✨ Resultados del Cálculo',
      resultsCopied: '✅ ¡Resultados copiados al portapapeles!',
      requiredFabric: 'Tela Requerida',
      yards: 'yardas',
      dimensions: '📏 Dimensiones:',
      productType: '📦 Tipo de Producto:',
      fullness: '📊 Plenitud:',
      fabricWidths: '↔️ Anchos de Tela:',
      fabricCuts: '✂️ Cortes de Tela:',
      cutLength: '📐 Longitud de Corte:',
      orientation: '🔄 Orientación:',
      snapsRequired: '📍 Broches Requeridos:',
      ripplefold: 'Ripplefold',
      pinchPleated: 'Pinch Pleated',
      railroad: 'Railroad',
      regular: 'Regular',
    },
    history: {
      title: 'Historial de Cálculos',
      noCalculationsYet: 'Aún no hay cálculos. Comience a calcular para ver el historial.',
      startCalculating: 'Comience a calcular para ver el historial.',
      fabric: 'Tela',
      width: 'Ancho',
      height: 'Alto',
      product: 'Producto',
      cuts: 'Cortes',
      snaps: 'Broches',
    },
    settings: {
      title: 'Configuración',
      appPreferences: 'Preferencias de la Aplicación',
      darkMode: 'Modo Oscuro',
      language: 'Idioma',
      measurementSystem: 'Sistema de Medición',
      imperial: 'Imperial (pulgadas)',
      metric: 'Métrico (cm/mm)',
      advancedCalculationSettings: 'Configuración Avanzada de Cálculo',
      sideMarginPerPanel: 'Margen lateral por panel',
      easeAllowance: 'Margen de facilidad',
      snapSeparation: 'Separación de broches',
      railroadStrict: 'Railroad estricto',
      onlyIfPanelHeightLessThanFabricWidth: 'Solo si la altura del panel < ancho de tela',
      ripplefoldFullnessFactors: 'Factores de plenitud Ripplefold',
      fabricWidthOptions: 'Opciones de Ancho de Tela',
      addWidth: 'Agregar ancho',
      clearLast: 'Limpiar último',
      restoreDefaults: 'Restaurar valores predeterminados',
      about: 'Acerca de',
      version: 'Calculadora de Cortinas v1.1.0.5',
      description: 'Calcule las necesidades de tela para cortinas de manera eficiente.',
      mustBeGreaterThanZero: 'Debe ser mayor que 0',
    },
    tabs: {
      calculator: 'Calculadora',
      history: 'Historial',
      settings: 'Configuración',
    },
  },
  fr: {
    common: {
      yes: 'Oui',
      no: 'Non',
      close: 'Fermer',
      copy: 'Copier',
      settings: 'Paramètres',
      calculator: 'Calculatrice',
      history: 'Historique',
    },
    calculator: {
      title: 'Calculateur de Rideaux',
      calculateFabricNeeds: 'Calculer les Besoins en Tissu',
      width: 'Largeur',
      widthFraction: 'Fraction de Largeur',
      height: 'Hauteur',
      heightFraction: 'Fraction de Hauteur',
      productType: 'Type de Produit',
      ripplefoldCurtain: 'Rideau Ripplefold',
      pinchPleatedCurtain: 'Rideau Pinch Pleated',
      fabricWidth: 'Largeur du Tissu',
      verticalRepeat: 'Répétition Verticale',
      ripplefoldFullness: 'Plénitude Ripplefold',
      pinchPleatFullness: 'Plénitude Pinch Pleat',
      return: 'Retour',
      hem: 'Ourlet',
      opening: 'Ouverture',
      onWay: 'Un sens',
      centerOpen: 'Ouverture centrale',
      allowRailroad: 'Autoriser Railroad',
      select: 'Sélectionner',
      oops: 'Oups !',
      thereAreErrors: 'Il y a des erreurs...',
      widthRequired: 'La largeur est requise',
      widthGreaterThanZero: 'La largeur doit être supérieure à 0',
      widthMustBeInteger: 'La largeur doit être une valeur entière',
      heightRequired: 'La hauteur est requise',
      heightGreaterThanZero: 'La hauteur doit être supérieure à 0',
      heightMustBeInteger: 'La hauteur doit être une valeur entière',
      productRequired: 'Le produit est requis',
      fabricWidthRequired: 'La largeur du tissu est requise',
      verticalRepeatGreaterThanOrEqualZero: 'La répétition verticale doit être supérieure ou égale à 0',
      ripplefoldFullnessRequired: 'La plénitude Ripplefold est requise',
      pinchPleatFullnessRequired: 'La plénitude Pinch Pleat est requise',
      returnRequired: 'Le retour est requis',
      returnGreaterThanOrEqualZero: 'Le retour doit être supérieur ou égal à 0',
      hemRequired: "L'ourlet est requis",
      hemGreaterThanOrEqualZero: "L'ourlet doit être supérieur ou égal à 0",
      openingRequired: "L'ouverture est requise",
      pleaseSelectOption: 'Veuillez sélectionner une option',
    },
    results: {
      title: '✨ Résultats du Calcul',
      resultsCopied: '✅ Résultats copiés dans le presse-papiers !',
      requiredFabric: 'Tissu Requis',
      yards: 'yards',
      dimensions: '📏 Dimensions :',
      productType: '📦 Type de Produit :',
      fullness: '📊 Plénitude :',
      fabricWidths: '↔️ Largeurs de Tissu :',
      fabricCuts: '✂️ Coupes de Tissu :',
      cutLength: '📐 Longueur de Coupe :',
      orientation: '🔄 Orientation :',
      snapsRequired: '📍 Pressions Requises :',
      ripplefold: 'Ripplefold',
      pinchPleated: 'Pinch Pleated',
      railroad: 'Railroad',
      regular: 'Régulier',
    },
    history: {
      title: 'Historique des Calculs',
      noCalculationsYet: 'Aucun calcul pour le moment. Commencez à calculer pour voir l\'historique.',
      startCalculating: 'Commencez à calculer pour voir l\'historique.',
      fabric: 'Tissu',
      width: 'Largeur',
      height: 'Hauteur',
      product: 'Produit',
      cuts: 'Coupes',
      snaps: 'Pressions',
    },
    settings: {
      title: 'Paramètres',
      appPreferences: 'Préférences de l\'Application',
      darkMode: 'Mode Sombre',
      language: 'Langue',
      measurementSystem: 'Système de Mesure',
      imperial: 'Impérial (pouces)',
      metric: 'Métrique (cm/mm)',
      advancedCalculationSettings: 'Paramètres de Calcul Avancés',
      sideMarginPerPanel: 'Marge latérale par panneau',
      easeAllowance: 'Marge de facilité',
      snapSeparation: 'Séparation des pressions',
      railroadStrict: 'Railroad strict',
      onlyIfPanelHeightLessThanFabricWidth: 'Seulement si hauteur du panneau < largeur du tissu',
      ripplefoldFullnessFactors: 'Facteurs de plénitude Ripplefold',
      fabricWidthOptions: 'Options de Largeur de Tissu',
      addWidth: 'Ajouter une largeur',
      clearLast: 'Effacer le dernier',
      restoreDefaults: 'Restaurer les valeurs par défaut',
      about: 'À propos',
      version: 'Calculateur de Rideaux v1.1.0.5',
      description: 'Calculez les besoins en tissu pour les rideaux efficacement.',
      mustBeGreaterThanZero: 'Doit être supérieur à 0',
    },
    tabs: {
      calculator: 'Calculatrice',
      history: 'Historique',
      settings: 'Paramètres',
    },
  },
  pt: {
    common: {
      yes: 'Sim',
      no: 'Não',
      close: 'Fechar',
      copy: 'Copiar',
      settings: 'Configurações',
      calculator: 'Calculadora',
      history: 'Histórico',
    },
    calculator: {
      title: 'Calculadora de Cortinas',
      calculateFabricNeeds: 'Calcular Necessidades de Tecido',
      width: 'Largura',
      widthFraction: 'Fração de Largura',
      height: 'Altura',
      heightFraction: 'Fração de Altura',
      productType: 'Tipo de Produto',
      ripplefoldCurtain: 'Cortina Ripplefold',
      pinchPleatedCurtain: 'Cortina Pinch Pleated',
      fabricWidth: 'Largura do Tecido',
      verticalRepeat: 'Repetição Vertical',
      ripplefoldFullness: 'Plenitude Ripplefold',
      pinchPleatFullness: 'Plenitude Pinch Pleat',
      return: 'Retorno',
      hem: 'Bainha',
      opening: 'Abertura',
      onWay: 'Um sentido',
      centerOpen: 'Abertura central',
      allowRailroad: 'Permitir Railroad',
      select: 'Selecionar',
      oops: 'Ops!',
      thereAreErrors: 'Há erros...',
      widthRequired: 'A largura é obrigatória',
      widthGreaterThanZero: 'A largura deve ser maior que 0',
      widthMustBeInteger: 'A largura deve ser um valor inteiro',
      heightRequired: 'A altura é obrigatória',
      heightGreaterThanZero: 'A altura deve ser maior que 0',
      heightMustBeInteger: 'A altura deve ser um valor inteiro',
      productRequired: 'O produto é obrigatório',
      fabricWidthRequired: 'A largura do tecido é obrigatória',
      verticalRepeatGreaterThanOrEqualZero: 'A repetição vertical deve ser maior ou igual a 0',
      ripplefoldFullnessRequired: 'A plenitude Ripplefold é obrigatória',
      pinchPleatFullnessRequired: 'A plenitude Pinch Pleat é obrigatória',
      returnRequired: 'O retorno é obrigatório',
      returnGreaterThanOrEqualZero: 'O retorno deve ser maior ou igual a 0',
      hemRequired: 'A bainha é obrigatória',
      hemGreaterThanOrEqualZero: 'A bainha deve ser maior ou igual a 0',
      openingRequired: 'A abertura é obrigatória',
      pleaseSelectOption: 'Por favor selecione uma opção',
    },
    results: {
      title: '✨ Resultados do Cálculo',
      resultsCopied: '✅ Resultados copiados para a área de transferência!',
      requiredFabric: 'Tecido Necessário',
      yards: 'jardas',
      dimensions: '📏 Dimensões:',
      productType: '📦 Tipo de Produto:',
      fullness: '📊 Plenitude:',
      fabricWidths: '↔️ Larguras de Tecido:',
      fabricCuts: '✂️ Cortes de Tecido:',
      cutLength: '📐 Comprimento do Corte:',
      orientation: '🔄 Orientação:',
      snapsRequired: '📍 Pressões Necessárias:',
      ripplefold: 'Ripplefold',
      pinchPleated: 'Pinch Pleated',
      railroad: 'Railroad',
      regular: 'Regular',
    },
    history: {
      title: 'Histórico de Cálculos',
      noCalculationsYet: 'Ainda não há cálculos. Comece a calcular para ver o histórico.',
      startCalculating: 'Comece a calcular para ver o histórico.',
      fabric: 'Tecido',
      width: 'Largura',
      height: 'Altura',
      product: 'Produto',
      cuts: 'Cortes',
      snaps: 'Pressões',
    },
    settings: {
      title: 'Configurações',
      appPreferences: 'Preferências do Aplicativo',
      darkMode: 'Modo Escuro',
      language: 'Idioma',
      measurementSystem: 'Sistema de Medição',
      imperial: 'Imperial (polegadas)',
      metric: 'Métrico (cm/mm)',
      advancedCalculationSettings: 'Configurações Avançadas de Cálculo',
      sideMarginPerPanel: 'Margem lateral por painel',
      easeAllowance: 'Margem de facilidade',
      snapSeparation: 'Separação de pressões',
      railroadStrict: 'Railroad estrito',
      onlyIfPanelHeightLessThanFabricWidth: 'Apenas se altura do painel < largura do tecido',
      ripplefoldFullnessFactors: 'Fatores de plenitude Ripplefold',
      fabricWidthOptions: 'Opções de Largura de Tecido',
      addWidth: 'Adicionar largura',
      clearLast: 'Limpar último',
      restoreDefaults: 'Restaurar padrões',
      about: 'Sobre',
      version: 'Calculadora de Cortinas v1.1.0.5',
      description: 'Calcule as necessidades de tecido para cortinas de forma eficiente.',
      mustBeGreaterThanZero: 'Deve ser maior que 0',
    },
    tabs: {
      calculator: 'Calculadora',
      history: 'Histórico',
      settings: 'Configurações',
    },
  },
};

const STORAGE_KEY = 'appLanguage';

function loadLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (saved === 'es' || saved === 'en' || saved === 'fr' || saved === 'pt')) {
      return saved as Language;
    }
  } catch {
    // Ignore
  }
  // Default to English
  return 'en';
}

const state = reactive({
  language: loadLanguage(),
});

export function useI18n() {
  const t = computed(() => translations[state.language]);

  const setLanguage = (lang: Language) => {
    state.language = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      console.warn('Failed to persist language', e);
    }
  };

  return {
    t,
    language: computed(() => state.language),
    setLanguage,
    availableLanguages: ['en', 'es', 'fr', 'pt'] as Language[],
  };
}

