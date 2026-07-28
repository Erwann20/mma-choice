// Union fermée des actions du moteur (AD-2). S'enrichit story par story
// (choix, combat…).
export type Action = { type: 'ADVANCE_YEAR' } | { type: 'RETIRE' }
