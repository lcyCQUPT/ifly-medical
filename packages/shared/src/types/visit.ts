export interface Attachment {
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

export interface Visit {
  id: number;
  visitDate: string;
  hospital: string;
  department?: string;
  chiefComplaint?: string;
  diagnosis?: string;
  doctorAdvice?: string;
  attachments?: Attachment[];
  notes?: string;
  createdAt: string;
}
