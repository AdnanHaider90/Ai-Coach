export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      Session: {
        Row: {
          id: string;
          userId: string;
          coachType: string;
          createdAt: string | null;
        };
      };
      Message: {
        Row: {
          id: string;
          sessionId: string;
          role: string;
          content: string;
          createdAt: string | null;
        };
      };
      Goal: {
        Row: {
          id: string;
          userId: string;
          title: string;
          description: string | null;
          dueDate: string | null;
          progress: number | null;
        };
      };
    };
  };
}
