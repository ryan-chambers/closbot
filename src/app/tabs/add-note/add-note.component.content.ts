export interface CAddNoteComponent {
  enterNote: string;
  includePhoto: string;
  includeNote: string;
  atLeastOne: string;
  saveNotes: string;
}

export const enAddNoteContent: CAddNoteComponent = {
  enterNote: 'Enter wine note here...',
  includePhoto: 'Include photo? *',
  includeNote: 'Include note? *',
  atLeastOne: '* At least one must be selected.',
  saveNotes: 'Save notes',
};

export const frAddNoteContent: CAddNoteComponent = {
  enterNote: 'Entrez votre avis sur le vin ici...',
  includePhoto: 'Inclure une photo ? *',
  includeNote: 'Inclure une note ? *',
  atLeastOne: '* Au moins une option doit être sélectionnée.',
  saveNotes: 'Enregistrer les notes',
};
