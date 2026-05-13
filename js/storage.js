// ========================================
// Le Mandat — Storage module (localStorage encapsulé)
// ========================================
//
// Source de vérité unique pour l'objet `mandat` v2.
// Format documenté dans docs/superpowers/specs/2026-05-06-le-mandat-design.md § 8.3
// Expiration automatique : 30 jours depuis updatedAt.

(function (root) {
    'use strict';

    const STORAGE_KEY = 'le-mandat:v2';
    const EXPIRY_DAYS = 30;

    function emptyMandat() {
        return {
            version: 2,
            updatedAt: new Date().toISOString(),
            projet: { nom: '', contexte: '' },
            strategique:  { porteur: '', intention: '', testInvalidation: '' },
            tactique:     { porteur: '', intention: '', testInvalidation: '' },
            operationnel: { porteur: '', intention: '', testInvalidation: '' },
            tensions: { stratTact: '', tactOp: '', stratOp: '' },
            arbitrages: {
                stratTact: { prime: '', sacrifice: '' },
                tactOp:    { prime: '', sacrifice: '' },
                stratOp:   { prime: '', sacrifice: '' }
            },
            gardeFous: { interdictions: '', seuils: '', test3phrases: '' }
        };
    }

    function isExpired(mandat) {
        if (!mandat || !mandat.updatedAt) return true;
        const diffMs = Date.now() - new Date(mandat.updatedAt).getTime();
        return diffMs > EXPIRY_DAYS * 24 * 3600 * 1000;
    }

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const mandat = JSON.parse(raw);
            if (mandat.version !== 2) return null;
            if (isExpired(mandat)) {
                localStorage.removeItem(STORAGE_KEY);
                return null;
            }
            return mandat;
        } catch (e) {
            console.warn('storage.load failed:', e);
            return null;
        }
    }

    function save(mandat) {
        try {
            mandat.updatedAt = new Date().toISOString();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mandat));
        } catch (e) {
            console.warn('storage.save failed:', e);
        }
    }

    function clear() {
        localStorage.removeItem(STORAGE_KEY);
    }

    function isEmpty(mandat) {
        if (!mandat) return true;
        const filledTexts = [
            mandat.projet.nom,
            mandat.strategique.intention,
            mandat.tactique.intention,
            mandat.operationnel.intention,
            mandat.gardeFous.interdictions
        ].filter(s => s && s.trim().length > 0);
        return filledTexts.length === 0;
    }

    root.LeMandatStorage = { emptyMandat, load, save, clear, isEmpty, STORAGE_KEY };

})(window);
