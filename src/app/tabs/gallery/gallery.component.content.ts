export interface CGalleryComponent {
  edit: string;
  delete: string;
  noPhotos: string;
  deleteConfirm: string;
  yes: string;
  no: string;
  takePhoto: string;
  chooseFromLibrary: string;
  cancel: string;
}

export const enGallery: CGalleryComponent = {
  edit: 'Edit',
  delete: 'Delete',
  noPhotos: 'No photos available.',
  deleteConfirm: 'Are you sure the photo should be deleted?',
  yes: 'Yes',
  no: 'No',
  takePhoto: 'Take Photo',
  chooseFromLibrary: 'Choose From Library',
  cancel: 'Cancel',
};

export const frGallery: CGalleryComponent = {
  edit: 'Modifier',
  delete: 'Supprimer',
  noPhotos: 'Aucune photo disponible.',
  deleteConfirm: 'Êtes-vous sûr de vouloir supprimer la photo ?',
  yes: 'Oui',
  no: 'Non',
  takePhoto: 'Prendre une photo',
  cancel: 'Annuler',
  chooseFromLibrary: 'Choisir dans la bibliothèque',
};
