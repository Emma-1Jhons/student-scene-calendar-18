
export interface Event {
  id: string;
  title: string;
  description: string;
  clubName: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventFormData {
  title: string;
  description: string;
  clubName: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  image?: string;
  imageFile?: File; // Add this field to store the File object
}
