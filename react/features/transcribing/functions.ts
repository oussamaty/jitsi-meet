import i18next from 'i18next';

import { IConfig } from '../base/config/configType';

import JITSI_TO_BCP47_MAP from './jitsi-bcp47-map.json';
import logger from './logger';
import TRANSCRIBER_LANGS from './transcriber-langs.json';

export const DEFAULT_TRANSCRIBER_LANG = 'en-US';

/**
 * Determine which language to use for transcribing.
 *
 * @param {*} config - Application config.
 * @returns {string}
 */
export function determineTranscriptionLanguage(config: IConfig) {
    const { transcription } = config;

    // if transcriptions are not enabled nothing to determine
    if (!transcription?.enabled) {
        return undefined;
    }

    // Depending on the config either use the language that the app automatically detected or the hardcoded
    // config BCP47 value.
    // Jitsi language detections uses custom language tags, but the transcriber expects BCP-47 compliant tags,
    // we use a mapping file to convert them.
    const bcp47Locale = transcription?.useAppLanguage ?? true
        ? JITSI_TO_BCP47_MAP[i18next.language as keyof typeof JITSI_TO_BCP47_MAP]
        : transcription?.preferredLanguage;

    // Check if the obtained language is supported by the transcriber
    let safeBCP47Locale = TRANSCRIBER_LANGS[bcp47Locale as keyof typeof TRANSCRIBER_LANGS] && bcp47Locale;

    if (!safeBCP47Locale) {
        safeBCP47Locale = DEFAULT_TRANSCRIBER_LANG;
        logger.warn(`Transcriber language ${bcp47Locale} is not supported, using default ${DEFAULT_TRANSCRIBER_LANG}`);
    }

    logger.info(`Transcriber language set to ${safeBCP47Locale}`);

    return safeBCP47Locale;
}


/**
 * Change the language chosen into the transcriber language format.
 *
 * @param {string} lang - language chosen.
 * @returns {string}
 */
export function formatTranscriptionLanguage(lang: string) {
    const bcp47Locale = JITSI_TO_BCP47_MAP[lang.replace('translation-languages:','') as keyof typeof JITSI_TO_BCP47_MAP]

    // Check if the obtained language is supported by the transcriber
    let safeBCP47Locale = TRANSCRIBER_LANGS[bcp47Locale as keyof typeof TRANSCRIBER_LANGS] && bcp47Locale;

    if (!safeBCP47Locale) {
        safeBCP47Locale = DEFAULT_TRANSCRIBER_LANG;
        logger.warn(`Transcriber language ${bcp47Locale} is not supported, using default ${DEFAULT_TRANSCRIBER_LANG}`);
    }

    logger.info(`Transcriber language set to ${safeBCP47Locale}`);

    return safeBCP47Locale;
}

/**
 * Reverse the key-value pairs of JITSI_TO_BCP47_MAP.
 *
 * @param {Object} map - JITSI_TO_BCP47_MAP.
 * @returns {Object}
 */
export const BCP47_TO_JITSI_MAP = (map) => {
    const newMap = {}
    for (let key of map) {
        newMap[map[key]] = key
    }
    return newMap;
}