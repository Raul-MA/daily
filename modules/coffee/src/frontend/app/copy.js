import { getSettings } from '../../backend/features/settings.js';
import { t } from '../../backend/core/i18n.js';
import { drinkTypes } from './constants.js';

export function currentLanguage() {
  return getSettings().language || "en";
}

export function tr(key, params = {}) {
  return t(currentLanguage(), key, params);
}

export function tasteOptions() {
  return {
    triad: [
      { value: "low", label: tr("optionLow") },
      { value: "medium", label: tr("optionMediumShort") },
      { value: "high", label: tr("optionHigh") }
    ],
    body: [
      { value: "thin", label: tr("optionThin") },
      { value: "medium", label: tr("optionMediumShort") },
      { value: "heavy", label: tr("optionHeavy") }
    ],
    duration: [
      { value: "short", label: tr("optionShort") },
      { value: "lingering", label: tr("optionLingering") }
    ],
    quality: [
      { value: "pleasant", label: tr("optionPleasant") },
      { value: "harsh", label: tr("optionHarsh") }
    ],
    balance: [
      { value: "sour", label: tr("optionSour") },
      { value: "balanced", label: tr("optionBalanced") },
      { value: "bitter", label: tr("optionBitter") }
    ]
  };
}

export function tasteHelp() {
  return {
    sweetness: {
      title: tr("labelSweetness"),
      definition: tr("tasteSweetnessDefinition"),
      questions: [tr("tasteSweetnessQ1"), tr("tasteSweetnessQ2"), tr("tasteSweetnessQ3")]
    },
    acidity: {
      title: tr("labelAcidity"),
      definition: tr("tasteAcidityDefinition"),
      questions: [tr("tasteAcidityQ1"), tr("tasteAcidityQ2"), tr("tasteAcidityQ3")]
    },
    bitterness: {
      title: tr("labelBitterness"),
      definition: tr("tasteBitternessDefinition"),
      questions: [tr("tasteBitternessQ1"), tr("tasteBitternessQ2"), tr("tasteBitternessQ3")]
    },
    body: {
      title: tr("labelBody"),
      definition: tr("tasteBodyDefinition"),
      questions: [tr("tasteBodyQ1"), tr("tasteBodyQ2"), tr("tasteBodyQ3")]
    },
    aftertasteDuration: {
      title: tr("labelAftertasteDuration"),
      definition: tr("tasteAftertasteDurationDefinition"),
      questions: [tr("tasteAftertasteDurationQ1"), tr("tasteAftertasteDurationQ2"), tr("tasteAftertasteDurationQ3")]
    },
    aftertasteQuality: {
      title: tr("labelAftertasteQuality"),
      definition: tr("tasteAftertasteQualityDefinition"),
      questions: [tr("tasteAftertasteQualityQ1"), tr("tasteAftertasteQualityQ2"), tr("tasteAftertasteQualityQ3")]
    },
    balance: {
      title: tr("labelBalance"),
      definition: tr("tasteBalanceDefinition"),
      questions: [tr("tasteBalanceQ1"), tr("tasteBalanceQ2"), tr("tasteBalanceQ3")]
    }
  };
}

export function drinkTypeOptions() {
  return drinkTypes.map(({ value, labelKey }) => ({ value, label: tr(labelKey) }));
}
