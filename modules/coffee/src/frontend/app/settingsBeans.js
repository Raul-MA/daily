import { section, textInput, toggle, escapeHtml } from '../components/components.js';
import { tr } from './copy.js';
import { testIds } from './testIds.js';

export function settingsBeans() {
  return section(tr("sectionBeanPresets"), `
      <form id="bean-form" class="inline-form" data-testid="${testIds.beanForm}">
        ${textInput({ id: "beanBrand", placeholder: tr("placeholderBrand") })}
        ${textInput({ id: "beanBlend", placeholder: tr("placeholderBlend") })}
        ${textInput({ id: "beanOrigin", placeholder: tr("placeholderRoastOrigin") })}
        <div class="compact-check">${toggle({ id: "beanDecaf" })}<label for="beanDecaf">${escapeHtml(tr("labelDecaf"))}</label></div>
        <button class="primary" type="submit" data-testid="${testIds.saveBean}">${escapeHtml(tr("buttonSaveBean"))}</button>
      </form>
      <div id="bean-list" class="bean-list" data-testid="${testIds.beanList}"></div>
    `, tr("captionCatalog"));
}
