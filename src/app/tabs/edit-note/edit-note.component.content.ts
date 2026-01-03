export interface CEditNoteComponent {
  enterNote: string;
  saveNotes: string;
  updateWineNotes: string;
}

export const enEditNote: CEditNoteComponent = {
  enterNote: 'Wine notes here...',
  saveNotes: 'Save notes',
  updateWineNotes: 'Wine notes updated',
};

export const frEditNote: CEditNoteComponent = {
  enterNote: 'Notes de dégustation ici...',
  saveNotes: 'Enregistrer les notes',
  updateWineNotes: 'Notes de vin mises à jour',
};
