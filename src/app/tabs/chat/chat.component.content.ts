export interface CChatComponent {
  chat: string;
  askHere: string;
  clear: string;
  menu: string;
  bottle: string;
  noMessage: string;
  loading: string;
  userTitle: string;
  takePhoto: string;
  chooseFromLibrary: string;
  cancel: string;
}

export const enChat: CChatComponent = {
  chat: 'Chat',
  askHere: 'Ask here...',
  clear: 'Clear',
  menu: 'Menu',
  bottle: 'Bottle',
  noMessage: 'No messages yet.',
  loading: 'Loading...',
  userTitle: 'You',
  takePhoto: 'Take Photo',
  chooseFromLibrary: 'Choose From Library',
  cancel: 'Cancel',
};

export const frChat: CChatComponent = {
  chat: 'Discuter',
  askHere: 'Demandez ici...',
  clear: 'Effacer',
  menu: 'Menu',
  bottle: 'Bouteille',
  noMessage: 'Pas encore de messages.',
  loading: 'Chargement...',
  userTitle: 'Vous',
  takePhoto: 'Prendre une photo',
  cancel: 'Annuler',
  chooseFromLibrary: 'Choisir dans la bibliothèque',
};
